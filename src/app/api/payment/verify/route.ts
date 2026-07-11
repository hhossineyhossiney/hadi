import { db } from "@/db";
import { walletTransactions, users, registrations, notifications } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { verifyPayment } from "@/lib/zarinpal";

export const dynamic = "force-dynamic";

/**
 * GET /api/payment/verify
 * Called by ZarinPal after user completes payment.
 * Query params (from callback URL): Authority, Status, purpose, amount, userId, registrationId?
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const authority = searchParams.get("Authority") || "";
  const status = searchParams.get("Status") || "";
  const purpose = searchParams.get("purpose") || "wallet_charge";
  const amount = Number(searchParams.get("amount") || 0);
  const userId = Number(searchParams.get("userId") || 0);
  const registrationId = Number(searchParams.get("registrationId") || 0);

  // Build UI redirect URL
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("host") || "amozeshgahazadconfig.vercel.app";
  const successUrl = `${proto}://${host}/payment/result?status=success&purpose=${purpose}`;
  const failUrl = (reason: string) =>
    `${proto}://${host}/payment/result?status=failed&reason=${encodeURIComponent(reason)}&purpose=${purpose}`;

  if (!authority || !amount || !userId) {
    return NextResponse.redirect(failUrl("پارامترهای پرداخت نامعتبر"));
  }

  // If user cancelled at gateway
  if (status !== "OK") {
    // Clean up pending tx
    try {
      await db.execute(sql`
        DELETE FROM wallet_transactions
        WHERE user_id = ${userId} AND type = 'pending' AND amount = ${String(amount)}
      `);
    } catch {}
    return NextResponse.redirect(failUrl("پرداخت توسط کاربر لغو شد"));
  }

  // Verify with ZarinPal
  const verifyResult = await verifyPayment(authority, amount);
  if (!verifyResult.ok) {
    return NextResponse.redirect(failUrl(verifyResult.error || "تأیید پرداخت ناموفق"));
  }

  const refId = verifyResult.refId || "";

  // Get current balance
  let currentBalance = 0;
  try {
    const res: any = await db.execute(sql`SELECT wallet_balance FROM users WHERE id = ${userId} LIMIT 1`);
    currentBalance = Number(res.rows?.[0]?.wallet_balance || 0);
  } catch {}

  const newBalance = currentBalance + amount;

  // ═══════ WALLET CHARGE FLOW ═══════
  if (purpose === "wallet_charge") {
    try {
      await db.execute(sql`UPDATE users SET wallet_balance = ${String(newBalance)} WHERE id = ${userId}`);
    } catch (e: any) {
      console.error("wallet update failed:", e);
      return NextResponse.redirect(failUrl("خطا در به‌روزرسانی موجودی. کد پیگیری: " + refId));
    }

    // Remove pending tx, log successful deposit
    try {
      await db.execute(sql`
        DELETE FROM wallet_transactions
        WHERE user_id = ${userId} AND type = 'pending' AND amount = ${String(amount)}
      `);
      await db.insert(walletTransactions).values({
        userId,
        amount: String(amount) as any,
        type: "deposit",
        description: `شارژ آنلاین کیف پول (کد پیگیری: ${refId})`,
        balanceAfter: String(newBalance) as any,
      });
    } catch (e) { console.error("log deposit failed:", e); }

    // Notify user
    try {
      await db.insert(notifications).values({
        userId,
        userRole: "student",
        title: "✅ شارژ کیف پول موفق",
        body: `مبلغ ${amount.toLocaleString("fa-IR")} تومان به کیف پول شما اضافه شد. کد پیگیری: ${refId}`,
        type: "success",
        link: "/dashboard",
      });
    } catch {}

    return NextResponse.redirect(`${successUrl}&refId=${encodeURIComponent(refId)}&amount=${amount}`);
  }

  // ═══════ COURSE PAYMENT FLOW ═══════
  if (purpose === "course_payment" && registrationId) {
    try {
      // Log payment
      await db.execute(sql`
        DELETE FROM wallet_transactions
        WHERE user_id = ${userId} AND type = 'pending' AND amount = ${String(amount)}
      `);
      await db.insert(walletTransactions).values({
        userId,
        amount: String(amount) as any,
        type: "payment",
        description: `پرداخت شهریه دوره (کد پیگیری: ${refId})`,
        balanceAfter: String(currentBalance) as any,
        registrationId,
      });

      // Approve the registration (optional — depends on your workflow)
      // Uncomment to auto-approve after payment:
      // await db.update(registrations).set({ status: "approved" }).where(eq(registrations.id, registrationId));

      // Notify user
      await db.insert(notifications).values({
        userId,
        userRole: "student",
        title: "💳 پرداخت شهریه موفق",
        body: `مبلغ ${amount.toLocaleString("fa-IR")} تومان بابت شهریه دوره پرداخت شد. کد پیگیری: ${refId}`,
        type: "success",
        link: "/dashboard",
      });
    } catch (e) { console.error("course payment log failed:", e); }

    return NextResponse.redirect(`${successUrl}&refId=${encodeURIComponent(refId)}&amount=${amount}`);
  }

  // Fallback
  return NextResponse.redirect(`${successUrl}&refId=${encodeURIComponent(refId)}&amount=${amount}`);
}
