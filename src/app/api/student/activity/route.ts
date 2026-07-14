import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { sql } from "drizzle-orm";

// Aggregate activity feed for a student from multiple sources
export async function GET() {
  const s = await getServerSession(authOptions);
  const uid = Number((s?.user as any)?.id);
  if (!uid) return NextResponse.json({ error: "unauth" }, { status: 401 });

  try {
    const [regs, wallet, purchases, submissions, quizAtts, fees, notifs] = await Promise.all([
      db.execute(sql`SELECT id, created_at, status, (SELECT title FROM courses WHERE id = course_id) AS course FROM registrations WHERE user_id = ${uid} ORDER BY created_at DESC LIMIT 30`),
      db.execute(sql`SELECT id, amount, type, description, created_at FROM wallet_transactions WHERE user_id = ${uid} ORDER BY created_at DESC LIMIT 30`),
      db.execute(sql`SELECT p.id, p.amount, p.created_at, c.title FROM sellable_purchases p JOIN sellable_courses c ON c.id = p.course_id WHERE p.user_id = ${uid} AND p.status='paid' ORDER BY p.created_at DESC LIMIT 20`),
      db.execute(sql`SELECT s.id, s.submitted_at, s.status, s.score, a.title FROM assignment_submissions s JOIN assignments a ON a.id = s.assignment_id WHERE s.user_id = ${uid} ORDER BY s.submitted_at DESC LIMIT 20`),
      db.execute(sql`SELECT qa.id, qa.submitted_at, qa.percent, qa.passed, q.title FROM quiz_attempts qa JOIN quizzes q ON q.id = qa.quiz_id WHERE qa.user_id = ${uid} ORDER BY qa.submitted_at DESC LIMIT 20`),
      db.execute(sql`SELECT id, amount, title, paid_at FROM payment_fees WHERE user_id = ${uid} AND status='paid' ORDER BY paid_at DESC LIMIT 20`),
      db.execute(sql`SELECT id, title, body, type, created_at FROM notifications WHERE user_id = ${uid} ORDER BY created_at DESC LIMIT 30`),
    ]);

    const items: any[] = [];
    for (const r of ((regs as any).rows || regs) as any[]) {
      items.push({ icon: "📝", action: r.status === "approved" ? "ثبت‌نام تأیید شد" : r.status === "pending" ? "درخواست ثبت‌نام" : "درخواست ثبت‌نام رد شد", description: r.course, time: r.created_at });
    }
    for (const w of ((wallet as any).rows || wallet) as any[]) {
      const em = w.type === "deposit" ? "💰" : w.type === "withdraw" || w.type === "payment" ? "💸" : "🪙";
      items.push({ icon: em, action: w.type === "deposit" ? "شارژ کیف پول" : w.type === "withdraw" ? "برداشت" : w.type === "payment" ? "پرداخت" : "تراکنش", description: w.description, amount: w.amount, time: w.created_at });
    }
    for (const p of ((purchases as any).rows || purchases) as any[]) {
      items.push({ icon: "🎬", action: "خرید دوره آنلاین", description: p.title, amount: p.amount, time: p.created_at });
    }
    for (const s of ((submissions as any).rows || submissions) as any[]) {
      items.push({ icon: "📝", action: s.status === "reviewed" ? `نمره‌گیری تکلیف (${s.score || 0})` : "ارسال تکلیف", description: s.title, time: s.submitted_at });
    }
    for (const q of ((quizAtts as any).rows || quizAtts) as any[]) {
      items.push({ icon: q.passed ? "🏆" : "📊", action: q.passed ? `قبولی در آزمون (${q.percent}٪)` : `شرکت در آزمون (${q.percent}٪)`, description: q.title, time: q.submitted_at });
    }
    for (const f of ((fees as any).rows || fees) as any[]) {
      items.push({ icon: "💳", action: "پرداخت شهریه/قسط", description: f.title, amount: f.amount, time: f.paid_at });
    }
    for (const n of ((notifs as any).rows || notifs) as any[]) {
      items.push({ icon: "🔔", action: n.title, description: n.body, time: n.created_at });
    }

    items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    return NextResponse.json({ items: items.slice(0, 100) });
  } catch (e: any) { return NextResponse.json({ error: e?.message }, { status: 500 }); }
}
