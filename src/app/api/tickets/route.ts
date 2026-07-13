import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { sql } from "drizzle-orm";

const ADMIN_PHONES = ["09159513179", "09150000000"];

async function isAdmin(u: any) {
  return u?.role === "admin" || (u?.phone && ADMIN_PHONES.includes(u.phone));
}

export async function GET(req: Request) {
  const s = await getServerSession(authOptions);
  const u = s?.user as any;
  if (!u?.id) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const url = new URL(req.url);
  const scope = url.searchParams.get("scope") || "mine";
  const ticketId = url.searchParams.get("ticketId");

  try {
    if (ticketId) {
      // detail + replies
      const tRow = await db.execute(sql`SELECT t.*, u.name AS user_name, u.phone AS user_phone FROM support_tickets t LEFT JOIN users u ON u.id = t.user_id WHERE t.id = ${Number(ticketId)}`);
      const t = ((tRow as any).rows || tRow)[0];
      if (!t) return NextResponse.json({ error: "یافت نشد" }, { status: 404 });
      // permission: owner or admin
      const admin = await isAdmin(u);
      if (Number(t.user_id) !== Number(u.id) && !admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
      const rRows = await db.execute(sql`SELECT r.*, u.name AS user_name FROM ticket_replies r LEFT JOIN users u ON u.id = r.user_id WHERE r.ticket_id = ${Number(ticketId)} ORDER BY r.created_at ASC`);
      return NextResponse.json({ ticket: t, replies: ((rRows as any).rows || rRows) });
    }

    if (scope === "all" && await isAdmin(u)) {
      const rows = await db.execute(sql`
        SELECT t.*, u.name AS user_name, u.phone AS user_phone,
               (SELECT COUNT(*)::int FROM ticket_replies WHERE ticket_id = t.id) AS replies_count
        FROM support_tickets t
        LEFT JOIN users u ON u.id = t.user_id
        ORDER BY 
          CASE t.status WHEN 'open' THEN 1 WHEN 'in_progress' THEN 2 ELSE 3 END,
          CASE t.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'normal' THEN 3 ELSE 4 END,
          t.created_at DESC
        LIMIT 100
      `);
      return NextResponse.json({ items: ((rows as any).rows || rows) });
    }

    // scope=mine
    const rows = await db.execute(sql`
      SELECT t.*, (SELECT COUNT(*)::int FROM ticket_replies WHERE ticket_id = t.id) AS replies_count
      FROM support_tickets t
      WHERE t.user_id = ${Number(u.id)}
      ORDER BY t.updated_at DESC
    `);
    return NextResponse.json({ items: ((rows as any).rows || rows) });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  const u = s?.user as any;
  if (!u?.id) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const body = await req.json();
  const { action } = body;

  try {
    if (action === "create") {
      const { subject, message, category, priority } = body;
      if (!subject || !message) return NextResponse.json({ error: "موضوع و متن الزامی است" }, { status: 400 });
      const [t] = await db.execute(sql`
        INSERT INTO support_tickets (user_id, subject, message, category, priority)
        VALUES (${Number(u.id)}, ${String(subject).slice(0,255)}, ${String(message).slice(0,5000)},
                ${category || 'general'}, ${priority || 'normal'})
        RETURNING *
      `).then((r: any) => (r.rows || r));
      return NextResponse.json({ ok: true, ticket: t });
    }

    if (action === "reply") {
      const { ticketId, message } = body;
      const tRow = await db.execute(sql`SELECT * FROM support_tickets WHERE id = ${Number(ticketId)}`);
      const t = ((tRow as any).rows || tRow)[0];
      if (!t) return NextResponse.json({ error: "یافت نشد" }, { status: 404 });
      const admin = await isAdmin(u);
      if (Number(t.user_id) !== Number(u.id) && !admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
      await db.execute(sql`
        INSERT INTO ticket_replies (ticket_id, user_id, message, is_staff)
        VALUES (${Number(ticketId)}, ${Number(u.id)}, ${String(message).slice(0,5000)}, ${admin})
      `);
      await db.execute(sql`UPDATE support_tickets SET updated_at = NOW(), status = CASE WHEN status='open' AND ${admin} THEN 'in_progress' ELSE status END WHERE id = ${Number(ticketId)}`);
      return NextResponse.json({ ok: true });
    }

    if (action === "updateStatus" && await isAdmin(u)) {
      const { ticketId, status } = body;
      await db.execute(sql`
        UPDATE support_tickets
        SET status = ${status}, updated_at = NOW(),
            resolved_at = CASE WHEN ${status} IN ('resolved','closed') THEN NOW() ELSE resolved_at END
        WHERE id = ${Number(ticketId)}
      `);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "action نامعتبر" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
