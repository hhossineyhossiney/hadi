import { NextResponse } from "next/server";
import { db } from "@/db";
import { sellableCourses, sellableChapters, sellableLessons, institutes, sellablePurchases } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPublicReviews, getReviewSummary, seedSampleReviews } from "@/lib/review-system";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    await seedSampleReviews();
    const course = await db.select().from(sellableCourses).where(eq(sellableCourses.slug, slug)).then(r => r[0]);
    if (!course || !course.isPublished) {
      return NextResponse.json({ error: "دوره یافت نشد" }, { status: 404 });
    }
    const inst = await db.select().from(institutes).where(eq(institutes.id, course.instituteId)).then(r => r[0]);
    const chapters = await db.select().from(sellableChapters).where(eq(sellableChapters.courseId, course.id)).orderBy(sellableChapters.orderIndex);
    const lessons = await db.select().from(sellableLessons).where(eq(sellableLessons.courseId, course.id)).orderBy(sellableLessons.orderIndex);

    // Check if user has purchased
    let hasPurchased = false;
    try {
      const s = await getServerSession(authOptions);
      const uid = Number((s?.user as any)?.id);
      if (uid) {
        const purchase = await db.select().from(sellablePurchases)
          .where(and(eq(sellablePurchases.userId, uid), eq(sellablePurchases.courseId, course.id), eq(sellablePurchases.status, "paid")))
          .then(r => r[0]);
        hasPurchased = !!purchase;
      }
    } catch {}

    // If not purchased, hide videoUrl for locked lessons
    const chaptersWithLessons = chapters.map(ch => ({
      ...ch,
      lessons: lessons.filter(l => l.chapterId === ch.id).map(l => ({
        ...l,
        // Hide videoUrl if lesson is locked AND user hasn't bought
        videoUrl: (l.isFree || hasPurchased) ? l.videoUrl : null,
        content: (l.isFree || hasPurchased) ? l.content : null,
      })),
    }));

    const [reviews, reviewSummary] = await Promise.all([
      getPublicReviews({ instituteId: course.instituteId, sellableCourseId: course.id }),
      getReviewSummary({ instituteId: course.instituteId, sellableCourseId: course.id }),
    ]);

    return NextResponse.json({
      course: { ...course, rating: reviewSummary.rating, ratingCount: reviewSummary.reviewCount },
      institute: inst ? { id: inst.id, name: inst.name, slug: inst.slug, phone: inst.phone } : null,
      chapters: chaptersWithLessons,
      hasPurchased,
      reviews,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "خطا" }, { status: 500 });
  }
}
