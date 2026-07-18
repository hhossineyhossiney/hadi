import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Providers from "@/components/Providers";
import MobileNav from "@/components/MobileNav";
import AIChatWidget from "@/components/AIChatWidget";
import PWARegistration from "@/components/PWARegistration";
import "./globals.css";

export const metadata: Metadata = {
  title: "آموزشگاه‌های آزاد مرکز فنی و حرفه‌ای شهرستان زبرخان — شماره ۱۲",
  description: "سامانه رسمی معرفی، مقایسه و ثبت‌نام آنلاین آموزشگاه‌های آزاد مرکز فنی و حرفه‌ای شهرستان زبرخان (شماره ۱۲). کامپیوتر، خیاطی، آرایشگری، آشپزی و زبان با مدرک رسمی.",
  keywords: "آموزشگاه فنی حرفه‌ای, زبرخان, مرکز شماره 12, خیاطی, آرایشگری, کامپیوتر, آشپزی, ثبت‌نام آنلاین",
  manifest: "/manifest.webmanifest",
  applicationName: "فَنی‌اکسو",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "فَنی‌اکسو",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "آموزشگاه‌های آزاد مرکز فنی و حرفه‌ای شهرستان زبرخان — شماره ۱۲",
    description: "سامانه رسمی ثبت‌نام آنلاین دوره‌های مهارتی با مدرک رسمی فنی و حرفه‌ای",
    type: "website",
    locale: "fa_IR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#071426" },
    { media: "(prefers-color-scheme: light)", color: "#F7FAFC" },
  ],
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
          <PWARegistration />
        </Providers>
      </body>
    </html>
  );
}
