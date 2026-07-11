import { db } from "@/db";
import { paymentFees, registrations, institutes, courses, notifications } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function requireManager() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) return { error: "unauthorized", status: 401 as const };

  const inst = await db.select().from(institutes)
    .where(eq(institutes.userId, Number(user.id)))
    .then((r) => r[0]);
  if (!inst) return { error: "no institute", status: 403 as const };
  return { userId: Number(user.id), instituteId: inst.id, instituteName: inst.name };
}

/** GET — list fees for a registration */
export async function GET(request: Request) {
  const auth = await requireManager();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const registrationId = Number(searchParams.get("registrationId"));
  if (!registrationId) return NextResponse.json({ error: "registrationId required" }, { status: 400 });

  // Verify ownership
  const reg = await db.select().from(registrations)
    .where(and(eq(registrations.id, registrationId), eq(registrations.instituteId, auth.instituteId)))
    .then((r) => r[0]);
  if (!reg) return NextResponse.json({ error: "not your student" }, { status: 403 });

  const fees = await db.select().from(paymentFees)
    .where(eq(paymentFees.registrationId, registrationId))
    .orderBy(paymentFees.installmentNumber, paymentFees.dueDate);

  return NextResponse.json(fees);
}

/**
 * POST — create fee plan (multiple installments at once, or single extra fee)
 * Body:
 *   For installments plan:
 *     { registrationId, plan: "installments",
 *       installments: [{ amount, dueDate, title? }, ...] }
 *   For single extra fee:
 *     { registrationId, plan: "extra",
 *       type: "certificate"|"exam_first"|"exam_retry"|"government_dahak"|"extra",
 *       title, amount, dueDate?, isOptional?, description? }
 */
export async function POST(request: Request) {
  const auth = await requireManager();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();
  const registrationId = Number(body.registrationId);
  const plan = body.plan || "installments";

  const reg = await db.select().from(registrations)
    .where(and(eq(registrations.id, registrationId), eq(registrations.instituteId, auth.instituteId)))
    .then((r) => r[0]);
  if (!reg) return NextResponse.json({ error: "not your student" }, { status: 403 });

  const course = await db.select({ title: courses.title }).from(courses)
    .where(eq(courses.id, reg.courseId)).then((r) => r[0]);

  if (plan === "installments") {
    const installments = Array.isArray(body.installments) ? body.installments : [];
    if (installments.length < 1) return NextResponse.json({ error: "حداقل یک قسط الزامی است" }, { status: 400 });
    if (installments.length > 24) return NextResponse.json({ error: "حداکثر ۲۴ قسط" }, { status: 400 });

    // Delete existing installments (replace plan)
    await db.delete(paymentFees).where(and(
      eq(paymentFees.registrationId, registrationId),
      eq(paymentFees.type, "installment"),
      eq(paymentFees.status, "pending")
    ));

    const rows = installments.map((inst: any, i: number) => {
      const amt = Number(inst.amount);
      if (isNaN(amt) || amt <= 0) throw new Error(`مبلغ قسط ${i + 1} نامعتبر است`);
      return {
        registrationId,
        userId: reg.userId!,
        courseId: reg.courseId,
        instituteId: reg.instituteId,
        type: "installment",
        installmentNumber: i + 1,
        totalInstallments: installments.length,
        title: inst.title || `قسط ${i + 1} از ${installments.length}`,
        amount: String(amt) as any,
        dueDate: inst.dueDate || null,
        status: "pending",
      };
    });

    try {
      const inserted = await db.insert(paymentFees).values(rows).returning();
      // Notify student
      if (reg.userId) {
        try {
          const total = installments.reduce((s: number, x: any) => s + Number(x.amount || 0), 0);
          await db.insert(notifications).values({
            userId: reg.userId,
            userRole: "student",
            title: "📋 برنامه قسط‌بندی شهریه صادر شد",
            body: `${auth.instituteName}: دوره «${course?.title || ""}» — ${installments.length} قسط به مبلغ کل ${total.toLocaleString("fa-IR")} تومان`,
            type: "info",
            link: "/dashboard",
          });
        } catch {}
      }
      return NextResponse.json({ ok: true, count: inserted.length, fees: inserted });
    } catch (e: any) {
      return NextResponse.json({ error: e?.message || "خطا در ثبت اقساط" }, { status: 500 });
    }
  }

  // Single extra fee
  const type = String(body.type || "extra");
  const amount = Number(body.amount);
  if (!amount || amount <= 0) return NextResponse.json({ error: "مبلغ نامعتبر" }, { status: 400 });
  if (!body.title) return NextResponse.json({ error: "عنوان الزامی است" }, { status: 400 });

  const [row] = await db.insert(paymentFees).values({
    registrationId,
    userId: reg.userId!,
    courseId: reg.courseId,
    instituteId: reg.instituteId,
    type,
    installmentNumber: 0,
    totalInstallments: 0,
    title: String(body.title).slice(0, 250),
    amount: String(amount) as any,
    dueDate: body.dueDate || null,
    isOptional: !!body.isOptional,
    description: body.description || null,
    status: "pending",
  }).returning();

  // Notify
  if (reg.userId) {
    try {
      const typeLabel: Record<string, string> = {
        certificate: "💎 هزینه صدور مدرک",
        exam_first: "📝 هزینه آزمون",
        exam_retry: "🔄 هزینه آزمون مجدد",
        government_dahak: "🏛️ هزینه دهک‌بندی دولت",
        extra: "💰 هزینه اضافه",
      };
      await db.insert(notifications).values({
        userId: reg.userId,
        userRole: "student",
        title: `${typeLabel[type] || "💰 هزینه جدید"} برای دوره`,
        body: `${body.title} — مبلغ: ${amount.toLocaleString("fa-IR")} تومان${body.isOptional ? " (اختیاری)" : ""}`,
        type: "info",
        link: "/dashboard",
      });
    } catch {}
  }

  return NextResponse.json({ ok: true, fee: row });
}

/** PATCH — update or mark fee as paid manually (cash/manual) */
export async function PATCH(request: Request) {
  const auth = await requireManager();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();
  const id = Number(body.id);
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const fee = await db.select().from(paymentFees).where(eq(paymentFees.id, id)).then((r) => r[0]);
  if (!fee || fee.instituteId !== auth.instituteId) {
    return NextResponse.json({ error: "not your fee" }, { status: 403 });
  }

  const updates: any = {};
  if (body.amount !== undefined) updates.amount = String(Number(body.amount));
  if (body.dueDate !== undefined) updates.dueDate = body.dueDate || null;
  if (body.title !== undefined) updates.title = String(body.title).slice(0, 250);
  if (body.description !== undefined) updates.description = body.description || null;

  if (body.markPaid === true) {
    updates.status = "paid";
    updates.paidAt = new Date();
    updates.paidAmount = fee.amount;
    updates.paymentMethod = body.method || "manual";
    updates.paymentRefId = body.refId || null;

    // Notify student
    if (fee.userId) {
      try {
        await db.insert(notifications).values({
          userId: fee.userId,
          userRole: "student",
          title: "✅ پرداخت شما ثبت شد",
          body: `${fee.title} — مبلغ ${Number(fee.amount).toLocaleString("fa-IR")} تومان توسط مدیر آموزشگاه تأیید شد.`,
          type: "success",
          link: "/dashboard",
        });
      } catch {}
    }
  }
  if (body.markUnpaid === true) {
    updates.status = "pending";
    updates.paidAt = null;
    updates.paidAmount = null;
    updates.paymentMethod = null;
    updates.paymentRefId = null;
  }
  if (body.markWaived === true) {
    updates.status = "waived";
  }

  updates.updatedAt = new Date();

  const [updated] = await db.update(paymentFees).set(updates).where(eq(paymentFees.id, id)).returning();
  return NextResponse.json({ ok: true, fee: updated });
}

/** DELETE — delete a fee (only pending) */
export async function DELETE(request: Request) {
  const auth = await requireManager();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();
  const id = Number(body.id);
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const fee = await db.select().from(paymentFees).where(eq(paymentFees.id, id)).then((r) => r[0]);
  if (!fee || fee.instituteId !== auth.instituteId) {
    return NextResponse.json({ error: "not your fee" }, { status: 403 });
  }
  if (fee.status === "paid") return NextResponse.json({ error: "قسط پرداخت‌شده قابل حذف نیست. ابتدا لغو پرداخت کنید." }, { status: 400 });

  await db.delete(paymentFees).where(eq(paymentFees.id, id));
  return NextResponse.json({ ok: true });
}
