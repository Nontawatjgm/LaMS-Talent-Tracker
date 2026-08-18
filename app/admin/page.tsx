import Link from "next/link";
import { getPlayers } from "@/app/utils/supabase/queries";
import type { Player } from "@/types/player";

export const metadata = {
  title: "Dashboard - La Masia Admin",
};

export default async function AdminDashboard() {
  const players = await getPlayers();
  const totalPlayers = players.length;
  const promotedCount = players.filter(p => p.currentStatus === "promoted").length;
  const reserveCount = players.filter(p => p.currentStatus === "barca_atletic" || p.currentStatus === "juvenil_a" || p.currentStatus === "academy").length;
  const loanedCount = players.filter(p => p.currentStatus === "loaned").length;

  const positions = {
    FWD: players.filter(p => ["ST", "LW", "RW", "FWD"].includes(p.position)).length,
    MID: players.filter(p => ["CAM", "CM", "CDM", "MID"].includes(p.position)).length,
    DEF: players.filter(p => ["CB", "LB", "RB", "DEF"].includes(p.position)).length,
    GK: players.filter(p => p.position === "GK").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Dashboard Overview</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            ยินดีต้อนรับสู่ระบบจัดการข้อมูลนักเตะ La Masia
          </p>
        </div>
        <Link
          href="/admin/players/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold transition-colors shadow-md"
          style={{ background: "linear-gradient(135deg, #A2001D, #D4002A)", boxShadow: "0 0 12px rgba(162,0,29,0.3)" }}
        >
          <span className="text-lg leading-none">+</span> เพิ่มนักเตะใหม่
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Players */}
        <div className="glass p-5 rounded-2xl border border-[rgba(0,77,152,0.12)] relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3 relative z-10">
            <h3 className="text-[var(--text-secondary)] font-medium text-xs">นักเตะทั้งหมด</h3>
            <span className="w-8 h-8 rounded-lg bg-[var(--surface-3)] flex items-center justify-center text-[#004D98]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-display font-black text-[var(--text-primary)] relative z-10">{totalPlayers}</p>
        </div>

        {/* Promoted */}
        <div className="glass p-5 rounded-2xl border border-[rgba(0,77,152,0.12)] relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3 relative z-10">
            <h3 className="text-[var(--text-secondary)] font-medium text-xs">ชุดใหญ่ (First Team)</h3>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-display font-black text-emerald-600 relative z-10">{promotedCount}</p>
        </div>

        {/* Atlètic / U19 */}
        <div className="glass p-5 rounded-2xl border border-[rgba(0,77,152,0.12)] relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3 relative z-10">
            <h3 className="text-[var(--text-secondary)] font-medium text-xs">Atlètic / U19</h3>
            <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-display font-black text-purple-600 relative z-10">{reserveCount}</p>
        </div>

        {/* Loaned */}
        <div className="glass p-5 rounded-2xl border border-[rgba(0,77,152,0.12)] relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3 relative z-10">
            <h3 className="text-[var(--text-secondary)] font-medium text-xs">ปล่อยยืมตัว (Loaned)</h3>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-display font-black text-amber-600 relative z-10">{loanedCount}</p>
        </div>
      </div>

      {/* Breakdown by Position */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl border border-[rgba(0,77,152,0.12)]">
          <h2 className="text-base font-bold text-[var(--text-primary)] mb-5">สัดส่วนตำแหน่งนักเตะ</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 text-xs font-bold text-[#A2001D]">FWD</div>
              <div className="flex-1 h-2.5 bg-[var(--surface-3)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#A2001D] to-[#F87171]" style={{ width: `${(positions.FWD / totalPlayers) * 100}%` }} />
              </div>
              <div className="w-8 text-right text-xs font-semibold text-[var(--text-secondary)]">{positions.FWD}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 text-xs font-bold text-[#004D98]">MID</div>
              <div className="flex-1 h-2.5 bg-[var(--surface-3)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#004D98] to-[#60A5FA]" style={{ width: `${(positions.MID / totalPlayers) * 100}%` }} />
              </div>
              <div className="w-8 text-right text-xs font-semibold text-[var(--text-secondary)]">{positions.MID}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 text-xs font-bold text-[#7C3AED]">DEF</div>
              <div className="flex-1 h-2.5 bg-[var(--surface-3)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA]" style={{ width: `${(positions.DEF / totalPlayers) * 100}%` }} />
              </div>
              <div className="w-8 text-right text-xs font-semibold text-[var(--text-secondary)]">{positions.DEF}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 text-xs font-bold text-[#059669]">GK</div>
              <div className="flex-1 h-2.5 bg-[var(--surface-3)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#059669] to-[#34D399]" style={{ width: `${(positions.GK / totalPlayers) * 100}%` }} />
              </div>
              <div className="w-8 text-right text-xs font-semibold text-[var(--text-secondary)]">{positions.GK}</div>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-[rgba(0,77,152,0.12)] flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#004D98]/8 text-[#004D98] flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7c0-2-1.5-3-3.5-3h-9C5.5 4 4 5 4 7zm0 5h16M4 12c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-[var(--text-primary)] mb-1.5">Supabase PostgreSQL</h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm">
            ระบบเชื่อมต่อและดึงข้อมูลนักเตะจาก Supabase Cloud Database แบบเรียลไทม์
          </p>
        </div>
      </div>
    </div>
  );
}
