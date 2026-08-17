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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--barca-navy)] hover:bg-[var(--barca-navy-light)] text-white text-sm font-bold transition-colors"
        >
          <span className="text-lg leading-none">+</span> เพิ่มนักเตะใหม่
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass p-5 rounded-2xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--barca-navy)]/10 rounded-full blur-2xl group-hover:bg-[var(--barca-navy)]/20 transition-all" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-[var(--text-secondary)] font-medium text-sm">นักเตะทั้งหมด</h3>
            <span className="w-8 h-8 rounded-lg bg-[var(--surface-3)] flex items-center justify-center text-lg">👥</span>
          </div>
          <p className="text-4xl font-display font-black text-white relative z-10">{totalPlayers}</p>
        </div>

        <div className="glass p-5 rounded-2xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-[var(--text-secondary)] font-medium text-sm">โปรโมทแล้ว</h3>
            <span className="w-8 h-8 rounded-lg bg-[var(--surface-3)] flex items-center justify-center text-lg">✨</span>
          </div>
          <p className="text-4xl font-display font-black text-green-400 relative z-10">{promotedCount}</p>
        </div>

        <div className="glass p-5 rounded-2xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-[var(--text-secondary)] font-medium text-sm">Atlètic / U19</h3>
            <span className="w-8 h-8 rounded-lg bg-[var(--surface-3)] flex items-center justify-center text-lg">🎓</span>
          </div>
          <p className="text-4xl font-display font-black text-purple-400 relative z-10">{reserveCount}</p>
        </div>

        <div className="glass p-5 rounded-2xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-[var(--text-secondary)] font-medium text-sm">ปล่อยยืมตัว</h3>
            <span className="w-8 h-8 rounded-lg bg-[var(--surface-3)] flex items-center justify-center text-lg">✈️</span>
          </div>
          <p className="text-4xl font-display font-black text-orange-400 relative z-10">{loanedCount}</p>
        </div>
      </div>

      {/* Breakdown by Position */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl border border-white/10">
          <h2 className="text-lg font-bold text-white mb-6">สัดส่วนตำแหน่งนักเตะ</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 text-sm font-bold text-[var(--barca-gold)]">FWD</div>
              <div className="flex-1 h-3 bg-[var(--surface-3)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#A2001D] to-[#F87171]" style={{ width: `${(positions.FWD / totalPlayers) * 100}%` }} />
              </div>
              <div className="w-8 text-right text-sm text-[var(--text-secondary)]">{positions.FWD}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 text-sm font-bold text-[#60A5FA]">MID</div>
              <div className="flex-1 h-3 bg-[var(--surface-3)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#004D98] to-[#60A5FA]" style={{ width: `${(positions.MID / totalPlayers) * 100}%` }} />
              </div>
              <div className="w-8 text-right text-sm text-[var(--text-secondary)]">{positions.MID}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 text-sm font-bold text-[#A78BFA]">DEF</div>
              <div className="flex-1 h-3 bg-[var(--surface-3)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#4C1D95] to-[#A78BFA]" style={{ width: `${(positions.DEF / totalPlayers) * 100}%` }} />
              </div>
              <div className="w-8 text-right text-sm text-[var(--text-secondary)]">{positions.DEF}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 text-sm font-bold text-[#34D399]">GK</div>
              <div className="flex-1 h-3 bg-[var(--surface-3)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#065F46] to-[#34D399]" style={{ width: `${(positions.GK / totalPlayers) * 100}%` }} />
              </div>
              <div className="w-8 text-right text-sm text-[var(--text-secondary)]">{positions.GK}</div>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--surface-3)] flex items-center justify-center text-2xl mb-4">
            🚧
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Supabase Integration</h3>
          <p className="text-sm text-[var(--text-muted)] max-w-sm">
            Phase ถัดไป ระบบจะทำการเปลี่ยนแหล่งข้อมูล (Data Source) จากไฟล์ JSON เป็นฐานข้อมูล Supabase PostgreSQL
          </p>
        </div>
      </div>
    </div>
  );
}
