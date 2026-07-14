import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { aiComplete, checkRateLimit } from "@/lib/ai";
import { getToolById } from "@/lib/ai-tools";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const toolId: string = String(body.toolId || "");
    const inputs: Record<string, string> = body.inputs && typeof body.inputs === "object" ? body.inputs : {};

    const tool = getToolById(toolId);
    if (!tool) {
      return NextResponse.json({ error: "ابزار یافت نشد" }, { status: 404 });
    }

    // Rate limit
    const session = await getServerSession(authOptions);
    const uid = (session?.user as any)?.id;
    const ip = req.headers.get("x-forwarded-for") || "anon";
    const rlKey = uid ? `tool:${uid}` : `tool:${ip}`;
    const rl = checkRateLimit(rlKey, uid ? 40 : 8);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "تعداد درخواست بیش از حد. چند دقیقه صبر کن." },
        { status: 429 }
      );
    }

    // Validate: at least first input filled
    const firstInput = tool.inputs[0];
    if (firstInput && !(inputs[firstInput.name] || "").trim()) {
      return NextResponse.json(
        { error: `${firstInput.label} الزامی است` },
        { status: 400 }
      );
    }

    // Build prompt
    const userPrompt = tool.template(inputs).slice(0, 5000);

    const result = await aiComplete({
      messages: [
        { role: "system", content: tool.systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: tool.temperature ?? 0.8,
      maxTokens: tool.maxTokens ?? 1500,
    });

    return NextResponse.json({
      ok: true,
      text: result.text,
      usage: result.usage,
      model: result.model,
      toolId,
    });
  } catch (e: any) {
    const msg = String(e?.message || e);
    if (msg.includes("OPENAI_KEY_MISSING")) {
      return NextResponse.json(
        { error: "کلید AI تنظیم نشده. با مدیر تماس بگیرید." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: msg.slice(0, 300) }, { status: 500 });
  }
}
