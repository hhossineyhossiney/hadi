import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { aiStream, SYSTEM_PROMPTS, checkRateLimit, type AIMessage } from "@/lib/ai";
import { buildLiveSiteKnowledge, PROFESSIONAL_SITE_ASSISTANT_PROMPT } from "@/lib/ai-knowledge";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const messages: AIMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const mode: keyof typeof SYSTEM_PROMPTS = body.mode || "general";
    if (!messages.length) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }
    // last N only
    const trimmed = messages.slice(-12).map((message) => ({
      // System-role messages are never accepted from the browser.
      role: message.role === "assistant" ? "assistant" as const : "user" as const,
      content: String(message.content || "").slice(0, 4000),
    }));

    // Rate limit key (user id or ip)
    const session = await getServerSession(authOptions);
    const uid = (session?.user as any)?.id;
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "anon";
    const rlKey = uid ? `u:${uid}` : `ip:${ip}`;
    const rl = checkRateLimit(rlKey, uid ? 100 : 40);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "rate_limit", resetAt: rl.resetAt },
        { status: 429 }
      );
    }

    const isGeneralAssistant = mode === "general";
    const systemPrompt = isGeneralAssistant
      ? PROFESSIONAL_SITE_ASSISTANT_PROMPT
      : (SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.general);
    const liveKnowledge = isGeneralAssistant ? await buildLiveSiteKnowledge() : "";
    // Some OpenRouter fallback models only honor the first system message.
    // Keep instructions and live facts in one authoritative message.
    const groundedSystemPrompt = liveKnowledge
      ? `${systemPrompt}\n\n=== اطلاعات زنده و قابل استناد سایت ===\n${liveKnowledge}\n=== پایان اطلاعات زنده ===`
      : systemPrompt;
    const finalMessages: AIMessage[] = [
      { role: "system", content: groundedSystemPrompt },
      ...trimmed,
    ];

    const stream = await aiStream({
      messages: finalMessages,
      temperature: isGeneralAssistant ? 0.25 : 0.7,
      maxTokens: isGeneralAssistant ? 1800 : 1200,
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
        "X-AI-Knowledge-Length": String(liveKnowledge.length),
      },
    });
  } catch (e: any) {
    const msg = String(e?.message || e);
    if (msg.includes("OPENAI_KEY_MISSING")) {
      return NextResponse.json(
        { error: "کلید API تنظیم نشده. با مدیر تماس بگیرید." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: msg.slice(0, 300) }, { status: 500 });
  }
}
