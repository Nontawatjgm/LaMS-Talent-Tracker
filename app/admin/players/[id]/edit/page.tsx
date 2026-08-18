import { notFound } from "next/navigation";
import { updatePlayer } from "@/app/actions/playerActions";
import { getPlayers } from "@/app/utils/supabase/queries";
import { AdminBackButton } from "@/app/components/AdminBackButton";
import { PlayerForm } from "@/app/components/PlayerForm";

export const metadata = {
  title: "แก้ไขข้อมูลนักเตะ - La Masia Admin",
};

export default async function EditPlayerPage(props: PageProps<"/admin/players/[id]/edit">) {
  const { id } = await props.params;
  const players = await getPlayers();
  const player = players.find(p => p.id === id);

  if (!player) {
    notFound();
  }

  // Create a bound action that includes the player ID
  const updatePlayerWithId = updatePlayer.bind(null, player.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <AdminBackButton href="/admin/players" label="กลับหน้ารายชื่อนักเตะ" />
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">แก้ไขข้อมูล: {player.name}</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            แก้ไขข้อมูลพื้นฐานและสถานะของนักเตะ
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/10 p-6 md:p-8">
        <PlayerForm player={player} action={updatePlayerWithId} isEdit={true} />
      </div>
    </div>
  );
}
