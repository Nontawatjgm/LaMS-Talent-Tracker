import Link from "next/link";
import { notFound } from "next/navigation";
import { updatePlayer } from "@/app/actions/playerActions";
import { getPlayers } from "@/app/utils/supabase/queries";

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
      <div className="flex items-center gap-4">
        <Link href="/admin/players" className="text-[var(--text-muted)] hover:text-white transition-colors">
          ← กลับ
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">แก้ไขข้อมูล: {player.name}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            แก้ไขข้อมูลพื้นฐานและสถานะของนักเตะ
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/10 p-6 md:p-8">
        <form action={updatePlayerWithId} className="space-y-8">
          
          {/* ข้อมูลพื้นฐาน */}
          <section>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--barca-gold)]" />
              ข้อมูลพื้นฐาน (Basic Info)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">ชื่อนักเตะ <span className="text-red-500">*</span></label>
                <input type="text" name="name" defaultValue={player.name} required className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)]" placeholder="เช่น Lamine Yamal" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">ไอดี (ID)</label>
                <input type="text" name="id" defaultValue={player.id} disabled className="w-full bg-[var(--surface-3)] text-[var(--text-muted)] px-4 py-2.5 rounded-xl border border-white/5 opacity-50 cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">ตำแหน่ง <span className="text-red-500">*</span></label>
                <select name="position" defaultValue={player.position} required className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)]">
                  <option value="FWD">กองหน้า (FWD)</option>
                  <option value="MID">กองกลาง (MID)</option>
                  <option value="DEF">กองหลัง (DEF)</option>
                  <option value="GK">ผู้รักษาประตู (GK)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">ปีที่เข้า La Masia <span className="text-red-500">*</span></label>
                <input type="number" name="lamasia_year" defaultValue={player.lamasiaYear} required className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">สัญชาติ <span className="text-red-500">*</span></label>
                <input type="text" name="nationality" defaultValue={player.nationality} required className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">อิโมจิธงชาติ <span className="text-red-500">*</span></label>
                <input type="text" name="flag_emoji" defaultValue={player.flagEmoji} required className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">วันเกิด <span className="text-red-500">*</span></label>
                <input type="date" name="date_of_birth" defaultValue={player.dateOfBirth} required className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">หมายเลขเสื้อ</label>
                <input type="number" name="jersey_number" defaultValue={player.jerseyNumber || ""} className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">ส่วนสูง (ซม.)</label>
                <input type="number" name="height" defaultValue={player.height || ""} className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)]" />
              </div>
            </div>
            <div className="space-y-2 mt-6">
              <label className="text-sm text-[var(--text-secondary)] font-medium">คำอธิบาย (ภาษาไทย)</label>
              <textarea name="description_th" defaultValue={player.descriptionTH || ""} rows={4} className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] resize-none" placeholder="รายละเอียดนักเตะ..." />
            </div>
          </section>

          {/* สถานะปัจจุบัน */}
          <section>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-t border-white/10 pt-6">
              <span className="w-2 h-2 rounded-full bg-[var(--barca-crimson)]" />
              สถานะปัจจุบัน (Current Status)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">สถานะนักเตะ <span className="text-red-500">*</span></label>
                <select name="current_status" defaultValue={player.currentStatus} required className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)]">
                  <option value="academy">ทีมเยาวชน (Academy)</option>
                  <option value="promoted">ขึ้นทีมชุดใหญ่ (Promoted)</option>
                  <option value="loaned">ยืมตัว (Loaned)</option>
                  <option value="released">ปล่อยตัว (Released)</option>
                  <option value="sold">ย้ายทีม (Sold)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">สโมสรปัจจุบัน</label>
                <input type="text" name="current_club" defaultValue={player.currentClub || ""} className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)]" />
              </div>
            </div>
          </section>

          <div className="pt-6 border-t border-white/10 flex items-center justify-end gap-3">
            <Link href="/admin/players" className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-[var(--surface-3)] hover:bg-[var(--surface-4)] transition-colors">
              ยกเลิก
            </Link>
            <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--barca-navy)] hover:bg-[var(--barca-navy-light)] transition-colors">
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
