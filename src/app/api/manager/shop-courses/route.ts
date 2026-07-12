import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { institutes, sellableCourses, sellablePermissions, sellableChapters, sellableLessons, users } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { normalizePhone } from "@/lib/phone";

// Same resolver logic as /api/manager/route.ts — with autoheal by mobile
async function findInstitute() {
  const s = await getServerSession(authOptions);
  const u = s?.user as any;
  if (!u?.id) return null;

  // 1) Primary: linked userId
  let inst = await db.select().from(institutes).where(eq(institutes.userId, Number(u.id))).then(r => r[0]);
  if (inst) return inst;

  // 2) AUTOHEAL: match by phone
  if (u.phone) {
    const clean = normalizePhone(String(u.phone));
    const all = await db.select().from(institutes);
    const candidates = all.filter((i) => {
      const phones = [
        i.mobile ? normalizePhone(String(i.mobile)) : null,
        i.phone ? normalizePhone(String(i.phone)) : null,
      ].filter(Boolean);
      return phones.includes(clean) && (!i.userId || i.userId === Number(u.id));
    });
    if (candidates.length >= 1) {
      const target = candidates.find(c => !c.userId) || candidates[0];
      const [linked] = await db.update(institutes).set({ userId: Number(u.id) }).where(eq(institutes.id, target.id)).returning();
      if (u.role !== "institute") {
        try { await db.update(users).set({ role: "institute" as any }).where(eq(users.id, Number(u.id))); } catch {}
      }
      return linked;
    }
  }
  return null;
}

function makeSlug(title: string) {
  return title.toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100) + "-" + Math.random().toString(36).substring(2, 8);
}

// GET: manager's shop courses + permission info
export async function GET() {
  const inst = await findInstitute();
  if (!inst) return NextResponse.json({ error: "آموزشگاهی به حساب شما متصل نیست" }, { status: 403 });

  const perm = await db.select().from(sellablePermissions).where(eq(sellablePermissions.instituteId, inst.id)).then(r => r[0]);
  const courses = await db.select().from(sellableCourses).where(eq(sellableCourses.instituteId, inst.id)).orderBy(desc(sellableCourses.createdAt));

  // enrich with chapter/lesson counts (fast counts)
  const enriched = await Promise.all(courses.map(async (c) => {
    const chs = await db.select().from(sellableChapters).where(eq(sellableChapters.courseId, c.id));
    const lessons = await db.select().from(sellableLessons).where(eq(sellableLessons.courseId, c.id));
    return {
      ...c,
      chaptersCount: chs.length,
      lessonsCount: lessons.length,
    };
  }));

  return NextResponse.json({
    institute: { id: inst.id, name: inst.name, slug: inst.slug },
    permission: perm || { isEnabled: false, maxCourses: 0, commissionPercent: "10.00" },
    courses: enriched,
  });
}

// POST: create/update sellable course
export async function POST(req: Request) {
  const inst = await findInstitute();
  if (!inst) return NextResponse.json({ error: "آموزشگاهی به حساب شما متصل نیست" }, { status: 403 });

  const perm = await db.select().from(sellablePermissions).where(eq(sellablePermissions.instituteId, inst.id)).then(r => r[0]);
  if (!perm || !perm.isEnabled) return NextResponse.json({ error: "مجوز فروش آنلاین برای شما فعال نیست. با مدیر کل تماس بگیرید." }, { status: 403 });

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "create") {
      const currentCount = await db.select({ c: sql<number>`count(*)::int` }).from(sellableCourses).where(eq(sellableCourses.instituteId, inst.id)).then(r => r[0]?.c || 0);
      if (currentCount >= (perm.maxCourses || 0)) {
        return NextResponse.json({ error: `سقف مجاز شما ${perm.maxCourses} دوره است. برای افزایش با مدیر کل تماس بگیرید.` }, { status: 400 });
      }
      const { title, subtitle, description, price, originalPrice, level, instructor, instructorTitle, coverImage, features, requirements, targetAudience } = body;
      if (!title || !price) return NextResponse.json({ error: "عنوان و قیمت الزامی است" }, { status: 400 });

      const slug = makeSlug(title);
      const discountPercent = originalPrice && Number(originalPrice) > Number(price)
        ? Math.round((1 - Number(price) / Number(originalPrice)) * 100)
        : 0;

      const [created] = await db.insert(sellableCourses).values({
        instituteId: inst.id,
        slug,
        title: String(title).slice(0, 255),
        subtitle: subtitle ? String(subtitle).slice(0, 500) : null,
        description: description || null,
        coverImage: coverImage || null,
        instructor: instructor || null,
        instructorTitle: instructorTitle || null,
        level: level || "beginner",
        price: String(price),
        originalPrice: originalPrice ? String(originalPrice) : null,
        discountPercent,
        features: Array.isArray(features) ? features : [],
        requirements: Array.isArray(requirements) ? requirements : [],
        targetAudience: Array.isArray(targetAudience) ? targetAudience : [],
        status: "draft",
      }).returning();
      return NextResponse.json({ ok: true, course: created });
    }

    if (action === "update") {
      const { courseId, ...rest } = body;
      const c = await db.select().from(sellableCourses).where(and(eq(sellableCourses.id, Number(courseId)), eq(sellableCourses.instituteId, inst.id))).then(r => r[0]);
      if (!c) return NextResponse.json({ error: "دوره یافت نشد" }, { status: 404 });

      const update: any = {};
      const allowed = ["title", "subtitle", "description", "coverImage", "trailerVideo", "instructor", "instructorTitle", "instructorAvatar", "instructorBio", "level", "price", "originalPrice", "features", "requirements", "targetAudience", "hasSupport", "hasCertificate", "hasDownload", "lifetimeAccess", "accessDurationDays"];
      for (const k of allowed) {
        if (rest[k] !== undefined) update[k] = rest[k];
      }
      if (update.price !== undefined) update.price = String(update.price);
      if (update.originalPrice !== undefined && update.originalPrice !== null) update.originalPrice = String(update.originalPrice);
      if (update.price && update.originalPrice && Number(update.originalPrice) > Number(update.price)) {
        update.discountPercent = Math.round((1 - Number(update.price) / Number(update.originalPrice)) * 100);
      }
      update.updatedAt = new Date();

      const [updated] = await db.update(sellableCourses).set(update).where(eq(sellableCourses.id, Number(courseId))).returning();
      return NextResponse.json({ ok: true, course: updated });
    }

    if (action === "publish") {
      const { courseId, publish } = body;
      const c = await db.select().from(sellableCourses).where(and(eq(sellableCourses.id, Number(courseId)), eq(sellableCourses.instituteId, inst.id))).then(r => r[0]);
      if (!c) return NextResponse.json({ error: "دوره یافت نشد" }, { status: 404 });
      const [updated] = await db.update(sellableCourses).set({
        isPublished: !!publish,
        status: publish ? "published" : "draft",
        publishedAt: publish ? new Date() : null,
        updatedAt: new Date(),
      }).where(eq(sellableCourses.id, Number(courseId))).returning();
      return NextResponse.json({ ok: true, course: updated });
    }

    if (action === "delete") {
      const { courseId } = body;
      const c = await db.select().from(sellableCourses).where(and(eq(sellableCourses.id, Number(courseId)), eq(sellableCourses.instituteId, inst.id))).then(r => r[0]);
      if (!c) return NextResponse.json({ error: "دوره یافت نشد" }, { status: 404 });
      await db.delete(sellableCourses).where(eq(sellableCourses.id, Number(courseId)));
      return NextResponse.json({ ok: true });
    }

    // === Chapters ===
    if (action === "addChapter") {
      const { courseId, title, description, isFree, coverImage } = body;
      const c = await db.select().from(sellableCourses).where(and(eq(sellableCourses.id, Number(courseId)), eq(sellableCourses.instituteId, inst.id))).then(r => r[0]);
      if (!c) return NextResponse.json({ error: "دوره یافت نشد" }, { status: 404 });
      const orderIdx = await db.select({ c: sql<number>`count(*)::int` }).from(sellableChapters).where(eq(sellableChapters.courseId, c.id)).then(r => r[0]?.c || 0);
      const [ch] = await db.insert(sellableChapters).values({
        courseId: c.id,
        title: String(title).slice(0, 255),
        description: description || null,
        coverImage: coverImage || null,
        orderIndex: orderIdx + 1,
        isFree: !!isFree,
      }).returning();
      await db.update(sellableCourses).set({ totalChapters: orderIdx + 1, updatedAt: new Date() }).where(eq(sellableCourses.id, c.id));
      return NextResponse.json({ ok: true, chapter: ch });
    }

    if (action === "updateChapter") {
      const { chapterId, title, description, isFree, coverImage } = body;
      const ch = await db.select().from(sellableChapters).where(eq(sellableChapters.id, Number(chapterId))).then(r => r[0]);
      if (!ch) return NextResponse.json({ error: "فصل یافت نشد" }, { status: 404 });
      const c = await db.select().from(sellableCourses).where(eq(sellableCourses.id, ch.courseId)).then(r => r[0]);
      if (!c || c.instituteId !== inst.id) return NextResponse.json({ error: "غیرمجاز" }, { status: 403 });
      const update: any = {};
      if (title !== undefined) update.title = title;
      if (description !== undefined) update.description = description;
      if (isFree !== undefined) update.isFree = !!isFree;
      if (coverImage !== undefined) update.coverImage = coverImage || null;
      const [updated] = await db.update(sellableChapters).set(update).where(eq(sellableChapters.id, ch.id)).returning();
      return NextResponse.json({ ok: true, chapter: updated });
    }

    if (action === "deleteChapter") {
      const { chapterId } = body;
      const ch = await db.select().from(sellableChapters).where(eq(sellableChapters.id, Number(chapterId))).then(r => r[0]);
      if (!ch) return NextResponse.json({ error: "فصل یافت نشد" }, { status: 404 });
      const c = await db.select().from(sellableCourses).where(eq(sellableCourses.id, ch.courseId)).then(r => r[0]);
      if (!c || c.instituteId !== inst.id) return NextResponse.json({ error: "غیرمجاز" }, { status: 403 });
      await db.delete(sellableChapters).where(eq(sellableChapters.id, ch.id));
      const cnt = await db.select({ c: sql<number>`count(*)::int` }).from(sellableChapters).where(eq(sellableChapters.courseId, c.id)).then(r => r[0]?.c || 0);
      await db.update(sellableCourses).set({ totalChapters: cnt, updatedAt: new Date() }).where(eq(sellableCourses.id, c.id));
      return NextResponse.json({ ok: true });
    }

    // === Lessons ===
    if (action === "addLesson") {
      const { chapterId, title, type, videoUrl, videoProvider, videoDuration, content, isFree, description, coverImage } = body;
      const ch = await db.select().from(sellableChapters).where(eq(sellableChapters.id, Number(chapterId))).then(r => r[0]);
      if (!ch) return NextResponse.json({ error: "فصل یافت نشد" }, { status: 404 });
      const c = await db.select().from(sellableCourses).where(eq(sellableCourses.id, ch.courseId)).then(r => r[0]);
      if (!c || c.instituteId !== inst.id) return NextResponse.json({ error: "غیرمجاز" }, { status: 403 });
      const orderIdx = await db.select({ c: sql<number>`count(*)::int` }).from(sellableLessons).where(eq(sellableLessons.chapterId, ch.id)).then(r => r[0]?.c || 0);
      const [lesson] = await db.insert(sellableLessons).values({
        chapterId: ch.id,
        courseId: c.id,
        title: String(title).slice(0, 255),
        type: type || "video",
        description: description || null,
        coverImage: coverImage || null,
        videoUrl: videoUrl || null,
        videoProvider: videoProvider || "direct",
        videoDuration: Number(videoDuration ?? 0),
        content: content || null,
        isFree: !!isFree,
        isLocked: !isFree,
        orderIndex: orderIdx + 1,
      }).returning();
      // Update totals
      const totalLessons = await db.select({ c: sql<number>`count(*)::int` }).from(sellableLessons).where(eq(sellableLessons.courseId, c.id)).then(r => r[0]?.c || 0);
      const totalDur = await db.select({ s: sql<number>`coalesce(sum(video_duration), 0)::int` }).from(sellableLessons).where(eq(sellableLessons.courseId, c.id)).then(r => r[0]?.s || 0);
      await db.update(sellableCourses).set({ totalLessons, totalDuration: Math.floor(totalDur / 60), updatedAt: new Date() }).where(eq(sellableCourses.id, c.id));
      return NextResponse.json({ ok: true, lesson });
    }

    if (action === "updateLesson") {
      const { lessonId, ...rest } = body;
      const lesson = await db.select().from(sellableLessons).where(eq(sellableLessons.id, Number(lessonId))).then(r => r[0]);
      if (!lesson) return NextResponse.json({ error: "درس یافت نشد" }, { status: 404 });
      const c = await db.select().from(sellableCourses).where(eq(sellableCourses.id, lesson.courseId)).then(r => r[0]);
      if (!c || c.instituteId !== inst.id) return NextResponse.json({ error: "غیرمجاز" }, { status: 403 });
      const update: any = {};
      const allowed = ["title", "type", "description", "videoUrl", "videoProvider", "videoDuration", "content", "isFree", "isLocked", "attachmentUrl", "coverImage"];
      for (const k of allowed) if (rest[k] !== undefined) update[k] = rest[k];
      if (update.isFree !== undefined) update.isLocked = !update.isFree;
      const [updated] = await db.update(sellableLessons).set(update).where(eq(sellableLessons.id, lesson.id)).returning();
      return NextResponse.json({ ok: true, lesson: updated });
    }

    if (action === "deleteLesson") {
      const { lessonId } = body;
      const lesson = await db.select().from(sellableLessons).where(eq(sellableLessons.id, Number(lessonId))).then(r => r[0]);
      if (!lesson) return NextResponse.json({ error: "درس یافت نشد" }, { status: 404 });
      const c = await db.select().from(sellableCourses).where(eq(sellableCourses.id, lesson.courseId)).then(r => r[0]);
      if (!c || c.instituteId !== inst.id) return NextResponse.json({ error: "غیرمجاز" }, { status: 403 });
      await db.delete(sellableLessons).where(eq(sellableLessons.id, lesson.id));
      const totalLessons = await db.select({ c: sql<number>`count(*)::int` }).from(sellableLessons).where(eq(sellableLessons.courseId, c.id)).then(r => r[0]?.c || 0);
      await db.update(sellableCourses).set({ totalLessons, updatedAt: new Date() }).where(eq(sellableCourses.id, c.id));
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "action نامعتبر" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "خطا" }, { status: 500 });
  }
}

// GET course details with chapters+lessons for edit
export async function PATCH(req: Request) {
  const inst = await findInstitute();
  if (!inst) return NextResponse.json({ error: "unauth" }, { status: 403 });
  const body = await req.json();
  const { courseId } = body;
  const c = await db.select().from(sellableCourses).where(and(eq(sellableCourses.id, Number(courseId)), eq(sellableCourses.instituteId, inst.id))).then(r => r[0]);
  if (!c) return NextResponse.json({ error: "دوره یافت نشد" }, { status: 404 });
  const chapters = await db.select().from(sellableChapters).where(eq(sellableChapters.courseId, c.id)).orderBy(sellableChapters.orderIndex);
  const lessons = await db.select().from(sellableLessons).where(eq(sellableLessons.courseId, c.id)).orderBy(sellableLessons.orderIndex);
  const chaptersWithLessons = chapters.map(ch => ({ ...ch, lessons: lessons.filter(l => l.chapterId === ch.id) }));
  return NextResponse.json({ course: c, chapters: chaptersWithLessons });
}
