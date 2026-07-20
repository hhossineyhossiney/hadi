import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import TrustBar from "@/components/TrustBar";
import ProblemSolution from "@/components/ProblemSolution";
import ManagerPlatformGuide from "@/components/ManagerPlatformGuide";
import AITechSection from "@/components/AITechSection";
import PremiumCTA from "@/components/PremiumCTA";
import FaqSection from "@/components/FaqSection";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "برای مدیران آموزشگاه‌ها | راهنمای کامل سامانه هوشمند فَنیکسو",
  description:
    "راهنمای حرفه‌ای و جزئی‌به‌جز ۲۳ بخش پنل مدیر آموزشگاه: ویرایش کامل دوره حضوری و آنلاین، مدیریت نظرات و خریدها، هنرجو، اقساط، مدرس، جلسات، حضور، نمرات، چت، تلگرام، هوش مصنوعی و ۶ گزارش Excel.",
  keywords: [
    "پنل مدیریت آموزشگاه",
    "سامانه آموزشگاه فنی و حرفه‌ای",
    "مدیریت هنرجویان",
    "ثبت نام آنلاین آموزشگاه",
    "فروش دوره آنلاین",
    "فَنیکسو",
    "آموزشگاه های زبرخان",
  ],
  alternates: { canonical: "https://www.fanixo.ir/for-institutes" },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://www.fanixo.ir/for-institutes",
    siteName: "فَنیکسو",
    title: "راهنمای کامل مدیران آموزشگاه‌ها | فَنیکسو",
    description: "معرفی کامل پنل مدیر، پنل هنرجو، فروش آنلاین، آموزش، مالی، ارتباطات، هوش مصنوعی و گزارش‌ها.",
  },
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "سامانه مدیریت آموزشگاه فَنیکسو",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://www.fanixo.ir/for-institutes",
  inLanguage: "fa",
  description: "سامانه یکپارچه مدیریت آموزشگاه، دوره، هنرجو، آموزش، امور مالی، ارتباطات و فروش دوره آنلاین.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "IRR",
    description: "پلن رایگان ۳۰ روزه برای شروع",
  },
  featureList: [
    "مدیریت دوره‌های حضوری و آنلاین",
    "پرونده یکپارچه هنرجو و مدیریت اقساط",
    "حضور و غیاب، نمرات، تکالیف و آزمون‌ها",
    "کلاس آنلاین و گروه‌های پیام‌رسان",
    "گزارش‌گیری Excel و ربات تلگرام",
    "استودیوی هوش مصنوعی مدیر",
  ],
};

export default function ForInstitutesPage() {
  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <Navbar />
      <HeroSection />
      <TrustBar />
      <ProblemSolution />
      <ManagerPlatformGuide />
      <AITechSection />
      <FaqSection audience="managers" />
      <PremiumCTA />
      <Footer />
    </main>
  );
}
