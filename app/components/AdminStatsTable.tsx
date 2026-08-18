"use client";

import { useState, useTransition } from "react";
import { deletePreSeason } from "@/app/actions/statsActions";
import { ConfirmModal } from "@/app/components/ConfirmModal";
import { useToast } from "@/app/components/Toast";

interface PreSeasonRecord {
  id: string;
  player_id: string;
  season: string;
  year: number;
  appearances: number;
  minutes_played: number;
  goals: number;
  assists: number;
  tour_location: string | null;
  notes: string | null;
}

interface AdminStatsTableProps {
  playerId: string;
  playerName: string;
  preSeasons: PreSeasonRecord[];
}

export function AdminStatsTable({
  playerId,
  playerName,
  preSeasons,
}: AdminStatsTableProps) {
  const [statToDelete, setStatToDelete] = useState<PreSeasonRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { success, error: toastError } = useToast();

  const handleConfirmDelete = () => {
    if (!statToDelete) return;
    const statId = statToDelete.id;
    const season = statToDelete.season;
    setDeletingId(statId);

    startTransition(async () => {
      try {
        await deletePreSeason(playerId, statId);
        success("ลบสถิติสำเร็จ", `ลบสถิติฤดูกาล ${season} ของ ${playerName} เรียบร้อยแล้ว`);
        setStatToDelete(null);
      } catch (err) {
        toastError("เกิดข้อผิดพลาดในการลบสถิติ", err instanceof Error ? err.message : String(err));
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <>
      <div className="glass rounded-2xl border border-[rgba(0,77,152,0.12)] overflow-hidden">
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
            <tbody className="divide-y divide-gray-100">
              {!preSeasons || preSeasons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[var(--text-muted)]">
                    ยังไม่มีข้อมูลสถิติพรีซีซั่น
                  </td>
                </tr>
              ) : (
                preSeasons.map((stat) => (
                  <tr key={stat.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-[var(--text-primary)]">
                      {stat.season}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center font-display text-base font-bold text-[var(--text-primary)]">
                      {stat.appearances}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center font-display text-base font-bold text-[var(--text-primary)]">
                      {stat.minutes_played}'
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center font-display text-base font-bold text-emerald-600">
                      {stat.goals}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center font-display text-base font-bold text-blue-600">
                      {stat.assists}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell max-w-[200px] truncate">
                      {stat.tour_location && <div className="text-[var(--text-primary)] text-xs font-medium">{stat.tour_location}</div>}
                      {stat.notes && <div className="text-[10px] text-[var(--text-muted)] truncate">{stat.notes}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => setStatToDelete(stat)}
                        disabled={deletingId === stat.id || isPending}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 bg-red-50/80 hover:bg-red-600 hover:text-white transition-all border border-red-200 cursor-pointer disabled:opacity-50"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compact Confirmation Modal */}
      <ConfirmModal
        isOpen={!!statToDelete}
        onClose={() => !isPending && setStatToDelete(null)}
        onConfirm={handleConfirmDelete}
        isPending={isPending}
        title="ลบสถิติพรีซีซั่น"
        description={
          <span>
            ต้องการลบสถิติฤดูกาล <strong className="text-[#0B1F40] font-bold">"{statToDelete?.season}"</strong> ของ <strong>{playerName}</strong> หรือไม่? (ข้อมูลจะถูกลบถาวร)
          </span>
        }
        confirmText="ลบสถิติ"
        cancelText="ยกเลิก"
        variant="danger"
      />
    </>
  );
}
