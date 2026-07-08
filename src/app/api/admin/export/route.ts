import { db } from "@/db";
import { registrations, courses, institutes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await db
    .select({
      id: registrations.id,
      fullName: registrations.fullName,
      phone: registrations.phone,
      email: registrations.email,
      notes: registrations.notes,
      status: registrations.status,
      createdAt: registrations.createdAt,
      courseTitle: courses.title,
      courseSlug: courses.slug,
      instituteName: institutes.name,
      instituteSlug: institutes.slug,
      institutePhone: institutes.phone,
      instituteMobile: institutes.mobile,
      instituteAddress: institutes.address,
    })
    .from(registrations)
    .leftJoin(courses, eq(registrations.courseId, courses.id))
    .leftJoin(institutes, eq(registrations.instituteId, institutes.id))
    .orderBy(desc(registrations.createdAt));

  const workbook = XLSX.utils.book_new();
  workbook.Props = {
    Title: "ثبت‌نام‌های زبرخان آموزش",
    Subject: "گزارش ثبت‌نام آموزشگاه‌ها",
    Author: "زبرخان آموزش",
    CreatedDate: new Date(),
  };

  const groupedByInstitute = data.reduce((acc, reg) => {
    const key = reg.instituteName || "نامشخص";
    if (!acc[key]) acc[key] = [];
    acc[key].push(reg);
    return acc;
  }, {} as Record<string, typeof data>);

  const allSheetData = data.map((reg, index) => ({
    "ردیف": index + 1,
    "نام و نام خانوادگی": reg.fullName,
    "شماره تماس": reg.phone,
    "ایمیل": reg.email || "-",
    "دوره": reg.courseTitle || "-",
    "آموزشگاه": reg.instituteName || "-",
    "آدرس آموزشگاه": reg.instituteAddress || "-",
    "تلفن آموزشگاه": reg.instituteMobile || reg.institutePhone || "-",
    "وضعیت":
      reg.status === "approved"
        ? "تأیید شده"
        : reg.status === "rejected"
        ? "رد شده"
        : "در انتظار",
    "توضیحات": reg.notes || "-",
    "تاریخ ثبت‌نام": reg.createdAt
      ? new Date(reg.createdAt).toLocaleDateString("fa-IR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-",
  }));

  const allWs = XLSX.utils.json_to_sheet(allSheetData);
  allWs["!cols"] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 16 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 35 },
    { wch: 16 },
    { wch: 12 },
    { wch: 25 },
    { wch: 22 },
  ];
  XLSX.utils.book_append_sheet(workbook, allWs, "همه ثبت‌نام‌ها");

  Object.entries(groupedByInstitute).forEach(([instName, regs]) => {
    const sheetName = instName.slice(0, 31).replace(/[\\*?:\/\[\]]/g, "-");
    const sheetData = regs.map((reg, index) => ({
      "ردیف": index + 1,
      "نام و نام خانوادگی": reg.fullName,
      "شماره تماس": reg.phone,
      "ایمیل": reg.email || "-",
      "دوره": reg.courseTitle || "-",
      "آدرس آموزشگاه": reg.instituteAddress || "-",
      "تلفن آموزشگاه": reg.instituteMobile || reg.institutePhone || "-",
      "وضعیت":
        reg.status === "approved"
          ? "تأیید شده"
          : reg.status === "rejected"
          ? "رد شده"
          : "در انتظار",
      "توضیحات": reg.notes || "-",
      "تاریخ ثبت‌نام": reg.createdAt
        ? new Date(reg.createdAt).toLocaleDateString("fa-IR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
    }));

    const ws = XLSX.utils.json_to_sheet(sheetData);
    ws["!cols"] = [
      { wch: 6 },
      { wch: 22 },
      { wch: 16 },
      { wch: 22 },
      { wch: 22 },
      { wch: 35 },
      { wch: 16 },
      { wch: 12 },
      { wch: 25 },
      { wch: 22 },
    ];

    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellRef]) continue;
        if (R === 0) {
          ws[cellRef].s = {
            font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
            fill: { fgColor: { rgb: "4F46E5" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
              top: { style: "thin", color: { rgb: "E4E4E7" } },
              bottom: { style: "thin", color: { rgb: "E4E4E7" } },
              left: { style: "thin", color: { rgb: "E4E4E7" } },
              right: { style: "thin", color: { rgb: "E4E4E7" } },
            },
          };
        } else {
          ws[cellRef].s = {
            font: { color: { rgb: "09090B" }, sz: 11 },
            alignment: { horizontal: "right", vertical: "center", wrapText: true },
            border: {
              top: { style: "thin", color: { rgb: "E4E4E7" } },
              bottom: { style: "thin", color: { rgb: "E4E4E7" } },
              left: { style: "thin", color: { rgb: "E4E4E7" } },
              right: { style: "thin", color: { rgb: "E4E4E7" } },
            },
          };
        }
      }
    }

    XLSX.utils.book_append_sheet(workbook, ws, sheetName);
  });

  const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="zabarkhan-registrations-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
}
