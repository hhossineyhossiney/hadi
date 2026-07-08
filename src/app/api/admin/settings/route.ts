import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const KEYS = ["featured_institutes", "featured_courses", "recommended_institutes"] as const;

/** GET: all homepage settings */
export async function GET() {
  const rows = await db.select().from(siteSettings);
  const result: Record<string, number[]> = {
    featured_institutes: [],
    featured_courses: [],
    recommended_institutes: [],
  };
  rows.forEach((r) => {
    if (KEYS.includes(r.key as any)) result[r.key] = (r.value as number[]) || [];
  });
  return NextResponse.json(result);
}

/** POST: update a homepage setting — { key, value: number[] } */
export async function POST(request: Request) {
  try {
    const { key, value } = await request.json();
    if (!KEYS.includes(key)) {
      return NextResponse.json({ error: "کلید تنظیمات نامعتبر است" }, { status: 400 });
    }

    if (key === "recommended_institutes" && Array.isArray(value) && value.length > 2) {
      return NextResponse.json(
        { error: "حداکثر ۲ آموزشگاه قابل انتخاب برای پیشنهاد به هنرجویان است" },
        { status: 400 }
      );
    }

    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).then((r) => r[0]);
    if (existing) {
      await db.update(siteSettings).set({ value, updatedAt: new Date() }).where(eq(siteSettings.key, key));
    } else {
      await db.insert(siteSettings).values({ key, value });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
