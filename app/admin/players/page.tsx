import Link from "next/link";
import Image from "next/image";
import { getPlayers } from "@/app/utils/supabase/queries";
import type { Player } from "@/types/player";
import { StatusBadge, PositionBadge } from "@/app/components/StatusBadge";

export const metadata = {
  title: "จัดการนักเตะ - La Masia Admin",
};

export default async function AdminPlayersPage() {
  const players = await getPlayers();
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">จัดการข้อมูลนักเตะ</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            รายการนักเตะทั้งหมดในระบบ ({players.length} คน)
          </p>
        </div>
        <Link
          href="/admin/players/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--barca-navy)] hover:bg-[var(--barca-navy-light)] text-white text-sm font-bold transition-colors"
        >
          <span className="text-lg leading-none">+</span> เพิ่มนักเตะใหม่
        </Link>
      </div>

      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-[var(--surface-2)] flex justify-between items-center">
          <input 
            type="text" 
            placeholder="ค้นหานักเตะ..." 
            className="bg-[var(--surface-3)] text-sm text-white px-4 py-2 rounded-lg border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] w-full max-w-sm"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--text-secondary)]">
            <thead className="text-xs uppercase bg-[var(--surface-3)]/50 text-[var(--text-muted)]">
              <tr>
                <th scope="col" className="px-6 py-4 rounded-tl-xl font-semibold">นักเตะ</th>
                <th scope="col" className="px-6 py-4 font-semibold">ตำแหน่ง</th>
                <th scope="col" className="px-6 py-4 font-semibold">สถานะ</th>
                <th scope="col" className="px-6 py-4 font-semibold hidden md:table-cell">สัญชาติ</th>
                <th scope="col" className="px-6 py-4 rounded-tr-xl font-semibold text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {players.map((player) => (
                <tr key={player.id} className="hover:bg-[var(--surface-2)] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm text-white"
                        style={{
                          background: player.position === "FWD" ? "linear-gradient(135deg, #A2001D, #D4002A)"
                            : player.position === "MID" ? "linear-gradient(135deg, #004D98, #0060BA)"
                            : player.position === "DEF" ? "linear-gradient(135deg, #7C3AED, #A78BFA)"
                            : "linear-gradient(135deg, #EDBB00, #F59E0B)"
                        }}
                      >
                        {player.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <div className="text-white font-bold">{player.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)]">
                          เข้าปี {player.lamasiaYear} {player.jerseyNumber ? `• #${player.jerseyNumber}` : ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PositionBadge position={player.position} size="sm" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={player.currentStatus} size="sm" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    {player.flagEmoji} {player.nationality}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end items-center gap-4">
                    <Link href={`/admin/players/${player.id}/edit`} className="text-[var(--barca-gold)] hover:text-white transition-colors">
                      Edit
                    </Link>
                    <form action={async () => {
                      "use server";
                      await import("@/app/actions/playerActions").then(m => m.deletePlayer(player.id));
                    }}>
                      <button type="submit" className="text-red-500 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-white/10 bg-[var(--surface-2)] flex justify-center text-xs text-[var(--text-muted)]">
          ข้อมูลดึงมาจากฐานข้อมูล Supabase (PostgreSQL) แบบ Real-time
        </div>
      </div>
    </div>
  );
}
