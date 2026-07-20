import { NextResponse } from "next/server";

const LATEST_ANDROID_APK = "/downloads/fanixo-android-1.1.0.apk";

export async function GET(request: Request) {
  const target = new URL(LATEST_ANDROID_APK, request.url);
  const response = NextResponse.redirect(target, 307);
  response.headers.set("Cache-Control", "public, max-age=300, must-revalidate");
  return response;
}
