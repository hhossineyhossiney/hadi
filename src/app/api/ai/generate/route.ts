import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { aiComplete, SYSTEM_PROMPTS, checkRateLimit, AI_MODELS } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// One-shot content generation for institute manager panel
// Body: { type: "course" | "sms" | "insta", prompt: string, extra?: any }
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const u = session?.user as any;
    if (!u?.id) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const type: string = String(body.type || "");
    const prompt: string = String(body.prompt || "").slice(0, 2000);
    if (!prompt) return NextResponse.json({ error: "prompt required" }, { status: 400 });

    const rl = checkRateLimit(`gen:${u.id}`, 30);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "rate_limit", resetAt: rl.resetAt },
        { status: 429 }
      );
    }

    let sys = SYSTEM_PROMPTS.general;
    let temperature = 0.8;
    let maxTokens = 800;
    if (type === "course") {
      sys = SYSTEM_PROMPTS.content_course;
    } else if (type === "sms") {
      sys = SYSTEM_PROMPTS.content_sms;
      maxTokens = 200;
    } else if (type === "insta") {
      sys = SYSTEM_PROMPTS.content_insta;
      maxTokens = 600;
    }

    const result = await aiComplete({
      model: AI_MODELS.fast,
      temperature,
      maxTokens,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: prompt },
      ],
    });

    return NextResponse.json({
      ok: true,
      text: result.text,
      usage: result.usage,
      model: result.model,
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
