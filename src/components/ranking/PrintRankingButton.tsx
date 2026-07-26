"use client";
import { Printer } from "lucide-react";
export default function PrintRankingButton(){return <button type="button" onClick={()=>window.print()} className="print:hidden inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-xs font-black text-slate-950"><Printer className="h-4 w-4"/>چاپ / ذخیره PDF</button>}
