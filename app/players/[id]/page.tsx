import { notFound } from "next/navigation";
import Link from "next/link";
import { getPlayers } from "@/app/utils/supabase/queries";
import type { Player } from "@/types/player";
import { StatusBadge, PositionBadge } from "@/app/components/StatusBadge";
import CareerTimeline from "@/app/components/CareerTimeline";

export async function generateStaticParams() {
  const players = await getPlayers();
  return players.map((p) => ({ id: p.id }));
}

export async function generateMetadata(props: PageProps<"/players/[id]">) {
  const { id } = await props.params;
  const players = await getPlayers();
  const player = players.find((p) => p.id === id);
  if (!player) return {};
  return {
    title: `${player.name} — La Masia Rising Stars`,
    description: player.descriptionTH ?? `โปรไฟล์ ${player.name} นักเตะดาวรุ่งจาก La Masia`,
  };
}

function getAge(dateOfBirth: string): number {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
  ) age--;
  return age;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default async function PlayerProfilePage(props: PageProps<"/players/[id]">) {
  const { id } = await props.params;
  const players = await getPlayers();
  const player = players.find((p) => p.id === id);

  if (!player) notFound();

  const age = getAge(player.dateOfBirth);
  const totalApps = player.preSeasons ? player.preSeasons.reduce((s, ps) => s + (ps.appearances ?? 0), 0) : 0;
  const totalGoals = player.preSeasons ? player.preSeasons.reduce((s, ps) => s + (ps.goals ?? 0), 0) : 0;
  const totalAssists = player.preSeasons ? player.preSeasons.reduce((s, ps) => s + (ps.assists ?? 0), 0) : 0;
  const totalMins = player.preSeasons ? player.preSeasons.reduce((s, ps) => s + (ps.minutesPlayed ?? 0), 0) : 0;

  return (
    <div className="pb-24">
      {/* Hero section */}
      <div
        className="relative pt-[110px] pb-16 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(162,0,29,0.18) 0%, rgba(0,77,152,0.18) 100%)",
        }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-8">
            <Link href="/" className="hover:text-white transition-colors">หน้าหลัก</Link>
            <span>›</span>
            <Link href="/timeline" className="hover:text-white transition-colors">Timeline</Link>
            <span>›</span>
            <span className="text-[var(--text-secondary)]">{player.name}</span>
          </nav>

          <div className="flex flex-col sm:flex-row items-start gap-8">
            {/* Big Avatar */}
            <div
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl flex-shrink-0 flex items-center justify-center text-white font-black text-4xl font-display relative overflow-hidden shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #A2001D, #004D98)",
                boxShadow: "0 0 60px rgba(162,0,29,0.35), 0 0 40px rgba(0,77,152,0.25)",
              }}
            >
              <span className="relative z-10">{getInitials(player.name)}</span>
              {player.jerseyNumber && (
                <span className="absolute bottom-2 right-2 text-sm font-black opacity-30">
                  #{player.jerseyNumber}
                </span>
              )}
            </div>

            {/* Main info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <PositionBadge position={player.position} size="md" />
                <StatusBadge status={player.currentStatus} size="md" />
              </div>

              <h1 className="font-display font-black text-4xl sm:text-5xl text-white mb-2 leading-tight">
                {player.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)]">
                <span>{player.flagEmoji} {player.nationality}</span>
                <span className="text-[var(--border-glass)]">·</span>
                <span>อายุ {age} ปี</span>
                <span className="text-[var(--border-glass)]">·</span>
                <span>เกิด {formatDate(player.dateOfBirth)}</span>
                {player.height && (
                  <>
                    <span className="text-[var(--border-glass)]">·</span>
                    <span>{player.height} ซม.</span>
                  </>
                )}
              </div>

              {player.descriptionTH && (
                <p className="mt-4 text-[var(--text-secondary)] leading-relaxed max-w-2xl">
                  {player.descriptionTH}
                </p>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/compare"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-[var(--surface-4)]"
                  style={{ background: "var(--surface-3)", border: "1px solid var(--border-glass)" }}
                >
                  <svg className="w-4 h-4 text-[var(--barca-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  เปรียบเทียบกับนักเตะคนอื่น
                </Link>
                <Link
                  href="/timeline"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-all duration-300 hover:bg-[var(--surface-2)]"
                >
                  ← ดู Timeline รวม
                </Link>
              </div>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <div className="stat-pill">
                  เข้า La Masia ปี {player.lamasiaYear}
                </div>
                <div className="stat-pill">
                  {player.currentClub ?? "FC Barcelona"}
                </div>
                {player.jerseyNumber && (
                  <div className="stat-pill">
                    #{player.jerseyNumber}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Career stats overview cards */}
        <section>
          <h2 className="font-display font-bold text-xl text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--barca-gold)]" />
            สถิติรวม Pre-Season ทั้งหมด
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "แมตช์ที่ลงเล่น", value: totalApps, icon: "⚽" },
              { label: "ประตูรวม", value: totalGoals, icon: "🎯" },
              { label: "แอสซิสต์รวม", value: totalAssists, icon: "🅐" },
              { label: "นาทีสะสม", value: `${totalMins}'`, icon: "⏱" },
            ].map(({ label, value, icon }) => (
              <div
                key={label}
                className="rounded-2xl glass p-5 text-center border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="text-2xl mb-2">{icon}</div>
                <div className="text-3xl font-black font-display gradient-text leading-none mb-1">
                  {value}
                </div>
                <div className="text-xs text-[var(--text-muted)]">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Visual Career Timeline */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--barca-crimson)]" />
                เส้นทางนักเตะ (La Masia & Pre-Season Journey)
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                ไทม์ไลน์พัฒนาการตั้งแต่จุดเริ่มต้นในอคาเดมี่จนถึงปัจจุบัน
              </p>
            </div>
          </div>

          <CareerTimeline player={player} />
        </section>
      </div>
    </div>
  );
}
