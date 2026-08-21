"use client";

import { useState, FormEvent, useTransition } from "react";
import Link from "next/link";
import { validatePreSeasonForm } from "@/app/utils/validation";
import { CustomSelect, type CustomSelectOption } from "@/app/components/CustomSelect";

export interface PreSeasonData {
  id?: string;
  season: string;
  year: number;
  appearances: number;
  minutes_played: number;
  goals: number;
  assists: number;
  tour_location: string | null;
  notes: string | null;
}

const SEASON_OPTIONS: CustomSelectOption[] = [
  { value: "2028/29", label: "ฤดูกาล 2028/29" },
  { value: "2027/28", label: "ฤดูกาล 2027/28" },
  { value: "2026/27", label: "ฤดูกาล 2026/27" },
  { value: "2025/26", label: "ฤดูกาล 2025/26" },
  { value: "2024/25", label: "ฤดูกาล 2024/25" },
  { value: "2023/24", label: "ฤดูกาล 2023/24" },
  { value: "2022/23", label: "ฤดูกาล 2022/23" },
  { value: "2021/22", label: "ฤดูกาล 2021/22" },
  { value: "2020/21", label: "ฤดูกาล 2020/21" },
  { value: "2019/20", label: "ฤดูกาล 2019/20" },
  { value: "2018/19", label: "ฤดูกาล 2018/19" },
  { value: "2017/18", label: "ฤดูกาล 2017/18" },
  { value: "2016/17", label: "ฤดูกาล 2016/17" },
  { value: "2015/16", label: "ฤดูกาล 2015/16" },
  { value: "2014/15", label: "ฤดูกาล 2014/15" },
  { value: "2013/14", label: "ฤดูกาล 2013/14" },
  { value: "2012/13", label: "ฤดูกาล 2012/13" },
  { value: "2011/12", label: "ฤดูกาล 2011/12" },
  { value: "2010/11", label: "ฤดูกาล 2010/11" },
  { value: "CUSTOM", label: "+ ระบุฤดูกาลเอง (Custom)..." },
];

interface PreSeasonFormProps {
  playerId: string;
  action: (formData: FormData) => Promise<void>;
  stat?: PreSeasonData;
  suggestedSeason?: string;
  currentYear?: number;
  isEdit?: boolean;
}

export function PreSeasonForm({
  playerId,
  action,
  stat,
  suggestedSeason = "",
  currentYear = new Date().getFullYear(),
  isEdit = false,
}: PreSeasonFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const initialSeason = stat?.season || suggestedSeason || "2026/27";
  const [isCustomSeason, setIsCustomSeason] = useState(
    !SEASON_OPTIONS.some(opt => opt.value === initialSeason) && Boolean(stat?.season)
  );
  const [season, setSeason] = useState(initialSeason);
  const [year, setYear] = useState<number | string>(
    stat?.year ?? (parseInt(initialSeason.split("/")[0]) || currentYear)
  );

  const handleSeasonSelectChange = (val: string) => {
    if (val === "CUSTOM") {
      setIsCustomSeason(true);
      setSeason("");
    } else {
      setIsCustomSeason(false);
      setSeason(val);
      clearFieldError("season");
      const parsedYear = parseInt(val.split("/")[0]);
      if (!isNaN(parsedYear)) {
        setYear(parsedYear);
        clearFieldError("year");
      }
    }
  };

  const handleCustomSeasonChange = (val: string) => {
    setSeason(val);
    clearFieldError("season");
    const parsedYear = parseInt(val.split("/")[0]);
    if (!isNaN(parsedYear) && parsedYear > 1900 && parsedYear < 2100) {
      setYear(parsedYear);
      clearFieldError("year");
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const validation = validatePreSeasonForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
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
        console.error("Stats submission error:", err);
        setServerError(err?.message || "เกิดข้อผิดพลาดในการบันทึกสถิติ กรุณาลองใหม่อีกครั้ง");
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

      {serverError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3 shadow-xs">
          <svg className="w-5 h-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="font-medium">{serverError}</span>
        </div>
      )}

      {/* ข้อมูลฤดูกาล */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--barca-gold)]" />
          ข้อมูลฤดูกาล (Season Info)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm text-[var(--text-secondary)] font-medium">
                ฤดูกาล (Season) <span className="text-red-500">*</span>
              </label>
              {isCustomSeason ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomSeason(false);
                    handleSeasonSelectChange(suggestedSeason || "2026/27");
                  }}
                  className="text-xs text-[var(--barca-gold)] hover:underline cursor-pointer"
                >
                  เลือกจากรายการ
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSeasonSelectChange("CUSTOM")}
                  className="text-xs text-[var(--barca-gold)] hover:underline cursor-pointer"
                >
                  + กรอกเอง
                </button>
              )}
            </div>

            {isCustomSeason ? (
              <input
                type="text"
                name="season"
                value={season}
                onChange={(e) => handleCustomSeasonChange(e.target.value)}
                placeholder="เช่น 2026/27"
                autoFocus
                className={`w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border transition-all placeholder:text-gray-500 focus:outline-none ${
                  errors.season
                    ? "border-red-500 ring-2 ring-red-500/10 focus:border-red-500"
                    : "border-white/5 focus:border-[var(--barca-gold)]"
                }`}
              />
            ) : (
              <CustomSelect
                name="season"
                value={season}
                placeholder="-- เลือกฤดูกาล (Season) --"
                options={SEASON_OPTIONS}
                size="md"
                onChange={(val) => handleSeasonSelectChange(val)}
                className={`w-full ${errors.season ? "ring-2 ring-red-500/20 rounded-xl" : ""}`}
              />
            )}
            {errors.season && <span className="text-xs text-red-500 block">{errors.season}</span>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-secondary)] font-medium flex items-center justify-between">
              <span>ปี ค.ศ. (Year) <span className="text-red-500">*</span></span>
              {errors.year && <span className="text-xs text-red-500 font-normal">{errors.year}</span>}
            </label>
            <input
              type="number"
              name="year"
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                clearFieldError("year");
              }}
              placeholder="2026"
              className={`w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border transition-all placeholder:text-gray-500 focus:outline-none ${
                errors.year
                  ? "border-red-500 ring-2 ring-red-500/10 focus:border-red-500"
                  : "border-white/5 focus:border-[var(--barca-gold)]"
              }`}
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm text-[var(--text-secondary)] font-medium">สถานที่ทัวร์ (Tour Location)</label>
            <input
              type="text"
              name="tour_location"
              defaultValue={stat?.tour_location ?? ""}
              placeholder="USA Tour"
              className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] placeholder:text-gray-500"
            />
          </div>
        </div>
      </section>

      {/* สถิติการเล่น */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-t border-white/10 pt-6">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          สถิติการเล่น (Performance Stats)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-secondary)] font-medium">ลงเล่น (นัด)</label>
            <input
              type="number"
              name="appearances"
              defaultValue={stat?.appearances ?? 0}
              min="0"
              onChange={() => clearFieldError("appearances")}
              className={`w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border text-center font-display text-lg focus:outline-none ${
                errors.appearances
                  ? "border-red-500 ring-2 ring-red-500/10"
                  : "border-white/5 focus:border-[var(--barca-gold)]"
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-secondary)] font-medium">เวลาเล่น (นาที)</label>
            <input
              type="number"
              name="minutes_played"
              defaultValue={stat?.minutes_played ?? 0}
              min="0"
              onChange={() => clearFieldError("minutes_played")}
              className={`w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border text-center font-display text-lg focus:outline-none ${
                errors.minutes_played
                  ? "border-red-500 ring-2 ring-red-500/10"
                  : "border-white/5 focus:border-[var(--barca-gold)]"
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-secondary)] font-medium">ประตู (Goals)</label>
            <input
              type="number"
              name="goals"
              defaultValue={stat?.goals ?? 0}
              min="0"
              onChange={() => clearFieldError("goals")}
              className={`w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border text-center font-display text-lg focus:outline-none ${
                errors.goals
                  ? "border-red-500 ring-2 ring-red-500/10"
                  : "border-white/5 focus:border-[var(--barca-gold)]"
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-secondary)] font-medium">แอสซิสต์ (Assists)</label>
            <input
              type="number"
              name="assists"
              defaultValue={stat?.assists ?? 0}
              min="0"
              onChange={() => clearFieldError("assists")}
              className={`w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border text-center font-display text-lg focus:outline-none ${
                errors.assists
                  ? "border-red-500 ring-2 ring-red-500/10"
                  : "border-white/5 focus:border-[var(--barca-gold)]"
              }`}
            />
          </div>
        </div>

        <div className="space-y-1.5 mt-6">
          <label className="text-sm text-[var(--text-secondary)] font-medium">หมายเหตุ (Notes)</label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={stat?.notes ?? ""}
            placeholder="บันทึกผลงานเด่น เช่น ยิง 1 ประตูในเกมพบ แมนฯ ซิตี้..."
            className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] resize-none placeholder:text-gray-500"
          />
        </div>
      </section>

      {/* Buttons */}
      <div className="pt-6 border-t border-[rgba(0,77,152,0.1)] flex items-center justify-end gap-3">
        <Link
          href="/admin/stats"
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
              <span>{isEdit ? "กำลังบันทึกการแก้ไข..." : "กำลังบันทึกสถิติ..."}</span>
            </>
          ) : (
            <span>{isEdit ? "บันทึกการแก้ไข" : "บันทึกสถิติ"}</span>
          )}
        </button>
      </div>
    </form>
  );
}
