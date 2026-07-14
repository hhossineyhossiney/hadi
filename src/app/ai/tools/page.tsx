import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIToolsHub from "@/components/AIToolsHub";

export const dynamic = "force-static";
export const metadata = {
  title: "ابزارهای هوش مصنوعی — ۶۵+ ابزار زبرخان",
  description: "دسترسی کامل به ۶۵+ ابزار AI برای هنرجویان، اساتید و آموزشگاه‌ها",
};

export default function AIToolsPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <AIToolsHub />
      <Footer />
    </main>
  );
}
