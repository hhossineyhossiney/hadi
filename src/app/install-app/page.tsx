import type { Metadata } from "next";
import InstallAppClient from "./InstallAppClient";

export const metadata: Metadata = {
  title: "نصب امن اپلیکیشن فَنیکسو",
  description: "نصب مستقیم و امن فَنیکسو روی موبایل، بدون دریافت فایل APK و بدون هشدار برنامه ناشناس.",
};

export default function InstallAppPage() {
  return <InstallAppClient />;
}
