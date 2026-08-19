"use client";

import { useState, FormEvent, useTransition } from "react";
import Link from "next/link";
import { topNationalities } from "@/app/utils/flags";
import { CustomSelect } from "@/app/components/CustomSelect";
import { DatePickerInput } from "@/app/components/DatePickerInput";
import { validatePlayerForm } from "@/app/utils/validation";
import { autofillPlayerWithAI } from "@/app/actions/aiActions";
import { useToast } from "@/app/components/Toast";
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
  const [formValues, setFormValues] = useState({
    name: player?.name || "",
    position: player?.position || "",
    lamasiaYear: player?.lamasiaYear ? String(player.lamasiaYear) : "",
    nationality: player?.nationality || "",
    dateOfBirth: player?.dateOfBirth ? formatToDMY(player.dateOfBirth) : "",
    jerseyNumber: player?.jerseyNumber ? String(player.jerseyNumber) : "",
    height: player?.height ? String(player.height) : "",
    descriptionTH: player?.descriptionTH || "",
    preferredFoot: player?.preferredFoot || "",
    marketValueM: player?.marketValueM ? String(player.marketValueM) : "",
    firstTeamDebutDate: player?.firstTeamDebutDate ? formatToDMY(player.firstTeamDebutDate) : "",
    firstTeamDebutMatch: player?.firstTeamDebutMatch || "",
    currentStatus: player?.currentStatus || "",
    currentClub: player?.currentClub || "FC Barcelona",
    imageUrl: player?.imageUrl || "",
    actionShotUrl: player?.actionShotUrl || "",
    socialInstagram: player?.socialInstagram || "",
  });

  const [aiQuery, setAiQuery] = useState(player?.name || "");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiStatusMsg, setAiStatusMsg] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { success: toastSuccess, error: toastError } = useToast();

  const nationalityOptions = [
    ...(player && !topNationalities.includes(player.nationality)
      ? [{ value: player.nationality, label: player.nationality }]
      : []),
    ...topNationalities.map((c) => ({ value: c, label: c })),
  ];

  // AI Autofill Trigger (supports direct query argument)
  const handleAiAutofill = async (customQuery?: string) => {
    const query = (customQuery || aiQuery).trim() || formValues.name.trim();
    if (!query) {
      toastError("กรุณาระบุชื่อนักเตะ", "พิมพ์ชื่อนักเตะในช่องค้นหา AI ก่อนกดดึงข้อมูล");
      return;
    }

    if (customQuery) {
      setAiQuery(customQuery);
    }

    setIsAiLoading(true);
    setAiStatusMsg(`กำลังค้นหาข้อมูลประวัติและสถิติของ "${query}" จาก La Masia...`);
    setServerError(null);

    try {
      const res = await autofillPlayerWithAI(query);

      if (!res.success || !res.data) {
        toastError("ไม่สามารถดึงข้อมูลได้", res.error || "เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI");
        return;
      }

      const data = res.data;

      // Populate form values
      setFormValues((prev) => ({
        ...prev,
        name: data.name || prev.name,
        position: data.position || prev.position,
        lamasiaYear: data.lamasia_year ? String(data.lamasia_year) : prev.lamasiaYear,
        nationality: data.nationality || prev.nationality,
        dateOfBirth: data.date_of_birth || prev.dateOfBirth,
        jerseyNumber: data.jersey_number !== undefined && data.jersey_number !== null ? String(data.jersey_number) : prev.jerseyNumber,
        height: data.height ? String(data.height) : prev.height,
        descriptionTH: data.description_th || prev.descriptionTH,
        preferredFoot: data.preferred_foot || prev.preferredFoot,
        marketValueM: data.market_value_m !== undefined && data.market_value_m !== null ? String(data.market_value_m) : prev.marketValueM,
        firstTeamDebutDate: data.first_team_debut_date || prev.firstTeamDebutDate,
        firstTeamDebutMatch: data.first_team_debut_match || prev.firstTeamDebutMatch,
        currentStatus: data.current_status || prev.currentStatus,
        currentClub: data.current_club || prev.currentClub,
        socialInstagram: data.social_instagram || prev.socialInstagram,
      }));

      // Clear any previous validation errors
      setErrors({});

      toastSuccess(
        "✨ เติมข้อมูลสำเร็จ!",
        `ดึงข้อมูลของ "${data.name}" เรียบร้อยแล้ว กรุณาตรวจทานก่อนกดบันทึก`
      );
    } catch (err: any) {
      console.error("AI Autofill error:", err);
      toastError("เกิดข้อผิดพลาด", err?.message || "ไม่สามารถเชื่อมต่อกับ AI ได้");
    } finally {
      setIsAiLoading(false);
      setAiStatusMsg("");
    }
  };

  const handleFieldChange = (field: string, val: string) => {
    setFormValues((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

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
          return;
        }
        console.error("Submission error:", err);
        setServerError(err?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
      }
    });
  };

  const hasErrors = Object.keys(errors).length > 0;

  const SAMPLE_PLAYERS = [
    "Guille Fernández",
    "Marc Bernal",
    "Toni Fernández",
    "Noah Darvich",
    "Pau Prim",
    "Quim Junyent",
  ];

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* ✨ COMPACT & MINIMAL AI SMART ASSIST TOOLBAR */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50/80 via-blue-50/50 to-white dark:bg-[#0B1F40] dark:border-purple-500/30 p-3 sm:p-3.5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Left: Icon & Title */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-[#A2001D] text-white flex items-center justify-center text-sm shadow-xs shrink-0">
              ✨
            </div>
            <div>
              <div className="text-xs font-bold text-[#0B1F40] flex items-center gap-1.5">
                <span>AI Auto-Fill</span>
                <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-md">Gemini</span>
              </div>
              <p className="text-[11px] text-[#526488] leading-tight">
                พิมพ์ชื่อดาวรุ่งเพื่อค้นหาประวัติและกรอกฟอร์มอัตโนมัติ
              </p>
            </div>
          </div>

          {/* Right: Inline Search Input & Action Button */}
          <div className="flex items-center gap-2 flex-1 max-w-md w-full md:w-auto">
            <div className="relative flex-1">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAiAutofill();
                  }
                }}
                placeholder="เช่น Guille Fernández, Marc Bernal..."
                disabled={isAiLoading}
                className="w-full bg-white text-[#0B1F40] placeholder-gray-400 text-xs px-3 py-2 rounded-lg border border-purple-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 shadow-2xs font-medium transition-all disabled:opacity-50"
              />
            </div>

            <button
              type="button"
              onClick={() => handleAiAutofill()}
              disabled={isAiLoading}
              className="px-3.5 py-2 rounded-lg text-xs font-bold text-white shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer shrink-0 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 to-[#A2001D]"
            >
              {isAiLoading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>กำลังดึง...</span>
                </>
              ) : (
                <span>🪄 เติมข้อมูล</span>
              )}
            </button>
          </div>
        </div>

        {/* Bottom: Quick Sample Pills & Status Bar */}
        <div className="mt-2.5 pt-2 border-t border-purple-100/80 flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[#7A8FAD] text-[10px]">ตัวอย่าง:</span>
            {SAMPLE_PLAYERS.slice(0, 4).map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => handleAiAutofill(sample)}
                disabled={isAiLoading}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium text-[#354875] bg-white hover:bg-purple-100 hover:text-purple-700 border border-purple-200/70 transition-all cursor-pointer active:scale-95 disabled:opacity-50 shadow-2xs"
              >
                {sample}
              </button>
            ))}
          </div>

          {isAiLoading && (
            <span className="text-purple-600 font-medium text-[11px] flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
              {aiStatusMsg || "กำลังดึงข้อมูล..."}
            </span>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📝 MAIN PLAYER FORM */}
      {/* ========================================================================= */}
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
                value={formValues.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder="Guillermo Fernández"
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
                  value={player.id}
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
                value={formValues.position}
                placeholder="-- เลือกตำแหน่ง (Position) --"
                groups={POSITION_GROUPS}
                size="md"
                onChange={(val) => handleFieldChange("position", val)}
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
                value={formValues.lamasiaYear}
                onChange={(e) => handleFieldChange("lamasiaYear", e.target.value)}
                placeholder="2018"
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
                value={formValues.nationality}
                placeholder="-- เลือกสัญชาติ (Nationality) --"
                options={nationalityOptions}
                size="md"
                onChange={(val) => handleFieldChange("nationality", val)}
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
                value={formValues.dateOfBirth}
                onChange={(val) => handleFieldChange("dateOfBirth", val)}
                placeholder="18/06/2008"
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
                value={formValues.jerseyNumber}
                onChange={(e) => handleFieldChange("jerseyNumber", e.target.value)}
                placeholder="28"
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
                value={formValues.height}
                onChange={(e) => handleFieldChange("height", e.target.value)}
                placeholder="179"
                className={`w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border transition-all placeholder:text-gray-500 focus:outline-none ${
                  errors.height
                    ? "border-red-500 ring-2 ring-red-500/10 focus:border-red-500"
                    : "border-white/5 focus:border-[var(--barca-gold)]"
                }`}
              />
            </div>
          </div>

          {/* คำอธิบายและบทวิเคราะห์ */}
          <div className="space-y-1.5 mt-6">
            <div className="flex items-center justify-between">
              <label className="text-sm text-[var(--text-secondary)] font-medium">
                บทวิเคราะห์และสไตล์การเล่น (ภาษาไทย)
              </label>
              {formValues.descriptionTH && (
                <span className="text-[11px] text-purple-400 font-medium flex items-center gap-1">
                  ✨ มีข้อมูลสไตล์และจุดเด่น
                </span>
              )}
            </div>
            <textarea
              name="description_th"
              value={formValues.descriptionTH}
              onChange={(e) => handleFieldChange("descriptionTH", e.target.value)}
              rows={4}
              placeholder="ประวัติ, สไตล์การเล่น, จุดเด่น, ฉายา หรือการเปรียบเทียบกับรุ่นพี่..."
              className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] resize-none placeholder:text-gray-500 leading-relaxed"
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
                value={formValues.preferredFoot}
                placeholder="-- เลือกเท้าที่ถนัด (Preferred Foot) --"
                options={PREFERRED_FOOT_OPTIONS}
                size="md"
                onChange={(val) => handleFieldChange("preferredFoot", val)}
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
                value={formValues.marketValueM}
                onChange={(e) => handleFieldChange("marketValueM", e.target.value)}
                placeholder="5"
                className={`w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border transition-all placeholder:text-gray-500 focus:outline-none ${
                  errors.market_value_m
                    ? "border-red-500 ring-2 ring-red-500/10 focus:border-red-500"
                    : "border-white/5 focus:border-[var(--barca-gold)]"
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-[var(--text-secondary)] font-medium">วันที่ลงเล่นทีมชุดใหญ่ครั้งแรก (Debut Date)</label>
              <DatePickerInput
                name="first_team_debut_date"
                value={formValues.firstTeamDebutDate}
                onChange={(val) => handleFieldChange("firstTeamDebutDate", val)}
                placeholder="DD/MM/YYYY"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-[var(--text-secondary)] font-medium">นัดที่ประเดิมสนาม (Debut Match)</label>
              <input
                type="text"
                name="first_team_debut_match"
                value={formValues.firstTeamDebutMatch}
                onChange={(e) => handleFieldChange("firstTeamDebutMatch", e.target.value)}
                placeholder="e.g. Barcelona 2-1 Valencia (La Liga 2024/25)"
                className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] placeholder:text-gray-500"
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
              <div className="flex gap-2.5 items-center">
                {formValues.imageUrl && (
                  <div className="w-10 h-10 rounded-xl shrink-0 overflow-hidden border border-white/20 bg-[var(--surface-3)] shadow-sm">
                    <img
                      src={formValues.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                <input
                  type="url"
                  name="image_url"
                  value={formValues.imageUrl}
                  onChange={(e) => handleFieldChange("imageUrl", e.target.value)}
                  placeholder="https://..."
                  className={`w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border transition-all placeholder:text-gray-500 focus:outline-none ${
                    errors.image_url
                      ? "border-red-500 ring-2 ring-red-500/10 focus:border-red-500"
                      : "border-white/5 focus:border-[var(--barca-gold)]"
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-[var(--text-secondary)] font-medium flex items-center justify-between">
                <span>รูปภาพแอคชั่น (URL)</span>
                {errors.action_shot_url && <span className="text-xs text-red-500 font-normal">{errors.action_shot_url}</span>}
              </label>
              <input
                type="url"
                name="action_shot_url"
                value={formValues.actionShotUrl}
                onChange={(e) => handleFieldChange("actionShotUrl", e.target.value)}
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
                value={formValues.socialInstagram}
                onChange={(e) => handleFieldChange("socialInstagram", e.target.value)}
                placeholder="guillefernandezz"
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
                value={formValues.currentStatus}
                placeholder="-- เลือกสถานะ (Status) --"
                options={STATUS_FORM_OPTIONS}
                size="md"
                onChange={(val) => handleFieldChange("currentStatus", val)}
                className={`w-full ${errors.current_status ? "ring-2 ring-red-500/20 rounded-xl" : ""}`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-[var(--text-secondary)] font-medium">สโมสรปัจจุบัน</label>
              <input
                type="text"
                name="current_club"
                value={formValues.currentClub}
                onChange={(e) => handleFieldChange("currentClub", e.target.value)}
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
    </div>
  );
}
