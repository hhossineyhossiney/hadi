import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { institutes, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { normalizePhone } from "@/lib/phone";

const ADMIN_PHONES = ["09159513179", "09150000000"];

/**
 * /my — Smart router. Redirects user to correct panel based on their role:
 *   - admin  → /admin
 *   - institute manager → /panel
 *   - student (default) → /dashboard
 */
export default async function MyRouterPage() {
  const s = await getServerSession(authOptions);
  const u = s?.user as any;
  if (!u?.id) redirect("/login?callbackUrl=/my");

  const phone = normalizePhone(u.phone || "");
  if (u.role === "admin" || ADMIN_PHONES.includes(phone)) {
    redirect("/admin");
  }

  // Check institute manager
  let isManager = false;
  try {
    const inst = await db.select({ id: institutes.id }).from(institutes).where(eq(institutes.userId, Number(u.id))).then((r) => r[0]);
    if (inst) isManager = true;
    else if (phone) {
      // autoheal by phone match
      const all = await db.select().from(institutes);
      const found = all.find((i: any) => {
        const ph = [normalizePhone(i.mobile || ""), normalizePhone(i.phone || "")];
        return ph.includes(phone) && (!i.userId || i.userId === Number(u.id));
      });
      if (found) {
        isManager = true;
        try {
          await db.update(institutes).set({ userId: Number(u.id) }).where(eq(institutes.id, found.id));
          if (u.role !== "institute") {
            await db.update(users).set({ role: "institute" as any }).where(eq(users.id, Number(u.id)));
          }
        } catch {}
      }
    }
  } catch {}

  if (isManager) redirect("/panel");
  redirect("/dashboard");
}
