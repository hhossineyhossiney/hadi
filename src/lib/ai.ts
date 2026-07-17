import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

// ─── Config: OpenRouter (OpenAI-compatible API) ──────────────────────
const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const HTTP_REFERER = "https://www.fanixo.ir";
const X_TITLE = "Fanixo Professional Education Advisor";

export const AI_MODELS = {
  fast: "qwen/qwen3-next-80b-a3b-instruct:free",
  pro: "meta-llama/llama-3.3-70b-instruct:free",
  premium: "openai/gpt-4o-mini",
} as const;

// Fallback chain — try in order if previous fails
export const AI_FALLBACK_CHAIN = [
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "openai/gpt-oss-20b:free",
  "google/gemma-4-31b-it:free",
  "meta-llama/llama-3.2-3b-instruct:free",
];

export type AIRole = "system" | "user" | "assistant";
export interface AIMessage {
  role: AIRole;
  content: string;
}

// ─── Get API key (env → db) ──────────────────────────────────────────
export async function getAIKey(): Promise<string | null> {
  const envKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  if (envKey && envKey.length > 20) return envKey;
  try {
    const [row] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, "openai_api_key"))
      .limit(1);
    if (row && typeof row.value === "string" && (row.value as string).length > 20)
      return row.value as string;
    if (Array.isArray(row?.value) && typeof row.value[0] === "string")
      return row.value[0] as string;
  } catch {}
  return null;
}
export const getOpenAIKey = getAIKey;

// ─── Save key ────────────────────────────────────────────────────────
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

// ─── Non-stream completion ───────────────────────────────────────────
export interface AICompleteOpts {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AICompleteResult {
  text: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
  model: string;
}

async function tryComplete(
  apiKey: string,
  model: string,
  opts: AICompleteOpts
): Promise<{ ok: boolean; res: Response }> {
  const body = {
    model,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 800,
  };
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": HTTP_REFERER,
      "X-Title": X_TITLE,
    },
    body: JSON.stringify(body),
  });
  return { ok: res.ok, res };
}

export async function aiComplete(opts: AICompleteOpts): Promise<AICompleteResult> {
  const apiKey = await getAIKey();
  if (!apiKey) throw new Error("OPENAI_KEY_MISSING");

  // Build chain: primary first, then fallbacks
  const chain = opts.model
    ? [opts.model, ...AI_FALLBACK_CHAIN.filter((m) => m !== opts.model)]
    : AI_FALLBACK_CHAIN;

  let lastErr = "";
  for (const model of chain) {
    try {
      const { ok, res } = await tryComplete(apiKey, model, opts);
      if (!ok) {
        lastErr = `${res.status}: ${(await res.text()).slice(0, 200)}`;
        // Retry on 429/404/5xx
        if (res.status === 429 || res.status === 404 || res.status >= 500) continue;
        throw new Error(`AI_ERROR ${lastErr}`);
      }
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.trim() || "";
      if (!text) {
        lastErr = `${model} returned empty text`;
        continue; // try next model
      }
      return {
        text,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
        model,
      };
    } catch (e: any) {
      lastErr = String(e?.message || e);
      continue;
    }
  }
  throw new Error(`AI_ERROR all providers failed: ${lastErr.slice(0, 200)}`);
}

// ─── Stream (SSE) ────────────────────────────────────────────────────
async function tryStream(
  apiKey: string,
  model: string,
  opts: AICompleteOpts
): Promise<Response> {
  const body = {
    model,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 1200,
    stream: true,
  };
  return fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": HTTP_REFERER,
      "X-Title": X_TITLE,
    },
    body: JSON.stringify(body),
  });
}

export async function aiStream(opts: AICompleteOpts): Promise<ReadableStream<Uint8Array>> {
  const apiKey = await getAIKey();
  if (!apiKey) throw new Error("OPENAI_KEY_MISSING");

  const chain = opts.model
    ? [opts.model, ...AI_FALLBACK_CHAIN.filter((m) => m !== opts.model)]
    : AI_FALLBACK_CHAIN;

  let res: Response | null = null;
  let lastErr = "";
  for (const model of chain) {
    const r = await tryStream(apiKey, model, opts);
    if (r.ok && r.body) {
      res = r;
      break;
    }
    lastErr = `${model} → ${r.status}: ${(await r.text()).slice(0, 150)}`;
    // Retry on 429, 404 (model unavailable), 5xx
    if (r.status !== 429 && r.status !== 404 && r.status < 500) {
      throw new Error(`AI_ERROR ${lastErr}`);
    }
  }
  if (!res || !res.body) throw new Error(`AI_ERROR all providers failed: ${lastErr}`);

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
            if (!trimmed || trimmed.startsWith(":")) continue; // openrouter sends comments
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
برای ثبت‌نام کاربر می‌تونه به /register بره، برای مشاهده دوره‌ها /courses، برای فروشگاه آنلاین /shop.
فقط به فارسی پاسخ بده.`,

  tutor: `تو یک معلم خصوصی هوشمند برای هنرجویان آموزشگاه‌های فنی و حرفه‌ای هستی.
سبک تدریست: صبور، شفاف، مثال‌محور. مفاهیم پیچیده رو ساده کن. از مثال روزمره استفاده کن.
اگه هنرجو سوال درسی می‌پرسه، مرحله‌به‌مرحله توضیح بده. اگه تمرین می‌فرسته، اول راه حل کلی، بعد گام‌به‌گام.
همیشه انگیزه بده و در پایان یه چالش کوچیک برای تمرین ارائه کن.
فقط به فارسی پاسخ بده.`,

  content_course: `تو یک نویسنده حرفه‌ای محتوای آموزشی هستی.
از عنوان دوره‌ای که مدیر آموزشگاه میده، یک توضیح جذاب، حرفه‌ای و SEO دار به فارسی بنویس.
شامل: هوک اول، ۳ مزیت کلیدی، مخاطب هدف، نتیجه پس از دوره، CTA در انتها.
لحن: انگیزشی، متخصص، مطمئن. طول: ۱۵۰ تا ۲۵۰ کلمه.
فقط به فارسی پاسخ بده.`,

  content_sms: `تو یک کپی‌رایتر ارشد پیامک تبلیغاتی هستی.
پیامک ۱۶۰ کاراکتری فارسی، جذاب، با CTA واضح تولید کن.
عناصر: هوک قوی، پیشنهاد ارزشمند، deadline (اختیاری)، لینک کوتاه یا شماره تماس.
اگر ممکنه ۳ نسخه بده. فقط به فارسی پاسخ بده.`,

  content_insta: `تو یک متخصص محتوای اینستاگرام برای آموزشگاه‌های آموزشی هستی.
پست حرفه‌ای بساز شامل:
1. عنوان جذاب (۴-۶ کلمه)
2. کپشن ۱۵۰-۲۰۰ کلمه‌ای با ایموجی و ساختار خوانا
3. ۱۰-۱۵ هشتگ مرتبط فارسی و انگلیسی
4. CTA پایانی
لحن جوان، مدرن، انگیزشی. فقط به فارسی پاسخ بده.`,
};

// ─── Rate limit ──────────────────────────────────────────────────────
const RATE = new Map<string, { count: number; resetAt: number }>();
export function checkRateLimit(key: string, maxPerHour = 30) {
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
