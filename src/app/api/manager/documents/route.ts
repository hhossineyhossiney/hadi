import { db } from "@/db";
import { institutes, registrations, studentDocuments } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX_DOC_SIZE = 3_000_000; // ~2MB decoded (base64 data URL)
const ALLOWED_PREFIXES = ["data:application/pdf", "data:image/jpeg", "data:image/jpg", "data:image/png"];

function detectFileType(fileUrl: string): string | null {
  if (fileUrl.startsWith("data:application/pdf")) return "pdf";
  if (fileUrl.startsWith("data:image/png")) return "png";
  if (fileUrl.startsWith("data:image/jpeg") || fileUrl.startsWith("data:image/jpg")) return "jpg";
  return null;
}

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

/** GET: list documents — optionally filtered by ?registrationId= */
export async function GET(request: Request) {
  const res = await getManagerInstitute();
  if ("error" in res) return NextResponse.json({ error: res.error }, { status: res.status });

  const { searchParams } = new URL(request.url);
  const registrationId = searchParams.get("registrationId");

  const conditions = [eq(studentDocuments.instituteId, res.inst.id)];
  if (registrationId) conditions.push(eq(studentDocuments.registrationId, Number(registrationId)));

  const list = await db
    .select()
    .from(studentDocuments)
    .where(and(...conditions))
    .orderBy(desc(studentDocuments.createdAt));

  return NextResponse.json(list);
}

/** POST: upload a new document for a student's registration */
export async function POST(request: Request) {
  const res = await getManagerInstitute();
  if ("error" in res) return NextResponse.json({ error: res.error }, { status: res.status });
  const inst = res.inst;

  try {
    const body = await request.json();
    const { registrationId, title, fileUrl, documentNumber, serialNumber, issueDate, validity, description } = body;

    if (!registrationId || !title || !fileUrl) {
      return NextResponse.json({ error: "دانش‌آموز، عنوان مدرک و فایل الزامی است" }, { status: 400 });
    }

    const reg = await db
      .select()
      .from(registrations)
      .where(and(eq(registrations.id, registrationId), eq(registrations.instituteId, inst.id)))
      .then((r) => r[0]);
    if (!reg) return NextResponse.json({ error: "هنرجو متعلق به آموزشگاه شما نیست" }, { status: 403 });

    const isAllowed = ALLOWED_PREFIXES.some((p) => fileUrl.startsWith(p));
    if (!isAllowed) {
      return NextResponse.json({ error: "فرمت فایل مجاز نیست (فقط PDF، JPG، PNG)" }, { status: 400 });
    }
    if (fileUrl.length > MAX_DOC_SIZE) {
      return NextResponse.json({ error: "حجم فایل باید کمتر از ۲ مگابایت باشد" }, { status: 400 });
    }

    const fileType = detectFileType(fileUrl);
    if (!fileType) {
      return NextResponse.json({ error: "نوع فایل قابل تشخیص نیست" }, { status: 400 });
    }

    const validValidity = ["valid", "expired", "pending_review"].includes(validity) ? validity : "pending_review";

    const [doc] = await db
      .insert(studentDocuments)
      .values({
        registrationId: Number(registrationId),
        instituteId: inst.id,
        title,
        fileUrl,
        fileType,
        documentNumber: documentNumber || null,
        serialNumber: serialNumber || null,
        issueDate: issueDate || null,
        validity: validValidity,
        description: description || null,
      })
      .returning();

    return NextResponse.json({ ok: true, document: doc });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

/** PATCH: edit document metadata or replace the file */
export async function PATCH(request: Request) {
  const res = await getManagerInstitute();
  if ("error" in res) return NextResponse.json({ error: res.error }, { status: res.status });
  const inst = res.inst;

  try {
    const body = await request.json();
    const { documentId, title, fileUrl, documentNumber, serialNumber, issueDate, validity, description } = body;

    if (!documentId) return NextResponse.json({ error: "شناسه مدرک الزامی است" }, { status: 400 });

    const doc = await db
      .select()
      .from(studentDocuments)
      .where(and(eq(studentDocuments.id, documentId), eq(studentDocuments.instituteId, inst.id)))
      .then((r) => r[0]);
    if (!doc) return NextResponse.json({ error: "مدرک متعلق به آموزشگاه شما نیست" }, { status: 403 });

    const updateData: any = { updatedAt: new Date() };

    if (title !== undefined) updateData.title = title;
    if (documentNumber !== undefined) updateData.documentNumber = documentNumber;
    if (serialNumber !== undefined) updateData.serialNumber = serialNumber;
    if (issueDate !== undefined) updateData.issueDate = issueDate;
    if (description !== undefined) updateData.description = description;
    if (validity !== undefined) {
      if (!["valid", "expired", "pending_review"].includes(validity)) {
        return NextResponse.json({ error: "وضعیت اعتبار نامعتبر است" }, { status: 400 });
      }
      updateData.validity = validity;
    }

    if (fileUrl !== undefined) {
      const isAllowed = ALLOWED_PREFIXES.some((p) => fileUrl.startsWith(p));
      if (!isAllowed) return NextResponse.json({ error: "فرمت فایل مجاز نیست" }, { status: 400 });
      if (fileUrl.length > MAX_DOC_SIZE) return NextResponse.json({ error: "حجم فایل باید کمتر از ۲ مگابایت باشد" }, { status: 400 });
      const fileType = detectFileType(fileUrl);
      if (!fileType) return NextResponse.json({ error: "نوع فایل قابل تشخیص نیست" }, { status: 400 });
      updateData.fileUrl = fileUrl;
      updateData.fileType = fileType;
    }

    const [updated] = await db.update(studentDocuments).set(updateData).where(eq(studentDocuments.id, documentId)).returning();
    return NextResponse.json({ ok: true, document: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

/** DELETE: permanently remove a document */
export async function DELETE(request: Request) {
  const res = await getManagerInstitute();
  if ("error" in res) return NextResponse.json({ error: res.error }, { status: res.status });
  const inst = res.inst;

  try {
    const { documentId } = await request.json();
    const doc = await db
      .select()
      .from(studentDocuments)
      .where(and(eq(studentDocuments.id, documentId), eq(studentDocuments.instituteId, inst.id)))
      .then((r) => r[0]);
    if (!doc) return NextResponse.json({ error: "مدرک متعلق به آموزشگاه شما نیست" }, { status: 403 });

    await db.delete(studentDocuments).where(eq(studentDocuments.id, documentId));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
