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
    { value: "minutes", label: "เรียงตาม: นาทีลงเล่น (มากที่สุด)" },
    { value: "appearances", label: "เรียงตาม: นัดที่ลงเล่น (มากที่สุด)" },
    { value: "goals", label: "เรียงตาม: ประตูที่ทำได้ (มากที่สุด)" },
    { value: "position", label: "เรียงตาม: ผังตำแหน่ง (GK → FWD)" },
    { value: "name", label: "เรียงตาม: ชื่อนักเตะ (A-Z)" },
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
    if (statusParam && statuses.some((s) => s.value === statusParam)) {
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
    if (posParam && positions.some((p) => p.value === posParam)) {
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
    const seasons = selectedSeason === "ALL" ? allSeasons : [selectedSeason];
    return seasons
      .map((season) => {
        const seasonPlayers = filteredPlayers.filter(
          (p) => p.preSeasons && p.preSeasons.some((ps) => ps.season === season)
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
            if (bGoals + bAssists !== aGoals + aAssists)
              return bGoals + bAssists - (aGoals + aAssists);
            return (POSITION_ORDER[a.position] || 99) - (POSITION_ORDER[b.position] || 99);
          }

          if (sortBy === "appearances") {
            if (bApps !== aApps) return bApps - aApps;
            if (bMins !== aMins) return bMins - aMins;
            if (bGoals + bAssists !== aGoals + aAssists)
              return bGoals + bAssists - (aGoals + aAssists);
            return (POSITION_ORDER[a.position] || 99) - (POSITION_ORDER[b.position] || 99);
          }

          if (sortBy === "goals") {
            if (bGoals !== aGoals) return bGoals - aGoals;
            if (bAssists !== aAssists) return bAssists - aAssists;
            return bMins - aMins;
          }

          if (sortBy === "position") {
            const posDiff =
              (POSITION_ORDER[a.position] || 99) - (POSITION_ORDER[b.position] || 99);
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

  const clearAllFilters = () => {
    setSelectedStatus("ALL");
    setSelectedSeason("ALL");
    setSelectedPosition("ALL");
    setSearchQuery("");
    setSortBy("minutes");
  };

  return (
    <div className="min-h-screen pb-20 bg-[#F8FAFD]">
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/20 text-xs font-semibold text-[#CBD5E1] mb-3.5 shadow-md">
              <span className="flex items-center -space-x-0.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#A2001D] ring-1 ring-white/30" />
                <span className="w-2 h-2 rounded-full bg-[#004D98] ring-1 ring-white/30" />
              </span>
              <span>Pre-Season History & Timeline</span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
              Timeline ดาวรุ่ง La Masia
            </h1>
            <p className="text-[#94A3B8] text-sm sm:text-base mt-3.5 max-w-2xl leading-relaxed">
              บันทึกลำดับเหตุการณ์และรายชื่อนักเตะดาวรุ่งที่ได้รับโอกาสขึ้นฝึกซ้อมและลงแข่งขันกับทีมชุดใหญ่ในแต่ละช่วง Pre-Season
            </p>
          </div>
        </div>
      </div>

      {/* ─── Sticky Filter Bar (Light Glassmorphism) ─── */}
      <div className="sticky top-[72px] z-30 bg-white/95 backdrop-blur-md border-y border-gray-200/90 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                id="search-players"
                placeholder="ค้นหาชื่อนักเตะ หรือสัญชาติ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F8FAFD] border border-gray-200 text-[#0B1F40] placeholder-gray-400 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#004D98] focus:bg-white transition-all shadow-2xs"
              />
            </div>

            {/* Season Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto py-0.5">
              <button
                id="filter-season-all"
                onClick={() => setSelectedSeason("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedSeason === "ALL"
                    ? "bg-[#0B1F40] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0B1F40] bg-[#F8FAFD] border border-gray-200/70 hover:bg-gray-100"
                }`}
              >
                ทุกฤดูกาล
              </button>
              {allSeasons.map((season) => (
                <button
                  key={season}
                  id={`filter-season-${season.replace("/", "-")}`}
                  onClick={() => setSelectedSeason(season)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedSeason === season
                      ? "bg-[#004D98] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#0B1F40] bg-[#F8FAFD] border border-gray-200/70 hover:bg-gray-100"
                  }`}
                >
                  {season}
                </button>
              ))}
            </div>

            {/* Position Dropdown */}
            <CustomSelect
              id="filter-position"
              value={selectedPosition}
              onChange={(val) => setSelectedPosition(val as Position | "ALL")}
              options={positions.map((p) => ({ value: p.value, label: p.label }))}
              variant="light"
              size="sm"
              minMenuWidth="min-w-[150px]"
            />

            {/* Status Dropdown */}
            <CustomSelect
              id="filter-status"
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val as Status | "ALL")}
              options={statuses.map((s) => ({ value: s.value, label: s.label }))}
              variant="light"
              size="sm"
              minMenuWidth="min-w-[160px]"
            />

            {/* Sort Dropdown */}
            <CustomSelect
              id="filter-sort"
              value={sortBy}
              onChange={(val) => setSortBy(val as TimelineSortOption)}
              options={sortOptions.map((opt) => ({ value: opt.value, label: opt.label }))}
              variant="light"
              size="sm"
              minMenuWidth="min-w-[230px]"
            />
          </div>

          {/* Result Count & Active Filter Tags */}
          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2 text-xs text-[#64748B]">
            <div className="flex items-center gap-2 flex-wrap">
              <span>
                พบ <strong className="text-[#0B1F40] font-bold">{filteredPlayers.length}</strong> นักเตะ
              </span>
              {selectedStatus !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[#004D98] text-[11px] font-semibold">
                  สถานะ: {statuses.find((s) => s.value === selectedStatus)?.label}
                </span>
              )}
              {selectedSeason !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-[#A2001D] text-[11px] font-semibold">
                  ฤดูกาล: {selectedSeason}
                </span>
              )}
              {selectedPosition !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-[#0B1F40] text-[11px] font-semibold">
                  ตำแหน่ง: {positions.find((p) => p.value === selectedPosition)?.label}
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold">
                  ค้นหา: &ldquo;{searchQuery}&rdquo;
                </span>
              )}
            </div>

            {(selectedStatus !== "ALL" ||
              selectedSeason !== "ALL" ||
              selectedPosition !== "ALL" ||
              searchQuery ||
              sortBy !== "minutes") && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-semibold text-[#A2001D] hover:underline cursor-pointer"
              >
                ✕ ล้างตัวกรองทั้งหมด
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Timeline Content Area ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {groupedBySeason.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-xs">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-lg font-bold text-[#0B1F40]">ไม่พบนักเตะที่ตรงกับเงื่อนไข</p>
            <p className="text-sm text-[#64748B] mt-1">ลองเปลี่ยนตัวกรอง หรือค้นหาด้วยคำใหม่อีกครั้ง</p>
            <button
              onClick={clearAllFilters}
              className="mt-5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#004D98] hover:bg-[#A2001D] transition-colors shadow-sm"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}

        {groupedBySeason.map((group) => (
          <section
            key={group.season}
            id={`season-${group.season.replace("/", "-")}`}
            className="relative"
          >
            {/* Season Header with Style A Dual Stripes */}
            <div className="flex items-center gap-3.5 mb-7">
              <div className="flex-shrink-0 w-1.5 h-12 rounded-full overflow-hidden flex flex-col shadow-xs">
                <div className="flex-1 bg-[#004D98]" />
                <div className="flex-1 bg-[#A2001D]" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="font-display font-black text-2xl sm:text-3xl text-[#0B1F40] tracking-tight">
                    Pre-Season {group.season}
                  </h2>
                  <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-md bg-[#0B1F40] text-white">
                    {group.players.length} นักเตะ
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                  นักเตะจาก La Masia ที่ได้รับโอกาสติดทัพช่วงพรีซีซั่นฤดูกาล {group.season}
                </p>
              </div>
              <div
                className="flex-1 h-px ml-4 hidden sm:block"
                style={{
                  background: "linear-gradient(90deg, rgba(0,77,152,0.25), transparent)",
                }}
              />
            </div>

            {/* Players Grid with Style A Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
              {group.players.map((player, i) => (
                <PlayerCard key={player.id} player={player} delay={i * 50} />
              ))}
            </div>
          </section>
        ))}

        {/* Players without pre-season records yet (Academy talents) */}
        {selectedSeason === "ALL" && playersWithoutPreseason.length > 0 && (
          <section id="academy-talents" className="relative pt-12 border-t border-gray-200/90">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-7">
              <div className="flex items-center gap-3.5">
                <div className="flex-shrink-0 w-1.5 h-12 rounded-full bg-[#EDBB00] shadow-xs" />
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-display font-black text-2xl sm:text-3xl text-[#0B1F40] tracking-tight">
                      ดาวรุ่งในสถาบัน (รอโอกาส Pre-Season)
                    </h2>
                    <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-md bg-[#EDBB00] text-[#0B1F40]">
                      {playersWithoutPreseason.length} นักเตะ
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                    นักเตะเยาวชนในระบบที่กำลังรอโอกาสขึ้นฝึกซ้อมกับทีมชุดใหญ่
                  </p>
                </div>
              </div>
              <Link
                href="/players"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004D98] hover:text-[#A2001D] bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-xs hover:shadow-sm transition-all group"
              >
                <span>ดูทำเนียบนักเตะทั้งหมด</span>
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
              {playersWithoutPreseason.map((player, i) => (
                <PlayerCard key={player.id} player={player} delay={i * 50} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
