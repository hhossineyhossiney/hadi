import { db } from "@/db";
import { institutes, courses, registrations, regions } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ADMIN_PHONES = new Set(["09159513179", "09150000000"]);

async function getAdminUser() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) return null;
  if (user.role === "admin" || ADMIN_PHONES.has(String(user.phone || ""))) return user;
  return null;
}

function unauthorized() {
  return NextResponse.json(
    { error: "دسترسی غیرمجاز؛ فقط مدیر کل می‌تواند این عملیات را انجام دهد" },
    { status: 401 }
  );
}

function slugify(text: string) {
  return (
    text
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, "") +
    "-" +
    Math.random().toString(36).substring(2, 7)
  );
}

/** GET: full list of institutes with course/student counts + revenue */
export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return unauthorized();

  const list = await db
    .select({
      id: institutes.id,
      name: institutes.name,
      slug: institutes.slug,
      address: institutes.address,
      mobile: institutes.mobile,
      phone: institutes.phone,
      description: institutes.description,
      status: institutes.status,
      isActive: institutes.isActive,
      isVerified: institutes.isVerified,
      isYearAward: institutes.isYearAward,
      accessCode: institutes.accessCode,
      licenseNumber: institutes.licenseNumber,
      managerName: institutes.managerName,
      managerTitle: institutes.managerTitle,
      features: institutes.features,
      establishedYear: institutes.establishedYear,
      regionId: institutes.regionId,
      regionName: regions.name,
      profilePhoto: institutes.profilePhoto,
    })
    .from(institutes)
    .leftJoin(regions, eq(institutes.regionId, regions.id))
    .orderBy(institutes.id);

  const result = await Promise.all(
    list.map(async (inst) => {
      const courseCount = await db
        .select({ count: count() })
        .from(courses)
        .where(eq(courses.instituteId, inst.id))
        .then((r) => r[0]?.count || 0);

      const studentCount = await db
        .select({ count: count() })
        .from(registrations)
        .where(eq(registrations.instituteId, inst.id))
        .then((r) => r[0]?.count || 0);

      return { ...inst, courseCount, studentCount };
    })
  );

  return NextResponse.json(result);
}

/** POST: create a new institute */
export async function POST(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) return unauthorized();

    const body = await request.json();
    const { name, address, mobile, phone, description, regionId } = body;

    if (!name) {
      return NextResponse.json({ error: "نام آموزشگاه الزامی است" }, { status: 400 });
    }

    const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const [newInst] = await db
      .insert(institutes)
      .values({
        name,
        slug: slugify(name),
        address: address || null,
        mobile: mobile || null,
        phone: phone || null,
        description: description || null,
        regionId: regionId || null,
        accessCode,
        status: "approved",
        isVerified: true,
        isActive: true,
      })
      .returning();

    return NextResponse.json({ ok: true, institute: newInst });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

/** PATCH: update / suspend / activate an institute */
export async function PATCH(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) return unauthorized();

    const body = await request.json();
    const { id, action, ...fields } = body;

    if (!id) return NextResponse.json({ error: "شناسه آموزشگاه الزامی است" }, { status: 400 });

    if (action === "suspend") {
      await db.update(institutes).set({ isActive: false }).where(eq(institutes.id, id));
      return NextResponse.json({ ok: true, isActive: false });
    }
    if (action === "activate") {
      await db.update(institutes).set({ isActive: true }).where(eq(institutes.id, id));
      return NextResponse.json({ ok: true, isActive: true });
    }
    if (action === "toggle_award") {
      const cur = await db.select({ v: institutes.isYearAward }).from(institutes).where(eq(institutes.id, id)).then(r => r[0]?.v || false);
      await db.update(institutes).set({ isYearAward: !cur }).where(eq(institutes.id, id));
      return NextResponse.json({ ok: true, isYearAward: !cur });
    }
    if (action === "toggle_verified") {
      const cur = await db.select({ v: institutes.isVerified }).from(institutes).where(eq(institutes.id, id)).then(r => r[0]?.v || false);
      await db.update(institutes).set({ isVerified: !cur }).where(eq(institutes.id, id));
      return NextResponse.json({ ok: true, isVerified: !cur });
    }

    // Generic field update
    await db.update(institutes).set(fields).where(eq(institutes.id, id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

/** DELETE: permanently remove an institute (and its courses/registrations) */
export async function DELETE(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) return unauthorized();

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "شناسه آموزشگاه الزامی است" }, { status: 400 });

    const target = await db
      .select({ id: institutes.id, name: institutes.name, slug: institutes.slug })
      .from(institutes)
      .where(eq(institutes.id, Number(id)))
      .then((rows) => rows[0]);
    if (!target) return NextResponse.json({ error: "آموزشگاه یافت نشد" }, { status: 404 });

    console.warn("[ADMIN_AUDIT] institute_delete", {
      instituteId: target.id,
      instituteName: target.name,
      adminId: admin.id,
      adminPhone: admin.phone,
      timestamp: new Date().toISOString(),
    });

    await db.delete(registrations).where(eq(registrations.instituteId, target.id));
    await db.delete(courses).where(eq(courses.instituteId, target.id));
    await db.delete(institutes).where(eq(institutes.id, target.id));

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
