import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import TrustBar from "@/components/TrustBar";
import ProblemSolution from "@/components/ProblemSolution";
import PlatformFeatures from "@/components/PlatformFeatures";
import HowItWorks from "@/components/HowItWorks";
import UserRolesSection from "@/components/UserRolesSection";
import AITechSection from "@/components/AITechSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import StatsSection from "@/components/StatsSection";
import PremiumCTA from "@/components/PremiumCTA";
import FaqSection from "@/components/FaqSection";

export const dynamic = "force-static";
export const metadata = {
  title: "برای مدیران آموزشگاه‌ها | سامانه هوشمند زبرخان",
  description:
    "پلتفرم جامع مدیریت آموزشگاه‌های آزاد فنی و حرفه‌ای — از ثبت‌نام تا فروش دوره آنلاین، هوش مصنوعی و گزارش‌گیری حرفه‌ای.",
};

export default function ForInstitutesPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <TrustBar />
      <ProblemSolution />
      <PlatformFeatures />
      <HowItWorks />
      <UserRolesSection />
      <AITechSection />
      <TestimonialsSection />
      <StatsSection />
      <FaqSection />
      <PremiumCTA />
      <Footer />
    </main>
  );
}
