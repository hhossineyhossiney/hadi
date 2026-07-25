import { NextResponse } from "next/server";
import { refreshEitaaNewsFeed } from "@/lib/eitaa-news";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 45;

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (cronSecret && authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await refreshEitaaNewsFeed();
  const status = result.reason === "source-unavailable" ? 503 : 200;
  return NextResponse.json({
    ok: status === 200,
    source: "https://eitaa.com/tvto66",
    count: result.feed.items.length,
    refreshedAt: result.feed.refreshedAt,
    updated: result.updated,
    reason: result.reason,
    ...(result.error ? { error: result.error } : {}),
  }, { status });
}
