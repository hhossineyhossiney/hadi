import { NextResponse } from "next/server";
import { load } from "cheerio";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET() {
  try {
    const response = await fetch("https://eitaa.com/AmoFan12", {
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fa-IR,fa;q=0.9,en;q=0.6",
        Referer: "https://eitaa.com/AmoFan12",
      },
    });
    const html = await response.text();
    const $ = load(html);
    const messages = $(".js-widget_message").slice(-3).map((_, element) => {
      const node = $(element);
      return {
        post: node.attr("data-post") || null,
        classes: [...new Set(node.find("[class]").map((__, child) => $(child).attr("class") || "").get().flatMap((value) => value.split(/\s+/)).filter((value) => /photo|video|media|document|message|image/i.test(value)))],
        media: node.find("[style], img, video, source, a").map((__, child) => {
          const item = $(child);
          const style = item.attr("style") || "";
          const src = item.attr("src") || item.attr("data-src") || item.attr("poster") || "";
          const href = item.attr("href") || "";
          if (!/download_|background-image|photo|video|media/i.test(`${style} ${src} ${href} ${item.attr("class") || ""}`)) return null;
          return { tag: child.tagName, class: item.attr("class") || "", style: style.slice(0, 500), src: src.slice(0, 500), href: href.slice(0, 500) };
        }).get().filter(Boolean).slice(0, 20),
      };
    }).get();
    return NextResponse.json({ status: response.status, bytes: html.length, messageCount: $(".js-widget_message").length, messages });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
