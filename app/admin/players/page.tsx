import Link from "next/link";
import { getPlayers } from "@/app/utils/supabase/queries";
import AdminPlayersList from "./AdminPlayersList";

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
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-md hover:opacity-95 transition-all"
          style={{
            background: "linear-gradient(135deg, #A2001D, #D4002A)",
            boxShadow: "0 2px 10px rgba(162, 0, 29, 0.25)",
          }}
        >
          <span className="text-lg leading-none">+</span> เพิ่มนักเตะใหม่
        </Link>
      </div>

      <AdminPlayersList initialPlayers={players} />
    </div>
  );
}
