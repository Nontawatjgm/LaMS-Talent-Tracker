import Link from "next/link";
import { getPlayers } from "@/app/utils/supabase/queries";
import type { Player } from "@/types/player";
import StatsBar from "./components/StatsBar";
import PlayerCard from "./components/PlayerCard";

export default async function HomePage() {
  const players = await getPlayers();

  // Promoted players for featured section
  const featuredPlayers = players
    .filter((p) => p.currentStatus === "promoted")
    .slice(0, 4);

  // All seasons sorted descending
  const allSeasons = [
    ...new Set(players.flatMap((p) => (p.preSeasons || []).map((ps) => ps.season))),
  ].sort((a, b) => b.localeCompare(a));
  const latestSeason = allSeasons[0] || "";

  // Most recent pre-season players
  const recentPlayers = [...players]
    .sort((a, b) => {
      const aYear = a.preSeasons && a.preSeasons.length > 0 ? Math.max(...a.preSeasons.map((ps) => ps.year)) : 0;
      const bYear = b.preSeasons && b.preSeasons.length > 0 ? Math.max(...b.preSeasons.map((ps) => ps.year)) : 0;
      return bYear - aYear;
    })
    .slice(0, 6);

  return (
    <div className="relative">
      {/* ===== HERO SECTION — Blaugrana Night ===== */}
      <section
        className="relative min-h-screen flex flex-col overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        {/* Animated orbs — stronger Blaugrana feel */}
        <div
          className="hero-orb w-[500px] h-[500px] opacity-25 animate-float"
          style={{
            background: "radial-gradient(circle, #A2001D 0%, #7A0016 50%, transparent 75%)",
            top: "5%",
            left: "-15%",
            animationDuration: "7s",
          }}
        />
        <div
          className="hero-orb w-96 h-96 opacity-20 animate-float"
          style={{
            background: "radial-gradient(circle, #004D98 0%, #003A73 50%, transparent 75%)",
            top: "15%",
            right: "-10%",
            animationDuration: "9s",
            animationDelay: "2s",
          }}
        />
        <div
          className="hero-orb w-72 h-72 opacity-12 animate-float"
          style={{
            background: "radial-gradient(circle, #EDBB00 0%, transparent 70%)",
            bottom: "20%",
            left: "35%",
            animationDuration: "8s",
            animationDelay: "3.5s",
          }}
        />
        {/* Extra crimson accent orb bottom-right */}
        <div
          className="hero-orb w-64 h-64 opacity-10 animate-float"
          style={{
            background: "radial-gradient(circle, #A2001D 0%, transparent 70%)",
            bottom: "5%",
            right: "5%",
            animationDuration: "11s",
            animationDelay: "5s",
          }}
        />

        {/* Hexagon football pattern overlay */}
        <div className="absolute inset-0 hex-pattern opacity-100 pointer-events-none" />

        {/* Diagonal accent stripe — subtle Blaugrana signature */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            background:
              "repeating-linear-gradient(-55deg, transparent, transparent 40px, #A2001D 40px, #A2001D 41px, transparent 41px, transparent 81px, #004D98 81px, #004D98 82px, transparent 82px, transparent 122px)",
          }}
        />

        {/* Safe top spacer */}
        <div className="flex-1 min-h-[120px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center shrink-0">
          {/* Eyebrow pill */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full glass border border-white/10 text-sm font-semibold text-[var(--text-secondary)] mb-10 shadow-lg">
            <span
              className="w-2 h-2 rounded-full animate-pulse-glow"
              style={{ background: "var(--barca-gold)" }}
            />
            <span>FC Barcelona</span>
            <span className="w-px h-3.5 bg-white/20" />
            <span>La Masia Academy</span>
          </div>

          {/* Main heading */}
          <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-9xl leading-[0.92] tracking-tight mb-6">
            <span className="gradient-text">La Masia</span>
            <br />
            <span className="text-white">Rising Stars</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-3 leading-relaxed">
            ติดตามนักเตะดาวรุ่งจากสถาบัน La Masia ที่ได้รับโอกาส
            <br className="hidden sm:block" />
            ขึ้นฝึกซ้อมกับทีมชุดใหญ่ช่วง{" "}
            <strong className="text-white font-bold">Pre-Season</strong> ในแต่ละปี
          </p>
          <p className="text-sm text-[var(--text-muted)] mb-14">
            Track FC Barcelona academy talents who feature in pre-season each year
          </p>

          {/* CTA Buttons */}
          <div className="relative z-20 flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              href="/timeline"
              id="cta-timeline"
              className="group px-8 py-4 rounded-2xl font-bold text-base text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center gap-2"
              style={{
                background: "var(--gradient-barca)",
                boxShadow: "0 0 40px rgba(162,0,29,0.35)",
              }}
            >
              ดู Timeline ทั้งหมด
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </Link>
            <a
              href="#featured"
              id="cta-featured"
              className="px-8 py-4 rounded-2xl font-bold text-base text-[var(--text-secondary)] glass border border-white/10 hover:text-white hover:border-white/25 hover:bg-white/8 transition-all duration-300"
            >
              นักเตะที่โปรโมทแล้ว ↓
            </a>
          </div>

          {/* Stats Bar */}
          <StatsBar players={players} />
        </div>

        {/* Safe bottom spacer */}
        <div className="flex-1 min-h-[80px]" />

        {/* Bottom multi-stop fade to black */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(6,6,15,0.4) 40%, var(--bg-dark) 100%)",
          }}
        />
      </section>

      {/* ===== WAVE DIVIDER — Hero → Featured ===== */}
      <div className="wave-divider -mt-px" style={{ color: "var(--bg-dark)" }}>
        <svg viewBox="0 0 1200 60" preserveAspectRatio="none" fill="currentColor">
          <path d="M0,30 C200,60 400,0 600,30 C800,60 1000,0 1200,30 L1200,60 L0,60 Z" />
        </svg>
      </div>

      {/* ===== FEATURED (PROMOTED) SECTION ===== */}
      <section id="featured" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-[var(--barca-gold)] mb-3 flex items-center gap-2">
              <span className="w-4 h-px bg-[var(--barca-gold)]" />
              ความสำเร็จ
            </p>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white section-heading-underline">
              โปรโมทสู่ทีมชุดใหญ่
            </h2>
            <p className="text-[var(--text-muted)] mt-4">
              นักเตะที่ผ่าน pre-season แล้วติดทีมชุดใหญ่ได้สำเร็จ
            </p>
          </div>
          <Link
            href="/players?status=promoted"
            id="view-all-promoted"
            className="hidden sm:flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-white transition-colors group"
          >
            <span>ดูทั้งหมด ({featuredPlayers.length})</span>
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </Link>
        </div>

        {featuredPlayers.length === 0 ? (
          <div className="rounded-2xl glass p-8 text-center text-[var(--text-muted)] text-sm">
            ยังไม่มีนักเตะในสถานะโปรโมทสู่ทีมชุดใหญ่
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredPlayers.map((player, i) => (
              <PlayerCard key={player.id} player={player} delay={i * 100} />
            ))}
          </div>
        )}
      </section>

      {/* ===== DIAGONAL SLASH DIVIDER ===== */}
      <div className="relative h-12 overflow-hidden">
        <div
          className="absolute inset-x-0 top-1/2 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 5%, var(--barca-crimson) 30%, var(--barca-navy) 70%, transparent 95%)",
            opacity: 0.5,
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 text-[var(--text-muted)] text-xs tracking-widest"
          style={{ background: "var(--bg-dark)" }}
        >
          ◆
        </div>
      </div>

      {/* ===== RECENT PRE-SEASON SECTION ===== */}
      <section id="recent" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-[var(--barca-navy-light)] mb-3 flex items-center gap-2">
              <span className="w-4 h-px bg-[var(--barca-navy-light)]" />
              ล่าสุด {latestSeason && `(${latestSeason})`}
            </p>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white section-heading-underline">
              นักเตะล่าสุด
            </h2>
            <p className="text-[var(--text-muted)] mt-4">
              ดาวรุ่งที่เพิ่งได้รับโอกาสใน pre-season {latestSeason}
            </p>
          </div>
          <Link
            href={latestSeason ? `/timeline?season=${encodeURIComponent(latestSeason)}` : "/timeline"}
            id="view-all-recent"
            className="hidden sm:flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-white transition-colors group"
          >
            <span>ดูทั้งหมด {latestSeason && `(${latestSeason})`}</span>
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </Link>
        </div>

        {recentPlayers.length === 0 ? (
          <div className="rounded-2xl glass p-8 text-center text-[var(--text-muted)] text-sm">
            ยังไม่มีข้อมูลนักเตะพรีซีซั่น
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentPlayers.map((player, i) => (
              <PlayerCard key={player.id} player={player} delay={i * 80} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/players"
            id="cta-view-all"
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl glass border border-white/10 text-sm font-semibold text-[var(--text-secondary)] hover:text-white hover:border-white/20 transition-all duration-300"
          >
            <span>ดูนักเตะทั้งหมด {players.length} คน</span>
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </section>

      {/* ===== WAVE DIVIDER — Recent → About ===== */}
      <div
        className="wave-divider -mb-px"
        style={{ color: "var(--surface)", transform: "scaleY(-1)" }}
      >
        <svg viewBox="0 0 1200 60" preserveAspectRatio="none" fill="currentColor">
          <path d="M0,30 C300,60 600,0 900,40 C1050,55 1150,20 1200,30 L1200,60 L0,60 Z" />
        </svg>
      </div>

      {/* ===== ABOUT SECTION ===== */}
      <section
        id="about"
        className="py-24 relative overflow-hidden"
        style={{ background: "var(--surface)" }}
      >
        {/* Subtle hex pattern in about section */}
        <div className="absolute inset-0 hex-pattern opacity-40 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div
            className="w-18 h-18 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg"
            style={{
              background: "var(--gradient-barca)",
              boxShadow: "0 0 30px rgba(162,0,29,0.3)",
              width: "72px",
              height: "72px",
            }}
          >
            <span className="text-3xl">⚽</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-white mb-4 section-heading-underline mx-auto">
            เกี่ยวกับ La Masia
          </h2>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-8 mt-6">
            La Masia (แปลว่า &quot;บ้านฟาร์ม&quot; ในภาษา Catalan) คือสถาบันพัฒนานักเตะเยาวชนระดับโลกของ FC Barcelona
            ก่อตั้งในปี 1979 ผลิตนักเตะระดับตำนานมากมาย ไม่ว่าจะเป็น Messi, Xavi, Iniesta, Puyol และอีกนับไม่ถ้วน
          </p>
          <p className="text-[var(--text-muted)] leading-relaxed">
            ทุกปีในช่วง Pre-Season นักเตะดาวรุ่งจาก La Masia จะได้รับโอกาสขึ้นฝึกซ้อมกับทีมชุดใหญ่
            ซึ่งเป็นบันไดสำคัญในการพิสูจน์ตัวเองก่อนจะได้รับการโปรโมทอย่างเป็นทางการ
          </p>
        </div>
      </section>
    </div>
  );
}
