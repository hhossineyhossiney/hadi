export function normalizePhone(phone: string): string {
  if (!phone) return "";

  // Convert Persian and Arabic digits to English digits
  let p = phone
    .replace(/[۰٠]/g, "0")
    .replace(/[۱١]/g, "1")
    .replace(/[۲٢]/g, "2")
    .replace(/[۳٣]/g, "3")
    .replace(/[۴٤]/g, "4")
    .replace(/[۵٥]/g, "5")
    .replace(/[۶٦]/g, "6")
    .replace(/[۷٧]/g, "7")
    .replace(/[۸٨]/g, "8")
    .replace(/[۹٩]/g, "9");

  // Remove non-digit characters
  p = p.replace(/[^\d+]/g, "");

  if (p.startsWith("+98")) {
    p = "0" + p.slice(3);
  } else if (p.startsWith("98") && p.length === 12) {
    p = "0" + p.slice(2);
  }

  return p.trim();
}
