import { db } from "@/db";
import {
  registrations,
  courses,
  institutes,
  categories,
  telegramChats,
} from "@/db/schema";
import { sendTelegramMessage } from "@/lib/telegram";
import { normalizePhone } from "@/lib/phone";
import { eq, desc, count, like, or } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const KEYBOARD = {
  keyboard: [
    [
      { text: "📋 گزارش آخرین ثبت‌نام‌ها" },
      { text: "📊 آمار کامل پلتفرم" },
    ],
    [
      { text: "🏢 لیست آموزشگاه‌ها" },
      { text: "📚 لیست دوره‌ها" },
    ],
    [
      { text: "🎓 هنرجویان آموزشگاه من" },
      { text: "ℹ️ راهنما و پشتیبانی" },
    ],
  ],
  resize_keyboard: true,
};

export async function POST(request: Request) {
  try {
    const update = await request.json();

    if (!update || !update.message) {
      return NextResponse.json({ ok: true });
    }

    const message = update.message;
    const chatId = String(message.chat.id);
    const text = (message.text || "").trim();
    const firstName = message.chat.first_name || "کاربر";
    const username = message.chat.username || "";

    // Save/update chat subscriber in database
    try {
      const existing = await db
        .select()
        .from(telegramChats)
        .where(eq(telegramChats.chatId, chatId))
        .then((res) => res[0]);

      if (!existing) {
        await db.insert(telegramChats).values({
          chatId,
          firstName,
          username,
          role: "subscriber",
        });
      }
    } catch (err) {
      console.error("Error saving telegram chat:", err);
    }

    // Institute access-code linking: "/start CODE" deep-link or plain 6-char code
    const codeCandidate = text.startsWith("/start ")
      ? text.split(" ")[1]?.trim().toUpperCase()
      : /^[A-Za-z0-9]{6}$/.test(text) ? text.toUpperCase() : null;

    if (codeCandidate) {
      const inst = await db
        .select({ id: institutes.id, name: institutes.name })
        .from(institutes)
        .where(eq(institutes.accessCode, codeCandidate))
        .then((r) => r[0]);
      if (inst) {
        await db
          .update(telegramChats)
          .set({ instituteId: inst.id, role: "institute_manager" })
          .where(eq(telegramChats.chatId, chatId));
        await sendTelegramMessage(
          chatId,
          `✅ <b>اتصال موفق!</b>\n\nاین چت به <b>${inst.name}</b> متصل شد.\nاز این پس با دکمه «🎓 هنرجویان آموزشگاه من» فقط لیست هنرجویان آموزشگاه خودتان را می‌بینید و اعلان ثبت‌نام‌های جدید آموزشگاه‌تان نیز به همین‌جا ارسال می‌شود.`,
          KEYBOARD
        );
        return NextResponse.json({ ok: true });
      }
    }

    // My institute's students (only for linked institute managers)
    if (text === "🎓 هنرجویان آموزشگاه من") {
      const chatRec = await db
        .select()
        .from(telegramChats)
        .where(eq(telegramChats.chatId, chatId))
        .then((r) => r[0]);

      if (!chatRec?.instituteId) {
        await sendTelegramMessage(
          chatId,
          `🔑 برای دسترسی به لیست هنرجویان آموزشگاه‌تان، ابتدا <b>کد اتصال ۶ رقمی</b> آموزشگاه خود را ارسال کنید.\n\nاین کد را از مدیر پلتفرم یا پنل مدیریت آموزشگاه خود (بخش «کد ربات تلگرام») دریافت نمایید.`,
          KEYBOARD
        );
        return NextResponse.json({ ok: true });
      }

      const inst = await db.select({ name: institutes.name }).from(institutes)
        .where(eq(institutes.id, chatRec.instituteId)).then((r) => r[0]);

      const myStudents = await db
        .select({
          fullName: registrations.fullName, phone: registrations.phone,
          status: registrations.status, createdAt: registrations.createdAt,
          courseTitle: courses.title,
        })
        .from(registrations)
        .leftJoin(courses, eq(registrations.courseId, courses.id))
        .where(eq(registrations.instituteId, chatRec.instituteId))
        .orderBy(desc(registrations.createdAt))
        .limit(20);

      if (myStudents.length === 0) {
        await sendTelegramMessage(chatId, `🎓 <b>${inst?.name}</b>\n\nهنوز هنرجویی در آموزشگاه شما ثبت‌نام نکرده است.`, KEYBOARD);
        return NextResponse.json({ ok: true });
      }

      let t = `🎓 <b>هنرجویان ${inst?.name}</b> (${myStudents.length} نفر اخیر):\n\n`;
      myStudents.forEach((s, i) => {
        const em = s.status === "approved" ? "🟢" : s.status === "rejected" ? "🔴" : "🟡";
        t += `${i + 1}. <b>${s.fullName}</b> ${em}\n📱 <code>${s.phone}</code> | 📚 ${s.courseTitle}\n`;
      });
      await sendTelegramMessage(chatId, t, KEYBOARD);
      return NextResponse.json({ ok: true });
    }

    // Command: /start or welcome
    if (text.startsWith("/start") || text === "ℹ️ راهنما و پشتیبانی") {
      const welcomeText = `
سلام ${firstName} عزیز! 👋
به ربات رسمی **زبرخان آموزش** خوش آمدید.

🤖 این ربات به سامانه جامع ثبت‌نام آموزشگاه‌های آزاد فنی‌وحرفه‌ای شهرستان زبرخان متصل است.

🔴 **امکانات ربات:**
• دریافت **اعلان فوری ثبت‌نام‌های جدید** سایت
• مشاهده **گزارش لحظه‌ای ثبت‌نام هنرجویان**
• استعلام و **جستجوی هنرجو با شماره موبایل**
• مشاهده **لیست دوره‌ها و آموزشگاه‌های فعال**

برای شروع از دکمه‌های زیر استفاده کنید 👇
`.trim();

      await sendTelegramMessage(chatId, welcomeText, KEYBOARD);
      return NextResponse.json({ ok: true });
    }

    // Command: 📋 گزارش آخرین ثبت‌نام‌ها or /registrations
    if (
      text === "📋 گزارش آخرین ثبت‌نام‌ها" ||
      text.startsWith("/registrations")
    ) {
      const latestRegs = await db
        .select({
          id: registrations.id,
          fullName: registrations.fullName,
          phone: registrations.phone,
          status: registrations.status,
          createdAt: registrations.createdAt,
          courseTitle: courses.title,
          instituteName: institutes.name,
        })
        .from(registrations)
        .leftJoin(courses, eq(registrations.courseId, courses.id))
        .leftJoin(institutes, eq(registrations.instituteId, institutes.id))
        .orderBy(desc(registrations.createdAt))
        .limit(10);

      if (latestRegs.length === 0) {
        await sendTelegramMessage(
          chatId,
          "❌ هنوز هیچ ثبت‌نامی در سامانه انجام نشده است.",
          KEYBOARD
        );
        return NextResponse.json({ ok: true });
      }

      let reportText = `📋 <b>گزارش ۱۰ ثبت‌نام اخیر پلتفرم:</b>\n\n`;

      latestRegs.forEach((r, idx) => {
        const statusEmoji =
          r.status === "approved" ? "🟢" : r.status === "rejected" ? "🔴" : "🟡";
        const statusTitle =
          r.status === "approved"
            ? "تأیید شده"
            : r.status === "rejected"
            ? "رد شده"
            : "در انتظار";

        reportText += `${idx + 1}. <b>${r.fullName}</b>\n`;
        reportText += `📱 همراه: <code>${r.phone}</code>\n`;
        reportText += `📚 دوره: ${r.courseTitle || "نامشخص"}\n`;
        reportText += `🏢 آموزشگاه: ${r.instituteName || "نامشخص"}\n`;
        reportText += `وضعیت: ${statusEmoji} ${statusTitle}\n`;
        reportText += `───────────────────\n`;
      });

      await sendTelegramMessage(chatId, reportText, KEYBOARD);
      return NextResponse.json({ ok: true });
    }

    // Command: 📊 آمار کامل پلتفرم or /stats
    if (text === "📊 آمار کامل پلتفرم" || text.startsWith("/stats")) {
      const [totalRegs, totalInsts, totalCourses, pendingRegs, approvedRegs] =
        await Promise.all([
          db.select({ count: count() }).from(registrations),
          db.select({ count: count() }).from(institutes),
          db.select({ count: count() }).from(courses),
          db
            .select({ count: count() })
            .from(registrations)
            .where(eq(registrations.status, "pending")),
          db
            .select({ count: count() })
            .from(registrations)
            .where(eq(registrations.status, "approved")),
        ]);

      const statsText = `
📊 <b>آمار زنده پلتفرم زبرخان آموزش:</b>

👥 **کل ثبت‌نام‌ها:** ${totalRegs[0]?.count || 0} نفر
🏢 **آموزشگاه‌های فعال:** ${totalInsts[0]?.count || 0} مرکز
📚 **دوره‌های آموزشی:** ${totalCourses[0]?.count || 0} دوره

🟡 **در انتظار بررسی:** ${pendingRegs[0]?.count || 0} درخواست
🟢 **ثبت‌نام‌های تأییدشده:** ${approvedRegs[0]?.count || 0} درخواست
`.trim();

      await sendTelegramMessage(chatId, statsText, KEYBOARD);
      return NextResponse.json({ ok: true });
    }

    // Command: 🏢 لیست آموزشگاه‌ها or /institutes
    if (text === "🏢 لیست آموزشگاه‌ها" || text.startsWith("/institutes")) {
      const instList = await db
        .select({
          id: institutes.id,
          name: institutes.name,
          mobile: institutes.mobile,
          phone: institutes.phone,
          address: institutes.address,
        })
        .from(institutes)
        .where(eq(institutes.status, "approved"))
        .limit(10);

      let textMsg = `🏢 <b>لیست آموزشگاه‌های آزاد فنی‌وحرفه‌ای زبرخان:</b>\n\n`;

      instList.forEach((inst, idx) => {
        textMsg += `${idx + 1}. <b>${inst.name}</b>\n`;
        textMsg += `📞 تماس: <code>${inst.mobile || inst.phone || "—"}</code>\n`;
        textMsg += `📍 آدرس: ${inst.address || "—"}\n`;
        textMsg += `───────────────────\n`;
      });

      await sendTelegramMessage(chatId, textMsg, KEYBOARD);
      return NextResponse.json({ ok: true });
    }

    // Command: 📚 لیست دوره‌ها or /courses
    if (text === "📚 لیست دوره‌ها" || text.startsWith("/courses")) {
      const courseList = await db
        .select({
          id: courses.id,
          title: courses.title,
          price: courses.price,
          duration: courses.duration,
          startDate: courses.startDate,
          instituteName: institutes.name,
        })
        .from(courses)
        .leftJoin(institutes, eq(courses.instituteId, institutes.id))
        .where(eq(courses.status, "approved"))
        .limit(10);

      let textMsg = `📚 <b>لیست دوره‌های مهارتی فعال:</b>\n\n`;

      courseList.forEach((c, idx) => {
        const priceFmt = c.price
          ? `${Number(c.price).toLocaleString("fa-IR")} تومان`
          : "رایگان";

        textMsg += `${idx + 1}. <b>${c.title}</b>\n`;
        textMsg += `🏢 آموزشگاه: ${c.instituteName || "نامشخص"}\n`;
        textMsg += `💰 شهریه: ${priceFmt}\n`;
        textMsg += `📅 شروع: ${c.startDate || "تعیین نشده"}\n`;
        textMsg += `⏱ مدت: ${c.duration || "—"}\n`;
        textMsg += `───────────────────\n`;
      });

      await sendTelegramMessage(chatId, textMsg, KEYBOARD);
      return NextResponse.json({ ok: true });
    }

    // Search by Phone Number (if user enters 11-digit or 10-digit number like 0912...)
    const cleanNumber = normalizePhone(text);

    if (cleanNumber && cleanNumber.length >= 10 && /^09\d{9}$/.test(cleanNumber)) {
      const searchRegs = await db
        .select({
          fullName: registrations.fullName,
          phone: registrations.phone,
          status: registrations.status,
          createdAt: registrations.createdAt,
          courseTitle: courses.title,
          schedule: courses.schedule,
          startDate: courses.startDate,
          instituteName: institutes.name,
          instituteMobile: institutes.mobile,
        })
        .from(registrations)
        .leftJoin(courses, eq(registrations.courseId, courses.id))
        .leftJoin(institutes, eq(registrations.instituteId, institutes.id))
        .where(eq(registrations.phone, cleanNumber))
        .orderBy(desc(registrations.createdAt));

      if (searchRegs.length === 0) {
        await sendTelegramMessage(
          chatId,
          `❌ هیچ ثبت‌نامی با شماره <code>${cleanNumber}</code> در سیستم یافت نشد.`,
          KEYBOARD
        );
        return NextResponse.json({ ok: true });
      }

      let textResult = `🔍 <b>نتیجه جستجو برای شماره <code>${cleanNumber}</code>:</b>\n\n`;

      searchRegs.forEach((r, idx) => {
        const statusEmoji =
          r.status === "approved" ? "🟢" : r.status === "rejected" ? "🔴" : "🟡";
        const statusTitle =
          r.status === "approved"
            ? "تأیید شده"
            : r.status === "rejected"
            ? "رد شده"
            : "در انتظار بررسی";

        textResult += `${idx + 1}. 👤 <b>${r.fullName}</b>\n`;
        textResult += `📚 دوره: <b>${r.courseTitle}</b>\n`;
        textResult += `🏢 آموزشگاه: ${r.instituteName}\n`;
        textResult += `وضعیت: ${statusEmoji} ${statusTitle}\n`;
        textResult += `📅 شروع دوره: ${r.startDate || "تعیین نشده"}\n`;
        textResult += `⏰ زمان‌بندی: ${r.schedule || "تعیین نشده"}\n`;
        textResult += `📞 تماس آموزشگاه: <code>${r.instituteMobile || "—"}</code>\n`;
        textResult += `───────────────────\n`;
      });

      await sendTelegramMessage(chatId, textResult, KEYBOARD);
      return NextResponse.json({ ok: true });
    }

    // Fallback response for arbitrary text
    await sendTelegramMessage(
      chatId,
      `دستور متوجه نشدم! می‌توانید برای جستجو شماره موبایل هنرجو (مثلاً <code>09123456789</code>) را ارسال کنید یا از منوی زیر استفاده نمایید 👇`,
      KEYBOARD
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
