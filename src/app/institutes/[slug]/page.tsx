import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PremiumInstitutePage from "@/components/PremiumInstitutePage";
import { pruneCourse, pruneInstitute, pruneShopCourse, pruneStory } from "@/lib/media-url";
import { ensureAdvancedInstituteProfiles, getAdvancedInstituteProfile } from "@/lib/advanced-institute-profile";
import { seedSampleReviews } from "@/lib/review-system";

export const dynamic = "force-dynamic";

function rowsOf<T = Record<string, unknown>>(result: unknown): T[] {
  const value = result as { rows?: T[] } | T[];
  return Array.isArray(value) ? value : value.rows || [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const result = await db.execute(sql`SELECT name, description, profile_photo FROM institutes WHERE slug = ${slug} LIMIT 1`);
  const institute = rowsOf<any>(result)[0];
  if (!institute) return { title: "آموزشگاه یافت نشد | فَنی‌اکسو" };
  const title = `${institute.name} | دوره‌ها، اساتید، نظرات و ثبت‌نام`;
  const description = institute.description || `پروفایل حرفه‌ای ${institute.name} شامل دوره‌ها، اساتید، امکانات، نظرات، تقویم کلاس‌ها و ثبت‌نام سریع.`;
  return {
    title,
    description,
    alternates: { canonical: `https://www.fanixo.ir/institutes/${slug}` },
    openGraph: { title, description, url: `https://www.fanixo.ir/institutes/${slug}`, images: institute.profile_photo ? [institute.profile_photo] : undefined },
  };
}

export default async function InstituteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  await Promise.all([ensureAdvancedInstituteProfiles(), seedSampleReviews()]);

  const instituteResult = await db.execute(sql`
    SELECT i.*, r.name AS region_name
    FROM institutes i
    LEFT JOIN regions r ON r.id = i.region_id
    WHERE i.slug = ${slug}
    LIMIT 1
  `);
  const rawInstitute = rowsOf<any>(instituteResult)[0];
  if (!rawInstitute) notFound();

  const institute = pruneInstitute({
    id: Number(rawInstitute.id),
    name: rawInstitute.name,
    slug: rawInstitute.slug,
    description: rawInstitute.description,
    address: rawInstitute.address,
    phone: rawInstitute.phone,
    mobile: rawInstitute.mobile,
    email: rawInstitute.email,
    website: rawInstitute.website,
    images: rawInstitute.images || [],
    logo: rawInstitute.logo,
    lat: rawInstitute.lat,
    lng: rawInstitute.lng,
    rating: rawInstitute.rating,
    reviewCount: Number(rawInstitute.review_count || 0),
    isVerified: !!rawInstitute.is_verified,
    isFeatured: !!rawInstitute.is_featured,
    isYearAward: !!rawInstitute.is_year_award,
    bannerImages: rawInstitute.banner_images || [],
    profilePhoto: rawInstitute.profile_photo,
    managerName: rawInstitute.manager_name,
    managerTitle: rawInstitute.manager_title,
    licenseNumber: rawInstitute.license_number,
    features: rawInstitute.features || [],
    establishedYear: rawInstitute.established_year,
    regionName: rawInstitute.region_name,
  });

  const profile = await getAdvancedInstituteProfile(institute.id);

  const [courseResult, onlineResult, instructorResult, sessionResult, storyResult, similarResult, statsResult] = await Promise.all([
    db.execute(sql`
      SELECT c.id, c.title, c.slug, c.description, c.full_description, c.duration,
             c.price, c.original_price, c.capacity,
             (SELECT COUNT(*)::int FROM registrations reg WHERE reg.course_id = c.id AND reg.status = 'approved') AS enrolled_count,
             c.instructor, c.start_date, c.image, c.level,
             c.registration_closed, c.registration_ended,
             cat.name AS category_name,
             ${institute.name}::text AS institute_name,
             ${institute.slug}::text AS institute_slug,
             COALESCE((SELECT ROUND(AVG(rv.rating)::numeric, 1) FROM reviews rv WHERE rv.course_id = c.id AND rv.status = 'published'), 0)::text AS rating,
             (SELECT COUNT(*)::int FROM reviews rv WHERE rv.course_id = c.id AND rv.status = 'published') AS review_count
      FROM courses c
      LEFT JOIN categories cat ON cat.id = c.category_id
      WHERE c.institute_id = ${institute.id} AND c.status = 'approved'
      ORDER BY c.created_at DESC
    `),
    db.execute(sql`
      SELECT sc.id, sc.slug, sc.title, sc.subtitle, sc.cover_image,
             sc.instructor, sc.instructor_title, sc.level, sc.price, sc.original_price,
             sc.discount_percent, sc.total_lessons, sc.total_chapters, sc.total_duration,
             (SELECT COUNT(*)::int FROM sellable_purchases sp WHERE sp.course_id = sc.id AND sp.status = 'paid') AS students_count,
             sc.rating, sc.rating_count, sc.is_featured, sc.has_certificate,
             sc.has_support, sc.lifetime_access, ${institute.name}::text AS institute_name,
             cat.name AS category_name
      FROM sellable_courses sc
      LEFT JOIN categories cat ON cat.id = sc.category_id
      WHERE sc.institute_id = ${institute.id} AND sc.is_published = true AND sc.status = 'published'
      ORDER BY sc.is_featured DESC, sc.published_at DESC NULLS LAST
    `),
    db.execute(sql`
      SELECT ins.*,
             (SELECT COUNT(*)::int FROM courses c WHERE c.institute_id = ins.institute_id AND c.instructor = ins.name) AS course_count,
             (SELECT COUNT(*)::int FROM registrations reg JOIN courses c ON c.id = reg.course_id WHERE c.institute_id = ins.institute_id AND c.instructor = ins.name AND reg.status = 'approved') AS student_count
      FROM instructors ins
      WHERE ins.institute_id = ${institute.id} AND ins.is_active = true
      ORDER BY ins.rating DESC, ins.created_at DESC
    `),
    db.execute(sql`
      SELECT cs.*, c.title AS course_title
      FROM course_sessions cs
      JOIN courses c ON c.id = cs.course_id
      WHERE c.institute_id = ${institute.id}
      ORDER BY cs.session_date NULLS LAST, cs.session_time NULLS LAST
      LIMIT 30
    `),
    db.execute(sql`
      SELECT * FROM stories
      WHERE institute_id = ${institute.id} AND is_archived = false AND expires_at > NOW()
      ORDER BY sort_order, created_at DESC
      LIMIT 10
    `),
    db.execute(sql`
      SELECT i.id, i.name, i.slug, i.rating, i.review_count, i.is_verified,
             i.logo, i.profile_photo, r.name AS region_name,
             (SELECT COUNT(*)::int FROM courses c WHERE c.institute_id = i.id AND c.status = 'approved') AS course_count
      FROM institutes i
      LEFT JOIN regions r ON r.id = i.region_id
      WHERE i.id <> ${institute.id} AND i.status = 'approved'
      ORDER BY (i.region_id = ${rawInstitute.region_id}) DESC, i.rating DESC
      LIMIT 8
    `),
    db.execute(sql`
      SELECT
        (SELECT COUNT(*)::int FROM registrations WHERE institute_id = ${institute.id} AND status = 'approved') AS students,
        (SELECT COUNT(*)::int FROM registrations WHERE institute_id = ${institute.id} AND status = 'approved' AND (progress >= 100 OR certificate_url IS NOT NULL)) AS graduates,
        (SELECT COUNT(*)::int FROM courses WHERE institute_id = ${institute.id} AND status = 'approved')
          + (SELECT COUNT(*)::int FROM sellable_courses WHERE institute_id = ${institute.id} AND is_published = true) AS courses,
        (SELECT COUNT(*)::int FROM instructors WHERE institute_id = ${institute.id} AND is_active = true) AS instructors
    `),
  ]);

  const courses = rowsOf<any>(courseResult).map((row) => pruneCourse({
    id: Number(row.id), title: row.title, slug: row.slug, description: row.description,
    fullDescription: row.full_description, duration: row.duration, price: row.price,
    originalPrice: row.original_price, capacity: Number(row.capacity || 0),
    enrolledCount: Number(row.enrolled_count || 0), instructor: row.instructor,
    startDate: row.start_date, image: row.image, level: row.level,
    registrationClosed: !!row.registration_closed, registrationEnded: !!row.registration_ended,
    categoryName: row.category_name, instituteName: row.institute_name,
    instituteSlug: row.institute_slug, rating: row.rating,
    reviewCount: Number(row.review_count || 0),
  }));
  const onlineCourses = rowsOf<any>(onlineResult).map((row) => pruneShopCourse(row));
  const instructors = rowsOf<any>(instructorResult).map((row) => ({ ...row, id: Number(row.id), course_count: Number(row.course_count || 0), student_count: Number(row.student_count || 0) }));
  const sessions = rowsOf<any>(sessionResult);
  const stories = rowsOf<any>(storyResult).map((row) => pruneStory({ id: Number(row.id), ...row }));
  const similar = rowsOf<any>(similarResult).map((row) => pruneInstitute({ id: Number(row.id), ...row }));
  const rawStats = rowsOf<any>(statsResult)[0] || {};
  const stats = {
    students: Number(rawStats.students || 0),
    graduates: Number(rawStats.graduates || 0),
    courses: Number(rawStats.courses || 0),
    instructors: Number(rawStats.instructors || 0),
  };

  return (
    <>
      <Navbar />
      <PremiumInstitutePage
        institute={institute}
        profile={profile}
        courses={courses}
        onlineCourses={onlineCourses}
        instructors={instructors}
        sessions={sessions}
        stories={stories}
        similar={similar}
        stats={stats}
      />
      <Footer />
    </>
  );
}
