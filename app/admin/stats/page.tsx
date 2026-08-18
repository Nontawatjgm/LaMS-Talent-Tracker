import { getPlayers } from "@/app/utils/supabase/queries";
import AdminStatsList from "./AdminStatsList";

export const metadata = {
  title: "จัดการสถิติพรีซีซั่น - La Masia Admin",
};

export default async function AdminStatsOverviewPage() {
  const players = await getPlayers();
  
  // กรองนักเตะที่ยังไม่ได้ขึ้นชุดใหญ่ หรือถูกขาย/ปล่อยตัวออกไป (focus เฉพาะเด็กปั้น)
  // user request: ไม่ให้นักเตะที่ขึ้นชุดใหญ่ไปแล้วมาแสดง
  const academyPlayers = players.filter(p => p.currentStatus !== 'promoted');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">เลือกลงสถิติพรีซีซั่น</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            เลือกนักเตะเยาวชนเพื่อจัดการสถิติ ({academyPlayers.length} คนที่ยังไม่ขึ้นชุดใหญ่)
          </p>
        </div>
      </div>

      <AdminStatsList initialPlayers={academyPlayers} />
    </div>
  );
}
