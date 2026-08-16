import playersData from "@/data/players.json";
import type { Player } from "@/types/player";

const players = playersData as Player[];

interface StatsBarProps {
  className?: string;
}

export default function StatsBar({ className = "" }: StatsBarProps) {
  const totalPlayers = players.length;
  const promotedCount = players.filter((p) => p.currentStatus === "promoted").length;
  const seasons = [
    ...new Set(players.flatMap((p) => p.preSeasons.map((ps) => ps.season))),
  ];
  const seasonCount = seasons.length;
  const nationalities = [...new Set(players.map((p) => p.nationality))];

  const stats = [
    {
      id: "stat-total-players",
      value: totalPlayers,
      label: "นักเตะทั้งหมด",
      sublabel: "ที่ร่วม Pre-Season",
      icon: "👥",
    },
    {
      id: "stat-promoted",
      value: promotedCount,
      label: "โปรโมทแล้ว",
      sublabel: "สู่ทีมชุดใหญ่",
      icon: "⬆",
    },
    {
      id: "stat-seasons",
      value: seasonCount,
      label: "ฤดูกาล",
      sublabel: "ที่ครอบคลุม",
      icon: "📅",
    },
    {
      id: "stat-nationalities",
      value: nationalities.length,
      label: "สัญชาติ",
      sublabel: "ในทีม La Masia",
      icon: "🌍",
    },
  ];

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, i) => (
        <div
          key={stat.id}
          id={stat.id}
          className="rounded-2xl glass border-gradient p-5 text-center"
        >
          <div className="text-2xl mb-2">{stat.icon}</div>
          <div
            className="text-4xl font-black font-display gradient-text leading-tight mb-2"
          >
            {stat.value}
          </div>
          <div className="text-sm font-semibold text-[var(--text-primary)]">
            {stat.label}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-0.5">
            {stat.sublabel}
          </div>
        </div>
      ))}
    </div>
  );
}
