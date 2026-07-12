import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { sellableCourses, sellablePurchases, sellablePermissions, walletTransactions } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const s = await getServerSession(authOptions);
    const uid = Number((s?.user as any)?.id);
    if (!uid) return NextResponse.json({ error: "برای خرید ابتدا وارد شوید" }, { status: 401 });

    const { courseId, method } = await req.json();
    const course = await db.select().from(sellableCourses).where(eq(sellableCourses.id, Number(courseId))).then(r => r[0]);
    if (!course || !course.isPublished) return NextResponse.json({ error: "دوره یافت نشد" }, { status: 404 });

    // Check duplicate
    const existing = await db.select().from(sellablePurchases)
      .where(and(eq(sellablePurchases.userId, uid), eq(sellablePurchases.courseId, course.id), eq(sellablePurchases.status, "paid")))
      .then(r => r[0]);
    if (existing) return NextResponse.json({ error: "شما قبلاً این دوره را خریداری کرده‌اید", alreadyPurchased: true }, { status: 409 });

    const perm = await db.select().from(sellablePermissions).where(eq(sellablePermissions.instituteId, course.instituteId)).then(r => r[0]);
    const commissionPct = Number(perm?.commissionPercent || "10.00");
    const amount = Number(course.price);
    const commission = Math.floor(amount * commissionPct / 100);
    const net = amount - commission;

    if (method === "wallet") {
      // Read wallet balance
      const balRow = await db.execute(sql`SELECT COALESCE(wallet_balance, 0)::text AS bal FROM users WHERE id = ${uid}`);
      const bal = Number(((balRow as any).rows || balRow)[0]?.bal || 0);
      if (bal < amount) {
        return NextResponse.json({ error: `موجودی کیف پول کافی نیست (نیاز: ${amount.toLocaleString("fa-IR")} تومان — موجودی: ${bal.toLocaleString("fa-IR")})`, need: amount, have: bal }, { status: 400 });
      }
      const newBal = bal - amount;
      await db.execute(sql`UPDATE users SET wallet_balance = ${newBal} WHERE id = ${uid}`);

      const [tx] = await db.insert(walletTransactions).values({
        userId: uid,
        amount: String(amount),
        type: "payment",
        description: `خرید دوره فروشی: ${course.title}`,
        balanceAfter: String(newBal),
      }).returning();

      const [purchase] = await db.insert(sellablePurchases).values({
        userId: uid,
        courseId: course.id,
        instituteId: course.instituteId,
        amount: String(amount),
        commission: String(commission),
        netAmount: String(net),
        paymentMethod: "wallet",
        paymentRef: `TX-${tx.id}`,
        status: "paid",
      }).returning();

      // increment students count
      await db.execute(sql`UPDATE sellable_courses SET students_count = students_count + 1 WHERE id = ${course.id}`);

      return NextResponse.json({ ok: true, purchase, redirectTo: `/shop/${course.slug}` });
    }

    // fallback: create pending purchase — future integration with ZarinPal
    const [pending] = await db.insert(sellablePurchases).values({
      userId: uid,
      courseId: course.id,
      instituteId: course.instituteId,
      amount: String(amount),
      commission: String(commission),
      netAmount: String(net),
      paymentMethod: "online",
      status: "pending",
    }).returning();

    return NextResponse.json({ ok: true, purchase: pending, needsOnlinePayment: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "خطا در خرید" }, { status: 500 });
  }
}
