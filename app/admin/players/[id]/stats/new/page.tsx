import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlayers } from "@/app/utils/supabase/queries";
import { createPreSeason } from "@/app/actions/statsActions";
import { AdminBackButton } from "@/app/components/AdminBackButton";

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
      <div className="flex items-center gap-4">
        <AdminBackButton href={`/admin/players/${id}/stats`} />
        <div>
          <h1 className="text-2xl font-display font-bold text-white">เพิ่มสถิติพรีซีซั่น: {player.name}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            กรอกข้อมูลสถิติของนักเตะสำหรับฤดูกาลใหม่
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/10 p-6 md:p-8">
        <form action={createPreSeasonForPlayer} className="space-y-8">
          
          <section>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--barca-gold)]" />
              ข้อมูลฤดูกาล (Season Info)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">ฤดูกาล (Season) <span className="text-red-500">*</span></label>
                <input type="text" name="season" list="seasons-list" defaultValue={suggestedSeason} required className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] placeholder:text-gray-500" placeholder="2024/25" />
                <datalist id="seasons-list">
                  <option value="2026/27">2026/27</option>
                  <option value="2025/26">2025/26</option>
                  <option value="2024/25">2024/25</option>
                  <option value="2023/24">2023/24</option>
                  <option value="2022/23">2022/23</option>
                  <option value="2021/22">2021/22</option>
                  <option value="2020/21">2020/21</option>
                </datalist>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">ปี (Year) <span className="text-red-500">*</span></label>
                <input type="number" name="year" defaultValue={currentYear} required className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] placeholder:text-gray-500" placeholder="2024" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">สถานที่ทัวร์ (Tour Location)</label>
                <input type="text" name="tour_location" className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] placeholder:text-gray-500" placeholder="USA Tour" />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-t border-white/10 pt-6">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              สถิติการเล่น (Performance Stats)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">ลงเล่น (นัด)</label>
                <input type="number" name="appearances" defaultValue="0" min="0" className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] text-center font-display text-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">เวลาเล่น (นาที)</label>
                <input type="number" name="minutes_played" defaultValue="0" min="0" className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] text-center font-display text-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">ประตู (Goals)</label>
                <input type="number" name="goals" defaultValue="0" min="0" className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] text-center font-display text-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">แอสซิสต์ (Assists)</label>
                <input type="number" name="assists" defaultValue="0" min="0" className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] text-center font-display text-lg" />
              </div>
            </div>
            
            <div className="space-y-2 mt-6">
              <label className="text-sm text-[var(--text-secondary)] font-medium">หมายเหตุ (Notes)</label>
              <textarea name="notes" rows={3} className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] resize-none placeholder:text-gray-500" placeholder="บันทึกผลงานเด่น เช่น ยิง 1 ประตูในเกมพบ แมนฯ ซิตี้..." />
            </div>
          </section>

          <div className="pt-6 border-t border-white/10 flex items-center justify-end gap-3">
            <Link href={`/admin/players/${id}/stats`} className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-[var(--surface-3)] hover:bg-[var(--surface-4)] transition-colors">
              ยกเลิก
            </Link>
            <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--barca-navy)] hover:bg-[var(--barca-navy-light)] transition-colors">
              บันทึกสถิติ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
