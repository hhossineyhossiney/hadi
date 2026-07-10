import { db } from "@/db";
import { institutes, courses, registrations, categories, users } from "@/db/schema";
import { eq, desc, count, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

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

function parseOptionalNonNegativeNumber(value: unknown, fieldLabel: string) {
  if (value === undefined || value === null || value === "") return { ok: true as const, value: undefined };
  const normalized = String(value)
    .replace(/[۰٠]/g, "0")
    .replace(/[۱١]/g, "1")
    .replace(/[۲٢]/g, "2")
    .replace(/[۳٣]/g, "3")
    .replace(/[۴٤]/g, "4")
    .replace(/[۵٥]/g, "5")
    .replace(/[۶٦]/g, "6")
    .replace(/[۷٧]/g, "7")
    .replace(/[۸٨]/g, "8")
    .replace(/[۹٩]/g, "9")
    .replace(/,/g, "")
    .trim();
  if (!/^\d+$/.test(normalized)) {
    return { ok: false as const, error: `${fieldLabel} باید فقط عدد باشد` };
  }
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return { ok: false as const, error: `${fieldLabel} معتبر نیست` };
  }
  return { ok: true as const, value: parsed };
}

/** Resolve the institute owned by the logged-in manager */
async function getManagerInstitute() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) return { error: "ابتدا وارد حساب مدیر آموزشگاه شوید", status: 401 as const };

  // 1) Primary: find institute directly linked to this user
  let inst = await db
    .select()
    .from(institutes)
    .where(eq(institutes.userId, Number(user.id)))
    .then((r) => r[0]);

  // 2) AUTOHEAL: If no linked institute, try to auto-link by matching mobile
  if (!inst && user.phone) {
    const { normalizePhone } = await import("@/lib/phone");
    const cleanUserPhone = normalizePhone(String(user.phone));

    // Find institutes whose mobile matches (any normalization)
    const allInstitutes = await db.select().from(institutes);
    const candidates = allInstitutes.filter((i) => {
      const candidatePhones = [
        i.mobile ? normalizePhone(String(i.mobile)) : null,
        i.phone ? normalizePhone(String(i.phone)) : null,
      ].filter(Boolean);
      // Match on any phone field
      if (candidatePhones.includes(cleanUserPhone)) {
        // Only link if not already linked to someone else
        return !i.userId || i.userId === Number(user.id);
      }
      return false;
    });

    if (candidates.length >= 1) {
      // Prefer institute with NULL userId, otherwise first match
      const target = candidates.find((c) => !c.userId) || candidates[0];
      const [linked] = await db
        .update(institutes)
        .set({ userId: Number(user.id) })
        .where(eq(institutes.id, target.id))
        .returning();
      inst = linked;

      // Also promote user role to "institute" if not already
      if (user.role !== "institute") {
        try {
          await db
            .update(users)
            .set({ role: "institute" as any })
            .where(eq(users.id, Number(user.id)));
        } catch (e) {
          console.error("Failed to promote user role:", e);
        }
      }
    }
  }

  if (!inst) return { error: "هیچ آموزشگاهی به حساب شما متصل نیست", status: 403 as const };
  return { inst };
}

/** GET: full manager dashboard — institute, courses, students, analytics */
export async function GET() {
  const res = await getManagerInstitute();
  if ("error" in res) return NextResponse.json({ error: res.error }, { status: res.status });
  const inst = res.inst;

  const courseListRaw = await db
    .select({
      id: courses.id, title: courses.title, slug: courses.slug,
      description: courses.description, fullDescription: courses.fullDescription,
      duration: courses.duration,
      price: courses.price, originalPrice: courses.originalPrice,
      capacity: courses.capacity,
      enrolledCount: courses.enrolledCount, instructor: courses.instructor,
      instructorTitle: courses.instructorTitle,
      schedule: courses.schedule, startDate: courses.startDate,
      level: courses.level, totalSessions: courses.totalSessions,
      syllabus: courses.syllabus,
      requirements: courses.requirements,
      image: courses.image,
      categoryName: categories.name, categoryId: courses.categoryId,
      bannerImages: courses.bannerImages,
      registrationClosed: courses.registrationClosed,
      registrationEnded: courses.registrationEnded,
    })
    .from(courses)
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .where(eq(courses.instituteId, inst.id));

  const courseList = courseListRaw.map((c) => ({ ...c, bannerImages: (c.bannerImages as string[]) || [] }));

  const allCategories = await db.select({ id: categories.id, name: categories.name }).from(categories);

  const students = await db
    .select({
      id: registrations.id, fullName: registrations.fullName,
      phone: registrations.phone, status: registrations.status,
      notes: registrations.notes, createdAt: registrations.createdAt,
      courseTitle: courses.title, courseId: registrations.courseId,
      certificateUrl: registrations.certificateUrl,
    })
    .from(registrations)
    .leftJoin(courses, eq(registrations.courseId, courses.id))
    .where(eq(registrations.instituteId, inst.id))
    .orderBy(desc(registrations.createdAt));

  const pendingCount = students.filter((s) => s.status === "pending").length;
  const approvedCount = students.filter((s) => s.status === "approved").length;
  const revenue = students
    .filter((s) => s.status === "approved")
    .reduce((sum, s) => {
      const c = courseList.find((cc) => cc.title === s.courseTitle);
      return sum + (c?.price ? Number(c.price) : 0);
    }, 0);

  return NextResponse.json({
    institute: {
      id: inst.id, name: inst.name, slug: inst.slug, description: inst.description,
      address: inst.address, phone: inst.phone, mobile: inst.mobile,
      rating: inst.rating, accessCode: inst.accessCode,
      images: (inst.images as string[]) || [],
      bannerImages: (inst.bannerImages as string[]) || [],
      profilePhoto: inst.profilePhoto || null,
      managerName: inst.managerName || null,
      managerTitle: inst.managerTitle || null,
      licenseNumber: inst.licenseNumber || null,
      establishedYear: inst.establishedYear || null,
      features: (inst.features as string[]) || [],
      isYearAward: inst.isYearAward || false,
      isVerified: inst.isVerified || false,
      regionId: inst.regionId || null,
    },
    courses: courseList,
    categories: allCategories,
    students,
    stats: {
      totalStudents: students.length,
      pendingCount,
      approvedCount,
      totalCourses: courseList.length,
      estimatedRevenue: revenue,
    },
  });
}

/**
 * POST: manager actions —
 * createCourse | updateCourse | deleteCourse | updateStatus |
 * addImage | deleteImage | addBanner | deleteBanner |
 * uploadCertificate | updateProfile
 */
export async function POST(request: Request) {
  const res = await getManagerInstitute();
  if ("error" in res) return NextResponse.json({ error: res.error }, { status: res.status });
  const inst = res.inst;

  try {
    const body = await request.json();
    const { action } = body;

    if (action === "createCourse") {
      const { title, description, fullDescription, price, originalPrice, capacity, duration, schedule, startDate, instructor, instructorTitle, level, totalSessions, syllabus, categoryId, requirements } = body;
      if (!title || !String(title).trim()) {
        return NextResponse.json({ error: "عنوان دوره الزامی است" }, { status: 400 });
      }
      const categoryNumber = Number(categoryId);
      if (!categoryId || !Number.isFinite(categoryNumber) || categoryNumber <= 0) {
        return NextResponse.json({ error: "انتخاب رشته معتبر الزامی است" }, { status: 400 });
      }
      const parsedPrice = parseOptionalNonNegativeNumber(price, "شهریه");
      if (!parsedPrice.ok) return NextResponse.json({ error: parsedPrice.error }, { status: 400 });
      const parsedCapacity = parseOptionalNonNegativeNumber(capacity, "ظرفیت" );
      if (!parsedCapacity.ok) return NextResponse.json({ error: parsedCapacity.error }, { status: 400 });

      const parsedOrig = parseOptionalNonNegativeNumber(originalPrice, "قیمت اصلی");
      if (!parsedOrig.ok) return NextResponse.json({ error: parsedOrig.error }, { status: 400 });
      const parsedSessions = parseOptionalNonNegativeNumber(totalSessions, "تعداد جلسات");
      if (!parsedSessions.ok) return NextResponse.json({ error: parsedSessions.error }, { status: 400 });

      const [newCourse] = await db.insert(courses).values({
        instituteId: inst.id,
        categoryId: categoryNumber,
        title: String(title).trim(),
        slug: slugify(String(title)),
        description: description || null,
        fullDescription: fullDescription || description || null,
        price: parsedPrice.value !== undefined ? String(parsedPrice.value) : "0",
        originalPrice: parsedOrig.value !== undefined ? String(parsedOrig.value) : null,
        capacity: parsedCapacity.value !== undefined ? parsedCapacity.value : 0,
        duration: duration || null,
        schedule: schedule || null,
        startDate: startDate || null,
        instructor: instructor || null,
        instructorTitle: instructorTitle || null,
        level: level || null,
        totalSessions: parsedSessions.value !== undefined ? parsedSessions.value : 0,
        syllabus: Array.isArray(syllabus) ? syllabus.filter((x: unknown) => typeof x === "string" && (x as string).trim()) : [],
        requirements: requirements || null,
        status: "approved",
      }).returning();
      return NextResponse.json({ ok: true, course: newCourse });
    }

    if (action === "updateCourse") {
      const { courseId, title, description, fullDescription, price, originalPrice, capacity, duration, schedule, startDate, instructor, instructorTitle, level, totalSessions, syllabus, categoryId, requirements } = body;
      const c = await db.select().from(courses)
        .where(and(eq(courses.id, courseId), eq(courses.instituteId, inst.id)))
        .then((r) => r[0]);
      if (!c) return NextResponse.json({ error: "دوره متعلق به آموزشگاه شما نیست" }, { status: 403 });

      const parsedPrice = parseOptionalNonNegativeNumber(price, "شهریه");
      if (!parsedPrice.ok) return NextResponse.json({ error: parsedPrice.error }, { status: 400 });
      const parsedCapacity = parseOptionalNonNegativeNumber(capacity, "ظرفیت");
      if (!parsedCapacity.ok) return NextResponse.json({ error: parsedCapacity.error }, { status: 400 });
      const categoryNumber = categoryId != null && categoryId !== "" ? Number(categoryId) : undefined;
      if (categoryNumber !== undefined && (!Number.isFinite(categoryNumber) || categoryNumber <= 0)) {
        return NextResponse.json({ error: "رشته انتخاب‌شده معتبر نیست" }, { status: 400 });
      }

      const parsedOrig2 = parseOptionalNonNegativeNumber(originalPrice, "قیمت اصلی");
      if (!parsedOrig2.ok) return NextResponse.json({ error: parsedOrig2.error }, { status: 400 });
      const parsedSess2 = parseOptionalNonNegativeNumber(totalSessions, "تعداد جلسات");
      if (!parsedSess2.ok) return NextResponse.json({ error: parsedSess2.error }, { status: 400 });

      const [updated] = await db.update(courses).set({
        title: title ?? c.title,
        description: description ?? c.description,
        fullDescription: fullDescription ?? c.fullDescription,
        price: parsedPrice.value !== undefined ? String(parsedPrice.value) : c.price,
        originalPrice: parsedOrig2.value !== undefined ? String(parsedOrig2.value) : c.originalPrice,
        capacity: parsedCapacity.value !== undefined ? parsedCapacity.value : c.capacity,
        duration: duration ?? c.duration,
        schedule: schedule ?? c.schedule,
        startDate: startDate ?? c.startDate,
        instructor: instructor ?? c.instructor,
        instructorTitle: instructorTitle ?? c.instructorTitle,
        level: level ?? c.level,
        totalSessions: parsedSess2.value !== undefined ? parsedSess2.value : c.totalSessions,
        syllabus: Array.isArray(syllabus) ? syllabus.filter((x: unknown) => typeof x === "string" && (x as string).trim()) : c.syllabus,
        requirements: requirements ?? c.requirements,
        categoryId: categoryNumber !== undefined ? categoryNumber : c.categoryId,
      }).where(eq(courses.id, courseId)).returning();
      return NextResponse.json({ ok: true, course: updated });
    }

    if (action === "deleteCourse") {
      const { courseId } = body;
      const c = await db.select().from(courses)
        .where(and(eq(courses.id, courseId), eq(courses.instituteId, inst.id)))
        .then((r) => r[0]);
      if (!c) return NextResponse.json({ error: "دوره متعلق به آموزشگاه شما نیست" }, { status: 403 });
      await db.delete(registrations).where(eq(registrations.courseId, courseId));
      await db.delete(courses).where(eq(courses.id, courseId));
      return NextResponse.json({ ok: true });
    }

    // Toggle registration open/closed (manual manager control)
    if (action === "toggleCourseRegistration") {
      const { courseId, closed } = body;
      const c = await db.select().from(courses)
        .where(and(eq(courses.id, courseId), eq(courses.instituteId, inst.id)))
        .then((r) => r[0]);
      if (!c) return NextResponse.json({ error: "دوره متعلق به آموزشگاه شما نیست" }, { status: 403 });
      await db.update(courses).set({ registrationClosed: !!closed }).where(eq(courses.id, courseId));
      return NextResponse.json({ ok: true, registrationClosed: !!closed });
    }

    // Toggle "registration period ended" (زمان ثبت‌نام تمام شده)
    if (action === "toggleCourseRegistrationEnded") {
      const { courseId, ended } = body;
      const c = await db.select().from(courses)
        .where(and(eq(courses.id, courseId), eq(courses.instituteId, inst.id)))
        .then((r) => r[0]);
      if (!c) return NextResponse.json({ error: "دوره متعلق به آموزشگاه شما نیست" }, { status: 403 });
      await db.update(courses).set({ registrationEnded: !!ended }).where(eq(courses.id, courseId));
      return NextResponse.json({ ok: true, registrationEnded: !!ended });
    }

    // Update capacity
    if (action === "updateCapacity") {
      const { courseId, capacity } = body;
      const capNum = parseInt(String(capacity), 10);
      if (isNaN(capNum) || capNum < 0) {
        return NextResponse.json({ error: "ظرفیت نامعتبر است" }, { status: 400 });
      }
      const c = await db.select().from(courses)
        .where(and(eq(courses.id, courseId), eq(courses.instituteId, inst.id)))
        .then((r) => r[0]);
      if (!c) return NextResponse.json({ error: "دوره متعلق به آموزشگاه شما نیست" }, { status: 403 });
      await db.update(courses).set({ capacity: capNum }).where(eq(courses.id, courseId));
      return NextResponse.json({ ok: true, capacity: capNum });
    }

    if (action === "addCourseBanner") {
      const { courseId, image } = body;
      if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
        return NextResponse.json({ error: "تصویر بنر نامعتبر است" }, { status: 400 });
      }
      if (image.length > 1_200_000) {
        return NextResponse.json({ error: "حجم تصویر بنر باید کمتر از ۸۰۰ کیلوبایت باشد" }, { status: 400 });
      }
      const c = await db.select().from(courses)
        .where(and(eq(courses.id, courseId), eq(courses.instituteId, inst.id)))
        .then((r) => r[0]);
      if (!c) return NextResponse.json({ error: "دوره متعلق به آموزشگاه شما نیست" }, { status: 403 });
      const current = ((c.bannerImages as string[]) || []).slice(0, 4);
      const updated = [...current, image];
      await db.update(courses).set({ bannerImages: updated }).where(eq(courses.id, courseId));
      return NextResponse.json({ ok: true, count: updated.length });
    }

    if (action === "deleteCourseBanner") {
      const { courseId, index } = body;
      const c = await db.select().from(courses)
        .where(and(eq(courses.id, courseId), eq(courses.instituteId, inst.id)))
        .then((r) => r[0]);
      if (!c) return NextResponse.json({ error: "دوره متعلق به آموزشگاه شما نیست" }, { status: 403 });
      const current = (c.bannerImages as string[]) || [];
      const updated = current.filter((_, i) => i !== index);
      await db.update(courses).set({ bannerImages: updated }).where(eq(courses.id, courseId));
      return NextResponse.json({ ok: true, count: updated.length });
    }

    if (action === "updateStatus") {
      const { registrationId, status } = body;
      const reg = await db.select().from(registrations)
        .where(and(eq(registrations.id, registrationId), eq(registrations.instituteId, inst.id)))
        .then((r) => r[0]);
      if (!reg) return NextResponse.json({ error: "ثبت‌نام متعلق به آموزشگاه شما نیست" }, { status: 403 });
      const [updated] = await db.update(registrations).set({ status })
        .where(eq(registrations.id, registrationId)).returning();
      return NextResponse.json({ ok: true, registration: updated });
    }

    if (action === "uploadCertificate") {
      const { registrationId, certificateUrl } = body;
      if (!certificateUrl || typeof certificateUrl !== "string" || !certificateUrl.startsWith("data:image/")) {
        return NextResponse.json({ error: "فایل گواهینامه نامعتبر است" }, { status: 400 });
      }
      if (certificateUrl.length > 1_200_000) {
        return NextResponse.json({ error: "حجم فایل باید کمتر از ۸۰۰ کیلوبایت باشد" }, { status: 400 });
      }
      const reg = await db.select().from(registrations)
        .where(and(eq(registrations.id, registrationId), eq(registrations.instituteId, inst.id)))
        .then((r) => r[0]);
      if (!reg) return NextResponse.json({ error: "ثبت‌نام متعلق به آموزشگاه شما نیست" }, { status: 403 });
      const [updated] = await db.update(registrations).set({ certificateUrl })
        .where(eq(registrations.id, registrationId)).returning();
      return NextResponse.json({ ok: true, registration: updated });
    }

    if (action === "addImage") {
      const { image } = body; // base64 data URL
      if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
        return NextResponse.json({ error: "تصویر نامعتبر است" }, { status: 400 });
      }
      if (image.length > 700_000) {
        return NextResponse.json({ error: "حجم تصویر باید کمتر از ۵۰۰ کیلوبایت باشد" }, { status: 400 });
      }
      const current = ((inst.images as string[]) || []).slice(0, 11);
      const updated = [...current, image];
      await db.update(institutes).set({ images: updated }).where(eq(institutes.id, inst.id));
      return NextResponse.json({ ok: true, count: updated.length });
    }

    if (action === "deleteImage") {
      const { index } = body;
      const current = (inst.images as string[]) || [];
      const updated = current.filter((_, i) => i !== index);
      await db.update(institutes).set({ images: updated }).where(eq(institutes.id, inst.id));
      return NextResponse.json({ ok: true, count: updated.length });
    }

    if (action === "addBanner") {
      const { image } = body;
      if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
        return NextResponse.json({ error: "تصویر بنر نامعتبر است" }, { status: 400 });
      }
      if (image.length > 1_200_000) {
        return NextResponse.json({ error: "حجم تصویر بنر باید کمتر از ۸۰۰ کیلوبایت باشد" }, { status: 400 });
      }
      const current = ((inst.bannerImages as string[]) || []).slice(0, 7);
      const updated = [...current, image];
      await db.update(institutes).set({ bannerImages: updated }).where(eq(institutes.id, inst.id));
      return NextResponse.json({ ok: true, count: updated.length });
    }

    if (action === "deleteBanner") {
      const { index } = body;
      const current = (inst.bannerImages as string[]) || [];
      const updated = current.filter((_, i) => i !== index);
      await db.update(institutes).set({ bannerImages: updated }).where(eq(institutes.id, inst.id));
      return NextResponse.json({ ok: true, count: updated.length });
    }

    if (action === "updateProfile") {
      const { description, address, mobile, phone, managerName, managerTitle, licenseNumber, establishedYear, features } = body;
      const featuresArr = Array.isArray(features)
        ? features.filter((x: unknown) => typeof x === "string" && (x as string).trim())
        : undefined;
      await db.update(institutes).set({
        description: description ?? inst.description,
        address: address ?? inst.address,
        mobile: mobile ?? inst.mobile,
        phone: phone ?? inst.phone,
        managerName: managerName ?? inst.managerName,
        managerTitle: managerTitle ?? inst.managerTitle,
        licenseNumber: licenseNumber ?? inst.licenseNumber,
        establishedYear: establishedYear ?? inst.establishedYear,
        features: featuresArr !== undefined ? featuresArr : inst.features,
      }).where(eq(institutes.id, inst.id));
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "action نامعتبر" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
