/**
 * Convert Base64 data URL fields to lightweight API URLs to reduce HTML payload.
 * Server-side helper used by page.tsx and API endpoints that return data to the client.
 */

type ImgFieldMap = {
  logo?: any;
  profilePhoto?: any;
  bannerImages?: any;
  image?: any;
  coverImage?: any;
  cover_image?: any;
  images?: any;
  avatar?: any;
  mediaUrl?: any;
  media_url?: any;
};

const isBase64 = (v: any) =>
  typeof v === "string" && v.startsWith("data:image/") && v.length > 200;

/** Replace a data URL with an API endpoint URL (with server-side rendering hydration) */
export function toApiUrl(entityType: "institute" | "course" | "shop_course" | "chapter" | "lesson" | "story" | "user", id: number, field: string, index?: number) {
  const q = index !== undefined ? `&i=${index}` : "";
  return `/api/media/${entityType}/${id}?field=${field}${q}`;
}

export function pruneInstitute<T extends ImgFieldMap & { id: number }>(inst: T): T {
  const out: any = { ...inst };
  if (isBase64(inst.logo)) out.logo = toApiUrl("institute", inst.id, "logo");
  if (isBase64(inst.profilePhoto)) out.profilePhoto = toApiUrl("institute", inst.id, "profilePhoto");
  if (Array.isArray(inst.bannerImages)) {
    out.bannerImages = inst.bannerImages.map((v: any, i: number) =>
      isBase64(v) ? toApiUrl("institute", inst.id, "banner", i) : v
    );
  }
  if (Array.isArray(inst.images)) {
    out.images = inst.images.map((v: any, i: number) =>
      isBase64(v) ? toApiUrl("institute", inst.id, "images", i) : v
    );
  }
  return out as T;
}

export function pruneCourse<T extends ImgFieldMap & { id: number }>(c: T): T {
  const out: any = { ...c };
  if (isBase64(c.image)) out.image = toApiUrl("course", c.id, "cover");
  if (Array.isArray(c.bannerImages)) {
    out.bannerImages = c.bannerImages.map((v: any, i: number) =>
      isBase64(v) ? toApiUrl("course", c.id, "banner", i) : v
    );
  }
  return out as T;
}

export function pruneShopCourse<T extends { id: number; coverImage?: any; cover_image?: any }>(c: T): T {
  const out: any = { ...c };
  if (isBase64((c as any).coverImage)) out.coverImage = toApiUrl("shop_course", c.id, "cover");
  if (isBase64((c as any).cover_image)) out.cover_image = toApiUrl("shop_course", c.id, "cover");
  return out as T;
}

export function pruneStory<T extends { id: number; mediaUrl?: any; media_url?: any }>(s: T): T {
  const out: any = { ...s };
  if (isBase64((s as any).mediaUrl)) out.mediaUrl = toApiUrl("story", s.id, "media");
  if (isBase64((s as any).media_url)) out.media_url = toApiUrl("story", s.id, "media");
  return out as T;
}
