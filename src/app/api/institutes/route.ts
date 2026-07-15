import { db } from "@/db";
import { institutes, regions, courses } from "@/db/schema";
import { sql, eq, count, and, like } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");
  const q = searchParams.get("q");
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");

  const conditions = [];

  if (region) {
    conditions.push(eq(regions.slug, region));
  }
  if (q) {
    conditions.push(
      sql`${institutes.name} ILIKE ${"%" + q + "%"}`
    );
  }
  if (featured === "true") {
    conditions.push(eq(institutes.isFeatured, true));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const data = await db
    .select({
      id: institutes.id,
      name: institutes.name,
      slug: institutes.slug,
      address: institutes.address,
      description: institutes.description,
      phone: institutes.phone,
      mobile: institutes.mobile,
      rating: institutes.rating,
      reviewCount: institutes.reviewCount,
      isVerified: institutes.isVerified,
      regionName: regions.name,
      logo: institutes.logo,
      profilePhoto: institutes.profilePhoto,
      bannerImages: institutes.bannerImages,
      licenseNumber: institutes.licenseNumber,
      managerName: institutes.managerName,
      managerTitle: institutes.managerTitle,
      features: institutes.features,
      isYearAward: institutes.isYearAward,
    })
    .from(institutes)
    .leftJoin(regions, eq(institutes.regionId, regions.id))
    .where(whereClause)
    .orderBy(sql`${institutes.rating} DESC`);

  const result = await Promise.all(
    data.map(async (inst) => {
      const courseCount = await db
        .select({ count: count() })
        .from(courses)
        .where(eq(courses.instituteId, inst.id))
        .then((res) => res[0]?.count || 0);
      return { ...inst, courseCount };
    })
  );

  return NextResponse.json(result);
}
