import { db } from "@/db";
import { studentDocuments, registrations, users, institutes, courses } from "@/db/schema";
import { eq, or, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { normalizePhone } from "@/lib/phone";

export const dynamic = "force-dynamic";

/** GET: list all documents belonging to a student, identified by phone (?phone=) */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawPhone = searchParams.get("phone");

  if (!rawPhone) {
    return NextResponse.json({ error: "شماره موبایل الزامی است" }, { status: 400 });
  }

  const cleanPhone = normalizePhone(rawPhone);

  const user = await db
    .select()
    .from(users)
    .where(or(eq(users.phone, cleanPhone), eq(users.email, cleanPhone)))
    .then((res) => res[0]);

  // Find all registrations belonging to this student (by userId or matching phone)
  const myRegs = await db
    .select({ id: registrations.id })
    .from(registrations)
    .where(user ? or(eq(registrations.userId, user.id), eq(registrations.phone, cleanPhone)) : eq(registrations.phone, cleanPhone));

  const regIds = myRegs.map((r) => r.id);
  if (regIds.length === 0) return NextResponse.json([]);

  const docs = await db
    .select({
      id: studentDocuments.id,
      title: studentDocuments.title,
      fileUrl: studentDocuments.fileUrl,
      fileType: studentDocuments.fileType,
      documentNumber: studentDocuments.documentNumber,
      serialNumber: studentDocuments.serialNumber,
      issueDate: studentDocuments.issueDate,
      validity: studentDocuments.validity,
      description: studentDocuments.description,
      createdAt: studentDocuments.createdAt,
      registrationId: studentDocuments.registrationId,
      courseTitle: courses.title,
      instituteName: institutes.name,
    })
    .from(studentDocuments)
    .leftJoin(registrations, eq(studentDocuments.registrationId, registrations.id))
    .leftJoin(courses, eq(registrations.courseId, courses.id))
    .leftJoin(institutes, eq(studentDocuments.instituteId, institutes.id))
    .where(inArray(studentDocuments.registrationId, regIds));

  return NextResponse.json(docs);
}
