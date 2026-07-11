"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { CheckCircle, XCircle, ArrowLeft, Home, Wallet, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "";
  const purpose = searchParams.get("purpose") || "";
  const refId = searchParams.get("refId") || "";
  const amount = Number(searchParams.get("amount") || 0);
  const reason = searchParams.get("reason") || "";

  const isSuccess = status === "success";
  const toPersian = (str: string | number) => String(str).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

  return (
    <div className="pt-28 pb-20 min-h-screen bg-bg-secondary">
      <div className="max-w-lg mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface rounded-[24px] border border-border-default shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className={`p-8 text-center ${isSuccess ? "bg-emerald-500" : "bg-error-500"}`}>
            {isSuccess ? (
              <CheckCircle className="w-20 h-20 mx-auto text-white" />
            ) : (
              <XCircle className="w-20 h-20 mx-auto text-white" />
            )}
            <h1 className="text-2xl font-black text-white mt-4">
              {isSuccess ? "پرداخت با موفقیت انجام شد" : "پرداخت ناموفق بود"}
            </h1>
          </div>

          {/* Details */}
          <div className="p-8 space-y-4">
            {isSuccess ? (
              <>
                <div className="bg-emerald-50 border border-emerald-200 rounded-[16px] p-4 text-center">
                  <div className="text-xs text-emerald-700 font-bold mb-1">مبلغ پرداختی</div>
                  <div className="text-3xl font-black text-emerald-800" dir="ltr">
                    {toPersian(amount.toLocaleString("fa-IR"))} <span className="text-lg">تومان</span>
                  </div>
                </div>
                {refId && (
                  <div className="bg-bg-secondary border border-border-default rounded-[12px] p-3 text-center">
                    <div className="text-[10px] text-text-tertiary font-bold mb-1">کد پیگیری بانکی</div>
                    <div className="font-black text-text-primary text-lg tracking-wider" dir="ltr">{refId}</div>
                  </div>
                )}
                <p className="text-sm text-text-secondary text-center leading-relaxed">
                  {purpose === "wallet_charge"
                    ? "کیف پول شما با موفقیت شارژ شد و می‌توانید از موجودی خود برای پرداخت شهریه دوره‌ها استفاده کنید."
                    : purpose === "course_payment"
                      ? "شهریه دوره پرداخت شد. مدیر آموزشگاه ثبت‌نام شما را نهایی خواهد کرد."
                      : "پرداخت شما ثبت شد."}
                </p>
              </>
            ) : (
              <div className="text-center">
                <p className="text-sm text-error-600 font-bold mb-2">علت خطا:</p>
                <p className="text-xs text-text-tertiary bg-error-50 border border-error-500/20 rounded-[12px] p-3">
                  {reason || "خطای نامشخص"}
                </p>
                <p className="text-xs text-text-secondary mt-4">
                  در صورتی که مبلغ از حساب شما کسر شده باشد، طی ۷۲ ساعت به حساب شما بازگردانده می‌شود.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-4 border-t border-border-default">
              <Link
                href="/dashboard"
                className="w-full py-3 rounded-[12px] bg-primary-600 hover:bg-primary-700 text-white font-black text-sm flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4" /> بازگشت به پنل کاربری
              </Link>
              <Link
                href="/"
                className="w-full py-3 rounded-[12px] bg-white/10 hover:bg-white/20 text-text-primary font-bold text-sm flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" /> صفحه اصلی
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <main className="min-h-screen bg-bg-primary">
      <Navbar />
      <Suspense fallback={<div className="pt-28 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>}>
        <PaymentResultContent />
      </Suspense>
    </main>
  );
}
