import type { Metadata } from "next";
import type { ReactNode } from "react";
import Providers from "@/components/Providers";
import MobileNav from "@/components/MobileNav";
import AIChatWidget from "@/components/AIChatWidget";
import "./globals.css";

export const metadata: Metadata = {
  title: "آموزشگاه‌های آزاد مرکز فنی و حرفه‌ای شهرستان زبرخان — شماره ۱۲",
  description: "سامانه رسمی معرفی، مقایسه و ثبت‌نام آنلاین آموزشگاه‌های آزاد مرکز فنی و حرفه‌ای شهرستان زبرخان (شماره ۱۲). کامپیوتر، خیاطی، آرایشگری، آشپزی و زبان با مدرک رسمی.",
  keywords: "آموزشگاه فنی حرفه‌ای, زبرخان, مرکز شماره 12, خیاطی, آرایشگری, کامپیوتر, آشپزی, ثبت‌نام آنلاین",
  openGraph: {
    title: "آموزشگاه‌های آزاد مرکز فنی و حرفه‌ای شهرستان زبرخان — شماره ۱۲",
    description: "سامانه رسمی ثبت‌نام آنلاین دوره‌های مهارتی با مدرک رسمی فنی و حرفه‌ای",
    type: "website",
    locale: "fa_IR",
  },
};

// Inline script to prevent FOUC (Flash of Unstyled Content) when switching themes
const themeInitScript = `
  (function(){
    try {
      var t = localStorage.getItem('theme') || 'dark';
      document.documentElement.setAttribute('data-theme', t);
    } catch(e) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  })();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" data-theme="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css"
          rel="stylesheet"
          type="text/css"
        />
      </head>
      <body className="bg-bg-primary text-text-primary antialiased min-h-screen pb-16 lg:pb-0">
        <Providers>
          {children}
          <MobileNav />
          <AIChatWidget />
        </Providers>
      </body>
    </html>
  );
}
