export const BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN ||
  "8961723308:AAEMOiqT_D8GZ2U2EYQQfkbtk-rufunkXU0";

// Default admin chat ID (مهندس سید حمیدحسینی — @ostad_amoozesh)
const DEFAULT_ADMIN_CHAT_ID = "276686425";

export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  replyMarkup?: any
) {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        reply_markup: replyMarkup,
        disable_web_page_preview: true,
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Telegram sendMessage error:", error);
    return null;
  }
}

export async function editTelegramMessage(
  chatId: string | number,
  messageId: number,
  text: string,
  replyMarkup?: any
) {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: "HTML",
        reply_markup: replyMarkup,
        disable_web_page_preview: true,
      }),
    });
    return await response.json();
  } catch {
    return null;
  }
}

export async function answerCallbackQuery(callbackId: string, text?: string, showAlert = false) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: callbackId, text, show_alert: showAlert }),
    });
  } catch {}
}

// Notify a specific user via telegram (if they've linked their account)
export async function notifyUserByTelegram(userId: number, message: string, replyMarkup?: any) {
  try {
    const { db } = await import("@/db");
    const { telegramChats } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");
    const chats = await db.select().from(telegramChats).where(eq(telegramChats.userId, userId));
    for (const c of chats) {
      await sendTelegramMessage(c.chatId, message, replyMarkup);
    }
  } catch (e) {
    console.error("notifyUserByTelegram error:", e);
  }
}

export interface NewRegistrationNotification {
  fullName: string;
  phone: string;
  email?: string | null;
  courseTitle: string;
  instituteName: string;
  institutePhone?: string | null;
  instituteMobile?: string | null;
  startDate?: string | null;
  schedule?: string | null;
  notes?: string | null;
  price?: string | null;
}

export async function notifyNewRegistration(
  reg: NewRegistrationNotification,
  chatIds?: (string | number)[]
) {
  const priceFormatted = reg.price
    ? `${Number(reg.price).toLocaleString("fa-IR")} تومان`
    : "رایگان";

  const message = `
🎯 <b>ثبت‌نام جدید در زبرخان آموزش!</b>

👤 <b>نام هنرجو:</b> ${reg.fullName}
📱 <b>شماره همراه:</b> <code>${reg.phone}</code>
📧 <b>ایمیل:</b> ${reg.email || "ثبت نشده"}

📚 <b>دوره آموزشی:</b> ${reg.courseTitle}
🏢 <b>آموزشگاه:</b> ${reg.instituteName}
💰 <b>شهریه:</b> ${priceFormatted}
📅 <b>تاریخ شروع:</b> ${reg.startDate || "تعیین نشده"}
⏰ <b>زمان‌بندی:</b> ${reg.schedule || "تعیین نشده"}

📞 <b>تماس آموزشگاه:</b> <code>${reg.instituteMobile || reg.institutePhone || "—"}</code>
📝 <b>توضیحات هنرجو:</b> ${reg.notes || "بدون توضیح"}

⏰ <b>زمان ثبت:</b> ${new Date().toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}
`.trim();

  // Send to provided chat IDs or default Telegram admin chat ID if set
  const targets = new Set<string | number>();

  // Always include the platform admin chat ID
  targets.add(process.env.TELEGRAM_ADMIN_CHAT_ID || DEFAULT_ADMIN_CHAT_ID);

  if (chatIds && chatIds.length > 0) {
    chatIds.forEach((id) => targets.add(id));
  }

  // Also send to global store/admin chats if passed
  for (const chatId of targets) {
    await sendTelegramMessage(chatId, message);
  }
}
