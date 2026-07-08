import { db } from "@/db";
import { registrations, courses, institutes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await db
    .select({
      id: registrations.id,
      fullName: registrations.fullName,
      phone: registrations.phone,
      email: registrations.email,
      notes: registrations.notes,
      status: registrations.status,
      createdAt: registrations.createdAt,
      courseTitle: courses.title,
      instituteName: institutes.name,
      instituteSlug: institutes.slug,
    })
    .from(registrations)
    .leftJoin(courses, eq(registrations.courseId, courses.id))
    .leftJoin(institutes, eq(registrations.instituteId, institutes.id))
    .orderBy(desc(registrations.createdAt));

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "شناسه ثبت‌نام و وضعیت جدید الزامی است." },
        { status: 400 }
      );
    }

    const updated = await db
      .update(registrations)
      .set({ status })
      .where(eq(registrations.id, id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "خطا در تغییر وضعیت" }, { status: 500 });
  }
}
