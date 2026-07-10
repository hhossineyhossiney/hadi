import { db } from "@/db";
import { registrations, courses, institutes, categories } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// We store favorites via the existing registrations.isFavorite flag.
// But some users want to favorite a course WITHOUT registering.
// Solution: use a lightweight "favorite" record with status='pending' and a "notes"='__FAV__' marker
// so it doesn't affect enrolledCount. Cleanest approach: create a separate table would be better,
// but to avoid another migration we use isFavorite flag + notes marker.

const FAV_MARKER = "__FAV__";

async function requireUser() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) return { error: "ابتدا وارد حساب کاربری شوید", status: 401 as const };
  return {
    userId: Number(user.id),
    userName: user.name || "کاربر",
    userPhone: user.phone || "",
  };
}

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  // Return favorited courses (isFavorite=true) with course details
  const rows = await db
    .select({
      registrationId: registrations.id,
      courseId: registrations.courseId,
      courseTitle: courses.title,
      courseSlug: courses.slug,
      courseImage: courses.image,
      price: courses.price,
      duration: courses.duration,
      instructor: courses.instructor,
      startDate: courses.startDate,
      instituteName: institutes.name,
      instituteSlug: institutes.slug,
      categoryName: categories.name,
      notes: registrations.notes,
      status: registrations.status,
    })
    .from(registrations)
    .leftJoin(courses, eq(registrations.courseId, courses.id))
    .leftJoin(institutes, eq(registrations.instituteId, institutes.id))
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .where(and(eq(registrations.userId, auth.userId), eq(registrations.isFavorite, true)));

  return NextResponse.json(
    rows.map((r) => ({
      ...r,
      isFavOnly: r.notes === FAV_MARKER, // true if favorited only (not actually enrolled)
    }))
  );
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();
  const courseId = Number(body.courseId);
  if (!courseId) return NextResponse.json({ error: "courseId الزامی است" }, { status: 400 });

  // Check course exists
  const [c] = await db.select().from(courses).where(eq(courses.id, courseId));
  if (!c) return NextResponse.json({ error: "دوره یافت نشد" }, { status: 404 });

  // Check if user already has any record for this course (registered or favorited)
  const existing = await db
    .select()
    .from(registrations)
    .where(and(eq(registrations.userId, auth.userId), eq(registrations.courseId, courseId)))
    .then((r) => r[0]);

  if (existing) {
    // Toggle favorite
    const newFav = !existing.isFavorite;
    await db.update(registrations).set({ isFavorite: newFav }).where(eq(registrations.id, existing.id));
    return NextResponse.json({ ok: true, isFavorite: newFav });
  }

  // Create favorite-only record
  await db.insert(registrations).values({
    userId: auth.userId,
    courseId: courseId,
    instituteId: c.instituteId,
    fullName: auth.userName,
    phone: auth.userPhone,
    notes: FAV_MARKER,
    isFavorite: true,
    status: "pending",
  });

  return NextResponse.json({ ok: true, isFavorite: true });
}

// DELETE — remove from favorites (or remove favorite-only record entirely)
export async function DELETE(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();
  const courseId = Number(body.courseId);
  if (!courseId) return NextResponse.json({ error: "courseId الزامی است" }, { status: 400 });

  const existing = await db
    .select()
    .from(registrations)
    .where(and(eq(registrations.userId, auth.userId), eq(registrations.courseId, courseId)))
    .then((r) => r[0]);

  if (!existing) return NextResponse.json({ ok: true });

  if (existing.notes === FAV_MARKER) {
    // Delete favorite-only record
    await db.delete(registrations).where(eq(registrations.id, existing.id));
  } else {
    // Actual enrollment — just unset favorite flag
    await db.update(registrations).set({ isFavorite: false }).where(eq(registrations.id, existing.id));
  }
  return NextResponse.json({ ok: true, isFavorite: false });
}
