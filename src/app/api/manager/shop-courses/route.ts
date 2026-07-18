import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { institutes, sellableCourses, sellableChapters, sellableLessons, users, categories } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { normalizePhone } from "@/lib/phone";
import { syncLegacySellablePermission } from "@/lib/subscription-entitlements";

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
  try {
    const inst = await findInstitute();
    if (!inst) return NextResponse.json({ error: "آموزشگاهی به حساب شما متصل نیست" }, { status: 403 });

    const entitlement = await syncLegacySellablePermission(inst.id);

    // Use raw SQL to be fault-tolerant against schema mismatches (new cover_image columns etc.)
    const coursesRaw = await db.execute(sql`
      SELECT id, institute_id, slug, title, subtitle, description, cover_image,
             trailer_video, category_id, instructor, instructor_title, instructor_avatar, instructor_bio,
             level, language, total_duration, total_lessons, total_chapters, students_count,
             rating, rating_count, price, original_price, discount_percent,
             features, requirements, target_audience,
             has_support, has_certificate, has_download, lifetime_access, access_duration_days,
             is_published, is_featured, status, published_at,
             created_at, updated_at,
             (SELECT COUNT(*)::int FROM sellable_purchases sp WHERE sp.course_id = sellable_courses.id AND sp.status = 'paid') AS paid_count
      FROM sellable_courses
      WHERE institute_id = ${inst.id}
      ORDER BY created_at DESC
    `);
    const courses = ((coursesRaw as any).rows || coursesRaw) as any[];

    const enriched = await Promise.all(courses.map(async (c: any) => {
      const chs = await db.execute(sql`SELECT COUNT(*)::int AS c FROM sellable_chapters WHERE course_id = ${c.id}`);
      const les = await db.execute(sql`SELECT COUNT(*)::int AS c FROM sellable_lessons WHERE course_id = ${c.id}`);
      const chc = Number(((chs as any).rows || chs)[0]?.c || 0);
      const lec = Number(((les as any).rows || les)[0]?.c || 0);
      return {
        id: c.id,
        instituteId: c.institute_id,
        slug: c.slug,
        title: c.title,
        subtitle: c.subtitle,
        description: c.description,
        coverImage: c.cover_image,
        trailerVideo: c.trailer_video,
        categoryId: c.category_id,
        instructor: c.instructor,
        instructorTitle: c.instructor_title,
        instructorAvatar: c.instructor_avatar,
        instructorBio: c.instructor_bio,
        level: c.level,
        language: c.language,
        totalDuration: c.total_duration,
        totalLessons: c.total_lessons,
        totalChapters: c.total_chapters,
        studentsCount: Number(c.paid_count || 0),
        storedStudentsCount: c.students_count,
        rating: c.rating,
        ratingCount: c.rating_count,
        price: c.price,
        originalPrice: c.original_price,
        discountPercent: c.discount_percent,
        features: c.features,
        requirements: c.requirements,
        targetAudience: c.target_audience,
        hasSupport: c.has_support,
        hasCertificate: c.has_certificate,
        hasDownload: c.has_download,
        lifetimeAccess: c.lifetime_access,
        accessDurationDays: c.access_duration_days,
        isPublished: c.is_published,
        isFeatured: c.is_featured,
        status: c.status,
        publishedAt: c.published_at,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        chaptersCount: chc,
        lessonsCount: lec,
      };
    }));

    const categoryList = await db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(categories.name);

    return NextResponse.json({
      institute: { id: inst.id, name: inst.name, slug: inst.slug },
      permission: {
        isEnabled: entitlement.onlineSalesEnabled,
        maxCourses: entitlement.maxShopCourses,
        isUnlimited: entitlement.unlimitedShopCourses,
        commissionPercent: entitlement.commissionPercent,
        planName: entitlement.planName,
        source: "subscription_plan",
      },
      categories: categoryList,
      courses: enriched,
    });
  } catch (e: any) {
    console.error("[shop-courses GET] error:", e?.message, e?.stack);
    return NextResponse.json({ error: e?.message || "خطا در بارگذاری" }, { status: 500 });
  }
}

// POST: create/update sellable course
export async function POST(req: Request) {
  const inst = await findInstitute();
  if (!inst) return NextResponse.json({ error: "آموزشگاهی به حساب شما متصل نیست" }, { status: 403 });

  const entitlement = await syncLegacySellablePermission(inst.id);
  if (!entitlement.onlineSalesEnabled) {
    return NextResponse.json({ error: "فروش آنلاین در پلن فعال آموزشگاه شما وجود ندارد. با ارتقای پلن، دسترسی خودکار فعال می‌شود." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "create") {
      const currentCount = await db.select({ c: sql<number>`count(*)::int` }).from(sellableCourses).where(eq(sellableCourses.instituteId, inst.id)).then(r => r[0]?.c || 0);
      if (!entitlement.unlimitedShopCourses && currentCount >= entitlement.maxShopCourses) {
        return NextResponse.json({ error: `سقف پلن شما ${entitlement.maxShopCourses} دوره آنلاین است. برای افزایش، پلن را ارتقا دهید.` }, { status: 400 });
      }
      const {
        title, subtitle, description, price, originalPrice, level, instructor, instructorTitle,
        instructorAvatar, instructorBio, coverImage, trailerVideo, categoryId, language,
        features, requirements, targetAudience, hasSupport, hasCertificate, hasDownload,
        lifetimeAccess, accessDurationDays,
      } = body;
      if (!title || price === undefined || price === null || price === "") return NextResponse.json({ error: "عنوان و قیمت الزامی است" }, { status: 400 });

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
        trailerVideo: trailerVideo || null,
        categoryId: categoryId ? Number(categoryId) : null,
        instructor: instructor || null,
        instructorTitle: instructorTitle || null,
        instructorAvatar: instructorAvatar || null,
        instructorBio: instructorBio || null,
        level: level || "beginner",
        language: language || "fa",
        price: String(price),
        originalPrice: originalPrice ? String(originalPrice) : null,
        discountPercent,
        features: Array.isArray(features) ? features : [],
        requirements: Array.isArray(requirements) ? requirements : [],
        targetAudience: Array.isArray(targetAudience) ? targetAudience : [],
        hasSupport: hasSupport !== false,
        hasCertificate: hasCertificate !== false,
        hasDownload: !!hasDownload,
        lifetimeAccess: lifetimeAccess !== false,
        accessDurationDays: lifetimeAccess === false && accessDurationDays ? Number(accessDurationDays) : null,
        status: "draft",
      }).returning();
      return NextResponse.json({ ok: true, course: created });
    }

    if (action === "update") {
      const { courseId, ...rest } = body;
      const c = await db.select().from(sellableCourses).where(and(eq(sellableCourses.id, Number(courseId)), eq(sellableCourses.instituteId, inst.id))).then(r => r[0]);
      if (!c) return NextResponse.json({ error: "دوره یافت نشد" }, { status: 404 });

      const update: any = {};
      const allowed = [
        "title", "subtitle", "description", "coverImage", "trailerVideo", "categoryId", "language",
        "instructor", "instructorTitle", "instructorAvatar", "instructorBio", "level",
        "price", "originalPrice", "features", "requirements", "targetAudience",
        "hasSupport", "hasCertificate", "hasDownload", "lifetimeAccess", "accessDurationDays",
      ];
      for (const k of allowed) {
        if (rest[k] !== undefined) update[k] = rest[k];
      }
      if (update.price !== undefined) update.price = String(Math.max(0, Number(update.price) || 0));
      if (update.originalPrice !== undefined) update.originalPrice = update.originalPrice ? String(Math.max(0, Number(update.originalPrice) || 0)) : null;
      if (update.categoryId !== undefined) update.categoryId = update.categoryId ? Number(update.categoryId) : null;
      if (update.accessDurationDays !== undefined) update.accessDurationDays = update.lifetimeAccess ? null : (Number(update.accessDurationDays) || null);
      if (typeof update.coverImage === "string" && update.coverImage.startsWith("data:") && update.coverImage.length > 1_300_000) {
        return NextResponse.json({ error: "حجم تصویر کاور بیشتر از حد مجاز است" }, { status: 400 });
      }
      const nextPrice = update.price !== undefined ? Number(update.price) : Number(c.price);
      const nextOriginal = update.originalPrice !== undefined ? Number(update.originalPrice || 0) : Number(c.originalPrice || 0);
      update.discountPercent = nextOriginal > nextPrice && nextPrice >= 0
        ? Math.round((1 - nextPrice / nextOriginal) * 100)
        : 0;
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
  try {
    const inst = await findInstitute();
    if (!inst) return NextResponse.json({ error: "unauth" }, { status: 403 });
    const body = await req.json();
    const { courseId } = body;

    // fault-tolerant SQL to safely read even if new columns are missing
    const cRow = await db.execute(sql`
      SELECT * FROM sellable_courses WHERE id = ${Number(courseId)} AND institute_id = ${inst.id} LIMIT 1
    `);
    const c = ((cRow as any).rows || cRow)[0];
    if (!c) return NextResponse.json({ error: "دوره یافت نشد" }, { status: 404 });

    const chRows = await db.execute(sql`
      SELECT id, course_id, title, description, cover_image, order_index, is_free, created_at
      FROM sellable_chapters WHERE course_id = ${c.id} ORDER BY order_index
    `);
    const chapters = ((chRows as any).rows || chRows) as any[];

    const lRows = await db.execute(sql`
      SELECT id, chapter_id, course_id, title, type, description, cover_image,
             video_url, video_provider, video_duration, content, attachment_url,
             is_free, is_locked, order_index, created_at
      FROM sellable_lessons WHERE course_id = ${c.id} ORDER BY order_index
    `);
    const lessons = ((lRows as any).rows || lRows) as any[];

    const mapCh = (row: any) => ({
      id: row.id, courseId: row.course_id, title: row.title, description: row.description,
      coverImage: row.cover_image, orderIndex: row.order_index, isFree: row.is_free, createdAt: row.created_at,
    });
    const mapL = (row: any) => ({
      id: row.id, chapterId: row.chapter_id, courseId: row.course_id, title: row.title, type: row.type,
      description: row.description, coverImage: row.cover_image, videoUrl: row.video_url,
      videoProvider: row.video_provider, videoDuration: row.video_duration, content: row.content,
      attachmentUrl: row.attachment_url, isFree: row.is_free, isLocked: row.is_locked,
      orderIndex: row.order_index, createdAt: row.created_at,
    });

    const chaptersWithLessons = chapters.map((ch: any) => ({
      ...mapCh(ch),
      lessons: lessons.filter((l: any) => l.chapter_id === ch.id).map(mapL),
    }));

    return NextResponse.json({
      course: {
        id: c.id, instituteId: c.institute_id, slug: c.slug, title: c.title,
        subtitle: c.subtitle, description: c.description, coverImage: c.cover_image,
        instructor: c.instructor, instructorTitle: c.instructor_title,
        price: c.price, originalPrice: c.original_price, discountPercent: c.discount_percent,
        isPublished: c.is_published, status: c.status,
      },
      chapters: chaptersWithLessons,
    });
  } catch (e: any) {
    console.error("[shop-courses PATCH] error:", e?.message);
    return NextResponse.json({ error: e?.message || "خطا" }, { status: 500 });
  }
}
