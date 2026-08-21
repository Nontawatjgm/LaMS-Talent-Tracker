"use client";

import { useState, Fragment, useEffect } from "react";
import Link from "next/link";
import type { Player } from "@/types/player";
import { StatusBadge, PositionBadge } from "@/app/components/StatusBadge";
import { FlagIcon } from "@/app/components/FlagIcon";
import { CustomSelect, type CustomSelectOption } from "@/app/components/CustomSelect";

interface AdminStatsListProps {
  initialPlayers: Player[];
}

const STATS_STATUS_OPTIONS: CustomSelectOption[] = [
  { value: "all", label: "สถานะทั้งหมด" },
  { value: "barca_atletic", label: "Barça Atlètic" },
  { value: "juvenil_a", label: "Juvenil (U19)" },
  { value: "loaned", label: "ยืมตัว (Loaned)" },
  { value: "released", label: "ปล่อยตัว (Released)" },
  { value: "transferred", label: "ย้ายทีม (Transferred)" },
];

const STATS_POSITION_OPTIONS: CustomSelectOption[] = [
  { value: "all", label: "ตำแหน่งทั้งหมด" },
  { value: "GK", label: "ผู้รักษาประตู (GK)" },
  { value: "DEF", label: "กองหลัง (CB/LB/RB)" },
  { value: "MID", label: "กองกลาง (CAM/CM/CDM)" },
  { value: "ATT", label: "กองหน้า (ST/LW/RW)" },
];

const STATS_SORT_OPTIONS: CustomSelectOption[] = [
  { value: "position", label: "เรียงตาม: ผังตำแหน่ง" },
  { value: "jersey", label: "เรียงตาม: เบอร์เสื้อ" },
  { value: "name", label: "เรียงตาม: ชื่อ (A-Z)" },
  { value: "year_desc", label: "เรียงตาม: ปีเข้าล่าสุด" },
  { value: "year_asc", label: "เรียงตาม: ปีเข้าแรกสุด" },
];

const POSITION_ORDER: Record<string, number> = {
  GK: 1,
  CB: 10,
  LB: 11,
  RB: 12,
  DEF: 13,
  CDM: 20,
  CM: 21,
  CAM: 22,
  MID: 23,
  LW: 30,
  RW: 31,
  ST: 32,
  FWD: 33,
};

const POSITION_GRADIENT: Record<string, string> = {
  GK: "linear-gradient(135deg, #059669, #10B981)",
  DEF: "linear-gradient(135deg, #EDBB00, #F59E0B)",
  MID: "linear-gradient(135deg, #004D98, #0060BA)",
  FWD: "linear-gradient(135deg, #A2001D, #D4002A)",
};

interface PositionSectionConfig {
  key: string;
  name: string;
  nameEn: string;
  dotColor: string;
  positions: string[];
}

const POSITION_SECTIONS: PositionSectionConfig[] = [
  {
    key: "GK",
    name: "ผู้รักษาประตู",
    nameEn: "Goalkeepers",
    dotColor: "#10B981",
    positions: ["GK"],
  },
  {
    key: "DEF",
    name: "กองหลัง",
    nameEn: "Defenders",
    dotColor: "#EDBB00",
    positions: ["CB", "LB", "RB", "DEF"],
  },
  {
    key: "MID",
    name: "กองกลาง",
    nameEn: "Midfielders",
    dotColor: "#004D98",
    positions: ["CAM", "CM", "CDM", "MID"],
  },
  {
    key: "FWD",
    name: "กองหน้า",
    nameEn: "Forwards",
    dotColor: "#A2001D",
    positions: ["ST", "LW", "RW", "FWD"],
  },
];

function getPositionGradient(position: string) {
  if (["ST", "LW", "RW", "FWD"].includes(position)) return POSITION_GRADIENT.FWD;
  if (["CAM", "CM", "CDM", "MID"].includes(position)) return POSITION_GRADIENT.MID;
  if (["CB", "LB", "RB", "DEF"].includes(position)) return POSITION_GRADIENT.DEF;
  return POSITION_GRADIENT.GK;
}

type SortOption = "position" | "jersey" | "name" | "year_desc" | "year_asc";
type ViewMode = "table" | "grid";

export default function AdminStatsList({ initialPlayers }: AdminStatsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("position");
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Load saved view mode from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_stats_view_mode") as ViewMode | null;
      if (saved === "table" || saved === "grid") {
        setViewMode(saved);
      }
    } catch {}
  }, []);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem("admin_stats_view_mode", mode);
    } catch {}
  };

  const filteredPlayers = initialPlayers.filter((player) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      player.name.toLowerCase().includes(q) ||
      player.position.toLowerCase().includes(q) ||
      player.nationality.toLowerCase().includes(q) ||
      (player.jerseyNumber && String(player.jerseyNumber).includes(q)) ||
      (player.lamasiaYear && String(player.lamasiaYear).includes(q));

    const matchesStatus =
      statusFilter === "all" || player.currentStatus === statusFilter;

    const matchesPosition =
      positionFilter === "all" ||
      (positionFilter === "ATT"
        ? ["ST", "LW", "RW", "FWD"].includes(player.position)
        : positionFilter === "MID"
        ? ["CAM", "CM", "CDM", "MID"].includes(player.position)
        : positionFilter === "DEF"
        ? ["CB", "LB", "RB", "DEF"].includes(player.position)
        : player.position === positionFilter);

    return matchesSearch && matchesStatus && matchesPosition;
  });

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (sortBy === "position") {
      const orderA = POSITION_ORDER[a.position] || 99;
      const orderB = POSITION_ORDER[b.position] || 99;
      if (orderA !== orderB) return orderA - orderB;
      if (a.jerseyNumber && b.jerseyNumber) return a.jerseyNumber - b.jerseyNumber;
      if (a.jerseyNumber) return -1;
      if (b.jerseyNumber) return 1;
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "jersey") {
      if (a.jerseyNumber && b.jerseyNumber) return a.jerseyNumber - b.jerseyNumber;
      if (a.jerseyNumber) return -1;
      if (b.jerseyNumber) return 1;
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "year_desc") return b.lamasiaYear - a.lamasiaYear;
    if (sortBy === "year_asc") return a.lamasiaYear - b.lamasiaYear;
    return 0;
  });

  // Group players by position sections
  const groupedSections = POSITION_SECTIONS.map((sec) => ({
    ...sec,
    players: sortedPlayers.filter((p) => sec.positions.includes(p.position)),
  })).filter((sec) => sec.players.length > 0);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPositionFilter("all");
    setSortBy("position");
  };

  const hasActiveFilters =
    searchQuery || statusFilter !== "all" || positionFilter !== "all" || sortBy !== "position";

  return (
    <div className="glass rounded-2xl border border-white/10 overflow-visible">
      {/* Search & Filter Bar */}
      <div className="p-4 border-b border-white/10 bg-[var(--surface-2)] space-y-3 rounded-t-2xl">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหานักเตะเยาวชน..."
              className="bg-[var(--surface-3)] text-xs text-white pl-9 pr-8 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-[var(--barca-gold)] w-full placeholder:text-gray-400 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white bg-white/10 rounded-full w-4 h-4 flex items-center justify-center"
              >
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATS_STATUS_OPTIONS}
              minMenuWidth="min-w-[190px]"
            />

            {/* Position Filter */}
            <CustomSelect
              value={positionFilter}
              onChange={setPositionFilter}
              options={STATS_POSITION_OPTIONS}
              minMenuWidth="min-w-[190px]"
            />

            {/* Sort Filter */}
            <CustomSelect
              value={sortBy}
              onChange={(val) => setSortBy(val as SortOption)}
              options={STATS_SORT_OPTIONS}
              minMenuWidth="min-w-[210px]"
            />

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-red-600 hover:text-red-700 font-medium hover:underline px-2 py-1"
              >
                รีเซ็ต
              </button>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[var(--surface-3)] rounded-xl border border-white/10 p-1 gap-0.5">
              <button
                type="button"
                onClick={() => handleViewModeChange("table")}
                title="มุมมองตาราง"
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "table"
                    ? "bg-white text-[#004D98] shadow-xs"
                    : "text-gray-400 hover:text-[#0B1F40] hover:bg-white/40"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 3v18M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange("grid")}
                title="มุมมองการ์ด"
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-[#004D98] shadow-xs"
                    : "text-gray-400 hover:text-[#0B1F40] hover:bg-white/40"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Filter count feedback */}
        <div className="flex justify-between items-center text-xs text-[var(--text-muted)] pt-1">
          <span>
            แสดงผล <strong className="text-[var(--text-primary)] font-bold">{sortedPlayers.length}</strong> จากทั้งหมด {initialPlayers.length} คน
          </span>
          <span className="text-[var(--text-muted)] hidden sm:inline-flex items-center gap-1.5 font-medium">
            {viewMode === "grid" ? (
              <>
                <svg className="w-3.5 h-3.5 text-[#004D98]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>มุมมองการ์ด</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-[#004D98]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 10h18M3 14h18M10 3v18M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6z" />
                </svg>
                <span>มุมมองตาราง</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* ========== TABLE VIEW ========== */}
      {viewMode === "table" && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--text-secondary)]">
            <thead className="text-xs uppercase bg-[var(--surface-3)]/50 text-[var(--text-muted)]">
              <tr>
                <th scope="col" className="px-6 py-4 rounded-tl-xl font-semibold">นักเตะ</th>
                <th scope="col" className="px-6 py-4 font-semibold">ตำแหน่ง</th>
                <th scope="col" className="px-6 py-4 font-semibold">สถานะ</th>
                <th scope="col" className="px-6 py-4 font-semibold hidden md:table-cell">สัญชาติ</th>
                <th scope="col" className="px-6 py-4 rounded-tr-xl font-semibold text-right">จัดการสถิติ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedPlayers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-muted)]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-[var(--surface-3)] flex items-center justify-center text-gray-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <p className="text-xs">ไม่พบนักเตะที่ตรงกับเงื่อนไขการค้นหา</p>
                      <button type="button" onClick={clearFilters} className="text-xs text-[var(--barca-navy)] font-semibold hover:underline mt-1">
                        ล้างคำค้นหาทั้งหมด
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                groupedSections.map((sec) => (
                  <Fragment key={sec.key}>
                    {/* Section Header Row */}
                    <tr className="bg-[#F8FAFD] border-y border-[rgba(0,77,152,0.08)]">
                      <td colSpan={5} className="px-6 py-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: sec.dotColor }}
                          />
                          <span className="text-xs font-bold text-[var(--text-primary)]">{sec.name}</span>
                          <span className="text-[11px] text-[var(--text-muted)] font-normal">({sec.nameEn})</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-[#354875] border border-[rgba(0,77,152,0.12)] shadow-2xs ml-1">
                            {sec.players.length} คน
                          </span>
                        </div>
                      </td>
                    </tr>
                    {sec.players.map((player) => (
                      <tr key={player.id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white overflow-hidden border border-white/10 shrink-0 shadow-sm"
                              style={{ background: player.imageUrl ? "var(--surface-3)" : getPositionGradient(player.position) }}
                            >
                              {player.imageUrl ? (
                                <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover object-top" />
                              ) : (
                                player.name.split(" ").map((n) => n[0]).slice(0, 2).join("")
                              )}
                            </div>
                            <div>
                              <div className="text-[var(--text-primary)] font-bold">{player.name}</div>
                              <div className="text-[10px] text-[var(--text-muted)]">
                                เข้าปี {player.lamasiaYear}{" "}
                                {player.jerseyNumber ? `• #${player.jerseyNumber}` : ""}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <PositionBadge position={player.position} size="sm" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={player.currentStatus} size="sm" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <span className="inline-flex items-center gap-2">
                            <FlagIcon nationality={player.nationality} emoji={player.flagEmoji} />
                            {player.nationality}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/admin/players/${player.id}/stats`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50/80 hover:bg-[#004D98] hover:text-white text-[#004D98] text-xs font-semibold transition-all border border-[#004D98]/15"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" />
                            </svg>
                            <span>จัดการสถิติ</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ========== GRID / CARD VIEW ========== */}
      {viewMode === "grid" && (
        <div className="p-5">
          {sortedPlayers.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
              <div className="w-10 h-10 rounded-full bg-[var(--surface-3)] flex items-center justify-center text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-xs">ไม่พบนักเตะที่ตรงกับเงื่อนไขการค้นหา</p>
              <button type="button" onClick={clearFilters} className="text-xs text-[var(--barca-navy)] font-semibold hover:underline mt-1">
                ล้างคำค้นหาทั้งหมด
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {groupedSections.map((sec) => (
                <div key={sec.key} className="space-y-3.5">
                  {/* Position Section Header */}
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: sec.dotColor }}
                    />
                    <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                      <span>{sec.name}</span>
                      <span className="text-xs font-normal text-[var(--text-muted)]">({sec.nameEn})</span>
                    </h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-[#354875] border border-gray-200">
                      {sec.players.length} คน
                    </span>
                    <div className="h-px bg-gray-200/80 flex-1 ml-2" />
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {sec.players.map((player) => (
                      <div
                        key={player.id}
                        className="group relative rounded-2xl border border-[rgba(0,77,152,0.12)] bg-white hover:border-[#004D98]/30 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col p-3.5 hover:-translate-y-0.5"
                      >
                        {/* Top Row: Position & Status Pill */}
                        <div className="flex items-center justify-between gap-1 mb-2.5">
                          <PositionBadge position={player.position} size="sm" />
                          <StatusBadge status={player.currentStatus} size="sm" />
                        </div>

                        {/* Player Photo Area */}
                        <div className="relative mx-auto my-2">
                          <div
                            className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-white shadow-md transition-transform duration-300 group-hover:scale-105"
                            style={{
                              background: player.imageUrl ? "var(--surface-3)" : getPositionGradient(player.position),
                            }}
                          >
                            {player.imageUrl ? (
                              <img
                                src={player.imageUrl}
                                alt={player.name}
                                className="w-full h-full object-cover object-top"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-display font-black text-2xl text-white/90">
                                {player.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                              </div>
                            )}
                          </div>
                          {/* Jersey number badge */}
                          {player.jerseyNumber && (
                            <div
                              className="absolute -bottom-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black text-white shadow-sm"
                              style={{ background: getPositionGradient(player.position) }}
                            >
                              #{player.jerseyNumber}
                            </div>
                          )}
                        </div>

                        {/* Player Info */}
                        <div className="text-center flex flex-col gap-0.5 mb-2.5 flex-1">
                          <p
                            className="text-[var(--text-primary)] font-bold text-xs sm:text-sm leading-tight truncate group-hover:text-[#004D98] transition-colors"
                            title={player.name}
                          >
                            {player.name}
                          </p>
                          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-muted)] mt-0.5">
                            <FlagIcon nationality={player.nationality} emoji={player.flagEmoji} />
                            <span className="truncate">{player.nationality}</span>
                            <span>•</span>
                            <span className="font-mono text-[10px] text-[#7A8FAD]">เข้าปี {player.lamasiaYear}</span>
                          </div>
                        </div>

                        {/* Action Button: Manage Stats */}
                        <div className="pt-2.5 border-t border-gray-100 mt-auto">
                          <Link
                            href={`/admin/players/${player.id}/stats`}
                            className="w-full py-1.5 rounded-xl bg-[#004D98] hover:bg-[#003A73] active:scale-[0.98] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs hover:shadow-sm transition-all"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" />
                            </svg>
                            <span>จัดการสถิติ</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
