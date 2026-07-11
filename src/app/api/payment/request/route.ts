import { db } from "@/db";
import { walletTransactions } from "@/db/schema";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requestPayment, ZarinPalStatus } from "@/lib/zarinpal";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * POST /api/payment/request
 * Body: { amount: number (Toman), purpose: "wallet_charge" | "course_payment", meta?: any }
 * Returns: { paymentUrl, authority }
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) return NextResponse.json({ error: "لطفاً وارد حساب کاربری شوید" }, { status: 401 });

  const body = await request.json();
  const amount = Number(body.amount);
  const purpose = body.purpose || "wallet_charge";
  const meta = body.meta || {};

  if (!amount || amount < 1000) {
    return NextResponse.json({ error: "حداقل مبلغ ۱,۰۰۰ تومان است" }, { status: 400 });
  }
  if (amount > 500_000_000) {
    return NextResponse.json({ error: "حداکثر مبلغ ۵۰۰ میلیون تومان است" }, { status: 400 });
  }

  // Build callback URL
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("host") || "amozeshgahazadconfig.vercel.app";
  const callbackUrl = `${proto}://${host}/api/payment/verify?purpose=${encodeURIComponent(purpose)}&amount=${amount}&userId=${user.id}${meta.registrationId ? `&registrationId=${meta.registrationId}` : ""}`;

  const description =
    purpose === "wallet_charge"
      ? `شارژ کیف پول - کاربر ${user.name || user.phone}`
      : purpose === "course_payment"
        ? `پرداخت شهریه دوره - ${meta.courseTitle || ""}`
        : "پرداخت آنلاین";

  const result = await requestPayment({
    amount,
    description,
    callbackUrl,
    mobile: user.phone || "",
    email: user.email || "",
    metadata: { userId: user.id, purpose, ...meta },
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error || "خطا در درگاه پرداخت", errorCode: result.errorCode }, { status: 500 });
  }

  // Log a pending transaction (optional)
  try {
    await db.insert(walletTransactions).values({
      userId: Number(user.id),
      amount: String(amount) as any,
      type: "pending",
      description: `${description} — در انتظار تأیید درگاه`,
      balanceAfter: null as any,
      registrationId: meta.registrationId || null,
    });
  } catch (e) { console.error("log pending tx failed:", e); }

  return NextResponse.json({
    ok: true,
    paymentUrl: result.paymentUrl,
    authority: result.authority,
    sandbox: result.sandbox,
    merchantConfigured: ZarinPalStatus.merchantConfigured,
  });
}
