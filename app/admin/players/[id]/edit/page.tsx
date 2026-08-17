import Link from "next/link";
import { notFound } from "next/navigation";
import { updatePlayer } from "@/app/actions/playerActions";
import { topNationalities } from "@/app/utils/flags";
import { getPlayers } from "@/app/utils/supabase/queries";
import { AdminBackButton } from "@/app/components/AdminBackButton";

export const metadata = {
  title: "แก้ไขข้อมูลนักเตะ - La Masia Admin",
};

function formatToDDMMYYYY(dateStr?: string | null): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }
  return dateStr;
}

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
        <AdminBackButton href="/admin/players" />
        <div>
          <h1 className="text-2xl font-display font-bold text-white">แก้ไขข้อมูล: {player.name}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
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
                <input type="text" name="name" defaultValue={player.name} required className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] placeholder:text-gray-500" placeholder="Lamine Yamal" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">ไอดี (ID)</label>
                <input type="text" name="id" defaultValue={player.id} disabled className="w-full bg-[var(--surface-3)] text-[var(--text-muted)] px-4 py-2.5 rounded-xl border border-white/5 opacity-50 cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">ตำแหน่ง <span className="text-red-500">*</span></label>
                <select name="position" defaultValue={player.position} required className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)]">
                  {/* Keep old options hidden so existing data doesn't default to ST if not updated yet */}
                  <option value="FWD" hidden>FWD (Legacy)</option>
                  <option value="MID" hidden>MID (Legacy)</option>
                  <option value="DEF" hidden>DEF (Legacy)</option>
                  
                  <optgroup label="ผู้รักษาประตู (Goalkeepers)">
                    <option value="GK">GK</option>
                  </optgroup>
                  <optgroup label="กองหลัง (Defenders)">
                    <option value="CB">CB</option>
                    <option value="LB">LB</option>
                    <option value="RB">RB</option>
                  </optgroup>
                  <optgroup label="กองกลาง (Midfielders)">
                    <option value="CDM">CDM</option>
                    <option value="CM">CM</option>
                    <option value="CAM">CAM</option>
                  </optgroup>
                  <optgroup label="กองหน้า (Attackers)">
                    <option value="LW">LW</option>
                    <option value="RW">RW</option>
                    <option value="ST">ST</option>
                  </optgroup>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">ปีที่เข้า La Masia <span className="text-red-500">*</span></label>
                <input type="number" name="lamasia_year" defaultValue={player.lamasiaYear} required className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] placeholder:text-gray-500" placeholder="2014" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">สัญชาติ <span className="text-red-500">*</span></label>
                <input type="text" name="nationality" defaultValue={player.nationality} list="nationalities" required className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] placeholder:text-gray-500" placeholder="Spain" />
                <datalist id="nationalities">
                  {topNationalities.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">วันเกิด <span className="text-red-500">*</span></label>
                <input type="text" name="date_of_birth" defaultValue={formatToDDMMYYYY(player.dateOfBirth)} required className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] placeholder:text-gray-500" placeholder="13/07/2007" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">หมายเลขเสื้อ</label>
                <input type="text" name="jersey_number" defaultValue={player.jerseyNumber || ""} className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] placeholder:text-gray-500" placeholder="19" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">ส่วนสูง (ซม.)</label>
                <input type="text" name="height" defaultValue={player.height || ""} className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] placeholder:text-gray-500" placeholder="178" />
              </div>
            </div>
            <div className="space-y-2 mt-6">
              <label className="text-sm text-[var(--text-secondary)] font-medium">คำอธิบาย (ภาษาไทย)</label>
              <textarea name="description_th" defaultValue={player.descriptionTH || ""} rows={4} className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] resize-none placeholder:text-gray-500" placeholder="ประวัติและข้อมูลนักเตะ..." />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-t border-white/10 pt-6">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              ข้อมูลเชิงลึก (Player Details)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">เท้าที่ถนัด</label>
                <select name="preferred_foot" defaultValue={player.preferredFoot || ""} className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)]">
                  <option value="">-- ไม่ระบุ --</option>
                  <option value="Right">ขวา (Right)</option>
                  <option value="Left">ซ้าย (Left)</option>
                  <option value="Both">ทั้งสองเท้า (Both)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">มูลค่าการตลาด (ล้านยูโร)</label>
                <input type="text" name="market_value_m" defaultValue={player.marketValueM || ""} className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] placeholder:text-gray-500" placeholder="120" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">วันที่ลงเล่นทีมชุดใหญ่ครั้งแรก</label>
                <input type="text" name="first_team_debut_date" defaultValue={formatToDDMMYYYY(player.firstTeamDebutDate)} className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] placeholder:text-gray-500" placeholder="29/04/2023" />
              </div>
            </div>
          </section>

          {/* สื่อและโซเชียล */}
          <section>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-t border-white/10 pt-6">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              สื่อและโซเชียล (Media & Social)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">รูปภาพโปรไฟล์ (URL)</label>
                <input type="url" name="image_url" defaultValue={player.imageUrl || ""} className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] placeholder:text-gray-500" placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">รูปภาพแอคชั่น (URL)</label>
                <input type="url" name="action_shot_url" defaultValue={player.actionShotUrl || ""} className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] placeholder:text-gray-500" placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">Instagram Username</label>
                <input type="text" name="social_instagram" defaultValue={player.socialInstagram || ""} className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] placeholder:text-gray-500" placeholder="lamineyamal" />
              </div>
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
                  {/* Hidden legacy options */}
                  <option value="academy" hidden>ทีมเยาวชน (Academy - Legacy)</option>
                  <option value="sold" hidden>ย้ายทีม (Sold - Legacy)</option>

                  <option value="promoted">ขึ้นทีมชุดใหญ่ (First Team)</option>
                  <option value="barca_atletic">Barça Atlètic</option>
                  <option value="juvenil_a">Juvenil (U19)</option>
                  <option value="loaned">ยืมตัว (Loaned)</option>
                  <option value="released">ปล่อยตัว (Released)</option>
                  <option value="transferred">ย้ายทีม (Transferred / Sold)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)] font-medium">สโมสรปัจจุบัน</label>
                <input type="text" name="current_club" defaultValue={player.currentClub || ""} className="w-full bg-[var(--surface-3)] text-white px-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--barca-gold)] placeholder:text-gray-500" placeholder="FC Barcelona" />
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
