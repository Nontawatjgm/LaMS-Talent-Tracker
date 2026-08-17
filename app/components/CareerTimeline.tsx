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
  icon: string;
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
      tag: "🏰 จุดเริ่มต้นสู่ La Masia",
      title: `เข้าสู่ศูนย์ฝึกเยาวชน La Masia`,
      description: `เริ่มต้นเส้นทางลูกหนังในศูนย์ฝึก Ciutat Esportiva Joan Gamper เพื่อบ่มเพาะสไตล์การเล่นและปรัชญาฟุตบอลแบบบาร์เซโลน่า`,
      icon: "🔵",
      badgeColor: "bg-[var(--surface-3)] text-[var(--barca-gold)] border-[var(--barca-gold)]/20",
    },
    // 2. Pre-Season Appearances
    ...player.preSeasons.map((ps, idx) => ({
      id: `preseason-${ps.season}-${idx}`,
      year: ps.season,
      tag: `⚽ Pre-Season Debut / Feature`,
      title: `ร่วมฝึกซ้อมและลงเล่น Pre-Season ${ps.season}`,
      description: ps.notes || `ได้รับโอกาสติดทัพชุดใหญ่ในการแข่งขันและฝึกซ้อมช่วงปรีซีซั่นประจำฤดูกาล ${ps.season}`,
      stats: {
        apps: ps.appearances ?? 0,
        minutes: ps.minutesPlayed,
        goals: ps.goals ?? 0,
        assists: ps.assists ?? 0,
      },
      icon: "🔴",
      badgeColor: "bg-[var(--barca-crimson)]/20 text-white border-[var(--barca-crimson)]/30",
    })),
    // 3. Current Standing
    {
      id: "current-standing",
      year: "ปัจจุบัน",
      tag: "🌟 สถานะปัจจุบัน",
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
      icon: player.currentStatus === "promoted" ? "🏆" : "✦",
      badgeColor: "bg-[var(--barca-navy)]/20 text-white border-[var(--barca-navy)]/30",
    },
  ];

  return (
    <div className="relative py-4">
      {/* Vertical Connecting Line */}
      <div
        className="absolute top-6 bottom-6 left-6 sm:left-8 w-1 rounded-full pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, var(--barca-crimson), var(--barca-gold), var(--barca-navy))",
          boxShadow: "0 0 12px rgba(0, 77, 152, 0.4)",
        }}
      />

      <div className="flex flex-col gap-8">
        {steps.map((step, idx) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="relative flex items-start gap-4 sm:gap-6 pl-2"
          >
            {/* Timeline Node Icon */}
            <div
              className="relative z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center text-sm sm:text-base shrink-0 glass border border-white/20 shadow-lg"
              style={{
                background:
                  idx === 0
                    ? "linear-gradient(135deg, #1E1B4B, #312E81)"
                    : idx === steps.length - 1
                    ? "linear-gradient(135deg, #A2001D, #004D98)"
                    : "linear-gradient(135deg, #004D98, #0060BA)",
                boxShadow: "0 0 15px rgba(162, 0, 29, 0.25)",
              }}
            >
              <span>{step.icon}</span>
            </div>

            {/* Content Card */}
            <div className="flex-1 glass rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group">
              {/* Header: Tag & Year */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span
                  className={`text-xs px-2.5 py-1 rounded-lg border font-semibold tracking-wide ${step.badgeColor}`}
                >
                  {step.tag}
                </span>
                <span className="font-display font-black text-sm text-[var(--barca-gold)]">
                  {step.year}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-display font-bold text-lg sm:text-xl text-white mb-2 group-hover:text-[var(--barca-navy-light)] transition-colors">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                {step.description}
              </p>

              {/* Stats Box if available */}
              {step.stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 mt-3 border-t border-white/5">
                  <div className="p-2 rounded-xl bg-[var(--surface-3)] text-center">
                    <span className="block font-display font-bold text-base text-white">
                      {step.stats.apps}
                    </span>
                    <span className="block text-[10px] text-[var(--text-muted)]">ลงเล่น (นัด)</span>
                  </div>
                  {step.stats.minutes !== undefined && (
                    <div className="p-2 rounded-xl bg-[var(--surface-3)] text-center">
                      <span className="block font-display font-bold text-base text-white">
                        {step.stats.minutes}&apos;
                      </span>
                      <span className="block text-[10px] text-[var(--text-muted)]">นาทีรวม</span>
                    </div>
                  )}
                  <div className="p-2 rounded-xl bg-[var(--surface-3)] text-center">
                    <span className="block font-display font-bold text-base text-[var(--barca-gold)]">
                      {step.stats.goals}
                    </span>
                    <span className="block text-[10px] text-[var(--text-muted)]">ประตู</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[var(--surface-3)] text-center">
                    <span className="block font-display font-bold text-base text-[#22C55E]">
                      {step.stats.assists}
                    </span>
                    <span className="block text-[10px] text-[var(--text-muted)]">แอสซิสต์</span>
                  </div>
                </div>
              )}

              {/* Status Pill for the final step */}
              {step.status && (
                <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-muted)]">สถานะ:</span>
                    <StatusBadge status={step.status} size="sm" />
                  </div>
                  <span className="text-xs text-[var(--text-secondary)] font-medium">
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
