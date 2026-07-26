import { NextResponse } from "next/server";
import { getEitaaNewsFeed } from "@/lib/eitaa-news";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 20;

function fallback(request: Request) {
  const response = NextResponse.redirect(new URL("/images/eitaa-news-default.jpg", request.url), 307);
  response.headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  return response;
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const feed = await getEitaaNewsFeed();
  const item = feed.items.find((news) => news.id === decodeURIComponent(id));
  if (!item?.imageUrl || !item.imageUrl.startsWith("https://eitaa.com/download_")) return fallback(request);

  try {
    const upstream = await fetch(item.imageUrl, {
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(12_000),
      headers: {
        Referer: feed.channelUrl,
        "User-Agent": "Mozilla/5.0 (compatible; FanixoNewsImage/1.0; +https://www.fanixo.ir/news)",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });
    const contentType = upstream.headers.get("content-type") || "";
    if (!upstream.ok || !contentType.startsWith("image/")) return fallback(request);

    const bytes = await upstream.arrayBuffer();
    if (bytes.byteLength === 0 || bytes.byteLength > 8 * 1024 * 1024) return fallback(request);

    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "public, max-age=21600, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return fallback(request);
  }
}
