"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Player, Position, Status } from "@/types/player";
import PlayerCard from "@/app/components/PlayerCard";
import { CustomSelect } from "@/app/components/CustomSelect";

export default function TimelineClient({ players }: { players: Player[] }) {
  const searchParams = useSearchParams();

  // Build seasons list
  const allSeasons = [
    ...new Set(players.flatMap((p) => (p.preSeasons || []).map((ps) => ps.season))),
  ].sort((a, b) => b.localeCompare(a));

const positions: { value: Position | "ALL"; label: string }[] = [
  { value: "ALL", label: "ทุกตำแหน่ง" },
  { value: "GK", label: "ผู้รักษาประตู" },
  { value: "DEF", label: "กองหลัง" },
  { value: "MID", label: "กองกลาง" },
  { value: "FWD", label: "กองหน้า" },
];

const statuses: { value: Status | "ALL"; label: string }[] = [
  { value: "ALL", label: "ทุกสถานะ" },
  { value: "promoted", label: "First Team ✦" },
  { value: "barca_atletic", label: "Barça Atlètic ◈" },
  { value: "juvenil_a", label: "Juvenil (U19) ❖" },
  { value: "loaned", label: "Loaned ↗" },
  { value: "released", label: "Released ×" },
  { value: "transferred", label: "Transferred ⇆" },
];

const seasonColors: Record<string, { bg: string; accent: string }> = {
  "2026/27": { bg: "rgba(162, 0, 29, 0.08)", accent: "#A2001D" },
  "2025/26": { bg: "rgba(0, 77, 152, 0.08)", accent: "#004D98" },
  "2024/25": { bg: "rgba(139, 92, 246, 0.08)", accent: "#8B5CF6" },
  "2023/24": { bg: "rgba(237, 187, 0, 0.08)", accent: "#EDBB00" },
};

const POSITION_ORDER: Record<string, number> = {
  GK: 1,
  DEF: 2,
  CB: 2,
  LB: 2,
  RB: 2,
  MID: 3,
  CDM: 3,
  CM: 3,
  CAM: 3,
  FWD: 4,
  LW: 4,
  RW: 4,
  ST: 4,
};

type TimelineSortOption = "minutes" | "appearances" | "goals" | "position" | "name";

const sortOptions: { value: TimelineSortOption; label: string }[] = [
  { value: "minutes", label: "⏱️ นาทีที่ลงเล่น (มากสุด)" },
  { value: "appearances", label: "🏟️ นัดที่ลงเล่น (มากสุด)" },
  { value: "goals", label: "⚽ ประตู (มากสุด)" },
  { value: "position", label: "🛡️ ผังตำแหน่ง (GK → FWD)" },
  { value: "name", label: "🔤 ชื่อนักเตะ (A-Z)" },
];

  const initialStatus = (searchParams.get("status") as Status) || "ALL";
  const initialSeason = searchParams.get("season") || "ALL";
  const initialPos = (searchParams.get("position") as Position) || "ALL";
  const initialQ = searchParams.get("q") || "";

  const [selectedSeason, setSelectedSeason] = useState<string>(initialSeason);
  const [selectedPosition, setSelectedPosition] = useState<Position | "ALL">(initialPos);
  const [selectedStatus, setSelectedStatus] = useState<Status | "ALL">(initialStatus);
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [sortBy, setSortBy] = useState<TimelineSortOption>("minutes");

  // Sync state if URL query params change (e.g. user navigates from homepage links)
  useEffect(() => {
    const statusParam = searchParams.get("status") as Status | null;
    if (statusParam && (statuses.some(s => s.value === statusParam))) {
      setSelectedStatus(statusParam);
    } else if (!statusParam) {
      setSelectedStatus("ALL");
    }

    const seasonParam = searchParams.get("season");
    if (seasonParam && (seasonParam === "ALL" || allSeasons.includes(seasonParam))) {
      setSelectedSeason(seasonParam);
    } else if (!seasonParam) {
      setSelectedSeason("ALL");
    }

    const posParam = searchParams.get("position") as Position | null;
    if (posParam && (positions.some(p => p.value === posParam))) {
      setSelectedPosition(posParam);
    }

    const qParam = searchParams.get("q");
    if (qParam !== null) {
      setSearchQuery(qParam);
    }
  }, [searchParams, allSeasons]);

  const filteredBySeason = useMemo(() => {
    if (selectedSeason === "ALL") return players;
    return players.filter((p) =>
      (p.preSeasons || []).some((ps) => ps.season === selectedSeason)
    );
  }, [selectedSeason, players]);

  const filteredPlayers = useMemo(() => {
    return filteredBySeason.filter((p) => {
      const posMatch = selectedPosition === "ALL" || p.position === selectedPosition;
      const statusMatch = selectedStatus === "ALL" || p.currentStatus === selectedStatus;
      const searchMatch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nationality.toLowerCase().includes(searchQuery.toLowerCase());
      return posMatch && statusMatch && searchMatch;
    });
  }, [filteredBySeason, selectedPosition, selectedStatus, searchQuery]);

  // Group by season and sort players within each season based on pre-season stats
  const groupedBySeason = useMemo(() => {
    const seasons =
      selectedSeason === "ALL" ? allSeasons : [selectedSeason];
    return seasons
      .map((season) => {
        const seasonPlayers = filteredPlayers.filter((p) =>
          p.preSeasons && p.preSeasons.some((ps) => ps.season === season)
        );

        // Sort players within this specific season
        seasonPlayers.sort((a, b) => {
          const aPs = a.preSeasons?.find((ps) => ps.season === season);
          const bPs = b.preSeasons?.find((ps) => ps.season === season);

          const aMins = aPs?.minutesPlayed ?? 0;
          const bMins = bPs?.minutesPlayed ?? 0;
          const aApps = aPs?.appearances ?? 0;
          const bApps = bPs?.appearances ?? 0;
          const aGoals = aPs?.goals ?? 0;
          const bGoals = bPs?.goals ?? 0;
          const aAssists = aPs?.assists ?? 0;
          const bAssists = bPs?.assists ?? 0;

          if (sortBy === "minutes") {
            if (bMins !== aMins) return bMins - aMins;
            if (bApps !== aApps) return bApps - aApps;
            if ((bGoals + bAssists) !== (aGoals + aAssists)) return (bGoals + bAssists) - (aGoals + aAssists);
            return (POSITION_ORDER[a.position] || 99) - (POSITION_ORDER[b.position] || 99);
          }

          if (sortBy === "appearances") {
            if (bApps !== aApps) return bApps - aApps;
            if (bMins !== aMins) return bMins - aMins;
            if ((bGoals + bAssists) !== (aGoals + aAssists)) return (bGoals + bAssists) - (aGoals + aAssists);
            return (POSITION_ORDER[a.position] || 99) - (POSITION_ORDER[b.position] || 99);
          }

          if (sortBy === "goals") {
            if (bGoals !== aGoals) return bGoals - aGoals;
            if (bAssists !== aAssists) return bAssists - aAssists;
            return bMins - aMins;
          }

          if (sortBy === "position") {
            const posDiff = (POSITION_ORDER[a.position] || 99) - (POSITION_ORDER[b.position] || 99);
            if (posDiff !== 0) return posDiff;
            return bMins - aMins;
          }

          if (sortBy === "name") {
            return a.name.localeCompare(b.name);
          }

          return 0;
        });

        return {
          season,
          players: seasonPlayers,
        };
      })
      .filter((group) => group.players.length > 0);
  }, [filteredPlayers, selectedSeason, allSeasons, sortBy]);

  const playersWithoutPreseason = useMemo(() => {
    return filteredPlayers.filter((p) => !p.preSeasons || p.preSeasons.length === 0);
  }, [filteredPlayers]);

  return (
    <div className="min-h-screen pb-16">

      {/* ─── Page header ─── starts exactly at navbar bottom */}
      <div
        style={{
          paddingTop: "72px",        /* exact navbar height */
          background: "linear-gradient(to bottom, rgba(0,77,152,0.12) 0%, transparent 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-[var(--barca-gold)] mb-3">
            ◈ Pre-Season History
          </p>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-white mb-3">
            Timeline ดาวรุ่ง La Masia
          </h1>
          <p className="text-[var(--text-muted)] text-lg">
            นักเตะที่ขึ้น pre-season กับทีมชุดใหญ่ในแต่ละฤดูกาล
          </p>
        </div>
      </div>

      {/* ─── Sticky filter bar ─── sticks just below navbar after page header scrolls away */}
      <div
        className="sticky z-30"
        style={{
          top: "72px",
          backgroundColor: "var(--bg-dark)",
          borderTop: "1px solid var(--border-subtle)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">

          <div className="rounded-2xl glass-dark p-4 flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                id="search-players"
                placeholder="ค้นหาชื่อนักเตะ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--surface-3)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-[var(--barca-navy)] transition-colors"
              />
            </div>

            {/* Season filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[var(--text-muted)] font-medium">Season:</span>
              <button
                id="filter-season-all"
                onClick={() => setSelectedSeason("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedSeason === "ALL"
                    ? "bg-white/10 text-white"
                    : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                ทั้งหมด
              </button>
              {allSeasons.map((season) => {
                const color = seasonColors[season];
                return (
                  <button
                    key={season}
                    id={`filter-season-${season.replace("/", "-")}`}
                    onClick={() => setSelectedSeason(season)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedSeason === season
                        ? "text-white"
                        : "text-[var(--text-muted)] hover:text-white"
                    }`}
                    style={
                      selectedSeason === season && color
                        ? { background: color.accent, color: "white" }
                        : {}
                    }
                  >
                    {season}
                  </button>
                );
              })}
            </div>

            {/* Position filter */}
            <CustomSelect
              id="filter-position"
              value={selectedPosition}
              onChange={(val) => setSelectedPosition(val as Position | "ALL")}
              options={positions.map((p) => ({ value: p.value, label: p.label }))}
              variant="dark"
              size="sm"
              minMenuWidth="min-w-[160px]"
            />

            {/* Status filter */}
            <CustomSelect
              id="filter-status"
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val as Status | "ALL")}
              options={statuses.map((s) => ({ value: s.value, label: s.label }))}
              variant="dark"
              size="sm"
              minMenuWidth="min-w-[170px]"
            />

            {/* Sort By Filter */}
            <CustomSelect
              id="filter-sort"
              value={sortBy}
              onChange={(val) => setSortBy(val as TimelineSortOption)}
              options={sortOptions.map((opt) => ({ value: opt.value, label: opt.label }))}
              variant="dark"
              size="sm"
              minMenuWidth="min-w-[220px]"
            />
          </div>

          {/* Result count & Active Filter Pills */}
          <div className="mt-3 px-1 flex items-center justify-between flex-wrap gap-2 text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-2 flex-wrap">
              <span>
                พบ <span className="text-white font-semibold">{filteredPlayers.length}</span> นักเตะ
              </span>
              {selectedStatus !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[var(--barca-navy)]/30 border border-[var(--barca-navy-light)]/40 text-blue-200 text-[11px]">
                  สถานะ: {statuses.find(s => s.value === selectedStatus)?.label}
                </span>
              )}
              {selectedSeason !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[var(--barca-crimson)]/30 border border-[var(--barca-crimson-light)]/40 text-red-200 text-[11px]">
                  ฤดูกาล: {selectedSeason}
                </span>
              )}
              {selectedPosition !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/10 border border-white/20 text-white text-[11px]">
                  ตำแหน่ง: {positions.find(p => p.value === selectedPosition)?.label}
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/10 border border-white/20 text-white text-[11px]">
                  ค้นหา: &ldquo;{searchQuery}&rdquo;
                </span>
              )}
            </div>

            {(selectedStatus !== "ALL" || selectedSeason !== "ALL" || selectedPosition !== "ALL" || searchQuery || sortBy !== "minutes") && (
              <button
                onClick={() => {
                  setSelectedStatus("ALL");
                  setSelectedSeason("ALL");
                  setSelectedPosition("ALL");
                  setSearchQuery("");
                  setSortBy("minutes");
                }}
                className="text-xs text-[var(--barca-gold)] hover:text-white transition-colors underline cursor-pointer"
              >
                ✕ ล้างตัวกรองทั้งหมด
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Timeline groups */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        {groupedBySeason.length === 0 && (
          <div className="text-center py-24 text-[var(--text-muted)]">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-medium text-white">ไม่พบนักเตะที่ตรงกัน</p>
            <p className="text-sm mt-2">ลองเปลี่ยน filter หรือค้นหาด้วยคำอื่น</p>
          </div>
        )}

        {groupedBySeason.map((group) => {
          const color = seasonColors[group.season];
          return (
            <section
              key={group.season}
              id={`season-${group.season.replace("/", "-")}`}
              className="relative"
            >
              {/* Season header */}
              <div className="flex items-center gap-4 mb-8">
                <div
                  className="flex-shrink-0 w-1 h-16 rounded-full"
                  style={{ background: color?.accent ?? "var(--barca-crimson)" }}
                />
                <div>
                  <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
                    Pre-Season {group.season}
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    {group.players.length} นักเตะ La Masia ร่วม pre-season
                  </p>
                </div>
                <div className="flex-1 h-px ml-4" style={{
                  background: `linear-gradient(90deg, ${color?.accent ?? "var(--barca-crimson)"}, transparent)`,
                  opacity: 0.3,
                }} />
              </div>

              {/* Players grid — items-stretch so cards in the same row are same height */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
                {group.players.map((player, i) => (
                  <PlayerCard key={player.id} player={player} delay={i * 60} />
                ))}
              </div>
            </section>
          );
        })}

        {/* Players without pre-season records yet (Academy talents) */}
        {selectedSeason === "ALL" && playersWithoutPreseason.length > 0 && (
          <section id="academy-talents" className="relative pt-10 border-t border-white/10">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div
                  className="flex-shrink-0 w-1 h-16 rounded-full"
                  style={{ background: "var(--barca-gold)" }}
                />
                <div>
                  <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
                    ดาวรุ่งในสถาบัน (รอโอกาส Pre-Season)
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    {playersWithoutPreseason.length} นักเตะเยาวชนในระบบที่กำลังรอโอกาสขึ้นฝึกซ้อมกับทีมชุดใหญ่
                  </p>
                </div>
              </div>
              <Link
                href="/players"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--barca-gold)] hover:text-white glass px-4 py-2 rounded-xl border border-[var(--barca-gold)]/20 transition-all hover:bg-[var(--surface-3)]"
              >
                <span>ดูทำเนียบนักเตะทั้งหมด</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
              {playersWithoutPreseason.map((player, i) => (
                <PlayerCard key={player.id} player={player} delay={i * 60} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
