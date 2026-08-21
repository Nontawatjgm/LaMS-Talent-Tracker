import type { Player } from "@/types/player";

interface CompareStatsProps {
  player1: Player | null;
  player2: Player | null;
}

interface StatRowProps {
  label: string;
  subLabel?: string;
  val1: number;
  val2: number;
  unit?: string;
  prefix?: string;
  formatNumber?: (val: number) => string;
}

function StatRow({
  label,
  subLabel,
  val1,
  val2,
  unit = "",
  prefix = "",
  formatNumber,
}: StatRowProps) {
  const max = Math.max(val1, val2, 1);
  const pct1 = Math.round((val1 / max) * 100);
  const pct2 = Math.round((val2 / max) * 100);

  const num1Str = formatNumber ? formatNumber(val1) : `${val1}`;
  const num2Str = formatNumber ? formatNumber(val2) : `${val2}`;

  const isP1Higher = val1 > val2;
  const isP2Higher = val2 > val1;
  const isTie = val1 === val2 && val1 > 0;
  const isBothZero = val1 === 0 && val2 === 0;

  return (
    <div className="py-3 border-b border-gray-100 last:border-0 hover:bg-[#F8FAFD]/90 px-3 rounded-2xl transition-colors">
      {/* Numbers & Metric Label */}
      <div className="flex items-center justify-between mb-2">
        {/* Left: Player 1 Value (Red Corner) */}
        <div className="flex items-baseline gap-1 min-w-[80px] justify-start">
          {prefix && val1 > 0 && (
            <span
              className={`text-xs ${
                isP1Higher
                  ? "text-[#A2001D] font-black"
                  : isBothZero
                  ? "text-[#CBD5E1] font-medium"
                  : "text-[#94A3B8] font-bold"
              }`}
            >
              {prefix}
            </span>
          )}
          <span
            className={`font-display text-lg sm:text-xl tracking-tight transition-all ${
              isP1Higher
                ? "text-[#A2001D] font-black"
                : isBothZero
                ? "text-[#CBD5E1] font-medium"
                : isTie
                ? "text-[#0B1F40] font-bold"
                : "text-[#94A3B8] font-semibold"
            }`}
          >
            {val1 > 0 || (!prefix && !isBothZero) ? num1Str : val1 === 0 ? "0" : "-"}
          </span>
          {unit && val1 > 0 && (
            <span
              className={`text-xs ${
                isP1Higher
                  ? "text-[#A2001D] font-bold"
                  : isTie
                  ? "text-[#64748B] font-semibold"
                  : "text-[#94A3B8] font-normal"
              }`}
            >
              {unit}
            </span>
          )}
        </div>

        {/* Center: Metric Label & Subtitle */}
        <div className="text-center flex-1 px-3">
          <span className="font-bold text-xs sm:text-sm text-[#0B1F40] block font-display">
            {label}
          </span>
          {subLabel && (
            <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider block mt-0.5">
              {subLabel}
            </span>
          )}
        </div>

        {/* Right: Player 2 Value (Blue Corner) */}
        <div className="flex items-baseline gap-1 min-w-[80px] justify-end">
          {prefix && val2 > 0 && (
            <span
              className={`text-xs ${
                isP2Higher
                  ? "text-[#004D98] font-black"
                  : isBothZero
                  ? "text-[#CBD5E1] font-medium"
                  : "text-[#94A3B8] font-bold"
              }`}
            >
              {prefix}
            </span>
          )}
          <span
            className={`font-display text-lg sm:text-xl tracking-tight transition-all ${
              isP2Higher
                ? "text-[#004D98] font-black"
                : isBothZero
                ? "text-[#CBD5E1] font-medium"
                : isTie
                ? "text-[#0B1F40] font-bold"
                : "text-[#94A3B8] font-semibold"
            }`}
          >
            {val2 > 0 || (!prefix && !isBothZero) ? num2Str : val2 === 0 ? "0" : "-"}
          </span>
          {unit && val2 > 0 && (
            <span
              className={`text-xs ${
                isP2Higher
                  ? "text-[#004D98] font-bold"
                  : isTie
                  ? "text-[#64748B] font-semibold"
                  : "text-[#94A3B8] font-normal"
              }`}
            >
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Comparative Progress Bars (High Contrast Winner Glow) */}
      <div className="flex items-center gap-2">
        {/* Bar 1 (Left - Crimson) */}
        <div className="flex-1 h-3 bg-[#F1F5F9] rounded-full overflow-hidden flex justify-end p-0.5 border border-gray-100">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isP1Higher
                ? "bg-gradient-to-r from-[#A2001D] via-[#D4002A] to-[#FF4D6D] shadow-[0_0_12px_rgba(212,0,42,0.45)] opacity-100"
                : val1 > 0
                ? "bg-[#A2001D] opacity-25"
                : "bg-transparent"
            }`}
            style={{ width: `${pct1}%` }}
          />
        </div>

        {/* Center Dynamic Dot */}
        <div
          className={`w-2 h-2 rounded-full shrink-0 shadow-2xs ${
            isP1Higher
              ? "bg-[#A2001D] ring-2 ring-[#A2001D]/30"
              : isP2Higher
              ? "bg-[#004D98] ring-2 ring-[#004D98]/30"
              : isTie
              ? "bg-[#0B1F40] ring-2 ring-[#0B1F40]/20"
              : "bg-gray-300"
          }`}
        />

        {/* Bar 2 (Right - Navy) */}
        <div className="flex-1 h-3 bg-[#F1F5F9] rounded-full overflow-hidden p-0.5 border border-gray-100">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isP2Higher
                ? "bg-gradient-to-r from-[#004D98] via-[#0066CC] to-[#00C2FF] shadow-[0_0_12px_rgba(0,102,204,0.45)] opacity-100"
                : val2 > 0
                ? "bg-[#004D98] opacity-25"
                : "bg-transparent"
            }`}
            style={{ width: `${pct2}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function CompareStats({ player1, player2 }: CompareStatsProps) {
  if (!player1 || !player2) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-gray-200 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FDF2F4] to-[#EFF6FF] border border-gray-200 flex items-center justify-center mx-auto mb-3 text-[#0B1F40] shadow-xs">
          <span className="font-display font-black text-xl bg-gradient-to-r from-[#A2001D] to-[#004D98] bg-clip-text text-transparent">
            VS
          </span>
        </div>
        <p className="font-display font-bold text-base text-[#0B1F40]">
          เลือกนักเตะทั้ง 2 คนเพื่อเริ่มการดวลสถิติ
        </p>
        <p className="text-xs text-[#64748B] mt-1">
          ใช้กล่องค้นหาด้านบนเพื่อวิเคราะห์ข้อมูลแบบตัวต่อตัว
        </p>
      </div>
    );
  }

  // Calculate totals
  const p1Apps = player1.preSeasons.reduce((sum, ps) => sum + (ps.appearances || 0), 0);
  const p2Apps = player2.preSeasons.reduce((sum, ps) => sum + (ps.appearances || 0), 0);

  const p1Mins = player1.preSeasons.reduce((sum, ps) => sum + (ps.minutesPlayed || 0), 0);
  const p2Mins = player2.preSeasons.reduce((sum, ps) => sum + (ps.minutesPlayed || 0), 0);

  const p1Goals = player1.preSeasons.reduce((sum, ps) => sum + (ps.goals || 0), 0);
  const p2Goals = player2.preSeasons.reduce((sum, ps) => sum + (ps.goals || 0), 0);

  const p1Assists = player1.preSeasons.reduce((sum, ps) => sum + (ps.assists || 0), 0);
  const p2Assists = player2.preSeasons.reduce((sum, ps) => sum + (ps.assists || 0), 0);

  const p1Seasons = player1.preSeasons.length;
  const p2Seasons = player2.preSeasons.length;

  const p1MarketValue = player1.marketValueM || 0;
  const p2MarketValue = player2.marketValueM || 0;

  // Calculate overall stat wins
  let p1Wins = 0;
  let p2Wins = 0;
  if (p1Seasons > p2Seasons) p1Wins++; else if (p2Seasons > p1Seasons) p2Wins++;
  if (p1Apps > p2Apps) p1Wins++; else if (p2Apps > p1Apps) p2Wins++;
  if (p1Mins > p2Mins) p1Wins++; else if (p2Mins > p1Mins) p2Wins++;
  if (p1Goals > p2Goals) p1Wins++; else if (p2Goals > p1Goals) p2Wins++;
  if (p1Assists > p2Assists) p1Wins++; else if (p2Assists > p1Assists) p2Wins++;
  if (p1MarketValue > p2MarketValue) p1Wins++; else if (p2MarketValue > p1MarketValue) p2Wins++;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-200/90 shadow-md relative overflow-hidden">
      {/* Style A: Blaugrana Heritage Dual-Stripe Top Edge */}
      <div className="absolute top-0 left-0 right-0 h-1.5 flex">
        <div className="flex-1 bg-[#A2001D]" />
        <div className="flex-1 bg-[#004D98]" />
      </div>

      {/* Header Matchup Score Board (Locked 3-Column Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-3 pb-4 mb-4 border-b border-gray-100">
        {/* Player 1 Tag & Score (Col 1 - Left) */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#FDF2F4] border border-[#A2001D]/30 flex items-center justify-center font-display font-black text-sm text-[#A2001D] shrink-0 shadow-2xs">
            {p1Wins}
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-black uppercase tracking-wider text-[#A2001D] block font-mono">
              RED CORNER
            </span>
            <span className="font-display font-bold text-sm sm:text-base text-[#0B1F40] truncate block">
              {player1.name}
            </span>
          </div>
        </div>

        {/* Center Title (Col 2 - 100% Locked Center) */}
        <div className="flex items-center justify-center order-first sm:order-none">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F8FAFD] border border-gray-200 text-xs font-bold text-[#0B1F40] shadow-2xs whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-[#A2001D]" />
            <span>สถิติ PRE-SEASON ทั้งหมด</span>
            <span className="w-2 h-2 rounded-full bg-[#004D98]" />
          </div>
        </div>

        {/* Player 2 Tag & Score (Col 3 - Right) */}
        <div className="flex items-center justify-end gap-2.5 text-right min-w-0">
          <div className="min-w-0">
            <span className="text-[9px] font-black uppercase tracking-wider text-[#004D98] block font-mono">
              BLUE CORNER
            </span>
            <span className="font-display font-bold text-sm sm:text-base text-[#0B1F40] truncate block">
              {player2.name}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] border border-[#004D98]/30 flex items-center justify-center font-display font-black text-sm text-[#004D98] shrink-0 shadow-2xs">
            {p2Wins}
          </div>
        </div>
      </div>

      {/* Comparative Stat Rows */}
      <div className="space-y-0.5">
        <StatRow
          label="ฤดูกาลที่ขึ้นพรีซีซั่น"
          subLabel="PRE-SEASONS"
          val1={p1Seasons}
          val2={p2Seasons}
          unit="ฤดูกาล"
        />

        <StatRow
          label="แมตช์ที่ลงเล่นสะสม"
          subLabel="APPEARANCES"
          val1={p1Apps}
          val2={p2Apps}
          unit="นัด"
        />

        <StatRow
          label="นาทีสะสมในสนาม"
          subLabel="MINUTES PLAYED"
          val1={p1Mins}
          val2={p2Mins}
          formatNumber={(val) => `${val}'`}
        />

        <StatRow
          label="ประตูที่ทำได้"
          subLabel="GOALS SCORED"
          val1={p1Goals}
          val2={p2Goals}
          unit="ประตู"
        />

        <StatRow
          label="แอสซิสต์รวม"
          subLabel="ASSISTS"
          val1={p1Assists}
          val2={p2Assists}
          unit="แอสซิสต์"
        />

        {(p1MarketValue > 0 || p2MarketValue > 0) && (
          <StatRow
            label="มูลค่าตลาดประเมิน"
            subLabel="MARKET VALUE"
            val1={p1MarketValue}
            val2={p2MarketValue}
            prefix="€"
            unit="m"
          />
        )}
      </div>

      {/* Scouting Summary Banner */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2.5 bg-[#F8FAFD] -mx-5 sm:-mx-7 -mb-5 sm:-mb-7 p-4 sm:p-5 rounded-b-3xl">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center -space-x-0.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#A2001D]" />
            <span className="w-2 h-2 rounded-full bg-[#004D98]" />
          </span>
          <span className="text-xs sm:text-sm font-bold text-[#0B1F40]">
            {p1Wins > p2Wins
              ? `${player1.name} มีสถิติโดดเด่นกว่าใน ${p1Wins} หมวดหมู่`
              : p2Wins > p1Wins
              ? `${player2.name} มีสถิติโดดเด่นกว่าใน ${p2Wins} หมวดหมู่`
              : `ทั้งสองคนมีสถิติที่สูสีและใกล้เคียงกันมาก`}
          </span>
        </div>

        <span className="text-[11px] font-mono font-semibold text-[#64748B]">
          FC Barcelona · La Masia Scouting Matrix
        </span>
      </div>
    </div>
  );
}
