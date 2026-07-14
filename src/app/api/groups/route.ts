import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { institutes, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { normalizePhone } from "@/lib/phone";

async function getSession() {
  const s = await getServerSession(authOptions);
  return s?.user as any;
}
async function getMyInstitute(u: any) {
  if (!u?.id) return null;
  let inst = await db.select().from(institutes).where(eq(institutes.userId, Number(u.id))).then(r => r[0]);
  if (inst) return inst;
  if (u.phone) {
    const clean = normalizePhone(String(u.phone));
    const all = await db.select().from(institutes);
    const cand = all.find((i: any) => {
      const ph = [normalizePhone(i.mobile || ""), normalizePhone(i.phone || "")];
      return ph.includes(clean) && (!i.userId || i.userId === Number(u.id));
    });
    if (cand) {
      const [linked] = await db.update(institutes).set({ userId: Number(u.id) }).where(eq(institutes.id, cand.id)).returning();
      if (u.role !== "institute") { try { await db.update(users).set({ role: "institute" as any }).where(eq(users.id, Number(u.id))); } catch {} }
      return linked;
    }
  }
  return null;
}

// GET: list groups user is member of (or manager can see all their institute's groups)
export async function GET(req: Request) {
  const u = await getSession();
  if (!u?.id) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const uid = Number(u.id);
  const url = new URL(req.url);
  const groupId = url.searchParams.get("groupId");

  try {
    if (groupId) {
      // Detail + messages
      const gRow = await db.execute(sql`SELECT * FROM message_groups WHERE id = ${Number(groupId)} LIMIT 1`);
      const g = ((gRow as any).rows || gRow)[0];
      if (!g) return NextResponse.json({ error: "گروه یافت نشد" }, { status: 404 });
      // Verify membership OR manager of institute OR admin
      const inst = await getMyInstitute(u);
      const isManager = inst && Number(inst.id) === Number(g.institute_id);
      const isAdmin = u.role === "admin";
      const memRow = await db.execute(sql`SELECT id, role FROM message_group_members WHERE group_id = ${Number(groupId)} AND user_id = ${uid} LIMIT 1`);
      const isMember = ((memRow as any).rows || memRow).length > 0;
      if (!isMember && !isManager && !isAdmin) return NextResponse.json({ error: "شما عضو این گروه نیستید" }, { status: 403 });

      const mRow = await db.execute(sql`
        SELECT * FROM group_messages WHERE group_id = ${Number(groupId)} AND is_deleted = false
        ORDER BY created_at DESC LIMIT 100
      `);
      const msgs = (((mRow as any).rows || mRow) as any[]).reverse();

      // Update last_read
      if (isMember) {
        try { await db.execute(sql`UPDATE message_group_members SET last_read_at = NOW() WHERE group_id = ${Number(groupId)} AND user_id = ${uid}`); } catch {}
      }

      const membersRow = await db.execute(sql`
        SELECT m.user_id, m.role, u.name, u.phone, u.avatar
        FROM message_group_members m
        LEFT JOIN users u ON u.id = m.user_id
        WHERE m.group_id = ${Number(groupId)}
        ORDER BY m.role, u.name
      `);
      return NextResponse.json({ group: g, messages: msgs, members: ((membersRow as any).rows || membersRow), isMember, isManager, isAdmin });
    }

    // List: groups where user is member OR manager
    const inst = await getMyInstitute(u);
    const rows = await db.execute(sql`
      SELECT g.*,
             (SELECT COUNT(*)::int FROM group_messages WHERE group_id = g.id AND is_deleted = false) AS msg_count,
             (SELECT COUNT(*)::int FROM group_messages gm
              LEFT JOIN message_group_members m ON m.group_id = gm.group_id AND m.user_id = ${uid}
              WHERE gm.group_id = g.id AND gm.is_deleted = false AND (m.last_read_at IS NULL OR gm.created_at > m.last_read_at)
             ) AS unread_count,
             (SELECT content FROM group_messages WHERE group_id = g.id AND is_deleted = false ORDER BY created_at DESC LIMIT 1) AS last_message
      FROM message_groups g
      WHERE g.is_active = true AND (
        g.id IN (SELECT group_id FROM message_group_members WHERE user_id = ${uid})
        ${inst ? sql`OR g.institute_id = ${inst.id}` : sql``}
      )
      ORDER BY COALESCE(g.last_message_at, g.created_at) DESC
    `);
    return NextResponse.json({ items: ((rows as any).rows || rows) });
  } catch (e: any) { return NextResponse.json({ error: e?.message }, { status: 500 }); }
}

// POST: create group / send message / add member / remove member
export async function POST(req: Request) {
  const u = await getSession();
  if (!u?.id) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const uid = Number(u.id);
  const body = await req.json();
  const { action } = body;

  try {
    if (action === "createGroup") {
      const inst = await getMyInstitute(u);
      if (!inst) return NextResponse.json({ error: "فقط مدیران آموزشگاه می‌توانند گروه بسازند" }, { status: 403 });
      const { title, description, courseId, type, autoAddStudents } = body;
      if (!title) return NextResponse.json({ error: "عنوان الزامی است" }, { status: 400 });
      const [g] = await db.execute(sql`
        INSERT INTO message_groups (institute_id, course_id, title, description, type, created_by)
        VALUES (${inst.id}, ${courseId ? Number(courseId) : null}, ${title}, ${description || null}, ${type || 'course'}, ${uid})
        RETURNING *
      `).then((r: any) => (r.rows || r));

      // Add manager as admin
      await db.execute(sql`
        INSERT INTO message_group_members (group_id, user_id, role) VALUES (${g.id}, ${uid}, 'admin')
        ON CONFLICT (group_id, user_id) DO NOTHING
      `);

      // Auto-add all approved students of the course
      if (autoAddStudents && courseId) {
        await db.execute(sql`
          INSERT INTO message_group_members (group_id, user_id, role)
          SELECT ${g.id}, user_id, 'member'
          FROM registrations
          WHERE course_id = ${Number(courseId)} AND status = 'approved' AND user_id IS NOT NULL
          ON CONFLICT (group_id, user_id) DO NOTHING
        `);
      }

      // Update memberCount
      const cnt = await db.execute(sql`SELECT COUNT(*)::int AS c FROM message_group_members WHERE group_id = ${g.id}`);
      const c = ((cnt as any).rows || cnt)[0]?.c || 0;
      await db.execute(sql`UPDATE message_groups SET member_count = ${c} WHERE id = ${g.id}`);
      return NextResponse.json({ ok: true, group: g });
    }

    if (action === "sendMessage") {
      const { groupId, content, messageType, attachmentUrl, replyToId } = body;
      if (!groupId || (!content && !attachmentUrl)) return NextResponse.json({ error: "params" }, { status: 400 });
      // Verify membership OR institute manager
      const gRow = await db.execute(sql`SELECT institute_id FROM message_groups WHERE id = ${Number(groupId)}`);
      const g = ((gRow as any).rows || gRow)[0];
      if (!g) return NextResponse.json({ error: "گروه یافت نشد" }, { status: 404 });
      const inst = await getMyInstitute(u);
      const isManager = inst && Number(inst.id) === Number(g.institute_id);
      const memRow = await db.execute(sql`SELECT id FROM message_group_members WHERE group_id = ${Number(groupId)} AND user_id = ${uid}`);
      const isMember = ((memRow as any).rows || memRow).length > 0;
      if (!isMember && !isManager && u.role !== "admin") return NextResponse.json({ error: "دسترسی ندارید" }, { status: 403 });

      // Get user info
      const userRow = await db.select({ name: users.name, role: users.role }).from(users).where(eq(users.id, uid)).then(r => r[0]);
      await db.execute(sql`
        INSERT INTO group_messages (group_id, sender_id, sender_name, sender_role, content, message_type, attachment_url, reply_to_id)
        VALUES (${Number(groupId)}, ${uid}, ${userRow?.name || null},
                ${isManager ? 'manager' : u.role === 'admin' ? 'admin' : 'student'},
                ${content || null}, ${messageType || 'text'}, ${attachmentUrl || null}, ${replyToId ? Number(replyToId) : null})
      `);
      await db.execute(sql`UPDATE message_groups SET last_message_at = NOW() WHERE id = ${Number(groupId)}`);
      return NextResponse.json({ ok: true });
    }

    if (action === "addMembers") {
      const inst = await getMyInstitute(u);
      if (!inst) return NextResponse.json({ error: "unauth" }, { status: 403 });
      const { groupId, userIds } = body;
      const gRow = await db.execute(sql`SELECT institute_id FROM message_groups WHERE id = ${Number(groupId)}`);
      const g = ((gRow as any).rows || gRow)[0];
      if (!g || Number(g.institute_id) !== Number(inst.id)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
      for (const uid2 of userIds || []) {
        await db.execute(sql`
          INSERT INTO message_group_members (group_id, user_id) VALUES (${Number(groupId)}, ${Number(uid2)})
          ON CONFLICT (group_id, user_id) DO NOTHING
        `);
      }
      const cnt = await db.execute(sql`SELECT COUNT(*)::int AS c FROM message_group_members WHERE group_id = ${Number(groupId)}`);
      const c = ((cnt as any).rows || cnt)[0]?.c || 0;
      await db.execute(sql`UPDATE message_groups SET member_count = ${c} WHERE id = ${Number(groupId)}`);
      return NextResponse.json({ ok: true, count: c });
    }

    if (action === "deleteGroup") {
      const inst = await getMyInstitute(u);
      if (!inst) return NextResponse.json({ error: "unauth" }, { status: 403 });
      const gRow = await db.execute(sql`SELECT institute_id FROM message_groups WHERE id = ${Number(body.groupId)}`);
      const g = ((gRow as any).rows || gRow)[0];
      if (!g || Number(g.institute_id) !== Number(inst.id)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
      await db.execute(sql`DELETE FROM message_groups WHERE id = ${Number(body.groupId)}`);
      return NextResponse.json({ ok: true });
    }

    if (action === "leaveGroup") {
      await db.execute(sql`DELETE FROM message_group_members WHERE group_id = ${Number(body.groupId)} AND user_id = ${uid}`);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "action نامعتبر" }, { status: 400 });
  } catch (e: any) { return NextResponse.json({ error: e?.message }, { status: 500 }); }
}
