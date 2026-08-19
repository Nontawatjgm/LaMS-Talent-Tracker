"use client";

import { useEffect, useRef, useState } from "react";
import type { Player } from "@/types/player";

import Link from "next/link";

interface StatsBarProps {
  players: Player[];
  className?: string;
}

function useCountUp(target: number, duration = 1200, startDelay = 0) {
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
      // ease-out cubic
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

function StatCard({
  id,
  value,
  label,
  sublabel,
  icon,
  href,
  delay = 0,
}: {
  id: string;
  value: number;
  label: string;
  sublabel: string;
  icon: string;
  href?: string;
  delay?: number;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = useCountUp(visible ? value : 0, 1000, 0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const content = (
    <div
      ref={ref}
      id={id}
      className="rounded-2xl glass border-gradient p-5 text-center relative overflow-hidden group hover:border-[var(--barca-gold)]/40 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col justify-center"
      style={{
        animationDelay: `${delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, box-shadow 0.3s ease, border-color 0.3s ease`,
      }}
    >
      {/* hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{
          background: "radial-gradient(circle at 50% 0%, rgba(162,0,29,0.12) 0%, transparent 70%)",
        }}
      />
      <div className="text-2xl mb-2 relative z-10 transition-transform duration-300 group-hover:scale-110">{icon}</div>
      <div className="text-4xl font-black font-display gradient-text leading-tight mb-1.5 relative z-10 tabular-nums">
        {count}
      </div>
      <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--barca-gold)] transition-colors relative z-10">
        {label}
      </div>
      <div className="text-xs text-[var(--text-muted)] mt-0.5 relative z-10">
        {sublabel}
      </div>
      {href && (
        <span className="text-[10px] text-[var(--barca-gold)] opacity-0 group-hover:opacity-100 transition-opacity mt-2 font-medium">
          คลิกเพื่อดูรายชื่อ →
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full" aria-label={`ดู ${label}`}>
        {content}
      </Link>
    );
  }

  return content;
}

export default function StatsBar({ players = [], className = "" }: StatsBarProps) {
  const totalPlayers = players.length;
  const promotedCount = players.filter((p) => p.currentStatus === "promoted").length;
  const seasons = [
    ...new Set(players.flatMap((p) => (p.preSeasons || []).map((ps) => ps.season))),
  ];
  const seasonCount = seasons.length;
  const nationalities = [...new Set(players.map((p) => p.nationality))];

  const stats = [
    {
      id: "stat-total-players",
      value: totalPlayers,
      label: "นักเตะทั้งหมด",
      sublabel: "ในสถาบัน La Masia",
      icon: "👥",
      href: "/players",
    },
    {
      id: "stat-promoted",
      value: promotedCount,
      label: "โปรโมทแล้ว",
      sublabel: "สู่ทีมชุดใหญ่",
      icon: "⬆",
      href: "/players?status=promoted",
    },
    {
      id: "stat-seasons",
      value: seasonCount,
      label: "ฤดูกาล",
      sublabel: "พรีซีซั่นที่บันทึก",
      icon: "📅",
      href: "/timeline",
    },
    {
      id: "stat-nationalities",
      value: nationalities.length,
      label: "สัญชาติ",
      sublabel: "ในทีม La Masia",
      icon: "🌍",
      href: "/players",
    },
  ];

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, i) => (
        <StatCard key={stat.id} {...stat} delay={i * 120} />
      ))}
    </div>
  );
}
