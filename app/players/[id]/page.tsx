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
    <div className="pb-24 min-h-screen">
      {/* ─── Hero Section with Dynamic Action Shot ─── */}
      <div
        className="relative pt-[110px] pb-16 overflow-hidden border-b border-white/[0.08]"
        style={{
          background: player.actionShotUrl
            ? `linear-gradient(180deg, rgba(6,6,15,0.75) 0%, rgba(6,6,15,0.95) 100%), linear-gradient(135deg, rgba(162,0,29,0.35) 0%, rgba(0,77,152,0.35) 100%), url(${player.actionShotUrl}) center/cover no-repeat`
            : "linear-gradient(135deg, #1C050B 0%, #0D162B 50%, #060E21 100%)",
        }}
      >
        {/* Ambient Top Glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] pointer-events-none opacity-40 filter blur-[90px]"
          style={{
            background: "radial-gradient(ellipse at top, rgba(0,77,152,0.4) 0%, rgba(162,0,29,0.25) 50%, transparent 80%)",
          }}
        />

        {/* Subtle Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-[#94A3B8] mb-8 font-medium">
            <Link href="/" className="hover:text-white transition-colors">
              หน้าหลัก
            </Link>
            <span className="text-white/30">›</span>
            <Link href="/players" className="hover:text-white transition-colors">
              ทำเนียบนักเตะทั้งหมด
            </Link>
            <span className="text-white/30">›</span>
            <span className="text-white font-semibold">{player.name}</span>
          </nav>

          <div className="flex flex-col sm:flex-row items-start gap-8">
            {/* Big Avatar Card with Solid Border & Number Badge */}
            <div
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl flex-shrink-0 flex items-center justify-center text-white font-black text-4xl font-display relative overflow-hidden shadow-2xl border-2 border-white/20"
              style={{
                background: player.imageUrl ? 'transparent' : "linear-gradient(135deg, #A2001D, #004D98)",
                boxShadow: "0 0 50px rgba(162,0,29,0.3), 0 0 30px rgba(0,77,152,0.25)",
              }}
            >
              {player.imageUrl ? (
                <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover object-top" />
              ) : (
                <span className="relative z-10">{getInitials(player.name)}</span>
              )}
              {player.jerseyNumber && (
                <span
                  className="absolute bottom-1.5 right-2 text-sm sm:text-base font-black font-display tracking-tight text-[#EDBB00] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] select-none"
                >
                  #{player.jerseyNumber}
                </span>
              )}
            </div>

            {/* Main Info */}
            <div className="flex-1 w-full">
              {/* Badges & Social Links */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <PositionBadge position={player.position} size="md" />
                  <StatusBadge status={player.currentStatus} size="md" />
                </div>
                {player.socialInstagram && (
                  <a
                    href={`https://instagram.com/${player.socialInstagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/15 border border-white/15 text-xs text-[#CBD5E1] hover:text-white transition-all shadow-xs"
                  >
                    <svg className="w-4 h-4 text-pink-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                    @{player.socialInstagram}
                  </a>
                )}
              </div>

              {/* Player Name */}
              <h1 className="font-display font-black text-4xl sm:text-5xl text-white mb-2 leading-tight tracking-tight">
                {player.name}
              </h1>

              {/* Specs Meta Row */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-[#94A3B8]">
                <span className="flex items-center gap-1.5 text-white font-medium">
                  <FlagIcon nationality={player.nationality} emoji={player.flagEmoji} /> {player.nationality}
                </span>
                <span className="text-white/20">·</span>
                <span>อายุ {age} ปี</span>
                <span className="text-white/20">·</span>
                <span>เกิด {formatDate(player.dateOfBirth)}</span>
                {player.height && (
                  <>
                    <span className="text-white/20">·</span>
                    <span>{player.height} ซม.</span>
                  </>
                )}
                {player.preferredFoot && (
                  <>
                    <span className="text-white/20">·</span>
                    <span>ถนัด{player.preferredFoot === 'Right' ? 'ขวา' : player.preferredFoot === 'Left' ? 'ซ้าย' : 'สองเท้า'}</span>
                  </>
                )}
              </div>

              {/* Description Bio */}
              {player.descriptionTH && (
                <p className="mt-5 text-[#CBD5E1] text-sm sm:text-base leading-relaxed max-w-3xl font-normal">
                  {player.descriptionTH}
                </p>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/compare"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #A2001D 0%, #004D98 100%)" }}
                >
                  <svg className="w-4 h-4 text-[#EDBB00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  เปรียบเทียบกับนักเตะคนอื่น
                </Link>
                <Link
                  href="/players"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#CBD5E1] bg-white/[0.06] hover:bg-white/12 hover:text-white border border-white/15 transition-all duration-300 hover:scale-105"
                >
                  <span>← ดูรายชื่อนักเตะทั้งหมด</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Lower Content Area (Layout B + Vitals Card - Zero Emoji) ─── */}
      <div className="bg-[#F8FAFD] border-t border-gray-200/90 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Section 1: Pre-Season Master Performance Matrix */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="flex items-center -space-x-0.5 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A2001D]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#004D98]" />
                </span>
                <h2 className="font-display font-bold text-lg sm:text-xl text-[#0B1F40]">
                  สถิติรวม Pre-Season ทั้งหมด
                </h2>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-blue-50 text-[#004D98] border border-blue-100/80">
                2026/27 OFFICIAL TRACKER
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
              {/* Style A Heritage Stripes */}
              <div className="absolute top-0 left-0 right-0 h-1.5 flex">
                <div className="flex-1 bg-[#004D98]" />
                <div className="flex-1 bg-[#A2001D]" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 p-4 sm:p-6 text-center">
                <div className="p-4">
                  <span className="text-[11px] font-mono tracking-wider font-bold text-[#64748B] uppercase block mb-1">
                    APPEARANCES
                  </span>
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-[#0B1F40] leading-none mb-1.5">
                    {totalApps}
                  </div>
                  <span className="text-xs text-[#64748B] font-medium">ลงเล่น (แมตช์)</span>
                </div>

                <div className="p-4">
                  <span className="text-[11px] font-mono tracking-wider font-bold text-[#64748B] uppercase block mb-1">
                    GOALS
                  </span>
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-emerald-600 leading-none mb-1.5">
                    {totalGoals}
                  </div>
                  <span className="text-xs text-[#64748B] font-medium">ประตูที่ทำได้</span>
                </div>

                <div className="p-4">
                  <span className="text-[11px] font-mono tracking-wider font-bold text-[#64748B] uppercase block mb-1">
                    ASSISTS
                  </span>
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-[#004D98] leading-none mb-1.5">
                    {totalAssists}
                  </div>
                  <span className="text-xs text-[#64748B] font-medium">แอสซิสต์รวม</span>
                </div>

                <div className="p-4">
                  <span className="text-[11px] font-mono tracking-wider font-bold text-[#64748B] uppercase block mb-1">
                    TOTAL MINUTES
                  </span>
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-[#A2001D] leading-none mb-1.5">
                    {totalMins}&apos;
                  </div>
                  <span className="text-xs text-[#64748B] font-medium">นาทีสะสม</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Player Vitals & Contract Overview (From Layout A) */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center -space-x-0.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A2001D]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#004D98]" />
              </span>
              <h2 className="font-display font-bold text-lg sm:text-xl text-[#0B1F40]">
                ข้อมูลสังกัดและประวัตินักเตะ
              </h2>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
              {/* Style A Heritage Stripes */}
              <div className="absolute top-0 left-0 right-0 h-1.5 flex">
                <div className="flex-1 bg-[#004D98]" />
                <div className="flex-1 bg-[#A2001D]" />
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {/* Status */}
                  <div className="p-4 rounded-xl bg-[#F8FAFD] border border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] font-bold block mb-1">
                        CURRENT STATUS
                      </span>
                      <span className="text-xs font-semibold text-[#0B1F40]">สถานะสังกัด</span>
                    </div>
                    <StatusBadge status={player.currentStatus} size="md" />
                  </div>

                  {/* Position */}
                  <div className="p-4 rounded-xl bg-[#F8FAFD] border border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] font-bold block mb-1">
                        POSITION
                      </span>
                      <span className="text-xs font-semibold text-[#0B1F40]">ตำแหน่งหลัก</span>
                    </div>
                    <PositionBadge position={player.position} size="md" />
                  </div>

                  {/* La Masia Entry */}
                  <div className="p-4 rounded-xl bg-[#F8FAFD] border border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] font-bold block mb-1">
                        LA MASIA ENTRY
                      </span>
                      <span className="text-xs font-semibold text-[#0B1F40]">เข้าศูนย์ฝึก</span>
                    </div>
                    <span className="font-display font-black text-base text-[#004D98]">ปี {player.lamasiaYear}</span>
                  </div>

                  {/* Club */}
                  <div className="p-4 rounded-xl bg-[#F8FAFD] border border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] font-bold block mb-1">
                        CURRENT CLUB
                      </span>
                      <span className="text-xs font-semibold text-[#0B1F40]">สโมสรปัจจุบัน</span>
                    </div>
                    <span className="font-semibold text-sm text-[#0B1F40]">{player.currentClub ?? "FC Barcelona"}</span>
                  </div>

                  {/* Market Value */}
                  <div className="p-4 rounded-xl bg-[#F8FAFD] border border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] font-bold block mb-1">
                        MARKET VALUE
                      </span>
                      <span className="text-xs font-semibold text-[#0B1F40]">มูลค่าประเมิน</span>
                    </div>
                    <span className="font-display font-black text-base text-emerald-600">
                      {player.marketValueM ? `€${player.marketValueM}m` : "-"}
                    </span>
                  </div>

                  {/* Squad Number */}
                  <div className="p-4 rounded-xl bg-[#F8FAFD] border border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] font-bold block mb-1">
                        SQUAD NUMBER
                      </span>
                      <span className="text-xs font-semibold text-[#0B1F40]">หมายเลขเสื้อ</span>
                    </div>
                    <span className="font-mono font-bold text-sm text-[#EDBB00] bg-[#0B1F40] px-3 py-1 rounded-lg">
                      {player.jerseyNumber ? `#${player.jerseyNumber}` : "-"}
                    </span>
                  </div>
                </div>

                {(player.firstTeamDebutDate || player.firstTeamDebutMatch) && (
                  <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-[#64748B] font-medium">เปิดตัวทีมชุดใหญ่อย่างเป็นทางการ (Official First Team Debut):</span>
                    <span className="font-semibold text-xs text-[#0B1F40] bg-[#F8FAFD] border border-gray-200 px-3 py-1.5 rounded-lg">
                      {player.firstTeamDebutDate ? formatDate(player.firstTeamDebutDate) : ""} {player.firstTeamDebutMatch ? `(${player.firstTeamDebutMatch})` : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section 3: Full-Width Career Progression Timeline */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <span className="flex items-center -space-x-0.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A2001D]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#004D98]" />
              </span>
              <div>
                <h2 className="font-display font-bold text-lg sm:text-xl text-[#0B1F40]">
                  เส้นทางนักเตะ (La Masia & Career Journey)
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  ไทม์ไลน์พัฒนาการตั้งแต่จุดเริ่มต้นในอคาเดมี่จนถึงปัจจุบัน
                </p>
              </div>
            </div>

            <CareerTimeline player={player} />
          </section>
        </div>
      </div>
    </div>
  );
}
