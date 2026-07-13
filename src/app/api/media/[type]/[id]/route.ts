import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/media/institute/1?field=logo|profilePhoto|banner_0|banner_1
// GET /api/media/course/1?field=cover_image
// GET /api/media/shop_course/1?field=cover_image
// GET /api/media/chapter/1?field=cover_image
// GET /api/media/lesson/1?field=cover_image
// GET /api/media/story/1?field=media_url

function parseDataUrl(dataUrl: string): { mime: string; buffer: Buffer } | null {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return { mime: match[1], buffer: Buffer.from(match[2], "base64") };
}

const MAP: Record<string, { table: string; fields: Record<string, string> }> = {
  institute: {
    table: "institutes",
    fields: { logo: "logo", profilePhoto: "profile_photo", banner: "banner_images", images: "images" },
  },
  course: {
    table: "courses",
    fields: { cover: "cover_image", banner: "banner_images" },
  },
  shop_course: {
    table: "sellable_courses",
    fields: { cover: "cover_image", trailer: "trailer_video", instructor: "instructor_avatar" },
  },
  chapter: {
    table: "sellable_chapters",
    fields: { cover: "cover_image" },
  },
  lesson: {
    table: "sellable_lessons",
    fields: { cover: "cover_image" },
  },
  story: {
    table: "stories",
    fields: { media: "media_url" },
  },
  user: {
    table: "users",
    fields: { avatar: "avatar" },
  },
};

export async function GET(_req: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params;
  const url = new URL(_req.url);
  const field = url.searchParams.get("field") || "cover";
  const index = url.searchParams.get("i");

  const conf = MAP[type];
  if (!conf) return new NextResponse("Not found", { status: 404 });
  const column = conf.fields[field];
  if (!column) return new NextResponse("Field not allowed", { status: 400 });

  try {
    const rows = await db.execute(sql.raw(`SELECT "${column}" AS val FROM "${conf.table}" WHERE id = ${Number(id)} LIMIT 1`));
    const row = (((rows as any).rows) || rows)[0];
    if (!row || !row.val) return new NextResponse("Not found", { status: 404 });

    // Multi-image field (banner_images = jsonb array)
    let value = row.val;
    if (typeof value === "string" && value.startsWith("[")) {
      try { value = JSON.parse(value); } catch {}
    }
    if (Array.isArray(value)) {
      const i = Math.min(Math.max(Number(index || 0), 0), value.length - 1);
      value = value[i];
    }
    if (typeof value !== "string") return new NextResponse("Not found", { status: 404 });

    // If plain URL, redirect
    if (value.startsWith("http")) {
      return NextResponse.redirect(value);
    }
    // If data URL, decode and serve as image
    const parsed = parseDataUrl(value);
    if (!parsed) return new NextResponse("Invalid data", { status: 400 });

    return new NextResponse(parsed.buffer as any, {
      status: 200,
      headers: {
        "Content-Type": parsed.mime,
        "Content-Length": String(parsed.buffer.length),
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      },
    });
  } catch (e: any) {
    return new NextResponse(e?.message || "err", { status: 500 });
  }
}
