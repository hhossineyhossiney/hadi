import { db } from "@/db";
import { institutes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX_PHOTO_SIZE = 900_000; // ~600KB decoded
const ALLOWED_TYPES = ["data:image/jpeg", "data:image/jpg", "data:image/png", "data:image/webp"];

async function getManagerInstitute() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) return { error: "ابتدا وارد حساب مدیر آموزشگاه شوید", status: 401 as const };

  const inst = await db
    .select()
    .from(institutes)
    .where(eq(institutes.userId, Number(user.id)))
    .then((r) => r[0]);

  if (!inst) return { error: "هیچ آموزشگاهی به حساب شما متصل نیست", status: 403 as const };
  return { inst };
}

/** POST: upload/replace profile photo (base64 data URL, already cropped client-side) */
export async function POST(request: Request) {
  const res = await getManagerInstitute();
  if ("error" in res) return NextResponse.json({ error: res.error }, { status: res.status });

  try {
    const { image } = await request.json();

    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "تصویر ارسال نشده است" }, { status: 400 });
    }
    const isAllowedType = ALLOWED_TYPES.some((t) => image.startsWith(t));
    if (!isAllowedType) {
      return NextResponse.json(
        { error: "فرمت فایل مجاز نیست. فقط JPG، PNG و WEBP پذیرفته می‌شود" },
        { status: 400 }
      );
    }
    if (image.length > MAX_PHOTO_SIZE) {
      return NextResponse.json({ error: "حجم تصویر باید کمتر از ۶۰۰ کیلوبایت باشد" }, { status: 400 });
    }

    await db.update(institutes).set({ profilePhoto: image }).where(eq(institutes.id, res.inst.id));
    return NextResponse.json({ ok: true, profilePhoto: image });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

/** DELETE: remove profile photo */
export async function DELETE() {
  const res = await getManagerInstitute();
  if ("error" in res) return NextResponse.json({ error: res.error }, { status: res.status });

  await db.update(institutes).set({ profilePhoto: null }).where(eq(institutes.id, res.inst.id));
  return NextResponse.json({ ok: true });
}
