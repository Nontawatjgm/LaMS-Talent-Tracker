import Link from "next/link";
import { getPlayers } from "@/app/utils/supabase/queries";
import type { Player } from "@/types/player";
import StatsBar from "./components/StatsBar";
import PlayerCard from "./components/PlayerCard";
import { StatusBadge, PositionBadge } from "./components/StatusBadge";
import { FlagIcon } from "./components/FlagIcon";

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

function sortPlayersLikeTimeline(playersList: Player[], targetSeason?: string) {
  return [...playersList].sort((a, b) => {
    const aPs = targetSeason
      ? a.preSeasons?.find((ps) => ps.season === targetSeason)
      : a.preSeasons?.slice().sort((x, y) => y.year - x.year)[0];
    const bPs = targetSeason
      ? b.preSeasons?.find((ps) => ps.season === targetSeason)
      : b.preSeasons?.slice().sort((x, y) => y.year - x.year)[0];

    // If comparing without specific target season, sort by latest year first
    if (!targetSeason) {
      const aYear = aPs?.year ?? 0;
      const bYear = bPs?.year ?? 0;
      if (bYear !== aYear) return bYear - aYear;
    }

    const aMins = aPs?.minutesPlayed ?? 0;
    const bMins = bPs?.minutesPlayed ?? 0;
    if (bMins !== aMins) return bMins - aMins;

    const aApps = aPs?.appearances ?? 0;
    const bApps = bPs?.appearances ?? 0;
    if (bApps !== aApps) return bApps - aApps;

    const aGA = (aPs?.goals ?? 0) + (aPs?.assists ?? 0);
    const bGA = (bPs?.goals ?? 0) + (bPs?.assists ?? 0);
    if (bGA !== aGA) return bGA - aGA;

    const posDiff = (POSITION_ORDER[a.position] || 99) - (POSITION_ORDER[b.position] || 99);
    if (posDiff !== 0) return posDiff;

    return a.name.localeCompare(b.name);
  });
}

export default async function HomePage() {
  const players = await getPlayers();

  // All seasons sorted descending
  const allSeasons = [
    ...new Set(players.flatMap((p) => (p.preSeasons || []).map((ps) => ps.season))),
  ].sort((a, b) => b.localeCompare(a));
  const latestSeason = allSeasons[0] || "";

  // Promoted players sorted by minutes & appearances like Timeline
  const promotedList = players.filter((p) => p.currentStatus === "promoted");
  const featuredPlayers = sortPlayersLikeTimeline(promotedList).slice(0, 4);

  // Most recent pre-season players sorted by minutes & appearances like Timeline
  const playersWithPreseason = players.filter(
    (p) => p.preSeasons && p.preSeasons.length > 0
  );
  const recentPlayers = sortPlayersLikeTimeline(
    playersWithPreseason,
    latestSeason || undefined
  ).slice(0, 8);

  // Top performers of the latest season (Strictly 3 Unique Players ordered: 1. Minutes, 2. Goals, 3. Standout)
  const latestSeasonPlayers = players.filter((p) =>
    p.preSeasons?.some((ps) => ps.season === latestSeason)
  );

  // 1. First Player: Most Minutes in latest season
  const sortedByMinutes = [...latestSeasonPlayers].sort((a, b) => {
    const aPs = a.preSeasons?.find((ps) => ps.season === latestSeason);
    const bPs = b.preSeasons?.find((ps) => ps.season === latestSeason);
    const aMin = aPs?.minutesPlayed ?? 0;
    const bMin = bPs?.minutesPlayed ?? 0;
    if (bMin !== aMin) return bMin - aMin;
    return (bPs?.appearances ?? 0) - (aPs?.appearances ?? 0);
  });
  const firstPlayer = sortedByMinutes[0];

  // 2. Second Player: Most Goals (excluding first player)
  const remainingForSecond = latestSeasonPlayers.filter((p) => p.id !== firstPlayer?.id);
  const sortedByGoals = [...remainingForSecond].sort((a, b) => {
    const aPs = a.preSeasons?.find((ps) => ps.season === latestSeason);
    const bPs = b.preSeasons?.find((ps) => ps.season === latestSeason);
    const aG = aPs?.goals ?? 0;
    const bG = bPs?.goals ?? 0;
    if (bG !== aG) return bG - aG;
    const aGA = aG + (aPs?.assists ?? 0);
    const bGA = bG + (bPs?.assists ?? 0);
    if (bGA !== aGA) return bGA - aGA;
    return (bPs?.minutesPlayed ?? 0) - (aPs?.minutesPlayed ?? 0);
  });
  const secondPlayer = sortedByGoals[0];

  // 3. Third Player: Remaining Standout (Goals -> Assists -> Minutes)
  const remainingForThird = latestSeasonPlayers.filter(
    (p) => p.id !== firstPlayer?.id && p.id !== secondPlayer?.id
  );
  const sortedForThird = [...remainingForThird].sort((a, b) => {
    const aPs = a.preSeasons?.find((ps) => ps.season === latestSeason);
    const bPs = b.preSeasons?.find((ps) => ps.season === latestSeason);
    const aG = aPs?.goals ?? 0;
    const bG = bPs?.goals ?? 0;
    if (bG !== aG) return bG - aG;
    const aA = aPs?.assists ?? 0;
    const bA = bPs?.assists ?? 0;
    if (bA !== aA) return bA - aA;
    return (bPs?.minutesPlayed ?? 0) - (aPs?.minutesPlayed ?? 0);
  });
  const thirdPlayer = sortedForThird[0];

  const top3Performers = [firstPlayer, secondPlayer, thirdPlayer].filter(
    (p): p is Player => Boolean(p)
  );

  // Compare preview candidates
  const comparePlayer1 = featuredPlayers[0] || players[0];
  const comparePlayer2 = featuredPlayers[1] || recentPlayers[0] || players[1];

  return (
    <div className="relative">
      {/* ===== HERO SECTION — Modern Stadium Mesh Masterpiece ===== */}
      <section
        className="relative min-h-screen flex flex-col overflow-hidden"
        style={{
          background: "radial-gradient(circle at 50% 12%, #071942 0%, #030A1C 50%, #02050E 100%)",
        }}
      >
        {/* Soft Stadium Floodlight Rays (Silky, no hexagons) */}
        <div
          className="absolute -top-24 -left-24 w-[700px] h-[800px] pointer-events-none opacity-50"
          style={{
            background:
              "conic-gradient(from 125deg at 0% 0%, rgba(0, 120, 255, 0.4) 0deg, rgba(0, 77, 152, 0.18) 30deg, transparent 60deg)",
            filter: "blur(35px)",
          }}
        />
        <div
          className="absolute -top-24 -right-24 w-[700px] h-[800px] pointer-events-none opacity-50"
          style={{
            background:
              "conic-gradient(from 195deg at 100% 0%, rgba(225, 29, 72, 0.4) 0deg, rgba(162, 0, 29, 0.18) 30deg, transparent 60deg)",
            filter: "blur(35px)",
          }}
        />

        {/* Fluid Floating Mesh Blobs (Blaugrana & Gold) */}
        <div
          className="absolute top-[5%] -left-[10%] w-[650px] h-[650px] rounded-full pointer-events-none opacity-35 animate-float"
          style={{
            background:
              "radial-gradient(circle at center, rgba(0, 100, 255, 0.45) 0%, rgba(0, 77, 152, 0.2) 50%, transparent 70%)",
            filter: "blur(70px)",
            animationDuration: "11s",
          }}
        />
        <div
          className="absolute top-[8%] -right-[10%] w-[650px] h-[650px] rounded-full pointer-events-none opacity-35 animate-float"
          style={{
            background:
              "radial-gradient(circle at center, rgba(225, 29, 72, 0.45) 0%, rgba(162, 0, 29, 0.2) 50%, transparent 70%)",
            filter: "blur(70px)",
            animationDuration: "13s",
            animationDelay: "2.5s",
          }}
        />

        {/* Central Golden Aura on Title */}
        <div
          className="absolute top-[32%] left-1/2 -translate-x-1/2 w-[700px] h-[450px] rounded-full pointer-events-none opacity-35 animate-float"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(237, 187, 0, 0.3) 0%, rgba(0, 77, 152, 0.15) 50%, transparent 75%)",
            filter: "blur(55px)",
            animationDuration: "9s",
            animationDelay: "4s",
          }}
        />

        {/* Camp Nou Pitch Center Circle Arc (วงกลมสนามเรืองแสง) */}
        <div
          className="absolute top-[50%] left-1/2 -translate-x-1/2 w-[850px] h-[850px] rounded-full border border-white/[0.07] pointer-events-none"
          style={{
            boxShadow: "0 0 60px rgba(0, 77, 152, 0.15), inset 0 0 60px rgba(0, 77, 152, 0.08)",
          }}
        />
        <div
          className="absolute top-[50%] left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full border border-[var(--barca-gold)]/[0.1] pointer-events-none"
        />

        {/* Subtle Modern Dot-Matrix Grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.2]"
          style={{
            backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Safe top spacer */}
        <div className="flex-1 min-h-[120px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center shrink-0">
          {/* Eyebrow pill — Blaugrana Heritage */}
          <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-white/[0.07] backdrop-blur-md border border-white/15 text-xs sm:text-sm font-semibold text-[#CBD5E1] mb-6 shadow-md hover:border-white/25 transition-all">
            <span className="flex items-center -space-x-0.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A2001D] ring-1 ring-white/30" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#004D98] ring-1 ring-white/30" />
            </span>
            <span className="text-white font-bold tracking-wide">FC Barcelona</span>
            <span className="text-white/30">·</span>
            <span>La Masia Tracker</span>
            {latestSeason && (
              <>
                <span className="text-white/30 hidden sm:inline">·</span>
                <span className="text-[#EDBB00] font-bold hidden sm:inline">{latestSeason}</span>
              </>
            )}
          </div>

          {/* Main heading */}
          <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-9xl leading-[0.92] tracking-tight mb-6">
            <span className="gradient-text">La Masia</span>
            <br />
            <span className="text-white">Rising Stars</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-6 leading-relaxed">
            ติดตามนักเตะดาวรุ่งจากสถาบัน La Masia ที่ได้รับโอกาส
            <br className="hidden sm:block" />
            ขึ้นฝึกซ้อมกับทีมชุดใหญ่ช่วง{" "}
            <strong className="text-white font-bold">Pre-Season</strong> ในแต่ละปี
          </p>

          {/* Talent Avatar Stack Badge — Clickable Anchor */}
          {featuredPlayers.length > 0 && (
            <a
              href="#featured"
              id="hero-featured-pill"
              className="group inline-flex items-center gap-3 px-4 sm:px-5 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 hover:border-white/30 mb-8 backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <div className="flex -space-x-2 overflow-hidden items-center">
                {featuredPlayers.slice(0, 4).map((p, idx) => (
                  <div
                    key={p.id}
                    className="w-7 h-7 rounded-full ring-2 ring-[#0A1224] bg-[#0A1224] overflow-hidden shrink-0 shadow-xs relative"
                    style={{ zIndex: 10 - idx }}
                  >
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover object-top" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#004D98] to-[#A2001D] flex items-center justify-center text-[9px] font-bold text-white">
                        {p.name[0]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-xs text-[#CBD5E1] font-medium text-left flex items-center gap-1.5">
                <span>
                  <span className="text-white font-bold">{featuredPlayers.length} ดาวรุ่ง</span> ติดทีมชุดใหญ่แล้ว · จากทั้งหมด{" "}
                  <span className="text-[#EDBB00] font-bold">{players.length} คน</span>
                </span>
                <span className="text-white/40 group-hover:text-white group-hover:translate-y-0.5 transition-all text-xs">↓</span>
              </div>
            </a>
          )}

          {/* CTA Buttons */}
          <div className="relative z-20 flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              href="/timeline"
              id="cta-timeline"
              className="group px-8 py-4 rounded-2xl font-bold text-base text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(0,77,152,0.6)] flex items-center gap-2"
              style={{
                background: "linear-gradient(135deg, #A2001D 0%, #004D98 100%)",
                boxShadow: "0 0 35px rgba(162,0,29,0.4)",
              }}
            >
              <span>ดู Timeline ทั้งหมด</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
            <a
              href="#featured"
              id="cta-featured"
              className="px-8 py-4 rounded-2xl font-bold text-base text-[#CBD5E1] bg-white/[0.05] border border-white/15 hover:border-white/30 hover:bg-white/[0.1] hover:text-white shadow-md hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <span>ดูดาวรุ่งชุดใหญ่ (First Team)</span>
              <span className="text-sm">↓</span>
            </a>
          </div>

          {/* Stats Bar */}
          <StatsBar players={players} />
        </div>

        {/* Safe bottom spacer */}
        <div className="flex-1 min-h-[80px]" />

        {/* Bottom multi-stop fade to transition */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(6,6,15,0.4) 40%, #06060F 100%)",
          }}
        />
      </section>

      {/* ===== CAMP NOU GRAND ARCH DIVIDER — Hero → Light Canvas ===== */}
      <div className="relative h-20 sm:h-32 overflow-hidden -mt-px pointer-events-none z-10">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-full block"
        >
          <defs>
            {/* Pure Warm Barça Gold Stadium Arch Horizon */}
            <linearGradient id="campNouArchGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EDBB00" stopOpacity="0" />
              <stop offset="25%" stopColor="#EDBB00" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#EDBB00" stopOpacity="0.85" />
              <stop offset="75%" stopColor="#EDBB00" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#EDBB00" stopOpacity="0" />
            </linearGradient>
            <filter id="archGlow" x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* White Fill Path */}
          <path
            d="M0,0 Q600,95 1200,0 L1200,120 L0,120 Z"
            className="text-[#F8FAFD] fill-current"
          />

          {/* Pure Warm Barça Gold Stadium Curve Line */}
          <path
            d="M0,0 Q600,95 1200,0"
            fill="none"
            stroke="url(#campNouArchGlow)"
            strokeWidth="2.5"
            filter="url(#archGlow)"
          />
        </svg>
      </div>

      {/* ===== LIGHT SCOUTING DOSSIER CANVAS ===== */}
      <div className="bg-[#F8FAFD] text-[#0B1F40] relative -mt-px">
        {/* Subtle background grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.4]"
          style={{
            backgroundImage: "radial-gradient(rgba(0, 77, 152, 0.08) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* ===== SECTION 1: ⭐ FEATURED (PROMOTED) SECTION ===== */}
        <section id="featured" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 relative z-10">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-[#B45309] mb-2.5 flex items-center gap-2">
                <span className="w-4 h-0.5 bg-[#EDBB00]" />
                ความสำเร็จ · FIRST TEAM PROMOTIONS
              </p>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-[#0B1F40] section-heading-underline">
                โปรโมทสู่ทีมชุดใหญ่
              </h2>
              <p className="text-[#64748B] mt-4 text-base">
                นักเตะที่ผ่าน pre-season แล้วติดทีมชุดใหญ่ได้สำเร็จ
              </p>
            </div>
            <Link
              href="/players?status=promoted"
              id="view-all-promoted"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#004D98] hover:text-[#A2001D] transition-colors group self-start sm:self-auto"
            >
              <span>ดูทั้งหมด ({featuredPlayers.length})</span>
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </Link>
          </div>

          {featuredPlayers.length === 0 ? (
            <div className="rounded-2xl bg-white border border-gray-200 p-8 text-center text-[#64748B] text-sm shadow-xs">
              ยังไม่มีนักเตะในสถานะโปรโมทสู่ทีมชุดใหญ่
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
              {featuredPlayers.map((player, i) => (
                <PlayerCard key={player.id} player={player} delay={i * 100} theme="light" />
              ))}
            </div>
          )}
        </section>

        {/* ===== SECTION 2: 🔥 PRE-SEASON TOP PERFORMERS ===== */}
        {latestSeason && latestSeasonPlayers.length > 0 && (
          <section className="py-16 bg-gradient-to-b from-[#F0F5FD] to-[#F8FAFD] border-y border-[rgba(0,77,152,0.08)] relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-[#A2001D] mb-2.5 flex items-center gap-2">
                    <span className="w-4 h-0.5 bg-[#A2001D]" />
                    ดาวเด่นประจำปี · PRE-SEASON {latestSeason}
                  </p>
                  <h2 className="font-display font-black text-3xl sm:text-4xl text-[#0B1F40] section-heading-underline">
                    Top Performers
                  </h2>
                  <p className="text-[#64748B] mt-4 text-base">
                    3 ดาวรุ่งที่มีสถิติโดดเด่นที่สุดในแคมป์พรีซีซั่น {latestSeason}
                  </p>
                </div>
                <Link
                  href={`/timeline?season=${encodeURIComponent(latestSeason)}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#004D98] hover:text-[#A2001D] transition-colors group self-start sm:self-auto"
                >
                  <span>ดูตารางสถิติ {latestSeason}</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                </Link>
              </div>

              {/* 3 Top Performer Cards — Ordered: 1. Minutes, 2. Goals, 3. Standout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {top3Performers.map((player) => {
                  const stat = player.preSeasons?.find((ps) => ps.season === latestSeason);
                  const goals = stat?.goals ?? 0;
                  const assists = stat?.assists ?? 0;
                  const minutes = stat?.minutesPlayed ?? 0;
                  const apps = stat?.appearances ?? 0;

                  // Priority: Goals > 0 -> Goals; Assists > 0 -> Assists; Else -> Minutes (Standardized label)
                  let heroLabel = "เวลาลงสนาม (MINUTES PLAYED)";
                  let heroValue: string | number = `${minutes}'`;
                  let heroUnit = "นาที";
                  let heroUnitColor = "text-[#004D98]";
                  let secondaryStats: { value: string | number; label: string }[] = [
                    { value: apps, label: "แมตช์" },
                    { value: goals, label: "ประตู" },
                    { value: assists, label: "แอสซิสต์" },
                  ];

                  if (goals > 0) {
                    heroLabel = "ยิงประตู (GOALS)";
                    heroValue = goals;
                    heroUnit = "ประตู";
                    heroUnitColor = "text-emerald-600";
                    secondaryStats = [
                      { value: apps, label: "แมตช์" },
                      { value: `${minutes}'`, label: "นาที" },
                      { value: assists, label: "แอสซิสต์" },
                    ];
                  } else if (assists > 0) {
                    heroLabel = "แอสซิสต์ (ASSISTS)";
                    heroValue = assists;
                    heroUnit = "แอสซิสต์";
                    heroUnitColor = "text-blue-600";
                    secondaryStats = [
                      { value: apps, label: "แมตช์" },
                      { value: `${minutes}'`, label: "นาที" },
                      { value: goals, label: "ประตู" },
                    ];
                  }

                  return (
                    <Link
                      key={player.id}
                      href={`/players/${player.id}`}
                      className="block group h-full"
                    >
                      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/90 shadow-xs hover:shadow-2xl hover:border-[#004D98]/70 hover:-translate-y-1.5 transition-all duration-300 h-full min-h-[300px] flex flex-col justify-between relative overflow-hidden">
                        {/* Corner Blaugrana Tag */}
                        <div className="absolute top-0 right-0 flex h-3 w-10 overflow-hidden rounded-bl-lg pointer-events-none z-10">
                          <div className="w-1/2 h-full bg-[#004D98]" />
                          <div className="w-1/2 h-full bg-[#A2001D]" />
                        </div>

                        {/* Ambient Navy Hover Glow */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                          style={{
                            background:
                              "radial-gradient(circle at 50% 0%, rgba(0, 77, 152, 0.08) 0%, transparent 70%)",
                          }}
                        />

                        <div>
                          {/* Header: Avatar, Name & Position Badge */}
                          <div className="flex items-start gap-3.5 mb-4">
                            <div className="w-14 h-14 rounded-xl shrink-0 overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center font-display font-bold text-lg text-[#0B1F40] shadow-xs">
                              {player.imageUrl ? (
                                <img
                                  src={player.imageUrl}
                                  alt={player.name}
                                  className="w-full h-full object-cover object-top"
                                />
                              ) : (
                                <span>{player.name[0]}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 pr-2">
                              <h3 className="font-display font-bold text-base sm:text-[17px] text-[#0B1F40] group-hover:text-[#004D98] transition-colors truncate m-0">
                                {player.name}
                              </h3>
                              <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-1">
                                <FlagIcon
                                  nationality={player.nationality}
                                  emoji={player.flagEmoji}
                                />
                                <span>{player.nationality}</span>
                              </div>
                            </div>
                            <PositionBadge position={player.position} />
                          </div>

                          {/* Hero Metric Box */}
                          <div className="bg-[#F8FAFD] rounded-xl p-3.5 border border-gray-100/90 mb-3.5">
                            <div className="text-[11px] font-bold tracking-wider text-[#64748B] uppercase mb-1">
                              {heroLabel}
                            </div>
                            <div className="flex items-baseline justify-between">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl sm:text-4xl font-black font-display text-[#0B1F40] tracking-tight">
                                  {heroValue}
                                </span>
                                <span className={`text-sm font-bold ${heroUnitColor}`}>
                                  {heroUnit}
                                </span>
                              </div>
                              <span className="text-xs text-[#64748B] font-medium">
                                จาก {apps} แมตช์
                              </span>
                            </div>
                          </div>

                          {/* Secondary Stats Strip */}
                          <div className="grid grid-cols-3 gap-1.5 mb-3">
                            {secondaryStats.map((item, idx) => (
                              <div
                                key={idx}
                                className="text-center rounded-lg py-1.5 px-1 bg-[#F8FAFD] border border-gray-100"
                              >
                                <span className="block text-sm font-bold font-display text-[#0B1F40] leading-tight truncate">
                                  {item.value}
                                </span>
                                <span className="block text-[10px] text-[#7A8FAD] mt-0.5">
                                  {item.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                          <StatusBadge status={player.currentStatus} />
                          <span className="text-xs font-bold text-[#004D98] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                            ดูโปรไฟล์เต็ม →
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ===== SECTION 3: 📅 RECENT PRE-SEASON SECTION ===== */}
        <section id="recent" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 relative z-10">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-[#004D98] mb-2.5 flex items-center gap-2">
                <span className="w-4 h-0.5 bg-[#004D98]" />
                ล่าสุด {latestSeason && `(${latestSeason})`}
              </p>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-[#0B1F40] section-heading-underline">
                นักเตะล่าสุด
              </h2>
              <p className="text-[#64748B] mt-4 text-base">
                ดาวรุ่งที่เพิ่งได้รับโอกาสใน pre-season {latestSeason}
              </p>
            </div>
            <Link
              href={latestSeason ? `/timeline?season=${encodeURIComponent(latestSeason)}` : "/timeline"}
              id="view-all-recent"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#004D98] hover:text-[#A2001D] transition-colors group self-start sm:self-auto"
            >
              <span>ดูทั้งหมด {latestSeason && `(${latestSeason})`}</span>
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </Link>
          </div>

          {recentPlayers.length === 0 ? (
            <div className="rounded-2xl bg-white border border-gray-200 p-8 text-center text-[#64748B] text-sm shadow-xs">
              ยังไม่มีข้อมูลนักเตะพรีซีซั่น
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
              {recentPlayers.map((player, i) => (
                <PlayerCard key={player.id} player={player} delay={i * 80} theme="light" />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/players"
              id="cta-view-all"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white border border-[rgba(0,77,152,0.18)] shadow-md hover:shadow-xl text-sm font-bold text-[#0B1F40] hover:text-[#004D98] hover:border-[#004D98] transition-all duration-300"
            >
              <span>ดูนักเตะทั้งหมด {players.length} คน</span>
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </section>

        {/* ===== SECTION 4: ⚖️ QUICK HEAD-TO-HEAD COMPARE BANNER ===== */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-24">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#030A1C] via-[#071942] to-[#12030A] p-8 sm:p-12 text-white shadow-2xl border border-white/10">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--barca-crimson)]/20 rounded-full blur-[70px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--barca-navy)]/30 rounded-full blur-[70px] pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Text info */}
              <div className="max-w-xl text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-[var(--barca-gold)] mb-4">
                  <svg className="w-3.5 h-3.5 text-[var(--barca-gold)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>Head-to-Head Comparison</span>
                </div>
                <h2 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight leading-tight mb-3">
                  เปรียบเทียบสถิติดาวรุ่งแบบตัวต่อตัว
                </h2>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  เลือก 2 ดาวรุ่งแห่ง La Masia มาเทียบสถิติพรีซีซั่น นาทีลงเล่น ประตู แอสซิสต์ และการพัฒนาฝีเท้าแบบละเอียดข้างกัน
                </p>
              </div>

              {/* Interactive Player VS Teaser */}
              <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full lg:w-auto justify-center">
                {comparePlayer1 && comparePlayer2 && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl glass border border-white/15 bg-white/5 backdrop-blur-md">
                    {/* Player 1 Chip */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/20 bg-[var(--barca-navy)] flex items-center justify-center font-bold text-xs">
                        {comparePlayer1.imageUrl ? (
                          <img src={comparePlayer1.imageUrl} alt={comparePlayer1.name} className="w-full h-full object-cover object-top" />
                        ) : (
                          comparePlayer1.name[0]
                        )}
                      </div>
                      <span className="text-xs font-bold text-white max-w-[100px] truncate">{comparePlayer1.name}</span>
                    </div>

                    {/* VS Badge */}
                    <span className="w-7 h-7 rounded-full bg-gradient-to-r from-[var(--barca-crimson)] to-[var(--barca-navy)] flex items-center justify-center text-[10px] font-black text-[var(--barca-gold)] shadow-md shrink-0 border border-white/20">
                      VS
                    </span>

                    {/* Player 2 Chip */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/20 bg-[var(--barca-crimson)] flex items-center justify-center font-bold text-xs">
                        {comparePlayer2.imageUrl ? (
                          <img src={comparePlayer2.imageUrl} alt={comparePlayer2.name} className="w-full h-full object-cover object-top" />
                        ) : (
                          comparePlayer2.name[0]
                        )}
                      </div>
                      <span className="text-xs font-bold text-white max-w-[100px] truncate">{comparePlayer2.name}</span>
                    </div>
                  </div>
                )}

                {/* Compare CTA Button */}
                <Link
                  href={comparePlayer1 && comparePlayer2 ? `/compare?player1=${comparePlayer1.id}&player2=${comparePlayer2.id}` : "/compare"}
                  id="cta-compare-now"
                  className="px-7 py-3.5 rounded-2xl font-bold text-sm text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto"
                  style={{
                    background: "var(--gradient-barca)",
                    boxShadow: "0 0 30px rgba(162,0,29,0.4)",
                  }}
                >
                  <span>ลองเปรียบเทียบเลย</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

