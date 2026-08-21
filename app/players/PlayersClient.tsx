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

export default function PlayersClient({ players }: PlayersClientProps) {
  const searchParams = useSearchParams();

  const initialStatus = (searchParams.get("status") as Status) || "ALL";
  const initialPos = (searchParams.get("position") as Position) || "ALL";
  const initialQ = searchParams.get("q") || "";
  const initialSort = searchParams.get("sort") || "name_asc";

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
    { value: "promoted", label: "First Team ✦" },
    { value: "barca_atletic", label: "Barça Atlètic ◈" },
    { value: "juvenil_a", label: "Juvenil A (U19) ❖" },
    { value: "loaned", label: "Loaned ↗" },
    { value: "transferred", label: "Transferred ⇆" },
    { value: "released", label: "Released ×" },
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
    return filtered.sort((a, b) => {
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "name_desc") return b.name.localeCompare(a.name);
      if (sortBy === "age_asc") return getAge(a.dateOfBirth) - getAge(b.dateOfBirth);
      if (sortBy === "age_desc") return getAge(b.dateOfBirth) - getAge(a.dateOfBirth);
      if (sortBy === "lamasia_desc") return (b.lamasiaYear || 0) - (a.lamasiaYear || 0);
      if (sortBy === "lamasia_asc") return (a.lamasiaYear || 0) - (b.lamasiaYear || 0);
      if (sortBy === "apps_desc") {
        const aApps = (a.preSeasons || []).reduce((s, ps) => s + (ps.appearances || 0), 0);
        const bApps = (b.preSeasons || []).reduce((s, ps) => s + (ps.appearances || 0), 0);
        return bApps - aApps;
      }
      return 0;
    });
  }, [players, selectedPosition, selectedStatus, selectedNationality, searchQuery, sortBy]);

  // Quick stats count
  const promotedCount = useMemo(() => players.filter((p) => p.currentStatus === "promoted").length, [players]);
  const academyCount = useMemo(() => players.filter((p) => p.currentStatus === "barca_atletic" || p.currentStatus === "juvenil_a" || p.currentStatus === "academy").length, [players]);
  const loanedCount = useMemo(() => players.filter((p) => p.currentStatus === "loaned").length, [players]);

  const hasActiveFilters = selectedPosition !== "ALL" || selectedStatus !== "ALL" || selectedNationality !== "ALL" || searchQuery !== "";

  const clearAllFilters = () => {
    setSelectedPosition("ALL");
    setSelectedStatus("ALL");
    setSelectedNationality("ALL");
    setSearchQuery("");
    setSortBy("name_asc");
  };

  return (
    <div className="min-h-screen pb-20">
      {/* ─── Header Section ─── */}
      <div
        className="relative overflow-hidden"
        style={{
          paddingTop: "90px",
          background: "linear-gradient(160deg, rgba(0,77,152,0.18) 0%, rgba(6,6,15,0.95) 100%)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {/* Ambient glow */}
        <div
          className="hero-orb w-[400px] h-[400px] opacity-15 animate-float pointer-events-none"
          style={{
            background: "var(--barca-navy)",
            top: "10%",
            right: "-5%",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-white/10 text-xs font-semibold text-[var(--barca-gold)] mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--barca-gold)] animate-pulse-glow" />
                La Masia Directory
              </div>
              <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
                ทำเนียบนักเตะทั้งหมด
              </h1>
              <p className="text-[var(--text-secondary)] text-sm sm:text-base mt-2 max-w-2xl">
                รายชื่อนักเตะดาวรุ่งจากสถาบัน La Masia ทุกรุ่น ทั้งที่ขึ้นสู่ทีมชุดใหญ่และกำลังพัฒนาฝีเท้าในอคาเดมี
              </p>
            </div>

            {/* Quick Filter Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedStatus("ALL")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  selectedStatus === "ALL"
                    ? "bg-white/15 text-white border-white/20 shadow-sm"
                    : "glass text-[var(--text-muted)] border-white/5 hover:text-white"
                }`}
              >
                ทั้งหมด ({players.length})
              </button>
              <button
                onClick={() => setSelectedStatus("promoted")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  selectedStatus === "promoted"
                    ? "bg-[var(--barca-crimson)] text-white border-[var(--barca-crimson-light)] shadow-md"
                    : "glass text-[var(--text-muted)] border-white/5 hover:text-white"
                }`}
              >
                ✦ First Team ({promotedCount})
              </button>
              <button
                onClick={() => setSelectedStatus("barca_atletic")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  selectedStatus === "barca_atletic"
                    ? "bg-[var(--barca-navy)] text-white border-[var(--barca-navy-light)] shadow-md"
                    : "glass text-[var(--text-muted)] border-white/5 hover:text-white"
                }`}
              >
                ◈ Barça Atlètic
              </button>
              <button
                onClick={() => setSelectedStatus("juvenil_a")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  selectedStatus === "juvenil_a"
                    ? "bg-purple-600 text-white border-purple-400 shadow-md"
                    : "glass text-[var(--text-muted)] border-white/5 hover:text-white"
                }`}
              >
                ❖ Juvenil A
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Sticky Filter & Controls Bar ─── */}
      <div
        className="sticky z-30"
        style={{
          top: "72px",
          backgroundColor: "var(--bg-dark)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="rounded-2xl glass-dark p-3.5 flex flex-col lg:flex-row items-stretch lg:items-center gap-3 border border-white/10">
            {/* Search Input */}
            <div className="relative flex-1">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--surface-3)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-xs sm:text-sm focus:outline-none focus:border-[var(--barca-gold)] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs p-1"
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
                variant="dark"
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
                variant="dark"
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
                variant="dark"
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
                  { value: "name_asc", label: "เรียงตาม: ชื่อ (A-Z)" },
                  { value: "name_desc", label: "เรียงตาม: ชื่อ (Z-A)" },
                  { value: "age_asc", label: "เรียงตาม: อายุน้อยสุด" },
                  { value: "age_desc", label: "เรียงตาม: อายุมากสุด" },
                  { value: "lamasia_desc", label: "เรียงตาม: เข้า La Masia ล่าสุด" },
                  { value: "apps_desc", label: "เรียงตาม: นัดที่ลงเล่นพรีซีซั่น" },
                ]}
                variant="dark"
                size="sm"
                className="flex-1 sm:flex-none"
                minMenuWidth="min-w-[210px]"
              />

              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center rounded-xl bg-[var(--surface-3)] p-1 border border-white/5">
                <button
                  onClick={() => handleViewModeChange("grid")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "grid" ? "bg-white/15 text-white" : "text-gray-400 hover:text-white"
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
                    viewMode === "table" ? "bg-white/15 text-white" : "text-gray-400 hover:text-white"
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
          <div className="mt-3 px-1 flex items-center justify-between flex-wrap gap-2 text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-2 flex-wrap">
              <span>
                แสดง <span className="text-white font-bold">{filteredPlayers.length}</span> จากทั้งหมด {players.length} คน
              </span>
              {selectedStatus !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[var(--barca-navy)]/30 border border-[var(--barca-navy-light)]/40 text-blue-200 text-[11px]">
                  สถานะ: {statuses.find(s => s.value === selectedStatus)?.label}
                </span>
              )}
              {selectedPosition !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/10 border border-white/20 text-white text-[11px]">
                  ตำแหน่ง: {positions.find(p => p.value === selectedPosition)?.label}
                </span>
              )}
              {selectedNationality !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-200 text-[11px]">
                  สัญชาติ: {selectedNationality}
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/10 border border-white/20 text-white text-[11px]">
                  คำค้น: &ldquo;{searchQuery}&rdquo;
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-[var(--barca-gold)] hover:text-white transition-colors underline cursor-pointer"
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
          <div className="text-center py-20 rounded-2xl glass border border-white/10 p-8">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">ไม่พบนักเตะที่ตรงกับเงื่อนไข</h3>
            <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto mb-6">
              ลองเปลี่ยนคำค้นหา หรือกดล้างตัวกรองเพื่อดูรายชื่อนักเตะทั้งหมดในสโมสร
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all hover:scale-105"
              style={{ background: "var(--gradient-barca)" }}
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
            {filteredPlayers.map((player, index) => (
              <PlayerCard key={player.id} player={player} delay={index * 40} />
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="rounded-2xl glass border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[var(--text-secondary)]">
                <thead className="text-xs uppercase bg-[var(--surface-3)]/80 text-[var(--text-muted)] border-b border-white/10">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-semibold">นักเตะ</th>
                    <th scope="col" className="px-6 py-4 font-semibold text-center">ตำแหน่ง</th>
                    <th scope="col" className="px-6 py-4 font-semibold text-center">อายุ</th>
                    <th scope="col" className="px-6 py-4 font-semibold text-center">สัญชาติ</th>
                    <th scope="col" className="px-6 py-4 font-semibold text-center">สถานะ</th>
                    <th scope="col" className="px-6 py-4 font-semibold text-center">พรีซีซั่น</th>
                    <th scope="col" className="px-6 py-4 font-semibold text-right">โปรไฟล์</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredPlayers.map((player) => {
                    const age = getAge(player.dateOfBirth);
                    const totalApps = (player.preSeasons || []).reduce((sum, ps) => sum + (ps.appearances || 0), 0);
                    const totalGoals = (player.preSeasons || []).reduce((sum, ps) => sum + (ps.goals || 0), 0);
                    const totalAssists = (player.preSeasons || []).reduce((sum, ps) => sum + (ps.assists || 0), 0);

                    return (
                      <tr key={player.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link href={`/players/${player.id}`} className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-[var(--surface-3)] border border-white/10 flex items-center justify-center">
                              {player.imageUrl ? (
                                <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover object-top" />
                              ) : (
                                <span className="text-xs font-bold text-white font-display">
                                  {player.name.slice(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-white group-hover:text-[var(--barca-gold)] transition-colors">
                                {player.name}
                              </div>
                              {player.jerseyNumber && (
                                <div className="text-[11px] text-[var(--barca-gold)] font-mono font-medium">
                                  #{player.jerseyNumber}
                                </div>
                              )}
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <PositionBadge position={player.position} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-white font-medium">
                          {age} ปี
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white">
                            <FlagIcon nationality={player.nationality} emoji={player.flagEmoji} />
                            <span>{player.nationality}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <StatusBadge status={player.currentStatus} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-xs">
                          {player.preSeasons && player.preSeasons.length > 0 ? (
                            <div className="font-medium text-white">
                              {totalApps} นัด · <span className="text-emerald-400 font-bold">{totalGoals}G</span> · <span className="text-blue-400 font-bold">{totalAssists}A</span>
                            </div>
                          ) : (
                            <span className="text-[var(--text-muted)] text-[11px]">- ยังไม่มีสถิติ -</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link
                            href={`/players/${player.id}`}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white glass hover:bg-[var(--surface-3)] border border-white/10 transition-all inline-flex items-center gap-1"
                          >
                            <span>ดูโปรไฟล์</span>
                            <span>→</span>
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
