import { db } from "@/db";
import { otpCodes } from "@/db/schema";
import { eq, and, gt, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { normalizePhone } from "@/lib/phone";

export const dynamic = "force-dynamic";

/**
 * OTP API — action: "send" | "verify"
 * SMS provider: Kavenegar (set KAVENEGAR_API_KEY env) — falls back to dev mode
 * where the code is returned in the response for on-screen display.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, phone, code } = body;
    const cleanPhone = normalizePhone(phone || "");

    if (!/^09\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: "شماره موبایل باید دقیقاً ۱۱ رقم و با ۰۹ شروع شود" },
        { status: 400 }
      );
    }

    if (action === "send") {
      const otp = String(Math.floor(10000 + Math.random() * 90000)); // 5-digit
      const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

      await db.insert(otpCodes).values({ phone: cleanPhone, code: otp, expiresAt });

      const apiKey = process.env.KAVENEGAR_API_KEY;
      if (apiKey) {
        // Real SMS via Kavenegar verify lookup
        try {
          const res = await fetch(
            `https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json?receptor=${cleanPhone}&token=${otp}&template=${process.env.KAVENEGAR_TEMPLATE || "verify"}`
          );
          const data = await res.json();
          if (data?.return?.status === 200) {
            return NextResponse.json({ sent: true, sms: true });
          }
        } catch (e) {
          console.error("Kavenegar error:", e);
        }
      }

      // Dev fallback: no SMS provider configured — return code for on-screen display
      return NextResponse.json({ sent: true, sms: false, devCode: otp });
    }

    if (action === "verify") {
      if (!code) {
        return NextResponse.json({ error: "کد تأیید را وارد کنید" }, { status: 400 });
      }
      const record = await db
        .select()
        .from(otpCodes)
        .where(
          and(
            eq(otpCodes.phone, cleanPhone),
            eq(otpCodes.code, String(code).trim()),
            gt(otpCodes.expiresAt, new Date())
          )
        )
        .orderBy(desc(otpCodes.createdAt))
        .then((r) => r[0]);

      if (!record) {
        return NextResponse.json(
          { error: "کد تأیید نادرست است یا منقضی شده. دوباره تلاش کنید." },
          { status: 400 }
        );
      }

      await db.update(otpCodes).set({ verified: true }).where(eq(otpCodes.id, record.id));
      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ error: "action نامعتبر" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
