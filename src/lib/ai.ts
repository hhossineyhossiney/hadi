import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

// ─── Config ──────────────────────────────────────────────────────────
export const AI_MODELS = {
  fast: "gpt-4o-mini",
  pro: "gpt-4o",
} as const;

export type AIRole = "system" | "user" | "assistant";
export interface AIMessage {
  role: AIRole;
  content: string;
}

// ─── Get API key (env → db) ──────────────────────────────────────────
export async function getOpenAIKey(): Promise<string | null> {
  // env fallback
  const envKey = process.env.OPENAI_API_KEY;
  if (envKey && envKey.length > 20) return envKey;

  try {
    const [row] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, "openai_api_key"))
      .limit(1);
    if (row && typeof row.value === "string" && row.value.length > 20) return row.value;
    // stored as array in default? fall back to first element
    if (Array.isArray(row?.value) && typeof row.value[0] === "string") return row.value[0];
  } catch {}
  return null;
}

// ─── Save key (admin only, from bootstrap or panel) ──────────────────
export async function saveOpenAIKey(key: string): Promise<void> {
  const [existing] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, "openai_api_key"))
    .limit(1);
  if (existing) {
    await db
      .update(siteSettings)
      .set({ value: key as unknown as any, updatedAt: new Date() })
      .where(eq(siteSettings.key, "openai_api_key"));
  } else {
    await db.insert(siteSettings).values({
      key: "openai_api_key",
      value: key as unknown as any,
    });
  }
}

// ─── Basic completion (non-stream) ───────────────────────────────────
export interface AICompleteOpts {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AICompleteResult {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export async function aiComplete(opts: AICompleteOpts): Promise<AICompleteResult> {
  const apiKey = await getOpenAIKey();
  if (!apiKey) {
    throw new Error("OPENAI_KEY_MISSING");
  }
  const model = opts.model || AI_MODELS.fast;
  const body = {
    model,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 800,
  };
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OPENAI_ERROR ${res.status}: ${errText.slice(0, 200)}`);
  }
  const data = await res.json();
  return {
    text: data.choices?.[0]?.message?.content?.trim() || "",
    usage: {
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0,
    },
    model,
  };
}

// ─── SSE Stream helper (for /api/ai/chat) ────────────────────────────
export async function aiStream(opts: AICompleteOpts): Promise<ReadableStream<Uint8Array>> {
  const apiKey = await getOpenAIKey();
  if (!apiKey) throw new Error("OPENAI_KEY_MISSING");
  const model = opts.model || AI_MODELS.fast;
  const body = {
    model,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 1200,
    stream: true,
  };
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.body) {
    const err = await res.text();
    throw new Error(`OPENAI_ERROR ${res.status}: ${err.slice(0, 200)}`);
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const reader = res.body.getReader();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") {
              controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
              controller.close();
              return;
            }
            try {
              const j = JSON.parse(data);
              const delta = j.choices?.[0]?.delta?.content;
              if (delta) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`)
                );
              }
            } catch {}
          }
        }
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });
}

// ─── System prompts ──────────────────────────────────────────────────
export const SYSTEM_PROMPTS = {
  general: `تو دستیار هوشمند "سامانه آموزشگاه‌های آزاد فنی و حرفه‌ای شهرستان زبرخان" هستی.
همیشه به فارسی روان و مؤدبانه پاسخ بده. مختصر و مفید باش. اگه سوال درباره ثبت‌نام، دوره، آموزشگاه یا مجوزه، راهنمایی کن.
دوره‌های ما شامل: کامپیوتر (ICDL)، حسابداری، خیاطی، آرایشگری، آشپزی، طراحی و بیش از ۱۴۰ دوره فعال میشه.
برای ثبت‌نام کاربر می‌تونه به /register بره، برای مشاهده دوره‌ها /courses، برای فروشگاه آنلاین /shop.`,

  tutor: `تو یک معلم خصوصی هوشمند برای هنرجویان آموزشگاه‌های فنی و حرفه‌ای هستی.
سبک تدریست: صبور، شفاف، مثال‌محور. مفاهیم پیچیده رو ساده کن. از مثال روزمره استفاده کن.
اگه هنرجو سوال درسی می‌پرسه، مرحله‌به‌مرحله توضیح بده. اگه تمرین می‌فرسته، اول راه حل کلی، بعد گام‌به‌گام.
همیشه انگیزه بده و در پایان یه چالش کوچیک برای تمرین ارائه کن.`,

  content_course: `تو یک نویسنده حرفه‌ای محتوای آموزشی هستی.
از عنوان دوره‌ای که مدیر آموزشگاه میده، یک توضیح جذاب، حرفه‌ای و SEO دار به فارسی بنویس.
شامل: هوک اول، ۳ مزیت کلیدی، مخاطب هدف، نتیجه پس از دوره، CTA در انتها.
لحن: انگیزشی، متخصص، مطمئن. طول: ۱۵۰ تا ۲۵۰ کلمه.`,

  content_sms: `تو یک کپی‌رایتر ارشد پیامک تبلیغاتی هستی.
پیامک ۱۶۰ کاراکتری فارسی، جذاب، با CTA واضح تولید کن.
عناصر: هوک قوی، پیشنهاد ارزشمند، deadline (اختیاری)، لینک کوتاه یا شماره تماس.`,

  content_insta: `تو یک متخصص محتوای اینستاگرام برای آموزشگاه‌های آموزشی هستی.
پست حرفه‌ای بساز شامل:
1. عنوان جذاب (۴-۶ کلمه)
2. کپشن ۱۵۰-۲۰۰ کلمه‌ای با ایموجی و ساختار خوانا
3. ۱۰-۱۵ هشتگ مرتبط فارسی و انگلیسی
4. CTA پایانی
لحن جوان، مدرن، انگیزشی.`,
};

// ─── Simple rate limit (in-memory + best-effort) ─────────────────────
const RATE = new Map<string, { count: number; resetAt: number }>();
export function checkRateLimit(key: string, maxPerHour = 30): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;
  const entry = RATE.get(key);
  if (!entry || now > entry.resetAt) {
    RATE.set(key, { count: 1, resetAt: now + hourMs });
    return { allowed: true, remaining: maxPerHour - 1, resetAt: now + hourMs };
  }
  if (entry.count >= maxPerHour) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  entry.count++;
  return { allowed: true, remaining: maxPerHour - entry.count, resetAt: entry.resetAt };
}
