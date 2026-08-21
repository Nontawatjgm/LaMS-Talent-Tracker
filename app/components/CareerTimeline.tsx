"use client";

import { motion } from "framer-motion";
import type { Player } from "@/types/player";
import { StatusBadge } from "./StatusBadge";

interface CareerTimelineProps {
  player: Player;
}

interface TimelineStep {
  id: string;
  year: string;
  tag: string;
  title: string;
  description: string;
  badgeColor: string;
  stats?: {
    apps: number;
    minutes?: number;
    goals: number;
    assists: number;
  };
  status?: Player["currentStatus"];
  club?: string;
}

export default function CareerTimeline({ player }: CareerTimelineProps) {
  // Construct timeline steps
  const steps: TimelineStep[] = [
    // 1. Academy Entry
    {
      id: "academy-entry",
      year: player.lamasiaYear.toString(),
      tag: "จุดเริ่มต้นสู่ La Masia",
      title: `เข้าสู่ศูนย์ฝึกเยาวชน La Masia`,
      description: `เริ่มต้นเส้นทางลูกหนังในศูนย์ฝึก Ciutat Esportiva Joan Gamper เพื่อบ่มเพาะสไตล์การเล่นและปรัชญาฟุตบอลแบบบาร์เซโลน่า`,
      badgeColor: "bg-blue-50 text-[#004D98] border-blue-200",
    },
    // 2. Pre-Season Appearances
    ...player.preSeasons.map((ps, idx) => ({
      id: `preseason-${ps.season}-${idx}`,
      year: ps.season,
      tag: `Pre-Season Feature`,
      title: `ร่วมฝึกซ้อมและลงเล่น Pre-Season ${ps.season}`,
      description: ps.notes || `ได้รับโอกาสติดทัพชุดใหญ่ในการแข่งขันและฝึกซ้อมช่วงปรีซีซั่นประจำฤดูกาล ${ps.season}`,
      stats: {
        apps: ps.appearances ?? 0,
        minutes: ps.minutesPlayed,
        goals: ps.goals ?? 0,
        assists: ps.assists ?? 0,
      },
      badgeColor: "bg-rose-50 text-[#A2001D] border-rose-200",
    })),
    // 3. Current Standing
    {
      id: "current-standing",
      year: "ปัจจุบัน",
      tag: "สถานะปัจจุบัน",
      title: player.currentStatus === "promoted"
        ? `ก้าวขึ้นสู่ทีมชุดใหญ่ FC Barcelona`
        : player.currentStatus === "barca_atletic"
        ? `สังกัดทีมสำรอง Barça Atlètic`
        : player.currentStatus === "juvenil_a"
        ? `สังกัดทีมเยาวชน Juvenil (U19)`
        : player.currentStatus === "loaned"
        ? `ยืมตัวเพื่อเก็บเกี่ยวประสบการณ์กับ ${player.currentClub || "สโมสรพันธมิตร"}`
        : player.currentStatus === "transferred" || player.currentStatus === "sold"
        ? `ย้ายไปร่วมทีม ${player.currentClub || "สโมสรอื่น"}`
        : player.currentStatus === "academy"
        ? `กำลังพัฒนาฝีเท้าในสังกัด La Masia / Barça Atlètic`
        : `สิ้นสุดสัญญากับสโมสร`,
      description: player.descriptionTH || `ยังคงมุ่งมั่นพัฒนาฝีเท้าเพื่ออนาคตในเส้นทางฟุตบอลอาชีพ`,
      status: player.currentStatus,
      club: player.currentClub || "FC Barcelona",
      badgeColor: "bg-amber-50 text-amber-900 border-amber-200",
    },
  ];

  return (
    <div className="relative py-2">
      {/* Vertical Connecting Line */}
      <div
        className="absolute top-6 bottom-6 left-5 sm:left-6 w-1 rounded-full pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, #004D98 0%, #EDBB00 50%, #A2001D 100%)",
          boxShadow: "0 0 8px rgba(0, 77, 152, 0.2)",
        }}
      />

      <div className="flex flex-col gap-6">
        {steps.map((step, idx) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="relative flex items-start gap-4 sm:gap-5 pl-1"
          >
            {/* Timeline Numbered Stage Node */}
            <div
              className={`relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-mono font-black text-xs shrink-0 border-2 border-white shadow-md text-white ${
                idx === 0
                  ? "bg-[#004D98]"
                  : idx === steps.length - 1
                  ? "bg-[#A2001D]"
                  : "bg-[#0B1F40]"
              }`}
            >
              <span>{String(idx + 1).padStart(2, "0")}</span>
            </div>

            {/* Content Card with Style A Corner Heritage Tag */}
            <div className="flex-1 bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-xs hover:shadow-md hover:border-[#004D98]/40 transition-all duration-300 relative overflow-hidden group">
              {/* Style A: Blaugrana Heritage Dual-Stripe Top Edge */}
              <div className="absolute top-0 left-0 right-0 h-1 flex">
                <div className="flex-1 bg-[#004D98]" />
                <div className="flex-1 bg-[#A2001D]" />
              </div>

              {/* Header: Tag & Year Side-by-Side */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pt-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-lg border font-bold tracking-wide ${step.badgeColor}`}
                  >
                    {step.tag}
                  </span>
                </div>
                <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-md bg-[#0B1F40] text-white">
                  {step.year}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-display font-bold text-base sm:text-lg text-[#0B1F40] mb-1.5 group-hover:text-[#004D98] transition-colors">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-[#475569] leading-relaxed mb-3">
                {step.description}
              </p>

              {/* Stats Box if available */}
              {step.stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-3 border-t border-gray-100">
                  <div className="p-2.5 rounded-xl bg-[#F8FAFD] border border-gray-100 text-center">
                    <span className="block font-display font-bold text-base text-[#0B1F40]">
                      {step.stats.apps}
                    </span>
                    <span className="block text-[10px] text-[#64748B] font-medium">ลงเล่น (นัด)</span>
                  </div>
                  {step.stats.minutes !== undefined && (
                    <div className="p-2.5 rounded-xl bg-[#F8FAFD] border border-gray-100 text-center">
                      <span className="block font-display font-bold text-base text-[#0B1F40]">
                        {step.stats.minutes}&apos;
                      </span>
                      <span className="block text-[10px] text-[#64748B] font-medium">นาทีรวม</span>
                    </div>
                  )}
                  <div className="p-2.5 rounded-xl bg-[#F8FAFD] border border-gray-100 text-center">
                    <span className="block font-display font-bold text-base text-emerald-600">
                      {step.stats.goals}
                    </span>
                    <span className="block text-[10px] text-[#64748B] font-medium">ประตู</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F8FAFD] border border-gray-100 text-center">
                    <span className="block font-display font-bold text-base text-blue-600">
                      {step.stats.assists}
                    </span>
                    <span className="block text-[10px] text-[#64748B] font-medium">แอสซิสต์</span>
                  </div>
                </div>
              )}

              {/* Status Pill for the final step */}
              {step.status && (
                <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#64748B] font-medium">สถานะ:</span>
                    <StatusBadge status={step.status} size="sm" />
                  </div>
                  <span className="text-xs text-[#0B1F40] font-semibold">
                    {step.club}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
