import { notFound } from "next/navigation";
import Link from "next/link";
import { getPlayers } from "@/app/utils/supabase/queries";
import type { Player } from "@/types/player";
import { StatusBadge, PositionBadge } from "@/app/components/StatusBadge";
import { FlagIcon } from "@/app/components/FlagIcon";
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

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  // Direct string parse to avoid timezone shifts
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
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
          background: player.actionShotUrl 
            ? `linear-gradient(135deg, rgba(6, 6, 15, 0.9) 0%, rgba(6, 6, 15, 0.7) 100%), url(${player.actionShotUrl}) center/cover no-repeat` 
            : "linear-gradient(135deg, rgba(162,0,29,0.18) 0%, rgba(0,77,152,0.18) 100%)",
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
                background: player.imageUrl ? 'transparent' : "linear-gradient(135deg, #A2001D, #004D98)",
                boxShadow: "0 0 60px rgba(162,0,29,0.35), 0 0 40px rgba(0,77,152,0.25)",
              }}
            >
              {player.imageUrl ? (
                <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover object-top" />
              ) : (
                <span className="relative z-10">{getInitials(player.name)}</span>
              )}
              {!player.imageUrl && player.jerseyNumber && (
                <span className="absolute bottom-2 right-2 text-sm font-black opacity-30">
                  #{player.jerseyNumber}
                </span>
              )}
            </div>

            {/* Main info */}
            <div className="flex-1 w-full">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <PositionBadge position={player.position} size="md" />
                  <StatusBadge status={player.currentStatus} size="md" />
                </div>
                {player.socialInstagram && (
                  <a 
                    href={`https://instagram.com/${player.socialInstagram}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[var(--text-secondary)] hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                    @{player.socialInstagram}
                  </a>
                )}
              </div>

              <h1 className="font-display font-black text-4xl sm:text-5xl text-white mb-2 leading-tight">
                {player.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5">
                  <FlagIcon nationality={player.nationality} emoji={player.flagEmoji} /> {player.nationality}
                </span>
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
                {player.preferredFoot && (
                  <>
                    <span className="text-[var(--border-glass)]">·</span>
                    <span>ถนัด{player.preferredFoot === 'Right' ? 'ขวา' : player.preferredFoot === 'Left' ? 'ซ้าย' : 'สองเท้า'}</span>
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
                {(player.firstTeamDebutDate || player.firstTeamDebutMatch) && (
                  <div className="stat-pill border-purple-500/30 text-purple-300 bg-purple-500/10">
                    Debut: {player.firstTeamDebutDate ? formatDate(player.firstTeamDebutDate) : ""}
                    {player.firstTeamDebutMatch ? ` (${player.firstTeamDebutMatch})` : ""}
                  </div>
                )}
                {player.marketValueM && (
                  <div className="stat-pill border-green-500/30 text-green-400 bg-green-500/10">
                    €{player.marketValueM}m
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
