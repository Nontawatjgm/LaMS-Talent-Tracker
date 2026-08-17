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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--barca-navy)] hover:bg-[var(--barca-navy-light)] text-white text-sm font-bold transition-colors"
        >
          <span className="text-lg leading-none">+</span> เพิ่มนักเตะใหม่
        </Link>
      </div>

      <AdminPlayersList initialPlayers={players} />
    </div>
  );
}
