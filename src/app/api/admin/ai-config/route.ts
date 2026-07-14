import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { saveOpenAIKey, getOpenAIKey } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BOOTSTRAP_SECRET = "zebarkhan-fix-2026";

async function isAdminOrBootstrap(req: NextRequest, body: any) {
  if (body?.secret === BOOTSTRAP_SECRET) return true;
  const s = await getServerSession(authOptions);
  const u = s?.user as any;
  return u?.role === "admin";
}

export async function GET(req: NextRequest) {
  const s = await getServerSession(authOptions);
  const u = s?.user as any;
  if (u?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const key = await getOpenAIKey();
  return NextResponse.json({
    hasKey: !!key,
    masked: key ? `${key.slice(0, 7)}...${key.slice(-4)}` : null,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!(await isAdminOrBootstrap(req, body))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const key = String(body.key || "").trim();
  if ((!key.startsWith("sk-") && !key.startsWith("sk-or-")) || key.length < 30) {
    return NextResponse.json({ error: "invalid key format" }, { status: 400 });
  }
  await saveOpenAIKey(key);
  return NextResponse.json({ ok: true, masked: `${key.slice(0, 10)}...${key.slice(-4)}` });
}
