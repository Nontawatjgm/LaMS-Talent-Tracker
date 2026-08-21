"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Player, Position, Status } from "@/types/player";
import PlayerCard from "@/app/components/PlayerCard";
import { FlagIcon } from "@/app/components/FlagIcon";
import { PositionBadge, StatusBadge } from "@/app/components/StatusBadge";
import { CustomSelect } from "@/app/components/CustomSelect";

interface PlayersClientProps {
  players: Player[];
}

function getAge(dateOfBirth: string): number {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

const statusPriority: Record<string, number> = {
  promoted: 1,
  barca_atletic: 2,
  juvenil_a: 3,
  academy: 3,
  loaned: 4,
  transferred: 5,
  released: 6,
};

export default function PlayersClient({ players }: PlayersClientProps) {
  const searchParams = useSearchParams();

  const initialStatus = (searchParams.get("status") as Status) || "ALL";
  const initialPos = (searchParams.get("position") as Position) || "ALL";
  const initialQ = searchParams.get("q") || "";
  const initialSort = searchParams.get("sort") || "status_desc";

  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [selectedPosition, setSelectedPosition] = useState<Position | "ALL">(initialPos);
  const [selectedStatus, setSelectedStatus] = useState<Status | "ALL">(initialStatus);
  const [selectedNationality, setSelectedNationality] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Load saved view mode from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("players_directory_view_mode") as "grid" | "table" | null;
      if (saved === "grid" || saved === "table") {
        setViewMode(saved);
      }
    } catch {}
  }, []);

  const handleViewModeChange = (mode: "grid" | "table") => {
    setViewMode(mode);
    try {
      localStorage.setItem("players_directory_view_mode", mode);
    } catch {}
  };

  // Sync state if URL query params change
  useEffect(() => {
    const statusParam = searchParams.get("status") as Status | null;
    if (statusParam) setSelectedStatus(statusParam);

    const posParam = searchParams.get("position") as Position | null;
    if (posParam) setSelectedPosition(posParam);

    const qParam = searchParams.get("q");
    if (qParam !== null) setSearchQuery(qParam);

    const sortParam = searchParams.get("sort");
    if (sortParam) setSortBy(sortParam);
  }, [searchParams]);

  // Positions options
  const positions: { value: Position | "ALL"; label: string }[] = [
    { value: "ALL", label: "ทุกตำแหน่ง" },
    { value: "GK", label: "ผู้รักษาประตู (GK)" },
    { value: "DEF", label: "กองหลัง (DEF)" },
    { value: "MID", label: "กองกลาง (MID)" },
    { value: "FWD", label: "กองหน้า (FWD)" },
  ];

  // Statuses options
  const statuses: { value: Status | "ALL"; label: string }[] = [
    { value: "ALL", label: "ทุกสถานะ" },
    { value: "promoted", label: "First Team (ชุดใหญ่)" },
    { value: "barca_atletic", label: "Barça Atlètic" },
    { value: "juvenil_a", label: "Juvenil A (U19)" },
    { value: "loaned", label: "Loaned (ยืมตัว)" },
    { value: "transferred", label: "Transferred (ย้ายทีม)" },
    { value: "released", label: "Released (หมดสัญญา)" },
  ];

  // Nationalities list
  const nationalities = useMemo(() => {
    return ["ALL", ...new Set(players.map((p) => p.nationality).filter(Boolean))].sort();
  }, [players]);

  // Filter & Sort players
  const filteredPlayers = useMemo(() => {
    const filtered = players.filter((player) => {
      const posMatch = selectedPosition === "ALL" || player.position === selectedPosition;
      const statusMatch = selectedStatus === "ALL" || player.currentStatus === selectedStatus;
      const natMatch = selectedNationality === "ALL" || player.nationality === selectedNationality;
      const q = searchQuery.toLowerCase().trim();
      const searchMatch =
        !q ||
        player.name.toLowerCase().includes(q) ||
        player.nationality.toLowerCase().includes(q) ||
        (player.currentClub && player.currentClub.toLowerCase().includes(q)) ||
        (player.firstTeamDebutMatch && player.firstTeamDebutMatch.toLowerCase().includes(q));

      return posMatch && statusMatch && natMatch && searchMatch;
    });

    // Sorting
    return [...filtered].sort((a, b) => {
      if (sortBy === "status_desc") {
        const priorityA = statusPriority[a.currentStatus] ?? 99;
        const priorityB = statusPriority[b.currentStatus] ?? 99;
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        // Tie-breaker within same status: pre-season minutes played descending, then name ascending
        const minsA = (a.preSeasons || []).reduce((s, ps) => s + (ps.minutesPlayed || 0), 0);
        const minsB = (b.preSeasons || []).reduce((s, ps) => s + (ps.minutesPlayed || 0), 0);
        if (minsB !== minsA) return minsB - minsA;
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "name_desc") return b.name.localeCompare(a.name);
      if (sortBy === "apps_desc") {
        const aApps = (a.preSeasons || []).reduce((s, ps) => s + (ps.appearances || 0), 0);
        const bApps = (b.preSeasons || []).reduce((s, ps) => s + (ps.appearances || 0), 0);
        if (bApps !== aApps) return bApps - aApps;
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "age_asc") return getAge(a.dateOfBirth) - getAge(b.dateOfBirth);
      if (sortBy === "age_desc") return getAge(b.dateOfBirth) - getAge(a.dateOfBirth);
      if (sortBy === "lamasia_desc") return (b.lamasiaYear || 0) - (a.lamasiaYear || 0);
      if (sortBy === "lamasia_asc") return (a.lamasiaYear || 0) - (b.lamasiaYear || 0);
      return 0;
    });
  }, [players, selectedPosition, selectedStatus, selectedNationality, searchQuery, sortBy]);

  // Quick stats count
  const promotedCount = useMemo(() => players.filter((p) => p.currentStatus === "promoted").length, [players]);
  const academyCount = useMemo(() => players.filter((p) => p.currentStatus === "barca_atletic" || p.currentStatus === "juvenil_a" || p.currentStatus === "academy").length, [players]);
  const loanedCount = useMemo(() => players.filter((p) => p.currentStatus === "loaned").length, [players]);

  const avgAge = useMemo(() => {
    if (!players.length) return "0";
    const total = players.reduce((sum, p) => sum + getAge(p.dateOfBirth), 0);
    return (total / players.length).toFixed(1);
  }, [players]);

  const hasActiveFilters = selectedPosition !== "ALL" || selectedStatus !== "ALL" || selectedNationality !== "ALL" || searchQuery !== "";

  const clearAllFilters = () => {
    setSelectedPosition("ALL");
    setSelectedStatus("ALL");
    setSelectedNationality("ALL");
    setSearchQuery("");
    setSortBy("status_desc");
  };

  return (
    <div className="min-h-screen pb-20 bg-[#F8FAFD]">
      {/* ─── Blaugrana Dual Mesh Banner + Quick Stats ─── */}
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/20 text-xs font-semibold text-[#CBD5E1] mb-3.5 shadow-md">
                <span className="flex items-center -space-x-0.5 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-[#A2001D] ring-1 ring-white/30" />
                  <span className="w-2 h-2 rounded-full bg-[#004D98] ring-1 ring-white/30" />
                </span>
                <span>La Masia Directory</span>
              </div>
              <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
                ทำเนียบนักเตะทั้งหมด
              </h1>
              <p className="text-[#94A3B8] text-sm sm:text-base mt-3.5 max-w-2xl leading-relaxed">
                รายชื่อนักเตะดาวรุ่งจากสถาบัน La Masia ทุกรุ่น ทั้งที่ขึ้นสู่ทีมชุดใหญ่และกำลังพัฒนาฝีเท้าในอคาเดมี
              </p>
            </div>

            {/* Quick Stat Summary Cards (Glassmorphism Dark - Equal Width & Vibrant Dots) */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              <div className="min-w-[134px] px-4 py-2.5 rounded-2xl bg-white/[0.07] border border-white/15 backdrop-blur-md shadow-xl hover:border-white/25 transition-all flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0060BA] ring-2 ring-blue-400/60 shadow-[0_0_8px_rgba(0,96,186,0.5)] shrink-0" />
                <div>
                  <span className="block text-[11px] font-semibold text-[#94A3B8]">นักเตะทั้งหมด</span>
                  <span className="text-base font-black font-display text-white">{players.length} คน</span>
                </div>
              </div>
              <div className="min-w-[134px] px-4 py-2.5 rounded-2xl bg-white/[0.07] border border-white/15 backdrop-blur-md shadow-xl hover:border-white/25 transition-all flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] ring-2 ring-rose-400/60 shadow-[0_0_8px_rgba(225,29,72,0.5)] shrink-0" />
                <div>
                  <span className="block text-[11px] font-semibold text-[#94A3B8]">ทีมชุดใหญ่</span>
                  <span className="text-base font-black font-display text-[#EDBB00]">{promotedCount} คน</span>
                </div>
              </div>
              <div className="min-w-[134px] px-4 py-2.5 rounded-2xl bg-white/[0.07] border border-white/15 backdrop-blur-md shadow-xl hover:border-white/25 transition-all flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] ring-2 ring-amber-400/60 shadow-[0_0_8px_rgba(245,158,11,0.5)] shrink-0" />
                <div>
                  <span className="block text-[11px] font-semibold text-[#94A3B8]">อายุเฉลี่ย</span>
                  <span className="text-base font-black font-display text-white">{avgAge} ปี</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Sticky Filter & Controls Bar ─── */}
      <div
        className="sticky z-30 bg-[#F8FAFD]/90 backdrop-blur-xl border-b border-gray-200/90 shadow-xs"
        style={{ top: "72px" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="rounded-2xl bg-white p-3.5 flex flex-col lg:flex-row items-stretch lg:items-center gap-3 border border-gray-200 shadow-xs">
            {/* Search Input */}
            <div className="relative flex-1">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="ค้นหาชื่อนักเตะ, สัญชาติ, สโมสร..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#0B1F40] placeholder-gray-400 text-xs sm:text-sm focus:outline-none focus:border-[#004D98] focus:bg-white focus:ring-1 focus:ring-[#004D98] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs p-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Position Filter */}
              <CustomSelect
                id="filter-position"
                value={selectedPosition}
                onChange={(val) => setSelectedPosition(val as Position | "ALL")}
                options={positions.map((p) => ({ value: p.value, label: p.label }))}
                variant="light"
                size="sm"
                className="flex-1 sm:flex-none"
                minMenuWidth="min-w-[160px]"
              />

              {/* Status Filter */}
              <CustomSelect
                id="filter-status"
                value={selectedStatus}
                onChange={(val) => setSelectedStatus(val as Status | "ALL")}
                options={statuses.map((s) => ({ value: s.value, label: s.label }))}
                variant="light"
                size="sm"
                className="flex-1 sm:flex-none"
                minMenuWidth="min-w-[170px]"
              />

              {/* Nationality Filter */}
              <CustomSelect
                id="filter-nationality"
                value={selectedNationality}
                onChange={(val) => setSelectedNationality(val)}
                options={[
                  { value: "ALL", label: `ทุกสัญชาติ (${nationalities.length - 1})` },
                  ...nationalities.filter((n) => n !== "ALL").map((n) => ({
                    value: n,
                    label: n,
                  })),
                ]}
                variant="light"
                size="sm"
                className="flex-1 sm:flex-none"
                minMenuWidth="min-w-[170px]"
              />

              {/* Sort By */}
              <CustomSelect
                id="filter-sort"
                value={sortBy}
                onChange={(val) => setSortBy(val)}
                options={[
                  { value: "status_desc", label: "เรียงตาม: ลำดับชั้นทีม (First Team)" },
                  { value: "name_asc", label: "เรียงตาม: ชื่อ (A-Z)" },
                  { value: "name_desc", label: "เรียงตาม: ชื่อ (Z-A)" },
                  { value: "apps_desc", label: "เรียงตาม: นัดที่ลงเล่นพรีซีซั่น" },
                  { value: "age_asc", label: "เรียงตาม: อายุน้อยสุด" },
                  { value: "age_desc", label: "เรียงตาม: อายุมากสุด" },
                  { value: "lamasia_desc", label: "เรียงตาม: เข้า La Masia ล่าสุด" },
                ]}
                variant="light"
                size="sm"
                className="flex-1 sm:flex-none"
                minMenuWidth="min-w-[210px]"
              />

              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center rounded-xl bg-gray-100 p-1 border border-gray-200">
                <button
                  onClick={() => handleViewModeChange("grid")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "grid" ? "bg-white text-[#0B1F40] shadow-xs" : "text-gray-400 hover:text-gray-700"
                  }`}
                  title="Grid View"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleViewModeChange("table")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "table" ? "bg-white text-[#0B1F40] shadow-xs" : "text-gray-400 hover:text-gray-700"
                  }`}
                  title="Table View"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Pills & Summary */}
          <div className="mt-3 px-1 flex items-center justify-between flex-wrap gap-2 text-xs text-[#64748B]">
            <div className="flex items-center gap-2 flex-wrap">
              <span>
                แสดง <span className="text-[#0B1F40] font-bold">{filteredPlayers.length}</span> จากทั้งหมด {players.length} คน
              </span>
              {selectedStatus !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[#004D98] text-[11px] font-semibold">
                  สถานะ: {statuses.find(s => s.value === selectedStatus)?.label}
                </span>
              )}
              {selectedPosition !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-[#0B1F40] text-[11px] font-semibold">
                  ตำแหน่ง: {positions.find(p => p.value === selectedPosition)?.label}
                </span>
              )}
              {selectedNationality !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold">
                  สัญชาติ: {selectedNationality}
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-[#0B1F40] text-[11px] font-semibold">
                  คำค้น: &ldquo;{searchQuery}&rdquo;
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-[#004D98] hover:text-[#A2001D] font-bold transition-colors underline cursor-pointer"
              >
                ✕ ล้างตัวกรองทั้งหมด
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Main Content Area ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredPlayers.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-white border border-gray-200 p-8 shadow-xs">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-[#0B1F40] mb-2">ไม่พบนักเตะที่ตรงกับเงื่อนไข</h3>
            <p className="text-sm text-[#64748B] max-w-md mx-auto mb-6">
              ลองเปลี่ยนคำค้นหา หรือกดล้างตัวกรองเพื่อดูรายชื่อนักเตะทั้งหมดในสโมสร
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all hover:scale-105 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #A2001D 0%, #004D98 100%)" }}
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View — Style A Light Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
            {filteredPlayers.map((player, index) => (
              <PlayerCard key={player.id} player={player} delay={index * 40} />
            ))}
          </div>
        ) : (
          /* Table View — High Contrast Light Database */
          <div className="rounded-2xl bg-white border border-gray-200/90 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#0B1F40]">
                <thead className="text-xs uppercase bg-[#F8FAFD] text-[#64748B] border-b border-gray-200">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-bold">นักเตะ</th>
                    <th scope="col" className="px-6 py-4 font-bold text-center">ตำแหน่ง</th>
                    <th scope="col" className="px-6 py-4 font-bold text-center">อายุ</th>
                    <th scope="col" className="px-6 py-4 font-bold text-center">สัญชาติ</th>
                    <th scope="col" className="px-6 py-4 font-bold text-center">สถานะ</th>
                    <th scope="col" className="px-6 py-4 font-bold text-center">พรีซีซั่น</th>
                    <th scope="col" className="px-6 py-4 font-bold text-right">โปรไฟล์</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPlayers.map((player) => {
                    const age = getAge(player.dateOfBirth);
                    const totalApps = (player.preSeasons || []).reduce((sum, ps) => sum + (ps.appearances || 0), 0);
                    const totalGoals = (player.preSeasons || []).reduce((sum, ps) => sum + (ps.goals || 0), 0);
                    const totalAssists = (player.preSeasons || []).reduce((sum, ps) => sum + (ps.assists || 0), 0);

                    return (
                      <tr key={player.id} className="hover:bg-[#F0F5FD]/60 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link href={`/players/${player.id}`} className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-gray-50 border border-gray-200 flex items-center justify-center font-bold text-sm text-[#0B1F40]">
                              {player.imageUrl ? (
                                <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover object-top" />
                              ) : (
                                <span>{player.name[0]}</span>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-[#0B1F40] group-hover:text-[#004D98] transition-colors">
                                {player.name}
                              </div>
                              {player.jerseyNumber && (
                                <div className="text-[11px] text-[#64748B] font-mono font-medium">
                                  #{player.jerseyNumber}
                                </div>
                              )}
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <PositionBadge position={player.position} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-[#0B1F40] font-medium">
                          {age} ปี
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-xs text-[#0B1F40]">
                            <FlagIcon nationality={player.nationality} emoji={player.flagEmoji} />
                            <span>{player.nationality}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <StatusBadge status={player.currentStatus} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-xs">
                          {player.preSeasons && player.preSeasons.length > 0 ? (
                            <div className="font-medium text-[#0B1F40]">
                              {totalApps} นัด · <span className="text-emerald-600 font-bold">{totalGoals}G</span> · <span className="text-blue-600 font-bold">{totalAssists}A</span>
                            </div>
                          ) : (
                            <span className="text-[#94A3B8] text-[11px]">- ยังไม่มีสถิติ -</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link
                            href={`/players/${player.id}`}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#004D98] bg-[#F0F5FD] hover:bg-[#004D98] hover:text-white border border-[rgba(0,77,152,0.15)] transition-all inline-flex items-center gap-1 group cursor-pointer"
                          >
                            <span>ดูโปรไฟล์</span>
                            <span className="transition-transform group-hover:translate-x-0.5">→</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
