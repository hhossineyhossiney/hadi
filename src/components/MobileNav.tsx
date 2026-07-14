"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, LayoutGrid, PlusCircle, BookOpen, User, MessageCircle } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated";
  const u = session?.user as any;
  const isAdmin = u?.role === "admin" || u?.phone === "09159513179" || u?.phone === "09150000000";

  // Smart "پنل من" route: /my routes automatically to admin/panel/dashboard
  const panelHref = isAuthed ? "/my" : "/login?callbackUrl=/my";
  const panelLabel = isAuthed
    ? (isAdmin ? "پنل ادمین" : u?.role === "institute" ? "پنل آموزشگاه" : "پنل من")
    : "ورود";

  // When user is logged in, replace "رشته‌ها" with "چت"
  const items = [
    { href: "/", label: "خانه", icon: Home },
    isAuthed
      ? { href: "/chat", label: "چت", icon: MessageCircle }
      : { href: "/fields", label: "رشته‌ها", icon: LayoutGrid },
    { href: "/register", label: "ثبت‌نام", icon: PlusCircle, primary: true },
    { href: "/courses", label: "دوره‌ها", icon: BookOpen },
    { href: panelHref, label: panelLabel, icon: User, showBadge: isAuthed },
  ];

  return (
    <nav
      className="lg:hidden glass border-t border-border-default pb-[env(safe-area-inset-bottom)]"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        transform: "translateZ(0)",
        WebkitTransform: "translateZ(0)",
      }}
    >
      <div className="grid grid-cols-5 h-16">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : (item.href === "/my" ? (pathname.startsWith("/dashboard") || pathname.startsWith("/panel") || pathname.startsWith("/admin")) : pathname.startsWith(item.href));
          if ((item as any).primary) {
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center -mt-5">
                <div className="w-12 h-12 rounded-full gradient-button shadow-lg shadow-primary-600/40 flex items-center justify-center animate-pulse-glow">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] font-bold text-primary-600 mt-1">{item.label}</span>
              </Link>
            );
          }
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1 transition-colors ${
                active ? "text-primary-600" : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {(item as any).showBadge && (
                  <span className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[var(--bg-canvas)]" />
                )}
              </div>
              <span className="text-[10px] font-bold">{item.label}</span>
              {active && <span className="absolute top-0 w-6 h-0.5 rounded-full bg-primary-500" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
