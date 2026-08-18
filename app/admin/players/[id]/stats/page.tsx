import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlayers } from "@/app/utils/supabase/queries";
import { createClient } from "@/app/utils/supabase/server";
import { AdminBackButton } from "@/app/components/AdminBackButton";
import { AdminStatsTable } from "@/app/components/AdminStatsTable";

export const metadata = {
  title: "จัดการสถิติพรีซีซั่น - La Masia Admin",
};

export default async function AdminPlayerStatsPage(props: PageProps<"/admin/players/[id]/stats">) {
  const { id } = await props.params;
  const players = await getPlayers();
  const player = players.find(p => p.id === id);

  if (!player) {
    notFound();
  }

  // We need to fetch pre_seasons directly to get their IDs for deletion
  const supabase = await createClient();
  const { data: preSeasons } = await supabase
    .from("pre_seasons")
    .select("*")
    .eq("player_id", id)
    .order("year", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <AdminBackButton href="/admin/stats" label="กลับหน้ารายการสถิติ" />
          <div>
            <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">จัดการสถิติ: {player.name}</h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              สถิติพรีซีซั่นทั้งหมด ({preSeasons?.length || 0} ฤดูกาล)
            </p>
          </div>
        </div>
        <Link
          href={`/admin/players/${id}/stats/new`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-md hover:opacity-95 active:scale-[0.98] transition-all"
          style={{
            background: "linear-gradient(135deg, #A2001D, #D4002A)",
            boxShadow: "0 2px 10px rgba(162, 0, 29, 0.25)",
          }}
        >
          <span className="text-base leading-none">+</span> เพิ่มสถิติฤดูกาลใหม่
        </Link>
      </div>

      <AdminStatsTable
        playerId={player.id}
        playerName={player.name}
        preSeasons={preSeasons || []}
      />
    </div>
  );
}
