import { load } from "cheerio";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { EITAA_NEWS_FALLBACK } from "@/data/eitaa-news-fallback";
import type { EitaaNewsFeed, EitaaNewsItem } from "@/lib/eitaa-news-types";

const CHANNEL_USERNAME = "AmoFan12";
const CHANNEL_URL = `https://eitaa.com/${CHANNEL_USERNAME}`;
const CACHE_KEY = "eitaa_news_amofan12";
const MAX_ITEMS = 10;
const MIN_REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;
const CHANNEL_NAME = "اطلاع‌رسانی آموزش فنی و حرفه‌ای زبرخان";

function normalizeText(value: string) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanMarkdown(value: string) {
  return normalizeText(
    value
      .replace(/\[([^\]]*)\]\(([^)]+)\)/g, "$1")
      .replace(/\\([*_`~#>+\-=|{}.!])/g, "$1")
      .replace(/\*|__/g, "")
      .replace(/^\s*[-*]\s+/gm, "• ")
  );
}

function makeTitle(body: string, fallbackIndex?: number) {
  const firstUsefulLine = body
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 2 && !/^@/.test(line));

  if (!firstUsefulLine) {
    return fallbackIndex
      ? `اطلاعیه تصویری شماره ${fallbackIndex.toLocaleString("fa-IR")}`
      : "اطلاعیه تصویری آموزشگاه‌های فنی و حرفه‌ای آزاد";
  }

  const cleaned = firstUsefulLine.replace(/^[◼◾▫️🔹📢📌💢▶️\s]+/u, "").trim();
  if (cleaned.length <= 125) return cleaned;
  const sentence = cleaned.match(/^.{35,125}?[.!؟](?:\s|$)/u)?.[0]?.trim();
  return sentence || `${cleaned.slice(0, 122).trim()}…`;
}

function formatPersianDate(isoDate: string | null) {
  if (!isoDate) return "تاریخ درج‌شده در ایتا";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "تاریخ درج‌شده در ایتا";
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    day: "numeric",
    month: "long",
  }).format(date);
}

function normalizeImageUrl(url: string | undefined) {
  if (!url) return undefined;
  try {
    return new URL(url.replace(/\\_/g, "_"), CHANNEL_URL).toString();
  } catch {
    return undefined;
  }
}

export function parseEitaaHtml(html: string): EitaaNewsItem[] {
  const $ = load(html);
  const byId = new Map<string, EitaaNewsItem>();

  $(".js-widget_message_wrap").each((_, wrapper) => {
    const message = $(wrapper).find(".js-widget_message").first();
    const dataPost = message.attr("data-post") || "";
    const id = dataPost.split("/").pop()?.replace(/\D/g, "");
    if (!id) return;

    const textElement = message.find(".js-message_text").first().clone();
    textElement.find("br").replaceWith("\n");
    const body = normalizeText(textElement.text());

    const timeElement = message.find("time").first();
    const rawDate = timeElement.attr("datetime") || null;
    const publishedAt = rawDate && !Number.isNaN(new Date(rawDate).getTime())
      ? new Date(rawDate).toISOString()
      : null;

    let imageUrl: string | undefined;
    message.find("[style*='background-image']").each((__, media) => {
      if (imageUrl) return;
      const style = $(media).attr("style") || "";
      const match = style.match(/background-image\s*:\s*url\((['"]?)(.*?)\1\)/i);
      const candidate = normalizeImageUrl(match?.[2]);
      if (candidate?.includes("eitaa.com/download_")) imageUrl = candidate;
    });
    if (!imageUrl) {
      message.find("img").each((__, media) => {
        if (imageUrl) return;
        const candidate = normalizeImageUrl($(media).attr("src") || $(media).attr("data-src"));
        if (candidate?.includes("eitaa.com/download_")) imageUrl = candidate;
      });
    }
    if (!imageUrl) {
      const poster = normalizeImageUrl(message.find("video").first().attr("poster"));
      if (poster?.includes("eitaa.com/download_")) imageUrl = poster;
    }

    const existing = byId.get(id);
    const item: EitaaNewsItem = {
      id,
      title: makeTitle(body),
      body: body || "این خبر به‌صورت تصویری در کانال رسمی منتشر شده است. برای مشاهده کامل، منبع خبر را باز کنید.",
      dateLabel: formatPersianDate(publishedAt),
      publishedAt,
      sourceUrl: `https://eitaa.com/s/${CHANNEL_USERNAME}/${id}`,
      ...(imageUrl ? { imageUrl } : {}),
    };

    if (!existing || item.body.length > existing.body.length) byId.set(id, item);
  });

  return [...byId.values()]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, MAX_ITEMS);
}

export function parseEitaaReaderMarkdown(markdown: string): EitaaNewsItem[] {
  const content = markdown.includes("Markdown Content:")
    ? markdown.split("Markdown Content:").slice(1).join("Markdown Content:")
    : markdown;
  const marker = /^\[_!\[Image\s+(\d+)\].*$/gm;
  const matches = [...content.matchAll(marker)];
  const parsed: EitaaNewsItem[] = [];

  matches.forEach((match, index) => {
    const start = (match.index || 0) + match[0].length;
    const end = index + 1 < matches.length ? (matches[index + 1].index || content.length) : content.length;
    const rawSegment = content.slice(start, end).trim();
    const postIdPattern = new RegExp(`https://eitaa\\.com/s/${CHANNEL_USERNAME}/(\\d+)`, "i");
    const postId = rawSegment.match(postIdPattern)?.[1];
    const lines = rawSegment.split("\n").map((line) => line.trim()).filter(Boolean);
    const dateIndex = lines.findLastIndex((line) => /^[۰-۹]{1,2}\s+[آ-ی]+(?:\s+۱۴۰[۰-۹])?$/u.test(line));
    const dateLabel = dateIndex >= 0 ? lines[dateIndex] : "تاریخ درج‌شده در ایتا";
    const bodyLines = lines.filter((_, lineIndex) => lineIndex !== dateIndex);
    const body = cleanMarkdown(bodyLines.join("\n"));
    const previewIndex = Number(match[1]);
    const syntheticId = `preview-${String(previewIndex).padStart(3, "0")}`;

    parsed.push({
      id: postId || syntheticId,
      title: makeTitle(body, previewIndex),
      body: body || "این خبر به‌صورت تصویری در کانال رسمی منتشر شده است. برای مشاهده کامل، منبع خبر را باز کنید.",
      dateLabel,
      publishedAt: null,
      sourceUrl: postId ? `https://eitaa.com/s/${CHANNEL_USERNAME}/${postId}` : CHANNEL_URL,
    });
  });

  return parsed.reverse().slice(0, MAX_ITEMS);
}

async function fetchText(url: string, headers: HeadersInit = {}) {
  const response = await fetch(url, {
    cache: "no-store",
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; FanixoNewsBot/1.0; +https://www.fanixo.ir/news)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "fa-IR,fa;q=0.9,en;q=0.6",
      ...headers,
    },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`news source responded with ${response.status}`);
  return response.text();
}

async function fetchLatestEitaaItems() {
  try {
    const html = await fetchText(CHANNEL_URL, {
      Referer: CHANNEL_URL,
      Connection: "close",
    });
    const items = parseEitaaHtml(html);
    if (items.length >= 3) return items;
  } catch (error) {
    console.error("Direct Eitaa news fetch failed:", error);
  }

  const readerUrl = `https://r.jina.ai/https://eitaa.com/${CHANNEL_USERNAME}`;
  const markdown = await fetchText(readerUrl, {
    Accept: "text/plain;charset=utf-8",
    "X-Cache-Tolerance": "0",
  });
  const items = parseEitaaReaderMarkdown(markdown);
  if (items.length < 3) throw new Error("Eitaa reader returned too few posts");
  return items;
}

function isNewsFeed(value: unknown): value is EitaaNewsFeed {
  if (!value || typeof value !== "object") return false;
  const feed = value as Partial<EitaaNewsFeed>;
  return typeof feed.refreshedAt === "string"
    && typeof feed.channelUrl === "string"
    && Array.isArray(feed.items)
    && feed.items.length > 0;
}

async function readStoredFeed() {
  try {
    const row = await db
      .select({ value: siteSettings.value, updatedAt: siteSettings.updatedAt })
      .from(siteSettings)
      .where(eq(siteSettings.key, CACHE_KEY))
      .then((rows) => rows[0]);
    if (!row || !isNewsFeed(row.value)) return null;
    return { feed: row.value, updatedAt: row.updatedAt };
  } catch (error) {
    console.error("Reading Eitaa news cache failed:", error);
    return null;
  }
}

export async function getEitaaNewsFeed(): Promise<EitaaNewsFeed> {
  const stored = await readStoredFeed();
  return stored?.feed || EITAA_NEWS_FALLBACK;
}

export async function refreshEitaaNewsFeed(options: { force?: boolean } = {}) {
  const stored = await readStoredFeed();
  const updatedAt = stored?.updatedAt ? new Date(stored.updatedAt).getTime() : 0;
  if (!options.force && stored && updatedAt && Date.now() - updatedAt < MIN_REFRESH_INTERVAL_MS) {
    return { feed: stored.feed, updated: false, reason: "fresh-cache" as const };
  }

  try {
    const items = await fetchLatestEitaaItems();
    const feed: EitaaNewsFeed = {
      channelName: CHANNEL_NAME,
      channelUrl: CHANNEL_URL,
      refreshedAt: new Date().toISOString(),
      items: items.slice(0, MAX_ITEMS),
    };

    await db
      .insert(siteSettings)
      .values({ key: CACHE_KEY, value: feed, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: feed, updatedAt: new Date() },
      });

    return { feed, updated: true, reason: "source-refreshed" as const };
  } catch (error) {
    console.error("Refreshing Eitaa news failed:", error);
    return {
      feed: stored?.feed || EITAA_NEWS_FALLBACK,
      updated: false,
      reason: "source-unavailable" as const,
      error: error instanceof Error ? error.message : "unknown error",
    };
  }
}
