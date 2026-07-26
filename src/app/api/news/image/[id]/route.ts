import { NextResponse } from "next/server";
import { getEitaaNewsFeed } from "@/lib/eitaa-news";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 20;

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&apos;",
  })[character] || character);
}

function titleLines(value: string) {
  const words = value.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > 34 && current) {
      lines.push(current);
      current = word;
    } else current = next;
  });
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function fallback(request: Request, item?: { title: string; dateLabel: string }) {
  if (!item) {
    const response = NextResponse.redirect(new URL("/images/eitaa-news-default.jpg", request.url), 307);
    response.headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    return response;
  }

  const lines = titleLines(item.title);
  const lineMarkup = lines.map((line, index) =>
    `<text x="1060" y="${315 + index * 78}" text-anchor="end" direction="rtl" unicode-bidi="plaintext" font-family="Tahoma,Arial,sans-serif" font-size="52" font-weight="700" fill="#f8fbff">${escapeXml(line)}</text>`
  ).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#031426"/><stop offset="1" stop-color="#0a3b62"/></linearGradient>
      <radialGradient id="g"><stop stop-color="#22d3ee" stop-opacity=".28"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/></radialGradient>
      <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="#67e8f9" stroke-opacity=".08"/></pattern>
    </defs>
    <rect width="1200" height="675" fill="url(#bg)"/><rect width="1200" height="675" fill="url(#grid)"/>
    <circle cx="130" cy="550" r="390" fill="url(#g)"/><circle cx="1080" cy="90" r="260" fill="url(#g)" opacity=".55"/>
    <rect x="55" y="55" width="1090" height="565" rx="34" fill="none" stroke="#67e8f9" stroke-opacity=".2" stroke-width="2"/>
    <rect x="780" y="92" width="305" height="58" rx="29" fill="#0b4165" stroke="#d4af37" stroke-opacity=".65"/>
    <text x="1045" y="131" text-anchor="end" direction="rtl" unicode-bidi="plaintext" font-family="Tahoma,Arial,sans-serif" font-size="26" font-weight="700" fill="#f4d57c">اخبار مهارت زبرخان</text>
    <text x="1060" y="225" text-anchor="end" direction="rtl" unicode-bidi="plaintext" font-family="Tahoma,Arial,sans-serif" font-size="31" fill="#75e6ed">${escapeXml(item.dateLabel)}</text>
    ${lineMarkup}
    <path d="M140 230v250M110 265h60M110 445h60" stroke="#67e8f9" stroke-width="6" stroke-linecap="round" opacity=".8"/>
    <circle cx="140" cy="205" r="66" fill="#082f50" stroke="#d4af37" stroke-width="5"/>
    <text x="140" y="226" text-anchor="middle" font-family="Arial,sans-serif" font-size="55" font-weight="700" fill="#f4d57c">F</text>
    <text x="1060" y="570" text-anchor="end" direction="rtl" unicode-bidi="plaintext" font-family="Tahoma,Arial,sans-serif" font-size="25" fill="#9fc0d5">منبع: کانال ایتا @AmoFan12</text>
    <text x="140" y="570" font-family="Arial,sans-serif" font-size="26" font-weight="700" fill="#67e8f9">fanixo.ir</text>
  </svg>`;

  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=21600, stale-while-revalidate=86400",
      "X-Fanixo-News-Image": "generated-cover",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const feed = await getEitaaNewsFeed();
  const item = feed.items.find((news) => news.id === decodeURIComponent(id));
  if (!item) return fallback(request);
  if (!item.imageUrl || !item.imageUrl.startsWith("https://eitaa.com/download_")) return fallback(request, item);

  try {
    const upstream = await fetch(item.imageUrl, {
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(12_000),
      headers: {
        Referer: feed.channelUrl,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });
    const contentType = upstream.headers.get("content-type") || "";
    if (!upstream.ok || !contentType.startsWith("image/")) return fallback(request, item);

    const bytes = await upstream.arrayBuffer();
    if (bytes.byteLength === 0 || bytes.byteLength > 8 * 1024 * 1024) return fallback(request, item);

    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "public, max-age=21600, stale-while-revalidate=86400",
        "X-Fanixo-News-Image": "eitaa-original",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return fallback(request, item);
  }
}
