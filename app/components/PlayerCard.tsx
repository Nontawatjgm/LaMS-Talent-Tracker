import Link from "next/link";
import type { Player } from "@/types/player";
import { StatusBadge, PositionBadge } from "./StatusBadge";
import { FlagIcon } from './FlagIcon';

export interface PlayerCardProps {
  player: Player;
  delay?: number;
  theme?: "dark" | "light";
  promotedStyle?: "1" | "2" | "3";
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

function formatDebutDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const dmy = dateStr.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (dmy) return `${dmy[1].padStart(2, "0")}/${dmy[2].padStart(2, "0")}/${dmy[3]}`;
  const ymd = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (ymd) return `${ymd[3].padStart(2, "0")}/${ymd[2].padStart(2, "0")}/${ymd[1]}`;
  return dateStr;
}

export interface PlayerCardProps {
  player: Player;
  delay?: number;
  theme?: "dark" | "light";
  promotedStyle?: "1" | "2" | "3";
}

export default function PlayerCard({ player, theme = "dark", promotedStyle = "2" }: PlayerCardProps) {
  const isLight = theme === "light";
  const age = getAge(player.dateOfBirth);
  const latestPreSeason = player.preSeasons && player.preSeasons.length > 0
    ? player.preSeasons[player.preSeasons.length - 1]
    : undefined;
  const totalGoals = (player.preSeasons || []).reduce((sum, ps) => sum + (ps.goals ?? 0), 0);
  const totalAssists = (player.preSeasons || []).reduce((sum, ps) => sum + (ps.assists ?? 0), 0);
  const totalApps = (player.preSeasons || []).reduce((sum, ps) => sum + (ps.appearances ?? 0), 0);
  const totalMins = (player.preSeasons || []).reduce((sum, ps) => sum + (ps.minutesPlayed ?? 0), 0);

  const isPromoted = player.currentStatus === "promoted";
  const hasDebut = Boolean(player.firstTeamDebutDate || player.firstTeamDebutMatch);

  return (
    <Link
      href={`/players/${player.id}`}
      className="block h-full"
      aria-label={`View ${player.name} profile`}
    >
      <article
        className={`rounded-2xl group relative overflow-hidden flex flex-col gap-3.5 p-5 h-full min-h-[270px] transition-all duration-300 ${
          isLight
            ? "bg-white shadow-xs hover:shadow-2xl hover:-translate-y-1.5 border border-gray-200/90 hover:border-[#004D98]/70 hover:shadow-[0_16px_36px_rgba(0,77,152,0.12)]"
            : `glass card-hover ${
                isPromoted
                  ? "border border-amber-400/25 shadow-[0_0_16px_rgba(237,187,0,0.06)] hover:border-amber-400/50 hover:shadow-[0_0_24px_rgba(237,187,0,0.16)]"
                  : "border border-white/10 hover:border-white/20"
              }`
        }`}
      >
        {/* Corner Blaugrana Dual-Stripe Tag */}
        {isLight && (
          <div className="absolute top-0 right-0 flex h-3 w-10 overflow-hidden rounded-bl-lg pointer-events-none z-10">
            <div className="w-1/2 h-full bg-[var(--barca-navy)]" />
            <div className="w-1/2 h-full bg-[var(--barca-crimson)]" />
          </div>
        )}

        {/* Ambient Hover Glow (Soft Barça Navy - No Yellow) */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
          style={{
            background: isLight
              ? "radial-gradient(circle at 50% 0%, rgba(0, 77, 152, 0.08) 0%, rgba(162, 0, 29, 0.04) 60%, transparent 85%)"
              : "radial-gradient(circle at 50% 0%, rgba(0, 77, 152, 0.18) 0%, rgba(162, 0, 29, 0.12) 50%, transparent 80%)",
          }}
        />

        {/* ─── Header row ─── */}
        <div className="flex items-start gap-3 relative">
          {/* Avatar with clean border */}
          <div
            className={`w-14 h-14 rounded-xl shrink-0 flex items-center justify-center relative overflow-hidden shadow-xs ${
              isLight
                ? "border border-gray-200 bg-gray-50"
                : "border border-white/10"
            }`}
            style={{ background: player.imageUrl ? 'transparent' : getAvatarGradient(player.id) }}
          >
            {player.imageUrl ? (
              <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover object-top" />
            ) : (
              <span className="text-white font-bold text-lg font-display relative z-10">
                {getInitials(player.name)}
              </span>
            )}
            
            {player.jerseyNumber && (
              <span
                className="absolute bottom-0.5 right-1 text-xs font-black font-display tracking-tight text-[#EDBB00] drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] select-none"
              >
                #{player.jerseyNumber}
              </span>
            )}
          </div>

          {/* Name & info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className={`font-display font-bold text-[15px] leading-tight truncate m-0 transition-colors ${
                isLight
                  ? "text-[#0B1F40] group-hover:text-[#004D98]"
                  : "text-white group-hover:text-[var(--barca-gold)]"
              }`}>
                {player.name}
              </h3>
              {isPromoted && (
                <span
                  className="shrink-0 text-amber-500 font-bold text-xs"
                  title="First Team Star"
                >
                  ✦
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs whitespace-nowrap overflow-hidden">
              <div
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md ${
                  isLight
                    ? "bg-[#F4F7FD] border border-gray-200 text-[#354875]"
                    : "bg-white/5 border border-white/10 backdrop-blur-sm text-[var(--text-muted)]"
                }`}
                title={player.nationality}
              >
                <FlagIcon nationality={player.nationality} emoji={player.flagEmoji} />
                <span className={isLight ? "text-gray-300" : "text-white/20"}>·</span>
                <span className="text-xs font-medium">{age} ปี</span>
              </div>
            </div>
          </div>

          {/* Position badge */}
          <PositionBadge position={player.position} />
        </div>

        {/* ─── Divider ─── */}
        <div className={`h-px w-full ${isLight ? "bg-gray-100" : "divider-barca opacity-60"}`} />

        {/* ─── Stats row (4 Columns) ─── */}
        <div className="grid grid-cols-4 gap-1.5">
          <div className={`text-center rounded-xl py-2 px-1 ${
            isLight
              ? "bg-[#F8FAFD] border border-gray-100"
              : "bg-[var(--surface-3)] border border-white/5"
          }`}>
            <span className={`block text-base font-bold font-display leading-tight ${
              isLight ? "text-[#0B1F40]" : "text-white"
            }`}>
              {totalApps}
            </span>
            <span className={`block text-[10px] mt-0.5 ${
              isLight ? "text-[#7A8FAD]" : "text-[var(--text-muted)]"
            }`}>
              แมตช์
            </span>
          </div>

          <div className={`text-center rounded-xl py-2 px-1 ${
            isLight
              ? "bg-[#F8FAFD] border border-gray-100"
              : "bg-[var(--surface-3)] border border-white/5"
          }`}>
            <span className={`block text-base font-bold font-display leading-tight truncate ${
              isLight ? "text-[#0B1F40]" : "text-white"
            }`}>
              {totalMins > 0 ? `${totalMins}'` : "0'"}
            </span>
            <span className={`block text-[10px] mt-0.5 ${
              isLight ? "text-[#7A8FAD]" : "text-[var(--text-muted)]"
            }`}>
              นาที
            </span>
          </div>

          <div className={`text-center rounded-xl py-2 px-1 ${
            isLight
              ? "bg-[#F8FAFD] border border-gray-100"
              : "bg-[var(--surface-3)] border border-white/5"
          }`}>
            <span className={`block text-base font-bold font-display leading-tight ${
              totalGoals > 0
                ? isLight ? "text-emerald-600 font-black" : "text-emerald-400 font-black"
                : isLight ? "text-[#0B1F40]" : "text-white"
            }`}>
              {totalGoals}
            </span>
            <span className={`block text-[10px] mt-0.5 ${
              isLight ? "text-[#7A8FAD]" : "text-[var(--text-muted)]"
            }`}>
              ประตู
            </span>
          </div>

          <div className={`text-center rounded-xl py-2 px-1 ${
            isLight
              ? "bg-[#F8FAFD] border border-gray-100"
              : "bg-[var(--surface-3)] border border-white/5"
          }`}>
            <span className={`block text-base font-bold font-display leading-tight ${
              totalAssists > 0
                ? isLight ? "text-blue-600 font-black" : "text-blue-400 font-black"
                : isLight ? "text-[#0B1F40]" : "text-white"
            }`}>
              {totalAssists}
            </span>
            <span className={`block text-[10px] mt-0.5 ${
              isLight ? "text-[#7A8FAD]" : "text-[var(--text-muted)]"
            }`}>
              แอสซิสต์
            </span>
          </div>
        </div>

        {/* ─── Debuted Badge or Latest Pre-season Milestone ─── */}
        <div className="text-xs pt-0.5">
          {hasDebut ? (
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] max-w-full truncate shadow-2xs ${
                isLight
                  ? "bg-[#FFFDF7] border border-amber-300/60 text-[#78350F]"
                  : "bg-amber-500/10 border border-amber-400/30 text-amber-300"
              }`}
              title={player.firstTeamDebutMatch || (player.firstTeamDebutDate ? `Debuted: ${formatDebutDate(player.firstTeamDebutDate)}` : "")}
            >
              <svg className="w-3.5 h-3.5 text-amber-500 shrink-0 fill-amber-400" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="font-bold tracking-tight truncate">
                Debuted: {player.firstTeamDebutDate ? formatDebutDate(player.firstTeamDebutDate) : (player.firstTeamDebutMatch || "First Team")}
              </span>
            </div>
          ) : latestPreSeason ? (
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] max-w-full truncate shadow-2xs ${
                isLight
                  ? "bg-[#F8FAFD] border border-gray-200 text-[#354875]"
                  : "bg-white/5 border border-white/10 text-[var(--text-muted)]"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#EDBB00] inline-block" />
              <span className="text-[#64748B]">Pre-season:</span>
              <span className={`font-bold ${isLight ? "text-[#0B1F40]" : "text-white"}`}>
                {latestPreSeason.season}
              </span>
            </div>
          ) : (
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] max-w-full truncate shadow-2xs ${
                isLight
                  ? "bg-[#F8FAFD] border border-gray-200 text-[#7A8FAD]"
                  : "bg-white/5 border border-white/10 text-[var(--text-muted)]"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-gray-400 inline-block" />
              <span>เข้าสู่ La Masia {player.lamasiaYear ? `ปี ${player.lamasiaYear}` : ""}</span>
            </div>
          )}
        </div>

        {/* ─── Footer ─── */}
        <div className="mt-auto flex items-center justify-between pt-1">
          <StatusBadge status={player.currentStatus} />
          <span className={`text-xs transition-colors flex items-center gap-1 ${
            isLight
              ? "text-[#7A8FAD] group-hover:text-[#004D98]"
              : "text-[var(--text-muted)] group-hover:text-white"
          }`}>
            <span>ดูโปรไฟล์</span>
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </span>
        </div>
      </article>
    </Link>
  );
}
