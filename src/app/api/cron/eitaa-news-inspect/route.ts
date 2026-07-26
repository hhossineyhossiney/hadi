import { NextResponse } from "next/server";
import { parseEitaaHtml } from "@/lib/eitaa-news";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const response = await fetch("https://eitaa.com/AmoFan12", {
      cache: "no-store", redirect: "follow", signal: AbortSignal.timeout(15_000),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fa-IR,fa;q=0.9,en;q=0.6",
        Referer: "https://eitaa.com/AmoFan12",
      },
    });
    const html = await response.text();
    const items = parseEitaaHtml(html);
    return NextResponse.json({ status: response.status, bytes: html.length, items: items.map((item) => ({ id: item.id, title: item.title, imageUrl: item.imageUrl || null })) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
