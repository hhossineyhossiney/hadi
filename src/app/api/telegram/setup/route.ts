import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN ||
  "8961723308:AAEMOiqT_D8GZ2U2EYQQfkbtk-rufunkXU0";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const baseUrl =
    searchParams.get("url") ||
    process.env.NEXTAUTH_URL ||
    "https://amozeshgahazadconfig.vercel.app";

  const webhookUrl = `${baseUrl.replace(/\/$/, "")}/api/telegram/webhook`;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl }),
      }
    );
    const data = await res.json();

    return NextResponse.json({
      success: true,
      webhookUrl,
      telegramResponse: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
