import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlayers } from "@/app/utils/supabase/queries";
import { deletePreSeason } from "@/app/actions/statsActions";
import { createClient } from "@/app/utils/supabase/server";
import { AdminBackButton } from "@/app/components/AdminBackButton";

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
  // since the getPlayers query doesn't expose the pre_season PK ID.
  const supabase = await createClient();
  const { data: preSeasons } = await supabase
    .from("pre_seasons")
    .select("*")
    .eq("player_id", id)
    .order("year", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <AdminBackButton href="/admin/stats" />
          <div>
            <h1 className="text-2xl font-display font-bold text-white">จัดการสถิติ: {player.name}</h1>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              สถิติพรีซีซั่นทั้งหมด ({preSeasons?.length || 0} ฤดูกาล)
            </p>
          </div>
        </div>
        <Link
          href={`/admin/players/${id}/stats/new`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--barca-navy)] hover:bg-[var(--barca-navy-light)] text-white text-sm font-bold transition-colors"
        >
          <span className="text-lg leading-none">+</span> เพิ่มสถิติฤดูกาลใหม่
        </Link>
      </div>

      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--text-secondary)]">
            <thead className="text-xs uppercase bg-[var(--surface-3)]/50 text-[var(--text-muted)]">
              <tr>
                <th scope="col" className="px-6 py-4 rounded-tl-xl font-semibold">ฤดูกาล (Season)</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">นัดที่ลง</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">นาที</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">ประตู</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">แอสซิสต์</th>
                <th scope="col" className="px-6 py-4 font-semibold hidden md:table-cell">สถานที่ / หมายเหตุ</th>
                <th scope="col" className="px-6 py-4 rounded-tr-xl font-semibold text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {!preSeasons || preSeasons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[var(--text-muted)]">
                    ยังไม่มีข้อมูลสถิติพรีซีซั่น
                  </td>
                </tr>
              ) : (
                preSeasons.map((stat) => (
                  <tr key={stat.id} className="hover:bg-[var(--surface-2)] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-white">
                      {stat.season}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center font-display text-lg text-white">
                      {stat.appearances}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center font-display text-lg text-white">
                      {stat.minutes_played}'
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center font-display text-lg text-white">
                      {stat.goals}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center font-display text-lg text-white">
                      {stat.assists}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell max-w-[200px] truncate">
                      {stat.tour_location && <div className="text-white text-xs">{stat.tour_location}</div>}
                      {stat.notes && <div className="text-[10px] text-[var(--text-muted)] truncate">{stat.notes}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <form action={async () => {
                        "use server";
                        await deletePreSeason(player.id, stat.id);
                      }}>
                        <button type="submit" className="text-red-500 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer">
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
