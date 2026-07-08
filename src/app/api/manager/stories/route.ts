import { db } from "@/db";
import { institutes, stories } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX_ACTIVE_STORIES = 10;
const MAX_IMAGE_SIZE = 1_200_000; // ~800KB decoded
const MAX_VIDEO_SIZE = 4_500_000; // ~3MB decoded

async function getManagerInstitute() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) return { error: "ابتدا وارد حساب مدیر آموزشگاه شوید", status: 401 as const };

  const inst = await db
    .select()
    .from(institutes)
    .where(eq(institutes.userId, Number(user.id)))
    .then((r) => r[0]);

  if (!inst) return { error: "هیچ آموزشگاهی به حساب شما متصل نیست", status: 403 as const };
  return { inst };
}

/** GET: all stories (active + expired/archived) belonging to the manager's institute */
export async function GET() {
  const res = await getManagerInstitute();
  if ("error" in res) return NextResponse.json({ error: res.error }, { status: res.status });

  const list = await db
    .select()
    .from(stories)
    .where(eq(stories.instituteId, res.inst.id))
    .orderBy(asc(stories.sortOrder), asc(stories.createdAt));

  const now = new Date();
  const withStatus = list.map((s) => ({
    ...s,
    isExpired: new Date(s.expiresAt) <= now,
  }));

  return NextResponse.json(withStatus);
}

/** POST: create a new story */
export async function POST(request: Request) {
  const res = await getManagerInstitute();
  if ("error" in res) return NextResponse.json({ error: res.error }, { status: res.status });
  const inst = res.inst;

  try {
    const body = await request.json();
    const { mediaUrl, mediaType, caption, publishAt, expiresAt } = body;

    if (!mediaUrl || typeof mediaUrl !== "string") {
      return NextResponse.json({ error: "فایل استوری الزامی است" }, { status: 400 });
    }

    const type = mediaType === "video" ? "video" : "image";
    if (type === "image" && !mediaUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "فرمت تصویر نامعتبر است" }, { status: 400 });
    }
    if (type === "video" && !mediaUrl.startsWith("data:video/")) {
      return NextResponse.json({ error: "فرمت ویدئو نامعتبر است" }, { status: 400 });
    }
    const maxSize = type === "video" ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (mediaUrl.length > maxSize) {
      return NextResponse.json(
        { error: `حجم فایل بیش از حد مجاز است (حداکثر ${type === "video" ? "۳ مگابایت" : "۸۰۰ کیلوبایت"})` },
        { status: 400 }
      );
    }

    // Enforce max 10 ACTIVE (non-expired, non-archived) stories
    const now = new Date();
    const currentActive = await db
      .select()
      .from(stories)
      .where(and(eq(stories.instituteId, inst.id), eq(stories.isArchived, false)));
    const activeCount = currentActive.filter((s) => new Date(s.expiresAt) > now).length;

    if (activeCount >= MAX_ACTIVE_STORIES) {
      return NextResponse.json(
        { error: `حداکثر ${MAX_ACTIVE_STORIES} استوری فعال مجاز است. ابتدا یک استوری را حذف یا آرشیو کنید.` },
        { status: 400 }
      );
    }

    const finalExpiresAt = expiresAt ? new Date(expiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    const finalPublishAt = publishAt ? new Date(publishAt) : new Date();

    if (isNaN(finalExpiresAt.getTime()) || isNaN(finalPublishAt.getTime())) {
      return NextResponse.json({ error: "تاریخ انتشار یا انقضا نامعتبر است" }, { status: 400 });
    }
    if (finalExpiresAt <= finalPublishAt) {
      return NextResponse.json({ error: "زمان انقضا باید بعد از زمان انتشار باشد" }, { status: 400 });
    }

    const maxOrder = currentActive.reduce((m, s) => Math.max(m, s.sortOrder || 0), 0);

    const [newStory] = await db
      .insert(stories)
      .values({
        instituteId: inst.id,
        mediaUrl,
        mediaType: type,
        caption: caption || null,
        sortOrder: maxOrder + 1,
        publishAt: finalPublishAt,
        expiresAt: finalExpiresAt,
        isArchived: false,
      })
      .returning();

    return NextResponse.json({ ok: true, story: newStory });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

/** PATCH: update a story (caption/expiresAt) or reorder stories */
export async function PATCH(request: Request) {
  const res = await getManagerInstitute();
  if ("error" in res) return NextResponse.json({ error: res.error }, { status: res.status });
  const inst = res.inst;

  try {
    const body = await request.json();
    const { action } = body;

    if (action === "reorder") {
      const { orderedIds } = body as { orderedIds: number[] };
      if (!Array.isArray(orderedIds)) {
        return NextResponse.json({ error: "ترتیب نامعتبر است" }, { status: 400 });
      }
      // Verify all belong to this institute
      const owned = await db.select({ id: stories.id }).from(stories).where(eq(stories.instituteId, inst.id));
      const ownedIds = new Set(owned.map((o) => o.id));
      for (const id of orderedIds) {
        if (!ownedIds.has(id)) {
          return NextResponse.json({ error: "یکی از استوری‌ها متعلق به آموزشگاه شما نیست" }, { status: 403 });
        }
      }
      await Promise.all(
        orderedIds.map((id, index) =>
          db.update(stories).set({ sortOrder: index }).where(eq(stories.id, id))
        )
      );
      return NextResponse.json({ ok: true });
    }

    const { storyId, caption, expiresAt, isArchived } = body;
    const story = await db
      .select()
      .from(stories)
      .where(and(eq(stories.id, storyId), eq(stories.instituteId, inst.id)))
      .then((r) => r[0]);

    if (!story) return NextResponse.json({ error: "استوری متعلق به آموزشگاه شما نیست" }, { status: 403 });

    const updateData: any = {};
    if (caption !== undefined) updateData.caption = caption;
    if (expiresAt !== undefined) {
      const d = new Date(expiresAt);
      if (isNaN(d.getTime())) return NextResponse.json({ error: "تاریخ انقضا نامعتبر است" }, { status: 400 });
      updateData.expiresAt = d;
    }
    if (isArchived !== undefined) updateData.isArchived = !!isArchived;

    const [updated] = await db.update(stories).set(updateData).where(eq(stories.id, storyId)).returning();
    return NextResponse.json({ ok: true, story: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

/** DELETE: permanently remove a story */
export async function DELETE(request: Request) {
  const res = await getManagerInstitute();
  if ("error" in res) return NextResponse.json({ error: res.error }, { status: res.status });
  const inst = res.inst;

  try {
    const { storyId } = await request.json();
    const story = await db
      .select()
      .from(stories)
      .where(and(eq(stories.id, storyId), eq(stories.instituteId, inst.id)))
      .then((r) => r[0]);

    if (!story) return NextResponse.json({ error: "استوری متعلق به آموزشگاه شما نیست" }, { status: 403 });

    await db.delete(stories).where(eq(stories.id, storyId));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
