import { notFound } from "next/navigation";
import { getPlayers } from "@/app/utils/supabase/queries";
import { createClient } from "@/app/utils/supabase/server";
import { updatePreSeason } from "@/app/actions/statsActions";
import { AdminBackButton } from "@/app/components/AdminBackButton";
import { PreSeasonForm } from "@/app/components/PreSeasonForm";

export const metadata = {
  title: "แก้ไขสถิติพรีซีซั่น - La Masia Admin",
};

interface EditPreSeasonPageProps {
  params: Promise<{
    id: string;
    statId: string;
  }>;
}

export default async function EditPreSeasonPage(props: EditPreSeasonPageProps) {
  const { id, statId } = await props.params;
  const players = await getPlayers();
  const player = players.find((p) => p.id === id);

  if (!player) {
    notFound();
  }

  const supabase = await createClient();
  const { data: stat, error } = await supabase
    .from("pre_seasons")
    .select("*")
    .eq("id", statId)
    .eq("player_id", id)
    .single();

  if (error || !stat) {
    notFound();
  }

  // Bind the playerId and statId to the update action
  const updatePreSeasonForPlayer = updatePreSeason.bind(null, player.id, stat.id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <AdminBackButton href="/admin/stats" label="กลับหน้ารวมสถิติ" />
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">
            แก้ไขสถิติพรีซีซั่น: {player.name}
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            แก้ไขสถิติประจำฤดูกาล {stat.season} ({stat.year})
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/10 p-6 md:p-8">
        <PreSeasonForm
          playerId={player.id}
          action={updatePreSeasonForPlayer}
          stat={stat}
          isEdit={true}
        />
      </div>
    </div>
  );
}
