"use client";

import { useState, FormEvent, useTransition } from "react";
import Link from "next/link";
import { topNationalities } from "@/app/utils/flags";
import { CustomSelect } from "@/app/components/CustomSelect";
import { DatePickerInput } from "@/app/components/DatePickerInput";
import { validatePlayerForm } from "@/app/utils/validation";
import type { Player } from "@/types/player";

const POSITION_GROUPS = [
  {
    label: "ผู้รักษาประตู (Goalkeepers)",
    options: [{ value: "GK", label: "GK - ผู้รักษาประตู" }],
  },
  {
    label: "กองหลัง (Defenders)",
    options: [
      { value: "CB", label: "CB - กองหลังตัวกลาง" },
      { value: "LB", label: "LB - แบ็กซ้าย" },
      { value: "RB", label: "RB - แบ็กขวา" },
      { value: "DEF", label: "DEF (Legacy)" },
    ],
  },
  {
    label: "กองกลาง (Midfielders)",
    options: [
      { value: "CDM", label: "CDM - กองกลางตัวรับ" },
      { value: "CM", label: "CM - กองกลางตัวกลาง" },
      { value: "CAM", label: "CAM - กองกลางตัวรุก" },
      { value: "MID", label: "MID (Legacy)" },
    ],
  },
  {
    label: "กองหน้า (Attackers)",
    options: [
      { value: "LW", label: "LW - ปีกซ้าย" },
      { value: "RW", label: "RW - ปีกขวา" },
      { value: "ST", label: "ST - กองหน้าตัวเป้า" },
      { value: "FWD", label: "FWD (Legacy)" },
    ],
  },
];

const PREFERRED_FOOT_OPTIONS = [
  { value: "Right", label: "ขวา (Right)" },
  { value: "Left", label: "ซ้าย (Left)" },
  { value: "Both", label: "ทั้งสองเท้า (Both)" },
];

const STATUS_FORM_OPTIONS = [
  { value: "promoted", label: "ขึ้นทีมชุดใหญ่ (First Team)" },
  { value: "barca_atletic", label: "Barça Atlètic" },
  { value: "juvenil_a", label: "Juvenil (U19)" },
  { value: "loaned", label: "ยืมตัว (Loaned)" },
  { value: "released", label: "ปล่อยตัว (Released)" },
  { value: "transferred", label: "ย้ายทีม (Transferred / Sold)" },
  { value: "academy", label: "ทีมเยาวชน (Academy - Legacy)" },
  { value: "sold", label: "ย้ายทีม (Sold - Legacy)" },
];

function formatToDMY(dateStr?: string | null): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }
  return dateStr;
}

interface PlayerFormProps {
  player?: Player;
  action: (formData: FormData) => Promise<void>;
  isEdit?: boolean;
}

export function PlayerForm({ player, action, isEdit = false }: PlayerFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const nationalityOptions = [
    ...(player && !topNationalities.includes(player.nationality)
      ? [{ value: player.nationality, label: player.nationality }]
      : []),
    ...topNationalities.map((c) => ({ value: c, label: c })),
  ];

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Run client validation
    const validation = validatePlayerForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);

      // Scroll smoothly to the first invalid field
      const firstErrorField = Object.keys(validation.errors)[0];
      const errorElement = form.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setErrors({});

    startTransition(async () => {
      try {
        await action(formData);
      } catch (err: any) {
        if (err?.message?.includes("NEXT_REDIRECT")) {
          // Next.js redirect thrown inside Server Action, do not catch as error
          return;
        }
        console.error("Submission error:", err);
        setServerError(err?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
      }
    });
  };

  const clearFieldError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {/* Top Error Alert Banner */}
      {hasErrors && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 shadow-xs animate-scale-in">
          <svg className="w-5 h-5 shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h4 className="font-bold text-red-800">กรุณาตรวจสอบข้อมูล ({Object.keys(errors).length} รายการ):</h4>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
              {Object.values(errors).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Server Error Alert Banner */}
      {serverError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3 shadow-xs">
          <svg className="w-5 h-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="font-medium">{serverError}</span>
        </div>
      )}

      {/* ข้อมูลพื้นฐาน */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--barca-gold)]" />
          ข้อมูลพื้นฐาน (Basic Info)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* ชื่อนักเตะ */}
          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-secondary)] font-medium flex items-center justify-between">
              <span>ชื่อนักเตะ <span className="text-red-500">*</span></span>
              {errors.name && <span className="text-xs text-red-500 font-normal">{errors.name}</span>}
            </label>
            <input
              type="text"
              name="name"
              defaultValue={player?.name || ""}
              onChange={() => clearFieldError("name")}
              placeholder="Lamine Yamal"
              className={`w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border transition-all placeholder:text-gray-500 focus:outline-none ${
                errors.name
                  ? "border-red-500 ring-2 ring-red-500/10 focus:border-red-500"
                  : "border-white/5 focus:border-[var(--barca-gold)]"
              }`}
            />
          </div>

          {/* ID (Edit only) */}
          {isEdit && player && (
            <div className="space-y-1.5">
              <label className="text-sm text-[var(--text-secondary)] font-medium">ไอดี (ID)</label>
              <input
                type="text"
                name="id"
                defaultValue={player.id}
                disabled
                className="w-full bg-[var(--surface-3)] text-[var(--text-muted)] px-4 py-2.5 rounded-xl border border-white/5 opacity-50 cursor-not-allowed"
              />
            </div>
          )}

          {/* ตำแหน่ง */}
          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-secondary)] font-medium flex items-center justify-between">
              <span>ตำแหน่ง <span className="text-red-500">*</span></span>
              {errors.position && <span className="text-xs text-red-500 font-normal">{errors.position}</span>}
            </label>
            <CustomSelect
              name="position"
              defaultValue={player?.position || ""}
              placeholder="-- เลือกตำแหน่ง (Position) --"
              groups={POSITION_GROUPS}
              size="md"
              onChange={() => clearFieldError("position")}
              className={`w-full ${errors.position ? "ring-2 ring-red-500/20 rounded-xl" : ""}`}
            />
          </div>

          {/* ปีที่เข้า La Masia */}
          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-secondary)] font-medium flex items-center justify-between">
              <span>ปีที่เข้า La Masia (ค.ศ.) <span className="text-red-500">*</span></span>
              {errors.lamasia_year && <span className="text-xs text-red-500 font-normal">{errors.lamasia_year}</span>}
            </label>
            <input
              type="number"
              name="lamasia_year"
              defaultValue={player?.lamasiaYear || ""}
              onChange={() => clearFieldError("lamasia_year")}
              placeholder="2014"
              className={`w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border transition-all placeholder:text-gray-500 focus:outline-none ${
                errors.lamasia_year
                  ? "border-red-500 ring-2 ring-red-500/10 focus:border-red-500"
                  : "border-white/5 focus:border-[var(--barca-gold)]"
              }`}
            />
          </div>

          {/* สัญชาติ */}
          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-secondary)] font-medium flex items-center justify-between">
              <span>สัญชาติ <span className="text-red-500">*</span></span>
              {errors.nationality && <span className="text-xs text-red-500 font-normal">{errors.nationality}</span>}
            </label>
            <CustomSelect
              name="nationality"
              defaultValue={player?.nationality || ""}
              placeholder="-- เลือกสัญชาติ (Nationality) --"
              options={nationalityOptions}
              size="md"
              onChange={() => clearFieldError("nationality")}
              className={`w-full ${errors.nationality ? "ring-2 ring-red-500/20 rounded-xl" : ""}`}
            />
          </div>

          {/* วันเกิด */}
          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-secondary)] font-medium flex items-center justify-between">
              <span>วันเกิด (Date of Birth) <span className="text-red-500">*</span></span>
              {errors.date_of_birth && <span className="text-xs text-red-500 font-normal">{errors.date_of_birth}</span>}
            </label>
            <DatePickerInput
              name="date_of_birth"
              defaultValue={player?.dateOfBirth ? formatToDMY(player.dateOfBirth) : ""}
              placeholder="13/07/2007"
              className={errors.date_of_birth ? "ring-2 ring-red-500/20 rounded-xl" : ""}
            />
          </div>

          {/* หมายเลขเสื้อ */}
          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-secondary)] font-medium flex items-center justify-between">
              <span>หมายเลขเสื้อ</span>
              {errors.jersey_number && <span className="text-xs text-red-500 font-normal">{errors.jersey_number}</span>}
            </label>
            <input
              type="text"
              name="jersey_number"
              defaultValue={player?.jerseyNumber || ""}
              onChange={() => clearFieldError("jersey_number")}
              placeholder="19"
              className={`w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border transition-all placeholder:text-gray-500 focus:outline-none ${
                errors.jersey_number
                  ? "border-red-500 ring-2 ring-red-500/10 focus:border-red-500"
                  : "border-white/5 focus:border-[var(--barca-gold)]"
              }`}
            />
          </div>

          {/* ส่วนสูง */}
          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-secondary)] font-medium flex items-center justify-between">
              <span>ส่วนสูง (ซม.)</span>
              {errors.height && <span className="text-xs text-red-500 font-normal">{errors.height}</span>}
            </label>
            <input
              type="text"
              name="height"
              defaultValue={player?.height || ""}
              onChange={() => clearFieldError("height")}
              placeholder="178"
              className={`w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border transition-all placeholder:text-gray-500 focus:outline-none ${
                errors.height
                  ? "border-red-500 ring-2 ring-red-500/10 focus:border-red-500"
                  : "border-white/5 focus:border-[var(--barca-gold)]"
              }`}
            />
          </div>
        </div>

        {/* คำอธิบาย */}
        <div className="space-y-1.5 mt-6">
          <label className="text-sm text-[var(--text-secondary)] font-medium">คำอธิบาย (ภาษาไทย)</label>
          <textarea
            name="description_th"
            defaultValue={player?.descriptionTH || ""}
            rows={4}
            placeholder="ประวัติและข้อมูลนักเตะ..."
            className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] resize-none placeholder:text-gray-500"
          />
        </div>
      </section>

      {/* ข้อมูลเชิงลึก */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-t border-white/10 pt-6">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          ข้อมูลเชิงลึก (Player Details)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-secondary)] font-medium">เท้าที่ถนัด</label>
            <CustomSelect
              name="preferred_foot"
              defaultValue={player?.preferredFoot || ""}
              placeholder="-- เลือกเท้าที่ถนัด (Preferred Foot) --"
              options={PREFERRED_FOOT_OPTIONS}
              size="md"
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-secondary)] font-medium flex items-center justify-between">
              <span>มูลค่าการตลาด (ล้านยูโร)</span>
              {errors.market_value_m && <span className="text-xs text-red-500 font-normal">{errors.market_value_m}</span>}
            </label>
            <input
              type="text"
              name="market_value_m"
              defaultValue={player?.marketValueM || ""}
              onChange={() => clearFieldError("market_value_m")}
              placeholder="120"
              className={`w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border transition-all placeholder:text-gray-500 focus:outline-none ${
                errors.market_value_m
                  ? "border-red-500 ring-2 ring-red-500/10 focus:border-red-500"
                  : "border-white/5 focus:border-[var(--barca-gold)]"
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-secondary)] font-medium">วันที่ลงเล่นทีมชุดใหญ่ครั้งแรก (First Team Debut)</label>
            <DatePickerInput
              name="first_team_debut_date"
              defaultValue={player?.firstTeamDebutDate ? formatToDMY(player.firstTeamDebutDate) : ""}
              placeholder="29/04/2023"
            />
          </div>
        </div>
      </section>

      {/* สื่อและโซเชียล */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-t border-white/10 pt-6">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          สื่อและโซเชียล (Media & Social)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-secondary)] font-medium flex items-center justify-between">
              <span>รูปภาพโปรไฟล์ (URL)</span>
              {errors.image_url && <span className="text-xs text-red-500 font-normal">{errors.image_url}</span>}
            </label>
            <input
              type="url"
              name="image_url"
              defaultValue={player?.imageUrl || ""}
              onChange={() => clearFieldError("image_url")}
              placeholder="https://..."
              className={`w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border transition-all placeholder:text-gray-500 focus:outline-none ${
                errors.image_url
                  ? "border-red-500 ring-2 ring-red-500/10 focus:border-red-500"
                  : "border-white/5 focus:border-[var(--barca-gold)]"
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-secondary)] font-medium flex items-center justify-between">
              <span>รูปภาพแอคชั่น (URL)</span>
              {errors.action_shot_url && <span className="text-xs text-red-500 font-normal">{errors.action_shot_url}</span>}
            </label>
            <input
              type="url"
              name="action_shot_url"
              defaultValue={player?.actionShotUrl || ""}
              onChange={() => clearFieldError("action_shot_url")}
              placeholder="https://..."
              className={`w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border transition-all placeholder:text-gray-500 focus:outline-none ${
                errors.action_shot_url
                  ? "border-red-500 ring-2 ring-red-500/10 focus:border-red-500"
                  : "border-white/5 focus:border-[var(--barca-gold)]"
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-secondary)] font-medium">Instagram Username</label>
            <input
              type="text"
              name="social_instagram"
              defaultValue={player?.socialInstagram || ""}
              placeholder="lamineyamal"
              className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] placeholder:text-gray-500"
            />
          </div>
        </div>
      </section>

      {/* สถานะปัจจุบัน */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-t border-white/10 pt-6">
          <span className="w-2 h-2 rounded-full bg-[var(--barca-crimson)]" />
          สถานะปัจจุบัน (Current Status)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-secondary)] font-medium flex items-center justify-between">
              <span>สถานะนักเตะ <span className="text-red-500">*</span></span>
              {errors.current_status && <span className="text-xs text-red-500 font-normal">{errors.current_status}</span>}
            </label>
            <CustomSelect
              name="current_status"
              defaultValue={player?.currentStatus || ""}
              placeholder="-- เลือกสถานะ (Status) --"
              options={STATUS_FORM_OPTIONS}
              size="md"
              onChange={() => clearFieldError("current_status")}
              className={`w-full ${errors.current_status ? "ring-2 ring-red-500/20 rounded-xl" : ""}`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-secondary)] font-medium">สโมสรปัจจุบัน</label>
            <input
              type="text"
              name="current_club"
              defaultValue={player?.currentClub || "FC Barcelona"}
              placeholder="FC Barcelona"
              className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] placeholder:text-gray-500"
            />
          </div>
        </div>
      </section>

      {/* Form Action Buttons */}
      <div className="pt-6 border-t border-[rgba(0,77,152,0.1)] flex items-center justify-end gap-3">
        <Link
          href="/admin/players"
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#354875] bg-gray-100 hover:bg-gray-200 hover:text-[#0B1F40] border border-gray-200 transition-all"
        >
          ยกเลิก
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, #A2001D, #D4002A)",
            boxShadow: "0 2px 10px rgba(162, 0, 29, 0.25)",
          }}
        >
          {isPending ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>กำลังบันทึกข้อมูล...</span>
            </>
          ) : (
            <span>{isEdit ? "บันทึกการเปลี่ยนแปลง" : "บันทึกข้อมูล"}</span>
          )}
        </button>
      </div>
    </form>
  );
}
