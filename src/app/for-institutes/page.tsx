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
export const metadata = {
  title: "برای مدیران آموزشگاه‌ها | سامانه جامع و هوشمند فَنی‌اکسو",
  description:
    "راهنمای کامل امکانات پنل مدیر آموزشگاه: مدیریت دوره، هنرجو، مدرس، جلسات، حضور، نمرات، کلاس آنلاین، تکلیف، آزمون، فروش آنلاین، چت، هوش مصنوعی، تلگرام و گزارش‌گیری.",
  alternates: { canonical: "https://www.fanixo.ir/for-institutes" },
};

export default function ForInstitutesPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <TrustBar />
      <ProblemSolution />
      <ManagerPlatformGuide />
      <AITechSection />
      <FaqSection />
      <PremiumCTA />
      <Footer />
    </main>
  );
}
