import { db } from "@/db";
import { walletTransactions } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function requireUser() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) return { error: "ابتدا وارد حساب کاربری شوید", status: 401 as const };
  return { userId: Number(user.id) };
}

async function getBalance(userId: number): Promise<number> {
  // Try wallet_balance column first
  try {
    const res: any = await db.execute(sql`SELECT wallet_balance FROM users WHERE id = ${userId} LIMIT 1`);
    if (res.rows?.[0]?.wallet_balance !== undefined && res.rows[0].wallet_balance !== null) {
      return Number(res.rows[0].wallet_balance);
    }
  } catch {}
  // Fallback: last transaction's balanceAfter
  try {
    const tx = await db
      .select({ balanceAfter: walletTransactions.balanceAfter })
      .from(walletTransactions)
      .where(eq(walletTransactions.userId, userId))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(1);
    return Number(tx[0]?.balanceAfter || 0);
  } catch {
    return 0;
  }
}

async function setBalance(userId: number, newBalance: number) {
  try {
    await db.execute(sql`UPDATE users SET wallet_balance = ${String(newBalance)} WHERE id = ${userId}`);
    return true;
  } catch (e) {
    console.error("setBalance failed (column may not exist):", e);
    return false;
  }
}

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const balance = await getBalance(auth.userId);
  let transactions: any[] = [];
  try {
    transactions = await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.userId, auth.userId))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(100);
  } catch (e) {
    console.error("Failed to load wallet transactions:", e);
  }
  return NextResponse.json({ balance, transactions });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();
  const action = body.action || "deposit";
  const amount = Number(body.amount);

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "مبلغ نامعتبر است" }, { status: 400 });
  }
  if (amount > 500_000_000) {
    return NextResponse.json({ error: "حداکثر مبلغ در هر تراکنش ۵۰۰ میلیون تومان" }, { status: 400 });
  }

  const currentBalance = await getBalance(auth.userId);
  let newBalance = currentBalance;
  let txType = "deposit";
  let txDescription = body.description || "شارژ کیف پول";

  if (action === "deposit") {
    newBalance = currentBalance + amount;
    txType = "deposit";
  } else if (action === "withdraw") {
    if (amount > currentBalance) return NextResponse.json({ error: "موجودی کافی نیست" }, { status: 400 });
    newBalance = currentBalance - amount;
    txType = "withdraw";
    txDescription = body.description || "برداشت از کیف پول";
  } else if (action === "payment") {
    if (amount > currentBalance) return NextResponse.json({ error: "موجودی کافی نیست" }, { status: 400 });
    newBalance = currentBalance - amount;
    txType = "payment";
    txDescription = body.description || "پرداخت بابت دوره";
  }

  const balanceUpdated = await setBalance(auth.userId, newBalance);
  if (!balanceUpdated) {
    return NextResponse.json({
      error: "ستون wallet_balance در دیتابیس وجود ندارد. لطفاً از /admin migration را اجرا کنید.",
    }, { status: 500 });
  }

  try {
    await db.insert(walletTransactions).values({
      userId: auth.userId,
      amount: String(amount) as any,
      type: txType,
      description: txDescription,
      balanceAfter: String(newBalance) as any,
      registrationId: body.registrationId || null,
    });
  } catch (e) {
    console.error("Failed to log tx:", e);
  }

  return NextResponse.json({ ok: true, balance: newBalance, previousBalance: currentBalance });
}
