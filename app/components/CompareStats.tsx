import { Player } from "@/types/player";

interface CompareStatsProps {
  player1: Player | null;
  player2: Player | null;
}

function StatBar({ label, val1, val2, color1 = "var(--barca-crimson)", color2 = "var(--barca-navy)" }: { label: string, val1: number, val2: number, color1?: string, color2?: string }) {
  const max = Math.max(val1, val2, 1);
  const pct1 = (val1 / max) * 100;
  const pct2 = (val2 / max) * 100;

  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm mb-1.5 px-1">
        <span className="font-bold text-white">{val1}</span>
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className="font-bold text-white">{val2}</span>
      </div>
      <div className="flex items-center gap-1">
        {/* Bar 1 (Right aligned) */}
        <div className="flex-1 h-3 bg-[var(--surface-3)] rounded-full overflow-hidden flex justify-end">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${pct1}%`, background: color1 }}
          />
        </div>
        {/* Divider */}
        <div className="w-1 h-3 rounded-full bg-[var(--border-subtle)] shrink-0" />
        {/* Bar 2 (Left aligned) */}
        <div className="flex-1 h-3 bg-[var(--surface-3)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${pct2}%`, background: color2 }}
          />
        </div>
      </div>
    </div>
  );
}

export default function CompareStats({ player1, player2 }: CompareStatsProps) {
  if (!player1 || !player2) {
    return (
      <div className="glass p-8 rounded-3xl text-center text-[var(--text-muted)] border-dashed border-2 border-[var(--border-subtle)]">
        เลือกนักเตะทั้ง 2 คนเพื่อดูสถิติเปรียบเทียบ
      </div>
    );
  }

  // Calculate totals
  const p1Apps = player1.preSeasons.reduce((sum, ps) => sum + (ps.appearances || 0), 0);
  const p2Apps = player2.preSeasons.reduce((sum, ps) => sum + (ps.appearances || 0), 0);
  
  const p1Goals = player1.preSeasons.reduce((sum, ps) => sum + (ps.goals || 0), 0);
  const p2Goals = player2.preSeasons.reduce((sum, ps) => sum + (ps.goals || 0), 0);
  
  const p1Assists = player1.preSeasons.reduce((sum, ps) => sum + (ps.assists || 0), 0);
  const p2Assists = player2.preSeasons.reduce((sum, ps) => sum + (ps.assists || 0), 0);

  const p1Seasons = player1.preSeasons.length;
  const p2Seasons = player2.preSeasons.length;

  return (
    <div className="glass rounded-3xl p-6 md:p-8">
      <h3 className="font-display font-bold text-xl text-center mb-8">สถิติ Pre-Season รวม</h3>
      
      <StatBar label="ฤดูกาลที่ขึ้นชุดใหญ่" val1={p1Seasons} val2={p2Seasons} color1="#A2001D" color2="#004D98" />
      <StatBar label="แมตช์ที่ลงเล่น" val1={p1Apps} val2={p2Apps} color1="#D4002A" color2="#0060BA" />
      <StatBar label="ประตู" val1={p1Goals} val2={p2Goals} color1="#EDBB00" color2="#FBB414" />
      <StatBar label="แอสซิสต์" val1={p1Assists} val2={p2Assists} color1="#22C55E" color2="#10B981" />
    </div>
  );
}
