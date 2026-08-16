import Link from "next/link";
import type { Player } from "@/types/player";
import { StatusBadge, PositionBadge } from "./StatusBadge";

interface PlayerCardProps {
  player: Player;
  delay?: number;
}

function getAge(dateOfBirth: string): number {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function getAvatarGradient(id: string): string {
  const gradients = [
    "linear-gradient(135deg, #A2001D, #004D98)",
    "linear-gradient(135deg, #004D98, #0060BA)",
    "linear-gradient(135deg, #7A0016, #003A73)",
    "linear-gradient(135deg, #A2001D, #8B0000)",
    "linear-gradient(135deg, #003A73, #004D98)",
    "linear-gradient(135deg, #004D98, #A2001D)",
  ];
  const idx = id.charCodeAt(0) % gradients.length;
  return gradients[idx];
}

export default function PlayerCard({ player, delay = 0 }: PlayerCardProps) {
  const age = getAge(player.dateOfBirth);
  const latestPreSeason = player.preSeasons[player.preSeasons.length - 1];
  const totalGoals = player.preSeasons.reduce((sum, ps) => sum + (ps.goals ?? 0), 0);
  const totalAssists = player.preSeasons.reduce((sum, ps) => sum + (ps.assists ?? 0), 0);
  const totalApps = player.preSeasons.reduce((sum, ps) => sum + (ps.appearances ?? 0), 0);

  return (
    <Link
      href={`/players/${player.id}`}
      className="block h-full"
      aria-label={`View ${player.name} profile`}
    >
      <article className="rounded-2xl glass card-hover group relative overflow-hidden flex flex-col gap-4 p-5 h-full min-h-[260px] border border-white/10">
        {/* Background glow on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(0,77,152,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Gradient border top accent */}
        <div
          className="absolute top-0 left-4 right-4 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(162,0,29,0.6), rgba(0,77,152,0.6), transparent)",
          }}
        />

        {/* ─── Header row ─── */}
        <div className="flex items-start gap-3 relative">
          {/* Avatar */}
          <div
            className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center relative overflow-hidden"
            style={{ background: getAvatarGradient(player.id) }}
          >
            <span className="text-white font-bold text-lg font-display relative z-10">
              {getInitials(player.name)}
            </span>
            {player.jerseyNumber && (
              <span className="absolute bottom-0.5 right-1 text-[9px] font-black opacity-35 text-white">
                #{player.jerseyNumber}
              </span>
            )}
          </div>

          {/* Name & info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-[15px] text-white leading-tight truncate m-0">
              {player.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-[13px]">{player.flagEmoji}</span>
              <span className="text-xs text-[var(--text-muted)]">
                {player.nationality}
              </span>
              <span className="text-[var(--border-glass)] text-xs">·</span>
              <span className="text-xs text-[var(--text-muted)]">{age} ปี</span>
            </div>
          </div>

          {/* Position badge */}
          <PositionBadge position={player.position} />
        </div>

        {/* ─── Divider ─── */}
        <div className="divider-barca" />

        {/* ─── Stats row ─── */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "แมตช์", value: totalApps },
            { label: "ประตู", value: totalGoals },
            { label: "แอสซิสต์", value: totalAssists },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="text-center rounded-xl bg-[var(--surface-3)] py-2.5 px-1"
            >
              <span className="block text-xl font-bold font-display text-white leading-tight">
                {value}
              </span>
              <span className="block text-[10px] text-[var(--text-muted)] mt-1">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* ─── Latest pre-season ─── */}
        {latestPreSeason && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-[var(--barca-gold)] inline-block" />
            Pre-season ล่าสุด:{" "}
            <span className="text-[var(--text-secondary)] font-medium">
              {latestPreSeason.season}
            </span>
          </div>
        )}

        {/* ─── Footer ─── */}
        <div className="mt-auto flex items-center justify-between">
          <StatusBadge status={player.currentStatus} />
          <span className="text-xs text-[var(--text-muted)] transition-colors group-hover:text-[var(--barca-navy-light)]">
            ดูโปรไฟล์ →
          </span>
        </div>
      </article>
    </Link>
  );
}
