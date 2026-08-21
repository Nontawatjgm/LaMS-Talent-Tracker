"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Player } from "@/types/player";
import PlayerCard from "@/app/components/PlayerCard";

export default function TimelineClient({ players }: { players: Player[] }) {
  const searchParams = useSearchParams();

  // Build seasons list sorted descending
  const allSeasons = useMemo(() => {
    return [
      ...new Set(players.flatMap((p) => (p.preSeasons || []).map((ps) => ps.season))),
    ].sort((a, b) => b.localeCompare(a));
  }, [players]);

  const initialSeason = searchParams.get("season") || "ALL";
  const [selectedSeason, setSelectedSeason] = useState<string>(initialSeason);

  // Sync state if URL query params change
  useEffect(() => {
    const seasonParam = searchParams.get("season");
    if (seasonParam && (seasonParam === "ALL" || allSeasons.includes(seasonParam))) {
      setSelectedSeason(seasonParam);
    } else if (!seasonParam) {
      setSelectedSeason("ALL");
    }
  }, [searchParams, allSeasons]);

  // Group by season and sort players within each season by pre-season minutes played
  const groupedBySeason = useMemo(() => {
    const seasons = selectedSeason === "ALL" ? allSeasons : [selectedSeason];
    return seasons
      .map((season) => {
        const seasonPlayers = players.filter(
          (p) => p.preSeasons && p.preSeasons.some((ps) => ps.season === season)
        );

        // Sort players within this specific season by minutes played
        seasonPlayers.sort((a, b) => {
          const aPs = a.preSeasons?.find((ps) => ps.season === season);
          const bPs = b.preSeasons?.find((ps) => ps.season === season);

          const aMins = aPs?.minutesPlayed ?? 0;
          const bMins = bPs?.minutesPlayed ?? 0;
          const aApps = aPs?.appearances ?? 0;
          const bApps = bPs?.appearances ?? 0;
          const aGoals = (aPs?.goals ?? 0) + (aPs?.assists ?? 0);
          const bGoals = (bPs?.goals ?? 0) + (bPs?.assists ?? 0);

          if (bMins !== aMins) return bMins - aMins;
          if (bApps !== aApps) return bApps - aApps;
          if (bGoals !== aGoals) return bGoals - aGoals;
          return a.name.localeCompare(b.name);
        });

        return {
          season,
          players: seasonPlayers,
        };
      })
      .filter((group) => group.players.length > 0);
  }, [players, selectedSeason, allSeasons]);

  // Players without pre-season records yet (Academy talents)
  const playersWithoutPreseason = useMemo(() => {
    return players.filter((p) => !p.preSeasons || p.preSeasons.length === 0);
  }, [players]);

  const totalDisplayedPlayers = useMemo(() => {
    if (selectedSeason === "ALL") return players.length;
    return (
      groupedBySeason.find((g) => g.season === selectedSeason)?.players.length ?? 0
    );
  }, [players, selectedSeason, groupedBySeason]);

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
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
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
                บันทึกลำดับประวัติศาสตร์และเส้นทางของดาวรุ่งที่ได้รับโอกาสร่วมฝึกซ้อมและลงแข่งขันกับทีมชุดใหญ่ในแต่ละช่วง Pre-Season
              </p>
            </div>

            {/* Quick Link to Detailed Directory */}
            <div className="flex items-center gap-3">
              <Link
                href="/players"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-white/[0.08] hover:bg-white/15 border border-white/20 backdrop-blur-md transition-all shadow-xs group"
              >
                <span>ค้นหาละเอียดในทำเนียบนักเตะ</span>
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Sticky Season Navigator (Clean Option A) ─── */}
      <div className="sticky top-[72px] z-30 bg-white/95 backdrop-blur-md border-y border-gray-200/90 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Season Scroller Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto py-0.5">
              <span className="text-xs text-[#64748B] font-semibold mr-1 hidden sm:inline">
                เลือกฤดูกาล:
              </span>
              <button
                id="filter-season-all"
                onClick={() => setSelectedSeason("ALL")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedSeason === "ALL"
                    ? "bg-[#0B1F40] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0B1F40] bg-[#F8FAFD] border border-gray-200/70 hover:bg-gray-100"
                }`}
              >
                ทุกฤดูกาล ({allSeasons.length})
              </button>
              {allSeasons.map((season) => (
                <button
                  key={season}
                  id={`filter-season-${season.replace("/", "-")}`}
                  onClick={() => setSelectedSeason(season)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedSeason === season
                      ? "bg-[#004D98] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#0B1F40] bg-[#F8FAFD] border border-gray-200/70 hover:bg-gray-100"
                  }`}
                >
                  {season}
                </button>
              ))}
            </div>

            {/* Quick Status Count */}
            <div className="flex items-center gap-3 text-xs text-[#64748B]">
              <span>
                แสดง <strong className="text-[#0B1F40] font-bold">{totalDisplayedPlayers}</strong> นักเตะ
              </span>
              {selectedSeason !== "ALL" && (
                <button
                  onClick={() => setSelectedSeason("ALL")}
                  className="font-semibold text-[#A2001D] hover:underline cursor-pointer"
                >
                  ✕ ดูทั้งหมด
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Timeline Content Area ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {groupedBySeason.map((group) => (
          <section
            key={group.season}
            id={`season-${group.season.replace("/", "-")}`}
            className="relative scroll-mt-32"
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
                  นักเตะจาก La Masia ที่ได้รับโอกาสติดทัพช่วงพรีซีซั่นประจำฤดูกาล {group.season}
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
                <PlayerCard key={player.id} player={player} delay={i * 40} />
              ))}
            </div>
          </section>
        ))}

        {/* Players without pre-season records yet (Academy talents) */}
        {selectedSeason === "ALL" && playersWithoutPreseason.length > 0 && (
          <section id="academy-talents" className="relative pt-12 border-t border-gray-200/90 scroll-mt-32">
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
                <PlayerCard key={player.id} player={player} delay={i * 40} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
