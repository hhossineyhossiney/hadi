import { db } from "@/db";
import { paymentFees, courses, institutes, walletTransactions, notifications } from "@/db/schema";
import { eq, and, asc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function requireUser() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) return { error: "unauthorized", status: 401 as const };
  return { userId: Number(user.id), userName: user.name || "" };
}

/** GET — all fees of current user, grouped */
export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return NextResponse.json({ groups: [] }, { status: auth.status });

  const rows = await db
    .select({
      id: paymentFees.id,
      registrationId: paymentFees.registrationId,
      courseId: paymentFees.courseId,
      courseTitle: courses.title,
      courseSlug: courses.slug,
      instituteId: paymentFees.instituteId,
      instituteName: institutes.name,
      type: paymentFees.type,
      installmentNumber: paymentFees.installmentNumber,
      totalInstallments: paymentFees.totalInstallments,
      title: paymentFees.title,
      amount: paymentFees.amount,
      dueDate: paymentFees.dueDate,
      status: paymentFees.status,
      paidAt: paymentFees.paidAt,
      paidAmount: paymentFees.paidAmount,
      paymentMethod: paymentFees.paymentMethod,
      paymentRefId: paymentFees.paymentRefId,
      isOptional: paymentFees.isOptional,
      description: paymentFees.description,
    })
    .from(paymentFees)
    .leftJoin(courses, eq(paymentFees.courseId, courses.id))
    .leftJoin(institutes, eq(paymentFees.instituteId, institutes.id))
    .where(eq(paymentFees.userId, auth.userId))
    .orderBy(asc(paymentFees.registrationId), asc(paymentFees.installmentNumber));

  // Group by registration
  const groupsMap: Record<number, any> = {};
  rows.forEach((r) => {
    const key = r.registrationId;
    if (!groupsMap[key]) {
      groupsMap[key] = {
        registrationId: r.registrationId,
        courseTitle: r.courseTitle,
        courseSlug: r.courseSlug,
        instituteName: r.instituteName,
        installments: [],
        extras: [],
        summary: {
          totalPayable: 0,
          totalPaid: 0,
          totalRemaining: 0,
          installmentsPaid: 0,
          installmentsTotal: 0,
        },
      };
    }
    const g = groupsMap[key];
    const item = { ...r, amount: Number(r.amount || 0), paidAmount: Number(r.paidAmount || 0) };

    if (r.type === "installment") {
      g.installments.push(item);
      g.summary.installmentsTotal += 1;
      if (r.status === "paid") g.summary.installmentsPaid += 1;
    } else {
      g.extras.push(item);
    }

    // Skip waived from totals
    if (r.status !== "waived") {
      g.summary.totalPayable += item.amount;
      if (r.status === "paid") g.summary.totalPaid += item.amount;
    }
  });

  Object.values(groupsMap).forEach((g: any) => {
    g.summary.totalRemaining = g.summary.totalPayable - g.summary.totalPaid;
  });

  return NextResponse.json({ groups: Object.values(groupsMap) });
}

/**
 * POST — pay a fee from wallet
 * Body: { feeId }
 */
export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();
  const feeId = Number(body.feeId);
  if (!feeId) return NextResponse.json({ error: "feeId required" }, { status: 400 });

  const fee = await db.select().from(paymentFees)
    .where(and(eq(paymentFees.id, feeId), eq(paymentFees.userId, auth.userId)))
    .then((r) => r[0]);
  if (!fee) return NextResponse.json({ error: "قسط یافت نشد" }, { status: 404 });
  if (fee.status === "paid") return NextResponse.json({ error: "قبلاً پرداخت شده" }, { status: 400 });
  if (fee.status === "waived") return NextResponse.json({ error: "این هزینه بخشوده شده" }, { status: 400 });

  const amount = Number(fee.amount);

  // Get current balance
  let balance = 0;
  try {
    const res: any = await db.execute(sql`SELECT wallet_balance FROM users WHERE id = ${auth.userId} LIMIT 1`);
    balance = Number(res.rows?.[0]?.wallet_balance || 0);
  } catch {}

  if (balance < amount) {
    return NextResponse.json({
      error: "موجودی کیف پول کافی نیست",
      needed: amount,
      balance,
      shortage: amount - balance,
    }, { status: 400 });
  }

  const newBalance = balance - amount;

  try {
    // Deduct from wallet
    await db.execute(sql`UPDATE users SET wallet_balance = ${String(newBalance)} WHERE id = ${auth.userId}`);

    // Log wallet transaction
    const [tx] = await db.insert(walletTransactions).values({
      userId: auth.userId,
      amount: String(amount) as any,
      type: "payment",
      description: `${fee.title} — دوره ${fee.courseId}`,
      balanceAfter: String(newBalance) as any,
      registrationId: fee.registrationId,
    }).returning();

    // Mark fee as paid
    const [updated] = await db.update(paymentFees).set({
      status: "paid",
      paidAt: new Date(),
      paidAmount: String(amount) as any,
      paymentMethod: "wallet",
      paymentRefId: `WT-${tx.id}`,
      transactionId: tx.id,
      updatedAt: new Date(),
    }).where(eq(paymentFees.id, feeId)).returning();

    // Notify manager
    try {
      const inst: any = await db.execute(sql`SELECT user_id FROM institutes WHERE id = ${fee.instituteId} LIMIT 1`);
      const managerId = inst.rows?.[0]?.user_id;
      if (managerId) {
        await db.insert(notifications).values({
          userId: managerId,
          userRole: "institute",
          title: "💳 پرداخت جدید ثبت شد",
          body: `${auth.userName} — ${fee.title} — مبلغ ${amount.toLocaleString("fa-IR")} تومان (از کیف پول)`,
          type: "success",
          link: "/panel",
        });
      }
    } catch {}

    // Notify user
    try {
      await db.insert(notifications).values({
        userId: auth.userId,
        userRole: "student",
        title: "✅ پرداخت موفق از کیف پول",
        body: `${fee.title} — مبلغ ${amount.toLocaleString("fa-IR")} تومان از موجودی شما کسر شد.`,
        type: "success",
        link: "/dashboard",
      });
    } catch {}

    return NextResponse.json({ ok: true, fee: updated, balance: newBalance });
  } catch (e: any) {
    console.error("Pay fee failed:", e);
    return NextResponse.json({ error: "خطا در پرداخت: " + e?.message }, { status: 500 });
  }
}
