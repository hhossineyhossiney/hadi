import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { institutes, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { normalizePhone } from "@/lib/phone";
import * as XLSX from "xlsx";

async function findInstitute() {
  const s = await getServerSession(authOptions);
  const u = s?.user as any;
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

// GET /api/manager/report?type=students|courses|grades|attendance|revenue|fees
export async function GET(req: Request) {
  const inst = await findInstitute();
  if (!inst) return NextResponse.json({ error: "unauth" }, { status: 403 });
  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "students";
  const format = url.searchParams.get("format") || "excel"; // excel | csv | json

  try {
    let rows: any[] = [];
    let sheetName = "گزارش";
    let filename = "report";

    if (type === "students") {
      sheetName = "لیست هنرجویان";
      filename = "students";
      const r = await db.execute(sql`
        SELECT r.id AS "ردیف", r.full_name AS "نام و نام‌خانوادگی", r.phone AS "موبایل",
               r.email AS "ایمیل", c.title AS "دوره",
               CASE r.status WHEN 'approved' THEN 'تأیید شده' WHEN 'rejected' THEN 'رد شده' ELSE 'در انتظار' END AS "وضعیت",
               r.progress AS "پیشرفت (٪)", r.sessions_attended AS "جلسات حاضر",
               TO_CHAR(r.created_at, 'YYYY/MM/DD') AS "تاریخ ثبت‌نام"
        FROM registrations r
        LEFT JOIN courses c ON c.id = r.course_id
        WHERE r.institute_id = ${inst.id}
        ORDER BY r.created_at DESC
      `);
      rows = ((r as any).rows || r);
    } else if (type === "courses") {
      sheetName = "دوره‌ها";
      filename = "courses";
      const r = await db.execute(sql`
        SELECT c.id AS "ردیف", c.title AS "عنوان دوره", cat.name AS "رشته",
               c.instructor AS "مدرس", c.duration AS "مدت", c.price AS "شهریه (تومان)",
               c.capacity AS "ظرفیت", c.enrolled_count AS "ثبت‌نام‌شده",
               CASE c.status WHEN 'approved' THEN 'فعال' ELSE c.status END AS "وضعیت",
               c.start_date AS "تاریخ شروع",
               TO_CHAR(c.created_at, 'YYYY/MM/DD') AS "تاریخ ایجاد"
        FROM courses c
        LEFT JOIN categories cat ON cat.id = c.category_id
        WHERE c.institute_id = ${inst.id}
        ORDER BY c.created_at DESC
      `);
      rows = ((r as any).rows || r);
    } else if (type === "grades") {
      sheetName = "نمرات";
      filename = "grades";
      const r = await db.execute(sql`
        SELECT g.id AS "ردیف", reg.full_name AS "هنرجو", reg.phone AS "موبایل",
               c.title AS "دوره", g.subject AS "موضوع",
               g.theoretical_score AS "نمره تئوری", g.practical_score AS "نمره عملی",
               g.final_score AS "نمره نهایی", g.max_score AS "نمره کل",
               CASE g.status WHEN 'passed' THEN 'قبول' WHEN 'failed' THEN 'مردود' ELSE 'در انتظار' END AS "وضعیت",
               TO_CHAR(g.graded_at, 'YYYY/MM/DD') AS "تاریخ ثبت"
        FROM grades g
        LEFT JOIN registrations reg ON reg.id = g.registration_id
        LEFT JOIN courses c ON c.id = g.course_id
        WHERE g.institute_id = ${inst.id}
        ORDER BY g.graded_at DESC
      `);
      rows = ((r as any).rows || r);
    } else if (type === "attendance") {
      sheetName = "حضور و غیاب";
      filename = "attendance";
      const r = await db.execute(sql`
        SELECT a.id AS "ردیف", u.name AS "هنرجو", c.title AS "دوره",
               a.session_date AS "تاریخ جلسه",
               CASE a.status WHEN 'present' THEN 'حاضر' WHEN 'late' THEN 'تاخیر' WHEN 'excused' THEN 'با اجازه' ELSE 'غایب' END AS "وضعیت",
               a.notes AS "یادداشت",
               TO_CHAR(a.created_at, 'YYYY/MM/DD HH24:MI') AS "زمان ثبت"
        FROM attendance a
        LEFT JOIN users u ON u.id = a.user_id
        LEFT JOIN courses c ON c.id = a.course_id
        WHERE a.course_id IN (SELECT id FROM courses WHERE institute_id = ${inst.id})
        ORDER BY a.session_date DESC
      `);
      rows = ((r as any).rows || r);
    } else if (type === "revenue") {
      sheetName = "درآمد فروش آنلاین";
      filename = "revenue";
      const r = await db.execute(sql`
        SELECT p.id AS "ردیف", u.name AS "خریدار", u.phone AS "موبایل",
               c.title AS "دوره فروشی", p.amount AS "مبلغ (تومان)",
               p.commission AS "کمیسیون سامانه", p.net_amount AS "خالص دریافتی",
               CASE p.payment_method WHEN 'wallet' THEN 'کیف پول' WHEN 'online' THEN 'درگاه آنلاین' ELSE p.payment_method END AS "روش پرداخت",
               CASE p.status WHEN 'paid' THEN 'پرداخت شد' WHEN 'pending' THEN 'در انتظار' ELSE p.status END AS "وضعیت",
               TO_CHAR(p.created_at, 'YYYY/MM/DD') AS "تاریخ"
        FROM sellable_purchases p
        LEFT JOIN users u ON u.id = p.user_id
        LEFT JOIN sellable_courses c ON c.id = p.course_id
        WHERE p.institute_id = ${inst.id}
        ORDER BY p.created_at DESC
      `);
      rows = ((r as any).rows || r);
    } else if (type === "fees") {
      sheetName = "شهریه و اقساط";
      filename = "fees";
      const r = await db.execute(sql`
        SELECT pf.id AS "ردیف", u.name AS "هنرجو", u.phone AS "موبایل",
               c.title AS "دوره", pf.title AS "عنوان",
               CASE pf.type WHEN 'installment' THEN 'قسط' WHEN 'certificate' THEN 'هزینه گواهی' WHEN 'exam_first' THEN 'آزمون اول' WHEN 'exam_retry' THEN 'آزمون دوم' WHEN 'government_dahak' THEN 'دهک دولت' ELSE 'سایر' END AS "نوع",
               pf.installment_number AS "شماره قسط", pf.total_installments AS "کل اقساط",
               pf.amount AS "مبلغ", pf.due_date AS "موعد",
               CASE pf.status WHEN 'paid' THEN 'پرداخت شد' WHEN 'overdue' THEN 'معوقه' WHEN 'waived' THEN 'بخشیده' ELSE 'در انتظار' END AS "وضعیت",
               TO_CHAR(pf.paid_at, 'YYYY/MM/DD') AS "تاریخ پرداخت"
        FROM payment_fees pf
        LEFT JOIN users u ON u.id = pf.user_id
        LEFT JOIN courses c ON c.id = pf.course_id
        WHERE pf.institute_id = ${inst.id}
        ORDER BY pf.created_at DESC
      `);
      rows = ((r as any).rows || r);
    } else {
      return NextResponse.json({ error: "type نامعتبر" }, { status: 400 });
    }

    if (format === "json") return NextResponse.json({ rows });

    // Build Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ "توضیح": "داده‌ای موجود نیست" }]);
    // Set RTL & column widths
    (ws as any)['!cols'] = Object.keys(rows[0] || {"a":1}).map(() => ({ wch: 18 }));
    (ws as any)['!margins'] = { left: 0.5, right: 0.5 };
    ws['!ref'] = ws['!ref'];
    XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
    const buf = XLSX.write(wb, { type: "buffer", bookType: format === "csv" ? "csv" : "xlsx" });

    const now = new Date().toISOString().slice(0, 10);
    const ext = format === "csv" ? "csv" : "xlsx";
    const mime = format === "csv" ? "text/csv;charset=utf-8" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    return new NextResponse(buf as any, {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="${filename}-${now}.${ext}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "خطا" }, { status: 500 });
  }
}
