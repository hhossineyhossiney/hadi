import { db } from "@/db";
import {
  registrations, courses, institutes, categories, telegramChats,
  users, notifications, walletTransactions, sellableCourses, sellablePurchases,
  paymentFees,
} from "@/db/schema";
import { sendTelegramMessage, editTelegramMessage, answerCallbackQuery } from "@/lib/telegram";
import { normalizePhone } from "@/lib/phone";
import { eq, desc, count, and, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getInstituteEntitlement } from "@/lib/subscription-entitlements";

export const dynamic = "force-dynamic";

/* ═══════════════════════════════════════════════════════════════
   BOT V2 — قابلیت مدیریتی جامع در تلگرام
   ═══════════════════════════════════════════════════════════════
   حالت‌ها (states):
   - awaiting_phone → کاربر منتظر ورود شماره برای احراز هویت
   - awaiting_login_password → منتظر پسورد
   - awaiting_deposit_amount → منتظر مبلغ شارژ کیف پول
   
   نقش‌ها (roles) در telegram_chats:
   - subscriber → کاربر مهمان
   - student → هنرجو (userId set)
   - institute_manager → مدیر آموزشگاه (instituteId set)
   - admin → مدیر کل سامانه
*/

const ADMIN_PHONES = ["09159513179", "09150000000"];

// ═══════════ KEYBOARDS ═══════════
const GUEST_KB = {
  keyboard: [
    [{ text: "🔐 ورود / احراز هویت" }, { text: "📚 دوره‌ها" }],
    [{ text: "🏢 آموزشگاه‌ها" }, { text: "🎬 فروشگاه آنلاین" }],
    [{ text: "📊 آمار پلتفرم" }, { text: "ℹ️ راهنما" }],
  ],
  resize_keyboard: true,
};

const STUDENT_KB = {
  keyboard: [
    [{ text: "🎓 دوره‌های من" }, { text: "🎬 دوره‌های آنلاین من" }],
    [{ text: "💰 کیف پول" }, { text: "📄 اقساط و شهریه" }],
    [{ text: "🔔 اعلان‌ها" }, { text: "📚 مرور دوره‌ها" }],
    [{ text: "👤 پروفایل" }, { text: "🚪 خروج" }],
  ],
  resize_keyboard: true,
};

const MANAGER_KB = {
  keyboard: [
    [{ text: "🎓 هنرجویان آموزشگاه" }, { text: "📚 دوره‌های آموزشگاه" }],
    [{ text: "💼 فروش آنلاین" }, { text: "📈 آمار آموزشگاه" }],
    [{ text: "🔔 اعلان‌ها" }, { text: "💰 درآمد" }],
    [{ text: "🚪 خروج" }],
  ],
  resize_keyboard: true,
};

const ADMIN_KB = {
  keyboard: [
    [{ text: "📊 داشبورد مدیریتی" }, { text: "📋 ثبت‌نام‌های اخیر" }],
    [{ text: "🏢 لیست آموزشگاه‌ها" }, { text: "📚 لیست دوره‌ها" }],
    [{ text: "🎬 فروشگاه آنلاین" }, { text: "👥 مدیران" }],
    [{ text: "💰 مالی و درآمد" }, { text: "🔔 اعلان همگانی" }],
    [{ text: "🚪 خروج" }],
  ],
  resize_keyboard: true,
};

function kbFor(role?: string | null) {
  if (role === "admin") return ADMIN_KB;
  if (role === "institute_manager") return MANAGER_KB;
  if (role === "student") return STUDENT_KB;
  return GUEST_KB;
}

// ═══════════ HELPERS ═══════════
async function getOrCreateChat(chatId: string, firstName: string, username: string) {
  const existing = await db.select().from(telegramChats).where(eq(telegramChats.chatId, chatId)).then(r => r[0]);
  if (existing) {
    // update lastSeen
    try { await db.update(telegramChats).set({ lastSeen: new Date() }).where(eq(telegramChats.chatId, chatId)); } catch {}
    return existing;
  }
  const [created] = await db.insert(telegramChats).values({
    chatId, firstName, username, role: "subscriber",
  }).returning();
  return created;
}

async function setState(chatId: string, state: string | null, data?: any) {
  await db.update(telegramChats).set({
    state,
    stateData: data ? JSON.stringify(data) : null,
  }).where(eq(telegramChats.chatId, chatId));
}

async function clearAuth(chatId: string) {
  await db.update(telegramChats).set({
    role: "subscriber",
    userId: null,
    instituteId: null,
    phone: null,
    state: null,
    stateData: null,
  }).where(eq(telegramChats.chatId, chatId));
}

function fmtMoney(n: any) {
  return Number(n || 0).toLocaleString("fa-IR") + " تومان";
}
function fmtDate(d: any) {
  try { return new Date(d).toLocaleDateString("fa-IR"); } catch { return "—"; }
}

// ═══════════ AUTHENTICATION FLOW ═══════════
async function handleLogin(chatId: string, phone: string) {
  const clean = normalizePhone(phone);
  if (!/^09\d{9}$/.test(clean)) {
    await sendTelegramMessage(chatId, "❌ شماره موبایل نامعتبر است.\nمثال درست: <code>09123456789</code>", GUEST_KB);
    return;
  }

  const user = await db.select().from(users).where(eq(users.phone, clean)).then(r => r[0]);
  if (!user) {
    await sendTelegramMessage(chatId,
      `❌ کاربری با شماره <code>${clean}</code> در سامانه یافت نشد.\n\n🔗 برای ثبت‌نام به سایت مراجعه کنید:\nhttps://amozeshgahazadconfig.vercel.app/register`,
      GUEST_KB);
    await setState(chatId, null);
    return;
  }

  // Determine role
  let role = "student";
  let instituteId: number | null = null;
  if (ADMIN_PHONES.includes(clean) || user.role === "admin") {
    role = "admin";
  } else {
    // Try to find managed institute
    const inst = await db.select().from(institutes).where(eq(institutes.userId, user.id)).then(r => r[0]);
    if (inst) {
      role = "institute_manager";
      instituteId = inst.id;
    } else {
      // try by mobile
      const allInsts = await db.select().from(institutes);
      const match = allInsts.find(i => normalizePhone(i.mobile || "") === clean || normalizePhone(i.phone || "") === clean);
      if (match) {
        role = "institute_manager";
        instituteId = match.id;
        // Link
        try { await db.update(institutes).set({ userId: user.id }).where(eq(institutes.id, match.id)); } catch {}
      }
    }
  }

  await db.update(telegramChats).set({
    role, userId: user.id, phone: clean, instituteId,
    state: null, stateData: null,
  }).where(eq(telegramChats.chatId, chatId));

  const displayRole = role === "admin" ? "مدیر کل سامانه" : role === "institute_manager" ? "مدیر آموزشگاه" : "هنرجو";
  await sendTelegramMessage(chatId,
    `✅ <b>ورود موفق!</b>\n\n👤 ${user.name || clean}\n🎖 نقش: <b>${displayRole}</b>\n\nاز منوی پایین اقدام کنید.`,
    kbFor(role)
  );
}

// ═══════════ ADMIN COMMANDS ═══════════
async function adminDashboard(chatId: string) {
  const [regs, insts, cours, pending, approved, shopSales] = await Promise.all([
    db.select({ c: count() }).from(registrations),
    db.select({ c: count() }).from(institutes),
    db.select({ c: count() }).from(courses),
    db.select({ c: count() }).from(registrations).where(eq(registrations.status, "pending")),
    db.select({ c: count() }).from(registrations).where(eq(registrations.status, "approved")),
    db.execute(sql`SELECT COUNT(*)::int AS cnt, COALESCE(SUM(amount), 0)::text AS total FROM sellable_purchases WHERE status = 'paid'`),
  ]);
  const shop = ((shopSales as any).rows || shopSales)[0] || { cnt: 0, total: 0 };

  const text = `📊 <b>داشبورد مدیریتی زبرخان</b>\n\n` +
    `👥 کل ثبت‌نام‌ها: <b>${regs[0]?.c || 0}</b>\n` +
    `🟢 تأیید شده: <b>${approved[0]?.c || 0}</b>\n` +
    `🟡 در انتظار: <b>${pending[0]?.c || 0}</b>\n\n` +
    `🏢 آموزشگاه‌ها: <b>${insts[0]?.c || 0}</b>\n` +
    `📚 دوره‌ها: <b>${cours[0]?.c || 0}</b>\n\n` +
    `🎬 <b>فروشگاه آنلاین:</b>\n` +
    `   • خریدها: <b>${shop.cnt}</b>\n` +
    `   • درآمد: <b>${Number(shop.total).toLocaleString("fa-IR")} تومان</b>\n\n` +
    `⏰ ${new Date().toLocaleString("fa-IR")}`;
  await sendTelegramMessage(chatId, text, ADMIN_KB);
}

async function adminManagers(chatId: string) {
  const list = await db.execute(sql`
    SELECT u.id, u.name, u.phone, i.name AS inst_name
    FROM users u
    LEFT JOIN institutes i ON i.user_id = u.id
    WHERE u.role = 'institute'
    ORDER BY u.created_at DESC
    LIMIT 20
  `);
  const rows = ((list as any).rows || list) as any[];
  if (!rows.length) return sendTelegramMessage(chatId, "هیچ مدیری یافت نشد.", ADMIN_KB);
  let t = `👥 <b>مدیران آموزشگاه‌ها (${rows.length}):</b>\n\n`;
  rows.forEach((m, i) => {
    t += `${i + 1}. <b>${m.name || "—"}</b>\n📱 <code>${m.phone}</code>\n🏢 ${m.inst_name || "بدون آموزشگاه"}\n───────────\n`;
  });
  await sendTelegramMessage(chatId, t, ADMIN_KB);
}

async function adminFinance(chatId: string) {
  const wallet = await db.execute(sql`SELECT COALESCE(SUM(CASE WHEN type='deposit' THEN CAST(amount AS DECIMAL) ELSE 0 END), 0)::text AS total_deposit FROM wallet_transactions`);
  const shop = await db.execute(sql`SELECT COUNT(*)::int AS cnt, COALESCE(SUM(amount), 0)::text AS revenue, COALESCE(SUM(commission), 0)::text AS commission FROM sellable_purchases WHERE status='paid'`);
  const wRow = ((wallet as any).rows || wallet)[0] || {};
  const sRow = ((shop as any).rows || shop)[0] || {};

  const t = `💰 <b>گزارش مالی</b>\n\n` +
    `💳 <b>کیف پول‌ها:</b>\n   شارژهای کل: ${Number(wRow.total_deposit || 0).toLocaleString("fa-IR")} تومان\n\n` +
    `🎬 <b>فروش آنلاین:</b>\n   خریدها: ${sRow.cnt || 0}\n   درآمد ناخالص: ${Number(sRow.revenue || 0).toLocaleString("fa-IR")} تومان\n   کمیسیون سامانه: ${Number(sRow.commission || 0).toLocaleString("fa-IR")} تومان\n`;
  await sendTelegramMessage(chatId, t, ADMIN_KB);
}

async function adminBroadcastPrompt(chatId: string) {
  await setState(chatId, "awaiting_broadcast_text");
  await sendTelegramMessage(chatId, "📣 متن اعلان همگانی رو ارسال کنید. این پیام به همه هنرجویانی که ربات رو اضافه کردن ارسال می‌شه.\n\nبرای لغو: /cancel", ADMIN_KB);
}

async function adminBroadcast(chatId: string, message: string) {
  // Send to all telegram chats
  const all = await db.select().from(telegramChats);
  let sent = 0;
  for (const c of all) {
    if (c.chatId === chatId) continue;
    try {
      await sendTelegramMessage(c.chatId, `📣 <b>اعلان سامانه زبرخان</b>\n\n${message}`);
      sent++;
    } catch {}
  }
  await setState(chatId, null);
  await sendTelegramMessage(chatId, `✅ اعلان به ${sent} کاربر ارسال شد.`, ADMIN_KB);
}

// ═══════════ STUDENT COMMANDS ═══════════
async function studentMyCourses(chatId: string, userId: number) {
  const rows = await db.execute(sql`
    SELECT r.id, r.status, r.progress, r.created_at, r.certificate_url,
           c.title AS course_title, i.name AS inst_name, i.mobile AS inst_phone
    FROM registrations r
    LEFT JOIN courses c ON c.id = r.course_id
    LEFT JOIN institutes i ON i.id = r.institute_id
    WHERE r.user_id = ${userId}
    ORDER BY r.created_at DESC
  `);
  const list = ((rows as any).rows || rows) as any[];
  if (!list.length) {
    return sendTelegramMessage(chatId, "شما در هیچ دوره حضوری ثبت‌نام نکرده‌اید.\nبرای ثبت‌نام: https://amozeshgahazadconfig.vercel.app/courses", STUDENT_KB);
  }
  let t = `🎓 <b>دوره‌های حضوری شما (${list.length}):</b>\n\n`;
  list.forEach((r, i) => {
    const em = r.status === "approved" ? "🟢" : r.status === "rejected" ? "🔴" : "🟡";
    t += `${i + 1}. ${em} <b>${r.course_title}</b>\n🏢 ${r.inst_name}\n📊 پیشرفت: ${r.progress || 0}٪\n📅 ${fmtDate(r.created_at)}\n${r.certificate_url ? "🏆 گواهینامه دریافت‌شده\n" : ""}───────────\n`;
  });
  await sendTelegramMessage(chatId, t, STUDENT_KB);
}

async function studentShopCourses(chatId: string, userId: number) {
  const rows = await db.execute(sql`
    SELECT p.id AS pid, p.progress, p.amount, c.title, c.slug, c.total_lessons, i.name AS inst_name
    FROM sellable_purchases p
    JOIN sellable_courses c ON c.id = p.course_id
    LEFT JOIN institutes i ON i.id = p.institute_id
    WHERE p.user_id = ${userId} AND p.status = 'paid'
    ORDER BY p.created_at DESC
  `);
  const list = ((rows as any).rows || rows) as any[];
  if (!list.length) {
    return sendTelegramMessage(chatId,
      "شما هنوز دوره آنلاینی خریداری نکرده‌اید.\n\n🎬 فروشگاه: https://amozeshgahazadconfig.vercel.app/shop",
      STUDENT_KB);
  }
  let t = `🎬 <b>دوره‌های آنلاین شما (${list.length}):</b>\n\n`;
  list.forEach((p, i) => {
    t += `${i + 1}. <b>${p.title}</b>\n🏢 ${p.inst_name}\n📊 پیشرفت: ${p.progress || 0}٪ • ${p.total_lessons || 0} درس\n💰 ${fmtMoney(p.amount)}\n▶ https://amozeshgahazadconfig.vercel.app/shop/${encodeURIComponent(p.slug)}\n───────────\n`;
  });
  await sendTelegramMessage(chatId, t, STUDENT_KB);
}

async function studentWallet(chatId: string, userId: number) {
  const balRow = await db.execute(sql`SELECT COALESCE(wallet_balance, 0)::text AS bal FROM users WHERE id = ${userId}`);
  const bal = Number(((balRow as any).rows || balRow)[0]?.bal || 0);
  const txRows = await db.execute(sql`
    SELECT amount, type, description, balance_after, created_at
    FROM wallet_transactions WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 5
  `);
  const txs = ((txRows as any).rows || txRows) as any[];

  let t = `💰 <b>کیف پول شما</b>\n\nموجودی فعلی: <b>${bal.toLocaleString("fa-IR")} تومان</b>\n\n📜 <b>۵ تراکنش اخیر:</b>\n`;
  if (!txs.length) t += "بدون تراکنش\n";
  else txs.forEach((tx, i) => {
    const em = tx.type === "deposit" ? "🟢+" : tx.type === "withdraw" || tx.type === "payment" ? "🔴-" : "🟡";
    t += `${i + 1}. ${em} ${Number(tx.amount).toLocaleString("fa-IR")}ت • ${tx.description || tx.type}\n   ${fmtDate(tx.created_at)}\n`;
  });
  t += "\nبرای شارژ: https://amozeshgahazadconfig.vercel.app/dashboard";
  await sendTelegramMessage(chatId, t, STUDENT_KB);
}

async function studentFees(chatId: string, userId: number) {
  const rows = await db.execute(sql`
    SELECT pf.title, pf.amount, pf.status, pf.due_date, pf.type, pf.installment_number, pf.total_installments,
           c.title AS course_title
    FROM payment_fees pf
    LEFT JOIN courses c ON c.id = pf.course_id
    WHERE pf.user_id = ${userId}
    ORDER BY pf.due_date NULLS LAST, pf.created_at DESC
  `);
  const list = ((rows as any).rows || rows) as any[];
  if (!list.length) return sendTelegramMessage(chatId, "هیچ شهریه یا قسطی برای شما ثبت نشده.", STUDENT_KB);
  let t = `📄 <b>شهریه‌ها و اقساط شما:</b>\n\n`;
  list.forEach((f, i) => {
    const em = f.status === "paid" ? "🟢" : f.status === "overdue" ? "🔴" : "🟡";
    t += `${i + 1}. ${em} <b>${f.title}</b>\n📚 ${f.course_title || "—"}\n💰 ${fmtMoney(f.amount)}\n📅 موعد: ${f.due_date || "—"}\n${f.installment_number ? `📊 قسط ${f.installment_number}/${f.total_installments}\n` : ""}───────────\n`;
  });
  await sendTelegramMessage(chatId, t, STUDENT_KB);
}

async function studentNotifications(chatId: string, userId: number) {
  const rows = await db.execute(sql`
    SELECT title, body, type, created_at
    FROM notifications
    WHERE user_id = ${userId}
    ORDER BY created_at DESC LIMIT 10
  `);
  const list = ((rows as any).rows || rows) as any[];
  if (!list.length) return sendTelegramMessage(chatId, "🔔 هیچ اعلانی ندارید.", STUDENT_KB);
  let t = `🔔 <b>۱۰ اعلان اخیر:</b>\n\n`;
  list.forEach((n, i) => {
    const em = n.type === "success" ? "✅" : n.type === "error" ? "❌" : n.type === "warning" ? "⚠️" : "ℹ️";
    t += `${i + 1}. ${em} <b>${n.title}</b>\n${n.body || ""}\n${fmtDate(n.created_at)}\n───────────\n`;
  });
  await sendTelegramMessage(chatId, t, STUDENT_KB);
}

async function studentProfile(chatId: string, userId: number) {
  const u = await db.select().from(users).where(eq(users.id, userId)).then(r => r[0]);
  if (!u) return sendTelegramMessage(chatId, "❌", STUDENT_KB);
  const t = `👤 <b>پروفایل شما</b>\n\nنام: <b>${u.name || "—"}</b>\nموبایل: <code>${u.phone}</code>\nایمیل: ${u.email || "—"}\nنقش: هنرجو\n\nبرای ویرایش: https://amozeshgahazadconfig.vercel.app/dashboard`;
  await sendTelegramMessage(chatId, t, STUDENT_KB);
}

// ═══════════ MANAGER COMMANDS ═══════════
async function managerStudents(chatId: string, instituteId: number) {
  const rows = await db.execute(sql`
    SELECT r.id, r.full_name, r.phone, r.status, r.progress, c.title AS course_title
    FROM registrations r
    LEFT JOIN courses c ON c.id = r.course_id
    WHERE r.institute_id = ${instituteId}
    ORDER BY r.created_at DESC LIMIT 20
  `);
  const list = ((rows as any).rows || rows) as any[];
  if (!list.length) return sendTelegramMessage(chatId, "هیچ هنرجویی ندارید.", MANAGER_KB);
  let t = `🎓 <b>۲۰ هنرجوی اخیر:</b>\n\n`;
  list.forEach((s, i) => {
    const em = s.status === "approved" ? "🟢" : s.status === "rejected" ? "🔴" : "🟡";
    t += `${i + 1}. ${em} <b>${s.full_name}</b>\n📱 <code>${s.phone}</code>\n📚 ${s.course_title}\n📊 ${s.progress || 0}٪\n───────────\n`;
  });
  await sendTelegramMessage(chatId, t, MANAGER_KB);
}

async function managerCourses(chatId: string, instituteId: number) {
  const rows = await db.execute(sql`
    SELECT c.id, c.title, c.price, c.status, c.capacity,
           (SELECT COUNT(*)::int FROM registrations WHERE course_id = c.id) AS reg_count
    FROM courses c
    WHERE c.institute_id = ${instituteId}
    ORDER BY c.created_at DESC LIMIT 20
  `);
  const list = ((rows as any).rows || rows) as any[];
  if (!list.length) return sendTelegramMessage(chatId, "دوره‌ای ثبت نکرده‌اید.", MANAGER_KB);
  let t = `📚 <b>دوره‌های آموزشگاه (${list.length}):</b>\n\n`;
  list.forEach((c, i) => {
    t += `${i + 1}. <b>${c.title}</b>\n💰 ${fmtMoney(c.price)}\n👥 ${c.reg_count}/${c.capacity || "∞"}\n───────────\n`;
  });
  await sendTelegramMessage(chatId, t, MANAGER_KB);
}

async function managerShop(chatId: string, instituteId: number) {
  const entitlement = await getInstituteEntitlement(instituteId);
  if (!entitlement.onlineSalesEnabled) {
    return sendTelegramMessage(chatId, "❌ فروش آنلاین در پلن فعال شما وجود ندارد.\nبا ارتقای پلن، دسترسی خودکار فعال می‌شود.", MANAGER_KB);
  }
  const rows = await db.execute(sql`
    SELECT c.id, c.title, c.price, c.is_published,
           (SELECT COUNT(*)::int FROM sellable_purchases WHERE course_id = c.id AND status='paid') AS sales,
           (SELECT COALESCE(SUM(net_amount), 0)::text FROM sellable_purchases WHERE course_id = c.id AND status='paid') AS revenue
    FROM sellable_courses c WHERE c.institute_id = ${instituteId} ORDER BY c.created_at DESC
  `);
  const list = ((rows as any).rows || rows) as any[];
  let t = `💼 <b>فروش آنلاین</b>\n\n📊 پلن: <b>${entitlement.planName || "—"}</b> • سقف: ${entitlement.unlimitedShopCourses ? "نامحدود" : `${entitlement.maxShopCourses} دوره`}\n💵 کمیسیون خودکار پلن: ${entitlement.commissionPercent}٪\n\n📚 <b>دوره‌های شما (${list.length}):</b>\n\n`;
  list.forEach((c, i) => {
    const st = c.is_published ? "🟢 منتشر" : "🟡 پیش‌نویس";
    t += `${i + 1}. ${st} <b>${c.title}</b>\n💰 ${fmtMoney(c.price)}\n🛒 ${c.sales} فروش • خالص: ${Number(c.revenue).toLocaleString("fa-IR")} ت\n───────────\n`;
  });
  await sendTelegramMessage(chatId, t, MANAGER_KB);
}

async function managerStats(chatId: string, instituteId: number) {
  const stats = await db.execute(sql`
    SELECT
      (SELECT COUNT(*)::int FROM registrations WHERE institute_id = ${instituteId}) AS total_regs,
      (SELECT COUNT(*)::int FROM registrations WHERE institute_id = ${instituteId} AND status='approved') AS approved,
      (SELECT COUNT(*)::int FROM registrations WHERE institute_id = ${instituteId} AND status='pending') AS pending,
      (SELECT COUNT(*)::int FROM courses WHERE institute_id = ${instituteId}) AS courses_count,
      (SELECT COUNT(*)::int FROM sellable_courses WHERE institute_id = ${instituteId}) AS shop_count,
      (SELECT COALESCE(SUM(net_amount), 0)::text FROM sellable_purchases WHERE institute_id = ${instituteId} AND status='paid') AS shop_revenue
  `);
  const s = ((stats as any).rows || stats)[0] || {};
  const t = `📈 <b>آمار آموزشگاه</b>\n\n👥 هنرجویان: <b>${s.total_regs || 0}</b>\n🟢 تأییدشده: <b>${s.approved || 0}</b>\n🟡 در انتظار: <b>${s.pending || 0}</b>\n\n📚 دوره‌های حضوری: <b>${s.courses_count || 0}</b>\n🎬 دوره‌های آنلاین: <b>${s.shop_count || 0}</b>\n\n💰 درآمد آنلاین: <b>${Number(s.shop_revenue || 0).toLocaleString("fa-IR")} تومان</b>`;
  await sendTelegramMessage(chatId, t, MANAGER_KB);
}

async function managerRevenue(chatId: string, instituteId: number) {
  const rows = await db.execute(sql`
    SELECT p.amount, p.net_amount, p.created_at, c.title, u.name AS buyer
    FROM sellable_purchases p
    JOIN sellable_courses c ON c.id = p.course_id
    LEFT JOIN users u ON u.id = p.user_id
    WHERE p.institute_id = ${instituteId} AND p.status = 'paid'
    ORDER BY p.created_at DESC LIMIT 10
  `);
  const list = ((rows as any).rows || rows) as any[];
  if (!list.length) return sendTelegramMessage(chatId, "هنوز فروشی نداشته‌اید.", MANAGER_KB);
  let t = `💰 <b>۱۰ فروش اخیر آنلاین:</b>\n\n`;
  let total = 0;
  list.forEach((p, i) => {
    total += Number(p.net_amount || 0);
    t += `${i + 1}. <b>${p.title}</b>\n👤 ${p.buyer || "—"}\n💵 ${fmtMoney(p.amount)} • خالص: ${Number(p.net_amount).toLocaleString("fa-IR")} ت\n📅 ${fmtDate(p.created_at)}\n───────────\n`;
  });
  t += `\n💎 <b>مجموع خالص ۱۰ فروش:</b> ${total.toLocaleString("fa-IR")} تومان`;
  await sendTelegramMessage(chatId, t, MANAGER_KB);
}

// ═══════════ MAIN WEBHOOK ═══════════
export async function POST(request: Request) {
  try {
    const update = await request.json();

    // Handle callback queries (inline buttons)
    if (update.callback_query) {
      const cq = update.callback_query;
      await answerCallbackQuery(cq.id);
      // (Future) handle inline actions here
      return NextResponse.json({ ok: true });
    }

    if (!update.message) return NextResponse.json({ ok: true });

    const msg = update.message;
    const chatId = String(msg.chat.id);
    const text = (msg.text || "").trim();
    const firstName = msg.chat.first_name || "کاربر";
    const username = msg.chat.username || "";

    const chat = await getOrCreateChat(chatId, firstName, username);
    const role = chat.role || "subscriber";
    const currentKb = kbFor(role);

    // /cancel — clear state
    if (text === "/cancel" || text === "لغو") {
      await setState(chatId, null);
      await sendTelegramMessage(chatId, "❌ عملیات لغو شد.", currentKb);
      return NextResponse.json({ ok: true });
    }

    // === STATE HANDLING ===
    if (chat.state === "awaiting_phone") {
      await handleLogin(chatId, text);
      return NextResponse.json({ ok: true });
    }
    if (chat.state === "awaiting_broadcast_text" && role === "admin") {
      await adminBroadcast(chatId, text);
      return NextResponse.json({ ok: true });
    }

    // === COMMANDS ===
    // Access code (6-char) for institute manager linking
    const codeCandidate = text.startsWith("/start ")
      ? text.split(" ")[1]?.trim().toUpperCase()
      : /^[A-Za-z0-9]{6}$/.test(text) ? text.toUpperCase() : null;
    if (codeCandidate) {
      const inst = await db.select({ id: institutes.id, name: institutes.name })
        .from(institutes).where(eq(institutes.accessCode, codeCandidate)).then(r => r[0]);
      if (inst) {
        await db.update(telegramChats).set({ instituteId: inst.id, role: "institute_manager" }).where(eq(telegramChats.chatId, chatId));
        await sendTelegramMessage(chatId, `✅ اتصال موفق!\n\nاین چت به <b>${inst.name}</b> متصل شد.`, MANAGER_KB);
        return NextResponse.json({ ok: true });
      }
    }

    // /start
    if (text.startsWith("/start") || text === "ℹ️ راهنما") {
      const w = `سلام ${firstName} عزیز! 👋\nبه ربات <b>سامانه زبرخان</b> خوش آمدید.\n\n🔴 <b>امکانات ربات:</b>\n• ورود با شماره موبایل و مدیریت پنل\n• مشاهده دوره‌ها، آموزشگاه‌ها، خریدها\n• دریافت اعلان‌های فوری ثبت‌نام و پرداخت\n• جستجوی هنرجو با شماره موبایل\n• برای مدیران کل: داشبورد، آمار، اعلان همگانی\n\nبرای شروع از منوی زیر استفاده کنید 👇`;
      await sendTelegramMessage(chatId, w, currentKb);
      return NextResponse.json({ ok: true });
    }

    // === LOGIN FLOW ===
    if (text === "🔐 ورود / احراز هویت") {
      await setState(chatId, "awaiting_phone");
      await sendTelegramMessage(chatId, "🔐 <b>ورود به حساب</b>\n\nشماره موبایل خود را ارسال کنید (مثال: <code>09123456789</code>).\n\nبرای لغو: /cancel", { remove_keyboard: true });
      return NextResponse.json({ ok: true });
    }

    if (text === "🚪 خروج") {
      await clearAuth(chatId);
      await sendTelegramMessage(chatId, "✅ خروج موفق. برای ورود مجدد از دکمه 🔐 استفاده کنید.", GUEST_KB);
      return NextResponse.json({ ok: true });
    }

    // === ADMIN COMMANDS ===
    if (role === "admin") {
      if (text === "📊 داشبورد مدیریتی") return adminDashboard(chatId).then(() => NextResponse.json({ ok: true }));
      if (text === "👥 مدیران") return adminManagers(chatId).then(() => NextResponse.json({ ok: true }));
      if (text === "💰 مالی و درآمد") return adminFinance(chatId).then(() => NextResponse.json({ ok: true }));
      if (text === "🔔 اعلان همگانی") return adminBroadcastPrompt(chatId).then(() => NextResponse.json({ ok: true }));
    }

    // === MANAGER COMMANDS ===
    if (role === "institute_manager" && chat.instituteId) {
      if (text === "🎓 هنرجویان آموزشگاه") return managerStudents(chatId, chat.instituteId).then(() => NextResponse.json({ ok: true }));
      if (text === "📚 دوره‌های آموزشگاه") return managerCourses(chatId, chat.instituteId).then(() => NextResponse.json({ ok: true }));
      if (text === "💼 فروش آنلاین") return managerShop(chatId, chat.instituteId).then(() => NextResponse.json({ ok: true }));
      if (text === "📈 آمار آموزشگاه") return managerStats(chatId, chat.instituteId).then(() => NextResponse.json({ ok: true }));
      if (text === "💰 درآمد") return managerRevenue(chatId, chat.instituteId).then(() => NextResponse.json({ ok: true }));
    }

    // === STUDENT COMMANDS ===
    if (role === "student" && chat.userId) {
      if (text === "🎓 دوره‌های من") return studentMyCourses(chatId, chat.userId).then(() => NextResponse.json({ ok: true }));
      if (text === "🎬 دوره‌های آنلاین من") return studentShopCourses(chatId, chat.userId).then(() => NextResponse.json({ ok: true }));
      if (text === "💰 کیف پول") return studentWallet(chatId, chat.userId).then(() => NextResponse.json({ ok: true }));
      if (text === "📄 اقساط و شهریه") return studentFees(chatId, chat.userId).then(() => NextResponse.json({ ok: true }));
      if (text === "🔔 اعلان‌ها") return studentNotifications(chatId, chat.userId).then(() => NextResponse.json({ ok: true }));
      if (text === "👤 پروفایل") return studentProfile(chatId, chat.userId).then(() => NextResponse.json({ ok: true }));
    }

    // === SHARED (all roles) ===
    if (text === "📋 گزارش آخرین ثبت‌نام‌ها" || text === "📋 ثبت‌نام‌های اخیر" || text.startsWith("/registrations")) {
      const latest = await db.execute(sql`
        SELECT r.full_name, r.phone, r.status, r.created_at, c.title AS course_title, i.name AS inst_name
        FROM registrations r
        LEFT JOIN courses c ON c.id = r.course_id
        LEFT JOIN institutes i ON i.id = r.institute_id
        ${role === "institute_manager" && chat.instituteId ? sql`WHERE r.institute_id = ${chat.instituteId}` : sql``}
        ORDER BY r.created_at DESC LIMIT 10
      `);
      const list = ((latest as any).rows || latest) as any[];
      if (!list.length) return sendTelegramMessage(chatId, "❌ ثبت‌نامی یافت نشد.", currentKb).then(() => NextResponse.json({ ok: true }));
      let t = `📋 <b>۱۰ ثبت‌نام اخیر:</b>\n\n`;
      list.forEach((r, i) => {
        const em = r.status === "approved" ? "🟢" : r.status === "rejected" ? "🔴" : "🟡";
        t += `${i + 1}. ${em} <b>${r.full_name}</b>\n📱 <code>${r.phone}</code>\n📚 ${r.course_title || "—"}\n🏢 ${r.inst_name || "—"}\n───────────\n`;
      });
      await sendTelegramMessage(chatId, t, currentKb);
      return NextResponse.json({ ok: true });
    }

    if (text === "📊 آمار کامل پلتفرم" || text === "📊 آمار پلتفرم" || text.startsWith("/stats")) {
      return adminDashboard(chatId).then(() => NextResponse.json({ ok: true }));
    }

    if (text === "🏢 لیست آموزشگاه‌ها" || text === "🏢 آموزشگاه‌ها" || text.startsWith("/institutes")) {
      const list = await db.select({
        id: institutes.id, name: institutes.name, mobile: institutes.mobile,
        phone: institutes.phone, address: institutes.address,
      }).from(institutes).where(eq(institutes.status, "approved")).limit(20);
      let t = `🏢 <b>آموزشگاه‌های زبرخان (${list.length}):</b>\n\n`;
      list.forEach((inst, i) => {
        t += `${i + 1}. <b>${inst.name}</b>\n📞 <code>${inst.mobile || inst.phone || "—"}</code>\n📍 ${inst.address || "—"}\n───────────\n`;
      });
      await sendTelegramMessage(chatId, t, currentKb);
      return NextResponse.json({ ok: true });
    }

    if (text === "📚 لیست دوره‌ها" || text === "📚 دوره‌ها" || text === "📚 مرور دوره‌ها" || text.startsWith("/courses")) {
      const list = await db.execute(sql`
        SELECT c.title, c.price, c.duration, c.start_date, i.name AS inst_name
        FROM courses c LEFT JOIN institutes i ON i.id = c.institute_id
        WHERE c.status = 'approved' ORDER BY c.created_at DESC LIMIT 15
      `);
      const rows = ((list as any).rows || list) as any[];
      let t = `📚 <b>۱۵ دوره اخیر:</b>\n\n`;
      rows.forEach((c: any, i) => {
        t += `${i + 1}. <b>${c.title}</b>\n🏢 ${c.inst_name || "—"}\n💰 ${fmtMoney(c.price)}\n📅 ${c.start_date || "—"} • ⏱ ${c.duration || "—"}\n───────────\n`;
      });
      await sendTelegramMessage(chatId, t, currentKb);
      return NextResponse.json({ ok: true });
    }

    if (text === "🎬 فروشگاه آنلاین" || text.startsWith("/shop")) {
      const list = await db.execute(sql`
        SELECT c.title, c.slug, c.price, c.discount_percent, c.rating, c.students_count, i.name AS inst_name
        FROM sellable_courses c LEFT JOIN institutes i ON i.id = c.institute_id
        WHERE c.is_published = true ORDER BY c.is_featured DESC, c.published_at DESC NULLS LAST LIMIT 10
      `);
      const rows = ((list as any).rows || list) as any[];
      if (!rows.length) return sendTelegramMessage(chatId, "هنوز دوره آنلاینی منتشر نشده.", currentKb).then(() => NextResponse.json({ ok: true }));
      let t = `🎬 <b>فروشگاه دوره‌های آنلاین:</b>\n\n`;
      rows.forEach((c: any, i) => {
        const d = c.discount_percent > 0 ? ` (${c.discount_percent}٪ تخفیف)` : "";
        t += `${i + 1}. <b>${c.title}</b>${d}\n🏢 ${c.inst_name || "—"}\n💰 ${fmtMoney(c.price)}\n⭐ ${Number(c.rating).toFixed(1)} • 👥 ${c.students_count || 0}\n▶ https://amozeshgahazadconfig.vercel.app/shop/${encodeURIComponent(c.slug)}\n───────────\n`;
      });
      await sendTelegramMessage(chatId, t, currentKb);
      return NextResponse.json({ ok: true });
    }

    // Search by phone (any role can search)
    const cleanNumber = normalizePhone(text);
    if (cleanNumber && /^09\d{9}$/.test(cleanNumber)) {
      const rows = await db.execute(sql`
        SELECT r.full_name, r.phone, r.status, c.title AS course_title, i.name AS inst_name, i.mobile AS inst_phone
        FROM registrations r
        LEFT JOIN courses c ON c.id = r.course_id
        LEFT JOIN institutes i ON i.id = r.institute_id
        WHERE r.phone = ${cleanNumber}
        ${role === "institute_manager" && chat.instituteId ? sql`AND r.institute_id = ${chat.instituteId}` : sql``}
        ORDER BY r.created_at DESC
      `);
      const list = ((rows as any).rows || rows) as any[];
      if (!list.length) {
        await sendTelegramMessage(chatId, `❌ ثبت‌نامی با شماره <code>${cleanNumber}</code> یافت نشد.`, currentKb);
        return NextResponse.json({ ok: true });
      }
      let t = `🔍 <b>نتیجه برای <code>${cleanNumber}</code>:</b>\n\n`;
      list.forEach((r, i) => {
        const em = r.status === "approved" ? "🟢" : r.status === "rejected" ? "🔴" : "🟡";
        t += `${i + 1}. ${em} <b>${r.full_name}</b>\n📚 ${r.course_title || "—"}\n🏢 ${r.inst_name || "—"}\n───────────\n`;
      });
      await sendTelegramMessage(chatId, t, currentKb);
      return NextResponse.json({ ok: true });
    }

    // Fallback
    await sendTelegramMessage(chatId,
      `❓ دستور شناخته نشد.\nاز منوی زیر انتخاب کنید یا شماره موبایل یک هنرجو رو برای جستجو ارسال کنید.`,
      currentKb
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
