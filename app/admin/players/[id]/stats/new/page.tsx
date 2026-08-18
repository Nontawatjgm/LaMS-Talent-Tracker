import { notFound } from "next/navigation";
import { getPlayers } from "@/app/utils/supabase/queries";
import { createPreSeason } from "@/app/actions/statsActions";
import { AdminBackButton } from "@/app/components/AdminBackButton";
import { PreSeasonForm } from "@/app/components/PreSeasonForm";

export const metadata = {
  title: "เพิ่มสถิติพรีซีซั่น - La Masia Admin",
};

export default async function NewPreSeasonPage(props: PageProps<"/admin/players/[id]/stats/new">) {
  const { id } = await props.params;
  const players = await getPlayers();
  const player = players.find(p => p.id === id);

  if (!player) {
    notFound();
  }

  // Bind the playerId to the server action
  const createPreSeasonForPlayer = createPreSeason.bind(null, player.id);

  // Suggest the next year/season
  const currentYear = new Date().getFullYear();
  const suggestedSeason = `${currentYear}/${(currentYear + 1).toString().slice(2)}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <AdminBackButton href={`/admin/players/${id}/stats`} label="กลับหน้าสถิตินักเตะ" />
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">เพิ่มสถิติพรีซีซั่น: {player.name}</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            กรอกข้อมูลสถิติของนักเตะสำหรับฤดูกาลใหม่
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/10 p-6 md:p-8">
        <PreSeasonForm
          playerId={player.id}
          action={createPreSeasonForPlayer}
          suggestedSeason={suggestedSeason}
          currentYear={currentYear}
        />
      </div>
    </div>
  );
}
