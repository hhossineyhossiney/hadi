import { db } from "@/db";
import { stories, institutes } from "@/db/schema";
import { eq, and, lte, gt, asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET: public list of institutes that currently have at least one
 * active (published + not expired + not archived) story, grouped.
 * Used by the homepage StoriesBar.
 */
export async function GET() {
  const now = new Date();

  const activeStories = await db
    .select({
      id: stories.id,
      instituteId: stories.instituteId,
      mediaUrl: stories.mediaUrl,
      mediaType: stories.mediaType,
      caption: stories.caption,
      sortOrder: stories.sortOrder,
      publishAt: stories.publishAt,
      expiresAt: stories.expiresAt,
      instituteName: institutes.name,
      instituteSlug: institutes.slug,
      profilePhoto: institutes.profilePhoto,
    })
    .from(stories)
    .leftJoin(institutes, eq(stories.instituteId, institutes.id))
    .where(
      and(
        eq(stories.isArchived, false),
        lte(stories.publishAt, now),
        gt(stories.expiresAt, now)
      )
    )
    .orderBy(asc(stories.sortOrder), asc(stories.createdAt));

  // Group by institute, preserving story order
  const grouped = new Map<number, any>();
  for (const s of activeStories) {
    if (!s.instituteId) continue;
    if (!grouped.has(s.instituteId)) {
      grouped.set(s.instituteId, {
        instituteId: s.instituteId,
        instituteName: s.instituteName,
        instituteSlug: s.instituteSlug,
        profilePhoto: s.profilePhoto,
        stories: [],
      });
    }
    grouped.get(s.instituteId).stories.push({
      id: s.id,
      mediaUrl: s.mediaUrl,
      mediaType: s.mediaType,
      caption: s.caption,
      expiresAt: s.expiresAt,
    });
  }

  return NextResponse.json(Array.from(grouped.values()));
}

/** POST: increment view counter for a story (fire-and-forget from viewer) */
export async function POST(request: Request) {
  try {
    const { storyId } = await request.json();
    if (!storyId) return NextResponse.json({ error: "storyId الزامی است" }, { status: 400 });

    const story = await db.select().from(stories).where(eq(stories.id, storyId)).then((r) => r[0]);
    if (!story) return NextResponse.json({ error: "استوری یافت نشد" }, { status: 404 });

    await db.update(stories).set({ viewCount: (story.viewCount || 0) + 1 }).where(eq(stories.id, storyId));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
