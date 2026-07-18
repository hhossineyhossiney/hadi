import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/db";
import { authOptions } from "@/lib/auth";
import { institutes } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

function rowsOf<T = Record<string, unknown>>(result: unknown): T[] {
  const value = result as { rows?: T[] } | T[];
  return Array.isArray(value) ? value : value.rows || [];
}

async function managerInstitute() {
  const session = await getServerSession(authOptions);
  const userId = Number((session?.user as { id?: string | number } | undefined)?.id || 0);
  if (!userId) return null;
  return db.select().from(institutes).where(eq(institutes.userId, userId)).then((items) => items[0] || null);
}

async function syncCount(courseId: number) {
  await db.execute(sql`
    UPDATE sellable_courses
    SET students_count = (SELECT COUNT(*)::int FROM sellable_purchases WHERE course_id = ${courseId} AND status = 'paid'),
        updated_at = NOW()
    WHERE id = ${courseId}
  `);
}

export async function GET(request: Request) {
  try {
    const institute = await managerInstitute();
    if (!institute) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    const courseId = Number(new URL(request.url).searchParams.get("courseId") || 0);
    if (!courseId) return NextResponse.json({ error: "courseId الزامی است" }, { status: 400 });
    const owned = await db.execute(sql`SELECT id, title FROM sellable_courses WHERE id = ${courseId} AND institute_id = ${institute.id} LIMIT 1`);
    const course = rowsOf<{ id: number; title: string }>(owned)[0];
    if (!course) return NextResponse.json({ error: "دوره یافت نشد" }, { status: 404 });

    await syncCount(courseId);
    const result = await db.execute(sql`
      SELECT sp.id, sp.user_id, u.name AS user_name, u.phone, u.email,
             sp.amount, sp.commission, sp.net_amount, sp.payment_method,
             sp.payment_ref, sp.status, sp.progress, sp.created_at, sp.updated_at
      FROM sellable_purchases sp
      LEFT JOIN users u ON u.id = sp.user_id
      WHERE sp.course_id = ${courseId} AND sp.institute_id = ${institute.id}
      ORDER BY sp.created_at DESC
    `);
    const purchases = rowsOf<any>(result).map((row) => ({
      id: Number(row.id), userId: Number(row.user_id), userName: row.user_name || "هنرجو",
      phone: row.phone, email: row.email, amount: row.amount, commission: row.commission,
      netAmount: row.net_amount, paymentMethod: row.payment_method, paymentRef: row.payment_ref,
      status: row.status, progress: Number(row.progress || 0), createdAt: row.created_at, updatedAt: row.updated_at,
    }));
    return NextResponse.json({
      course,
      purchases,
      stats: {
        total: purchases.length,
        paid: purchases.filter((item) => item.status === "paid").length,
        pending: purchases.filter((item) => item.status === "pending").length,
        refunded: purchases.filter((item) => item.status === "refunded").length,
        revenue: purchases.filter((item) => item.status === "paid").reduce((sum, item) => sum + Number(item.amount || 0), 0),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "خطا در دریافت خریدها" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const institute = await managerInstitute();
    if (!institute) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    const body = await request.json();
    const purchaseId = Number(body.purchaseId || 0);
    const action = String(body.action || "");
    const purchaseResult = await db.execute(sql`
      SELECT sp.* FROM sellable_purchases sp
      WHERE sp.id = ${purchaseId} AND sp.institute_id = ${institute.id} LIMIT 1
    `);
    const purchase = rowsOf<any>(purchaseResult)[0];
    if (!purchase) return NextResponse.json({ error: "خرید یافت نشد" }, { status: 404 });

    if (action === "delete") {
      if (purchase.status === "paid") return NextResponse.json({ error: "خرید پرداخت‌شده ابتدا باید مسترد شود" }, { status: 400 });
      await db.execute(sql`DELETE FROM sellable_purchases WHERE id = ${purchaseId}`);
      await syncCount(Number(purchase.course_id));
      return NextResponse.json({ ok: true });
    }

    if (action !== "status") return NextResponse.json({ error: "عملیات نامعتبر است" }, { status: 400 });
    const status = ["pending", "paid", "failed", "refunded"].includes(body.status) ? String(body.status) : null;
    if (!status) return NextResponse.json({ error: "وضعیت نامعتبر است" }, { status: 400 });
    if (purchase.status === status) return NextResponse.json({ ok: true });

    await db.transaction(async (tx) => {
      if (purchase.status === "paid" && status === "refunded" && purchase.payment_method === "wallet") {
        const amount = Number(purchase.amount || 0);
        const balanceResult = await tx.execute(sql`SELECT COALESCE(wallet_balance, 0)::numeric AS balance FROM users WHERE id = ${Number(purchase.user_id)} FOR UPDATE`);
        const balance = Number(rowsOf<{ balance: string }>(balanceResult)[0]?.balance || 0);
        const nextBalance = balance + amount;
        await tx.execute(sql`UPDATE users SET wallet_balance = ${nextBalance} WHERE id = ${Number(purchase.user_id)}`);
        await tx.execute(sql`
          INSERT INTO wallet_transactions (user_id, amount, type, description, balance_after, created_at)
          VALUES (${Number(purchase.user_id)}, ${amount}, 'refund', ${`استرداد خرید دوره آنلاین #${purchaseId}`}, ${nextBalance}, NOW())
        `);
      }
      await tx.execute(sql`
        UPDATE sellable_purchases
        SET status = ${status},
            payment_method = CASE WHEN ${status} = 'paid' AND status <> 'paid' THEN 'manual' ELSE payment_method END,
            updated_at = NOW()
        WHERE id = ${purchaseId}
      `);
    });
    await syncCount(Number(purchase.course_id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "خطا در مدیریت خرید" }, { status: 500 });
  }
}
