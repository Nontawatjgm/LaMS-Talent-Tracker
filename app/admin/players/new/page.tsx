import { createPlayer } from "@/app/actions/playerActions";
import { AdminBackButton } from "@/app/components/AdminBackButton";
import { PlayerForm } from "@/app/components/PlayerForm";

export const metadata = {
  title: "เพิ่มนักเตะใหม่ - La Masia Admin",
};

export default function NewPlayerPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <AdminBackButton href="/admin/players" label="กลับหน้ารายชื่อนักเตะ" />
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">เพิ่มนักเตะใหม่</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            กรอกข้อมูลนักเตะดาวรุ่งคนใหม่เพื่อเพิ่มเข้าระบบ
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/10 p-6 md:p-8">
        <PlayerForm action={createPlayer} isEdit={false} />
      </div>
    </div>
  );
}
