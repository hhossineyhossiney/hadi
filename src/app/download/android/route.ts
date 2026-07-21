import { NextResponse } from "next/server";

const SAFE_INSTALL_PAGE = "/install-app";
const LATEST_ANDROID_APK = "/downloads/fanixo-android-1.3.0.apk";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const manualDownload = requestUrl.searchParams.get("manual") === "1";
  const target = new URL(manualDownload ? LATEST_ANDROID_APK : SAFE_INSTALL_PAGE, request.url);
  const response = NextResponse.redirect(target, 307);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
