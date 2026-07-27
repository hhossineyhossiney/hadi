import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { authOptions } from "@/lib/auth";
import { addRankingAudit, currentRankingYear, ensureRankingSystem, rowsOf } from "@/lib/ranking-system";
import { normalizePhone } from "@/lib/phone";

export const dynamic = "force-dynamic";

async function rankingExpert() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  return user?.id && user.role === "expert" ? user : null;
}

export async function GET() {
  const user = await rankingExpert();
  if (!user) return NextResponse.json({ error: "دسترسی کارشناس رتبه‌بندی لازم است" }, { status: 401 });
  await ensureRankingSystem();
  const [expertsResult, institutesResult, assignmentsResult, rankingsResult] = await Promise.all([
    db.execute(sql`SELECT id, name, phone, email, created_at FROM users WHERE role = 'expert' ORDER BY name`),
    db.execute(sql`SELECT id, name, slug, license_number FROM institutes WHERE is_active = TRUE ORDER BY name`),
    db.execute(sql`SELECT a.*, u.name AS expert_name, i.name AS academy_name FROM ranking_assignments a JOIN users u ON u.id = a.expert_id JOIN institutes i ON i.id = a.academy_id ORDER BY a.year DESC, a.assigned_at DESC`),
    db.execute(sql`SELECT ar.*, i.name AS academy_name, i.slug, u.name AS expert_name FROM academy_rankings ar JOIN institutes i ON i.id = ar.academy_id LEFT JOIN users u ON u.id = ar.expert_id ORDER BY ar.year DESC, ar.updated_at DESC`),
  ]);
  const rankings = rowsOf(rankingsResult);
  return NextResponse.json({
    experts: rowsOf(expertsResult), institutes: rowsOf(institutesResult), assignments: rowsOf(assignmentsResult), rankings,
    stats: {
      total: rankings.length,
      waiting: rankings.filter((row: any) => row.status === "submitted").length,
      approved: rankings.filter((row: any) => row.status === "approved").length,
      published: rankings.filter((row: any) => row.status === "published").length,
    },
    currentYear: currentRankingYear(),
  });
}

export async function POST(request: Request) {
  const user = await rankingExpert();
  if (!user) return NextResponse.json({ error: "دسترسی کارشناس رتبه‌بندی لازم است" }, { status: 401 });
  await ensureRankingSystem();
  const body = await request.json();

  if (body.action === "createExpert") {
    const phone = normalizePhone(body.phone || "");
    if (!body.name?.trim() || !/^09\d{9}$/.test(phone) || String(body.password || "").length < 6) {
      return NextResponse.json({ error: "نام، موبایل معتبر و رمز حداقل ۶ کاراکتری الزامی است" }, { status: 400 });
    }
    const existing = rowsOf(await db.execute(sql`SELECT id, role FROM users WHERE phone = ${phone} LIMIT 1`))[0] as any;
    const hash = await bcrypt.hash(String(body.password), 10);
    if (existing) {
      if (existing.role === "admin" || existing.role === "institute") return NextResponse.json({ error: "این شماره به حساب مدیریتی دیگری متصل است" }, { status: 409 });
      await db.execute(sql`UPDATE users SET name = ${String(body.name)}, password = ${hash}, role = 'expert' WHERE id = ${Number(existing.id)}`);
    } else {
      await db.execute(sql`INSERT INTO users (name, phone, password, role) VALUES (${String(body.name)}, ${phone}, ${hash}, 'expert')`);
    }
    return NextResponse.json({ ok: true });
  }

  if (body.action === "assign") {
    const academyId = Number(body.academyId), expertId = Number(body.expertId), year = Number(body.year) || currentRankingYear();
    if (!academyId || !expertId) return NextResponse.json({ error: "آموزشگاه و کارشناس الزامی است" }, { status: 400 });
    await db.execute(sql`DELETE FROM ranking_assignments WHERE academy_id = ${academyId} AND year = ${year}`);
    await db.execute(sql`
      INSERT INTO ranking_assignments (academy_id, expert_id, year, assigned_by, status)
      VALUES (${academyId}, ${expertId}, ${year}, ${Number(user.id)}, 'assigned')
    `);
    const ranking = rowsOf(await db.execute(sql`
      INSERT INTO academy_rankings (academy_id, year, expert_id) VALUES (${academyId}, ${year}, ${expertId})
      ON CONFLICT (academy_id, year) DO UPDATE SET expert_id = EXCLUDED.expert_id, updated_at = NOW()
      RETURNING id
    `))[0] as any;
    await addRankingAudit({ rankingId: ranking?.id, academyId, userId: Number(user.id), action: "expert_assigned", details: { expertId, year } });
    await db.execute(sql`INSERT INTO notifications (user_id, user_role, title, body, type, link) VALUES (${expertId}, 'expert', 'پرونده رتبه‌بندی جدید', 'یک آموزشگاه برای ارزیابی به شما تخصیص یافت.', 'info', '/expert')`);
    return NextResponse.json({ ok: true });
  }

  if (["publish", "unpublish"].includes(body.action)) {
    const rankingId = Number(body.rankingId);
    const ranking = rowsOf(await db.execute(sql`SELECT * FROM academy_rankings WHERE id = ${rankingId} LIMIT 1`))[0] as any;
    if (!ranking) return NextResponse.json({ error: "پرونده یافت نشد" }, { status: 404 });
    if (body.action === "publish" && !["approved", "published"].includes(ranking.status)) return NextResponse.json({ error: "ابتدا کارشناس باید پرونده را تایید کند" }, { status: 409 });
    const nextStatus = body.action === "publish" ? "published" : "approved";
    await db.execute(sql`
      UPDATE academy_rankings SET status = ${nextStatus}, published_at = ${body.action === "publish" ? new Date() : null},
        valid_until = ${body.action === "publish" ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null}, updated_at = NOW()
      WHERE id = ${rankingId}
    `);
    await addRankingAudit({ rankingId, academyId: Number(ranking.academy_id), userId: Number(user.id), action: body.action === "publish" ? "ranking_published" : "ranking_unpublished" });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "عملیات نامعتبر است" }, { status: 400 });
}
