"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Player } from "@/types/player";
import PlayerSelect from "@/app/components/PlayerSelect";
import CompareStats from "@/app/components/CompareStats";
import { FlagIcon } from "@/app/components/FlagIcon";
import { StatusBadge, PositionBadge } from "@/app/components/StatusBadge";

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
  ];
  const idx = id.charCodeAt(0) % gradients.length;
  return gradients[idx];
}

function PlayerProfileSummary({
  player,
  colorScheme = "crimson",
}: {
  player: Player | null;
  colorScheme?: "crimson" | "navy";
}) {
  const isCrimson = colorScheme === "crimson";
  const accentColor = isCrimson ? "#A2001D" : "#004D98";
  const borderColor = isCrimson ? "border-[#A2001D]" : "border-[#004D98]";
  const bgBadge = isCrimson
    ? "bg-[#FDF2F4] text-[#A2001D] border-[#A2001D]/30"
    : "bg-[#EFF6FF] text-[#004D98] border-[#004D98]/30";
  const vitalsBg = isCrimson
    ? "bg-[#FDF2F4] text-[#A2001D]"
    : "bg-[#EFF6FF] text-[#004D98]";
  const glowShadow = isCrimson
    ? "hover:shadow-[0_14px_30px_rgba(162,0,29,0.12)] hover:border-[#A2001D]/70"
    : "hover:shadow-[0_14px_30px_rgba(0,77,152,0.12)] hover:border-[#004D98]/70";

  if (!player) {
    return (
      <div
        className={`h-full min-h-[170px] flex items-center justify-center p-5 border-2 border-dashed rounded-3xl text-center shadow-xs transition-all ${
          isCrimson
            ? "bg-[#FDF2F4]/30 border-[#A2001D]/30"
            : "bg-[#EFF6FF]/30 border-[#004D98]/30"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs border shrink-0"
            style={{
              background: isCrimson ? "#FDF2F4" : "#EFF6FF",
              borderColor: isCrimson ? "rgba(162,0,29,0.2)" : "rgba(0,77,152,0.2)",
            }}
          >
            <span
              className="font-display font-black text-xl"
              style={{ color: accentColor }}
            >
              +
            </span>
          </div>
          <div className="text-left">
            <span className="font-display font-bold text-sm text-[#0B1F40] block">
              เลือกนักเตะ{isCrimson ? "คนที่ 1 (Red Corner)" : "คนที่ 2 (Blue Corner)"}
            </span>
            <span className="text-xs text-[#64748B]">
              พิมพ์ค้นหาในกล่องด้านบน
            </span>
          </div>
        </div>
      </div>
    );
  }

  const age = getAge(player.dateOfBirth);

  return (
    <div
      className={`bg-white rounded-3xl p-4 sm:p-5 flex flex-col justify-between h-full border border-gray-200/90 shadow-xs relative overflow-hidden transition-all duration-300 ${glowShadow} border-t-4 ${borderColor}`}
    >
      {/* Corner Heritage Flame Tag */}
      <div
        className="absolute top-0 right-0 w-12 h-3 overflow-hidden rounded-bl-lg pointer-events-none"
        style={{
          background: isCrimson
            ? "linear-gradient(90deg, #A2001D, #FF4D6D)"
            : "linear-gradient(90deg, #004D98, #00D2FF)",
        }}
      />

      {/* Main compact row: Avatar + Name & Specs */}
      <div>
        <div className="flex items-center gap-3.5 mb-3">
          {/* Avatar with jersey number */}
          <div
            className={`w-14 h-14 rounded-xl shrink-0 flex items-center justify-center relative overflow-hidden shadow-xs border bg-gray-50 ${
              isCrimson
                ? "border-[#A2001D]/30 ring-2 ring-[#A2001D]/10"
                : "border-[#004D98]/30 ring-2 ring-[#004D98]/10"
            }`}
            style={{
              background: player.imageUrl ? "transparent" : getAvatarGradient(player.id),
            }}
          >
            {player.imageUrl ? (
              <img
                src={player.imageUrl}
                alt={player.name}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <span className="font-display font-black text-xl text-white">
                {getInitials(player.name)}
              </span>
            )}

            {player.jerseyNumber && (
              <span className="absolute bottom-0.5 right-1 text-[10px] font-black font-display tracking-tight text-[#EDBB00] drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] select-none">
                #{player.jerseyNumber}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0 pr-4 sm:pr-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span
                className={`text-[9px] font-mono font-black px-2 py-0.2 rounded border ${bgBadge}`}
              >
                {isCrimson ? "RED CORNER" : "BLUE CORNER"}
              </span>
              <PositionBadge position={player.position} />
            </div>

            <h2
              className={`font-display font-black text-base sm:text-lg leading-tight truncate transition-colors ${
                isCrimson
                  ? "text-[#0B1F40] group-hover:text-[#A2001D]"
                  : "text-[#0B1F40] group-hover:text-[#004D98]"
              }`}
            >
              {player.name}
            </h2>

            <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-0.5 truncate">
              <FlagIcon nationality={player.nationality} emoji={player.flagEmoji} />
              <span>{player.nationality}</span>
              {player.currentClub && (
                <>
                  <span>·</span>
                  <span className="truncate">{player.currentClub}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Compact Micro-Vitals Strip */}
        <div className="grid grid-cols-3 gap-1.5 pt-2.5 border-t border-gray-100">
          <div className={`rounded-lg py-1.5 px-2 text-center ${vitalsBg}`}>
            <span className="block text-[9px] text-[#64748B] uppercase font-bold">
              อายุ
            </span>
            <span className="font-display font-black text-xs sm:text-sm">
              {age} ปี
            </span>
          </div>

          <div className={`rounded-lg py-1.5 px-2 text-center ${vitalsBg}`}>
            <span className="block text-[9px] text-[#64748B] uppercase font-bold">
              เข้า LA MASIA
            </span>
            <span className="font-display font-black text-xs sm:text-sm truncate block">
              {player.lamasiaYear ? `ปี ${player.lamasiaYear}` : "-"}
            </span>
          </div>

          <div className={`rounded-lg py-1.5 px-2 text-center ${vitalsBg}`}>
            <span className="block text-[9px] text-[#64748B] uppercase font-bold">
              มูลค่าตลาด
            </span>
            <span className="font-display font-black text-xs sm:text-sm truncate block">
              {player.marketValueM ? `€${player.marketValueM}m` : "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Footer: Status Badge + Direct Profile Link */}
      <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
        <StatusBadge status={player.currentStatus} />
        <Link
          href={`/players/${player.id}`}
          className="inline-flex items-center gap-1 text-xs font-bold transition-all group"
          style={{ color: accentColor }}
        >
          <span>ดูโปรไฟล์</span>
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </div>
    </div>
  );
}

export default function CompareClient({ players }: { players: Player[] }) {
  const searchParams = useSearchParams();

  const initialP1 = searchParams.get("p1") || null;
  const initialP2 = searchParams.get("p2") || null;

  const [p1Id, setP1Id] = useState<string | null>(initialP1);
  const [p2Id, setP2Id] = useState<string | null>(initialP2);

  // Sync state if URL query params change
  useEffect(() => {
    const p1Param = searchParams.get("p1");
    if (p1Param && players.some((p) => p.id === p1Param)) {
      setP1Id(p1Param);
    }
    const p2Param = searchParams.get("p2");
    if (p2Param && players.some((p) => p.id === p2Param)) {
      setP2Id(p2Param);
    }
  }, [searchParams, players]);

  const player1 = players.find((p) => p.id === p1Id) || null;
  const player2 = players.find((p) => p.id === p2Id) || null;

  const handleSwap = () => {
    setP1Id(p2Id);
    setP2Id(p1Id);
  };

  return (
    <div className="min-h-screen pb-20 bg-[#F8FAFD] relative overflow-hidden">
      {/* Background Arena Ambient Glows (The Two Corners) */}
      <div
        className="absolute top-[400px] -left-40 w-[600px] h-[600px] pointer-events-none opacity-40 filter blur-[120px]"
        style={{
          background: "radial-gradient(circle, rgba(162, 0, 29, 0.15) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-[400px] -right-40 w-[600px] h-[600px] pointer-events-none opacity-40 filter blur-[120px]"
        style={{
          background: "radial-gradient(circle, rgba(0, 77, 152, 0.15) 0%, transparent 70%)",
        }}
      />

      {/* ─── Blaugrana Dual Mesh Banner ─── */}
      <div
        className="relative overflow-hidden border-b border-white/[0.1]"
        style={{
          paddingTop: "90px",
          background: "linear-gradient(135deg, #1C050B 0%, #0D162B 50%, #060E21 100%)",
        }}
      >
        {/* Top subtle Blaugrana dual accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#A2001D] to-[#004D98] opacity-80" />

        {/* Left Crimson Mesh Orb */}
        <div
          className="absolute -top-10 -left-20 w-[450px] h-[350px] pointer-events-none opacity-45 filter blur-[100px]"
          style={{
            background: "radial-gradient(circle, #A2001D 0%, #4A000D 60%, transparent 80%)",
          }}
        />

        {/* Right Royal Navy Mesh Orb */}
        <div
          className="absolute -top-10 -right-20 w-[550px] h-[400px] pointer-events-none opacity-50 filter blur-[110px]"
          style={{
            background: "radial-gradient(circle, #004D98 0%, #002244 60%, transparent 80%)",
          }}
        />

        {/* Subtle dot matrix overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 text-center">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/20 text-xs font-semibold text-[#CBD5E1] mb-3.5 shadow-md">
              <span className="flex items-center -space-x-0.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#A2001D] ring-1 ring-white/30" />
                <span className="w-2 h-2 rounded-full bg-[#004D98] ring-1 ring-white/30" />
              </span>
              <span>Head-to-Head Scouting Analytics</span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
              <span>เปรียบเทียบสถิติ</span>{" "}
              <span className="bg-gradient-to-r from-[#EDBB00] via-[#FF8A00] to-[#EDBB00] bg-clip-text text-transparent">
                Head-to-Head
              </span>
            </h1>
            <p className="text-[#94A3B8] text-sm sm:text-base mt-3.5 max-w-2xl leading-relaxed mx-auto">
              วิเคราะห์และเปรียบเทียบพัฒนาการ สถิติการลงเล่นช่วง Pre-Season และข้อมูลสเปกของดาวรุ่งจาก La Masia แบบตัวต่อตัว
            </p>
          </div>
        </div>
      </div>

      {/* ─── Main Analytics Canvas (Tight & Focused Width) ─── */}
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative z-10">
        {/* Selectors Bar with Red & Blue Corner Styling */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200/90 shadow-md relative z-30">
          <div className="flex flex-col md:flex-row items-center gap-4 relative">
            <div className="flex-1 w-full p-2 rounded-2xl bg-gradient-to-r from-[#FDF2F4]/50 to-transparent border border-[#A2001D]/20">
              <PlayerSelect
                label="นักเตะคนที่ 1 (Red Corner)"
                players={players.filter((p) => p.id !== p2Id)}
                value={p1Id}
                onChange={setP1Id}
                themeColor="crimson"
              />
            </div>

            {/* Swap Button (Clean Minimalist Circle) */}
            <div className="shrink-0 flex items-center justify-center py-2 md:py-0">
              <button
                type="button"
                onClick={handleSwap}
                title="สลับตำแหน่งนักเตะ (Swap)"
                className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-[#004D98] text-[#64748B] hover:text-[#004D98] flex items-center justify-center transition-all cursor-pointer group"
              >
                <svg
                  className="w-4 h-4 transition-transform group-hover:rotate-180 duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 w-full p-2 rounded-2xl bg-gradient-to-l from-[#EFF6FF]/50 to-transparent border border-[#004D98]/20">
              <PlayerSelect
                label="นักเตะคนที่ 2 (Blue Corner)"
                players={players.filter((p) => p.id !== p1Id)}
                value={p2Id}
                onChange={setP2Id}
                themeColor="navy"
              />
            </div>
          </div>
        </div>

        {/* Profile Summaries (Side-by-Side The Two Corners Cards + Center VS Emblem) */}
        <div className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            <PlayerProfileSummary player={player1} colorScheme="crimson" />
            <PlayerProfileSummary player={player2} colorScheme="navy" />
          </div>

          {/* Central Floating VS Badge (Desktop Center) */}
          <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 items-center justify-center">
            <div className="px-3.5 py-1.5 rounded-2xl bg-white border border-gray-200 shadow-xl flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#A2001D] shadow-xs" />
              <span className="font-display font-black text-xs tracking-wider bg-gradient-to-r from-[#A2001D] to-[#004D98] bg-clip-text text-transparent">
                VS
              </span>
              <span className="w-2 h-2 rounded-full bg-[#004D98] shadow-xs" />
            </div>
          </div>
        </div>

        {/* Head-to-Head Comparative Stats */}
        <div className="relative z-10">
          <CompareStats player1={player1} player2={player2} />
        </div>
      </div>
    </div>
  );
}
