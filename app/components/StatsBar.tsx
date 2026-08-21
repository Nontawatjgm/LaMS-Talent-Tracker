"use client";

import { useEffect, useRef, useState } from "react";
import type { Player } from "@/types/player";
import Link from "next/link";

interface StatsBarProps {
  players: Player[];
  className?: string;
}

function useCountUp(target: number, duration = 1000, startDelay = 0) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) return;
    let startTime: number | null = null;
    let delayTimeout: ReturnType<typeof setTimeout>;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    delayTimeout = setTimeout(() => {
      rafRef.current = requestAnimationFrame(step);
    }, startDelay);

    return () => {
      clearTimeout(delayTimeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, startDelay]);

  return count;
}

type StatItem = {
  id: string;
  value: number;
  label: string;
  sublabel: string;
  enTitle: string;
  href: string;
};

export default function StatsBar({ players = [], className = "" }: StatsBarProps) {
  const totalPlayers = players.length;
  const promotedCount = players.filter((p) => p.currentStatus === "promoted").length;
  const seasons = [
    ...new Set(players.flatMap((p) => (p.preSeasons || []).map((ps) => ps.season))),
  ];
  const seasonCount = seasons.length;
  const nationalities = [...new Set(players.map((p) => p.nationality))];

  const stats: StatItem[] = [
    {
      id: "stat-total-players",
      value: totalPlayers,
      label: "นักเตะทั้งหมด",
      sublabel: "ในสถาบัน La Masia",
      enTitle: "TOTAL TALENTS",
      href: "/players",
    },
    {
      id: "stat-promoted",
      value: promotedCount,
      label: "โปรโมทแล้ว",
      sublabel: "สู่ทีมชุดใหญ่",
      enTitle: "PROMOTED STARS",
      href: "/players?status=promoted",
    },
    {
      id: "stat-seasons",
      value: seasonCount,
      label: "ฤดูกาล",
      sublabel: "พรีซีซั่นที่บันทึก",
      enTitle: "PRE-SEASONS",
      href: "/timeline",
    },
    {
      id: "stat-nationalities",
      value: nationalities.length,
      label: "สัญชาติ",
      sublabel: "ในทีม La Masia",
      enTitle: "GLOBAL ROSTER",
      href: "/players",
    },
  ];

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, i) => (
        <JerseyStatCard key={stat.id} stat={stat} delay={i * 90} />
      ))}
    </div>
  );
}

function JerseyStatCard({ stat, delay }: { stat: StatItem; delay: number }) {
  const count = useCountUp(stat.value, 950, delay);

  return (
    <Link href={stat.href} className="block group h-full">
      <div
        className="rounded-2xl border border-white/10 p-5 text-center relative overflow-hidden transition-all duration-300 hover:border-[var(--barca-gold)]/40 hover:-translate-y-1.5 hover:shadow-2xl h-full flex flex-col justify-between"
        style={{
          background: "linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.015) 100%)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Ambient Hover Glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
          style={{
            background: "radial-gradient(circle at 50% 15%, rgba(237, 187, 0, 0.12) 0%, transparent 75%)",
          }}
        />

        {/* Top Mini Category Title */}
        <div className="text-[10px] sm:text-[11px] font-bold tracking-widest text-gray-400 group-hover:text-gray-300 uppercase transition-colors relative z-10">
          {stat.enTitle}
        </div>

        {/* Giant Iconic Kit-Style Gold Number */}
        <div
          className="text-5xl sm:text-6xl font-black font-display leading-none my-1 tabular-nums text-[#EDBB00] tracking-tight relative z-10 transition-transform duration-300 group-hover:scale-105"
          style={{
            textShadow: "0 0 24px rgba(237, 187, 0, 0.45), 0 3px 6px rgba(0, 0, 0, 0.7)",
          }}
        >
          {count}
        </div>

        {/* Subtle Gold Center Divider */}
        <div className="w-8 h-0.5 mx-auto my-2.5 bg-gradient-to-r from-transparent via-[#EDBB00]/60 to-transparent group-hover:w-16 transition-all duration-300 relative z-10" />

        {/* Labels */}
        <div className="relative z-10">
          <div className="text-sm sm:text-base font-bold text-white group-hover:text-[var(--barca-gold)] transition-colors">
            {stat.label}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {stat.sublabel}
          </div>
        </div>
      </div>
    </Link>
  );
}

