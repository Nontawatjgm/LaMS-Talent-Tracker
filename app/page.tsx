import Link from "next/link";
import { getPlayers } from "@/app/utils/supabase/queries";
import type { Player } from "@/types/player";
import StatsBar from "./components/StatsBar";
import PlayerCard from "./components/PlayerCard";

export default async function HomePage() {
  const players = await getPlayers();

  // Get 4 most recent/notable players for hero featured section
  const featuredPlayers = players
    .filter((p) => p.currentStatus === "promoted")
    .slice(0, 4);

  const recentPlayers = players
    .sort((a, b) => {
      const aYear = a.preSeasons && a.preSeasons.length > 0 ? Math.max(...a.preSeasons.map((ps) => ps.year)) : 0;
      const bYear = b.preSeasons && b.preSeasons.length > 0 ? Math.max(...b.preSeasons.map((ps) => ps.year)) : 0;
      return bYear - aYear;
    })
    .slice(0, 6);
  return (
    <div className="relative">
      {/* ===== HERO SECTION ===== */}
      <section
        className="relative min-h-screen flex flex-col overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        {/* Animated orbs */}
        <div
          className="hero-orb w-96 h-96 opacity-20 animate-float"
          style={{
            background: "var(--barca-crimson)",
            top: "10%",
            left: "-10%",
            animationDuration: "6s",
          }}
        />
        <div
          className="hero-orb w-80 h-80 opacity-15 animate-float"
          style={{
            background: "var(--barca-navy)",
            top: "20%",
            right: "-8%",
            animationDuration: "8s",
            animationDelay: "2s",
          }}
        />
        <div
          className="hero-orb w-64 h-64 opacity-10 animate-float"
          style={{
            background: "var(--barca-gold)",
            bottom: "15%",
            left: "30%",
            animationDuration: "7s",
            animationDelay: "4s",
          }}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Safe top spacer (guarantees content is never pushed under navbar) */}
        <div className="flex-1 min-h-[120px]"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center shrink-0">
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-[var(--text-secondary)] mb-8"
          >
            <span className="w-2 h-2 rounded-full animate-pulse-glow"
              style={{ background: "var(--barca-gold)" }} />
            FC Barcelona · La Masia Academy
          </div>

          {/* Main heading */}
          <h1
            className="font-display font-black text-5xl sm:text-6xl lg:text-8xl leading-tight mb-6"
          >
            <span className="gradient-text">La Masia</span>
            <br />
            <span className="text-white">Rising Stars</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-4 leading-relaxed"
          >
            ติดตามนักเตะดาวรุ่งจากสถาบัน La Masia ที่ได้รับโอกาส
            <br className="hidden sm:block" />
            ขึ้นฝึกซ้อมกับทีมชุดใหญ่ช่วง <strong className="text-white">Pre-Season</strong> ในแต่ละปี
          </p>
          <p
            className="text-sm text-[var(--text-muted)] mb-12"
          >
            Track FC Barcelona academy talents who feature in pre-season each year
          </p>

          {/* CTA Buttons */}
          <div
            className="relative z-20 flex flex-col sm:flex-row items-center justify-center gap-6 mb-24 mt-8"
          >
            <Link
              href="/timeline"
              id="cta-timeline"
              className="px-8 py-4 rounded-2xl font-bold text-base text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{
                background: "var(--gradient-barca)",
                boxShadow: "0 0 30px rgba(162,0,29,0.3)",
              }}
            >
              ดู Timeline ทั้งหมด →
            </Link>
            <a
              href="#featured"
              id="cta-featured"
              className="px-8 py-4 rounded-2xl font-bold text-base text-[var(--text-secondary)] glass hover:text-white hover:bg-[var(--surface-3)] transition-all duration-300"
            >
              นักเตะที่โปรโมทแล้ว
            </a>
          </div>

          {/* Stats Bar */}
          <StatsBar />
        </div>

        {/* Safe bottom spacer */}
        <div className="flex-1 min-h-[80px]"></div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, transparent, var(--bg-dark))",
          }}
        />
      </section>

      {/* ===== FEATURED (PROMOTED) SECTION ===== */}
      <section id="featured" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-[var(--barca-gold)] mb-2">
              ✦ ความสำเร็จ
            </p>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white">
              โปรโมทสู่ทีมชุดใหญ่
            </h2>
            <p className="text-[var(--text-muted)] mt-2">
              นักเตะที่ผ่าน pre-season แล้วติดทีมชุดใหญ่ได้สำเร็จ
            </p>
          </div>
          <Link
            href="/timeline"
            id="view-all-promoted"
            className="hidden sm:block text-sm text-[var(--text-muted)] hover:text-white transition-colors"
          >
            ดูทั้งหมด →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredPlayers.map((player, i) => (
            <PlayerCard key={player.id} player={player} delay={i * 100} />
          ))}
        </div>
      </section>

      {/* ===== DIVIDER ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="divider-barca" />
      </div>

      {/* ===== RECENT PRE-SEASON SECTION ===== */}
      <section id="recent" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-[var(--barca-navy-light)] mb-2">
              ◈ ล่าสุด
            </p>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white">
              นักเตะล่าสุด
            </h2>
            <p className="text-[var(--text-muted)] mt-2">
              ดาวรุ่งที่เพิ่งได้รับโอกาสใน pre-season
            </p>
          </div>
          <Link
            href="/timeline"
            id="view-all-recent"
            className="hidden sm:block text-sm text-[var(--text-muted)] hover:text-white transition-colors"
          >
            ดูทั้งหมด →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recentPlayers.map((player, i) => (
            <PlayerCard key={player.id} player={player} delay={i * 80} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/timeline"
            id="cta-view-all"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl glass text-sm font-medium text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-3)] transition-all duration-300"
          >
            ดูนักเตะทั้งหมด {players.length} คน →
          </Link>
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section
        id="about"
        className="py-24 relative overflow-hidden"
        style={{ background: "var(--surface)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: "var(--gradient-barca)" }}>
            <span className="text-2xl">⚽</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-white mb-4">
            เกี่ยวกับ La Masia
          </h2>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-8">
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
