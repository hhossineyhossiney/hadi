import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIShowcase from "@/components/AIShowcase";

export const dynamic = "force-static";
export const metadata = {
  title: "هوش مصنوعی زبرخان — ۵۰+ ابزار پیشرفته AI برای آموزش",
  description:
    "پلتفرم AI جامع برای آموزشگاه‌ها، اساتید و هنرجویان — دستیار هوشمند، تولید محتوا، پیش‌بینی، تحلیل و اتوماسیون کامل.",
};

export default function AIPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <AIShowcase />
      <Footer />
    </main>
  );
}
