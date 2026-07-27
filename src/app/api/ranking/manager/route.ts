import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { authOptions } from "@/lib/auth";
import { addRankingAudit, currentRankingYear, ensureRankingSystem, getManagerInstitute, getRankingBundle } from "@/lib/ranking-system";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function context() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id || !["institute", "admin"].includes(user.role)) return null;
  const institute = await getManagerInstitute(Number(user.id));
  return institute ? { user, institute } : null;
}

export async function GET(request: Request) {
  const ctx = await context();
  if (!ctx) return NextResponse.json({ error: "دسترسی مدیر آموزشگاه لازم است" }, { status: 401 });
  const year = Number(new URL(request.url).searchParams.get("year")) || currentRankingYear();
  const bundle = await getRankingBundle(Number(ctx.institute.id), year);
  return NextResponse.json({ ...bundle, publicUrl: `/rank/${ctx.institute.slug}` });
}

function limitedArray(value: unknown, max = 30) {
  return Array.isArray(value) ? value.slice(0, max) : [];
}

export async function POST(request: Request) {
  const ctx = await context();
  if (!ctx) return NextResponse.json({ error: "دسترسی مدیر آموزشگاه لازم است" }, { status: 401 });
  await ensureRankingSystem();
  const body = await request.json();
  const year = Number(body.year) || currentRankingYear();
  const bundle = await getRankingBundle(Number(ctx.institute.id), year);
  if (["approved", "published"].includes(bundle.ranking.status)) {
    return NextResponse.json({ error: "پرونده تاییدشده قابل ویرایش نیست؛ دوره جدید رتبه‌بندی ایجاد کنید." }, { status: 409 });
  }

  const declaration = body.declaration || {};
  const physical = declaration.physical && typeof declaration.physical === "object" ? declaration.physical : {};
  const books = limitedArray(declaration.books);
  const seminars = limitedArray(declaration.seminars);
  const honors = limitedArray(declaration.honors);
  const contentActivities = limitedArray(declaration.contentActivities);
  const documents = limitedArray(declaration.documents, 20);
  const serialized = JSON.stringify({ physical, books, seminars, honors, contentActivities, documents });
  if (serialized.length > 6_000_000) return NextResponse.json({ error: "حجم مجموع مستندات بیشتر از حد مجاز است." }, { status: 413 });

  const action = body.action === "submit" ? "submit" : "save";
  const status = action === "submit" ? "submitted" : (bundle.ranking.status === "needs_correction" ? "needs_correction" : "draft");
  await db.execute(sql`
    UPDATE self_declarations SET
      physical = ${JSON.stringify(physical)}::jsonb,
      books = ${JSON.stringify(books)}::jsonb,
      seminars = ${JSON.stringify(seminars)}::jsonb,
      honors = ${JSON.stringify(honors)}::jsonb,
      content_activities = ${JSON.stringify(contentActivities)}::jsonb,
      documents = ${JSON.stringify(documents)}::jsonb,
      status = ${status}, submitted_at = ${action === "submit" ? new Date() : null}, updated_at = NOW()
    WHERE academy_id = ${Number(ctx.institute.id)} AND year = ${year}
  `);
  await db.execute(sql`
    UPDATE academy_rankings SET status = ${status}, submitted_at = ${action === "submit" ? new Date() : bundle.ranking.submittedAt}, updated_at = NOW()
    WHERE id = ${bundle.ranking.id}
  `);

  await db.execute(sql`DELETE FROM ranking_documents WHERE academy_id = ${Number(ctx.institute.id)} AND ranking_id = ${bundle.ranking.id}`);
  for (const document of documents) {
    if (!document?.dataUrl) continue;
    await db.execute(sql`
      INSERT INTO ranking_documents (academy_id, ranking_id, type, file_path, description)
      VALUES (${Number(ctx.institute.id)}, ${bundle.ranking.id}, ${String(document.type || "document")}, ${String(document.dataUrl)}, ${String(document.description || document.name || "")})
    `);
  }

  await addRankingAudit({ rankingId: bundle.ranking.id, academyId: Number(ctx.institute.id), userId: Number(ctx.user.id), action: action === "submit" ? "self_declaration_submitted" : "self_declaration_saved", details: { year } });

  if (action === "submit") {
    const experts = await db.execute(sql`SELECT id FROM users WHERE role = 'expert'`);
    const rows = Array.isArray(experts) ? experts : (experts as any).rows || [];
    for (const row of rows as any[]) {
      await db.execute(sql`
        INSERT INTO notifications (user_id, user_role, title, body, type, link)
        VALUES (${Number(row.id)}, 'expert', 'پرونده جدید رتبه‌بندی', ${`خوداظهاری ${ctx.institute.name} برای سال ${year} ارسال شد.`}, 'info', '/expert')
      `);
    }
  }

  return NextResponse.json({ ok: true, status, bundle: await getRankingBundle(Number(ctx.institute.id), year) });
}
