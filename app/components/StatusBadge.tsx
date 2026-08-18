import type { Position, Status } from "@/types/player";

interface StatusBadgeProps {
  status: Status;
  size?: "sm" | "md";
  className?: string;
}

interface PositionBadgeProps {
  position: Position;
  size?: "sm" | "md";
  className?: string;
}

const statusConfig: Record<
  Status,
  { label: string; dotColor: string; bgClass: string; textClass: string; borderClass: string }
> = {
  promoted: {
    label: "First Team",
    dotColor: "bg-[#A2001D]",
    bgClass: "bg-white dark:bg-gray-900",
    textClass: "text-[#004D98] dark:text-blue-300 font-bold",
    borderClass: "border-transparent",
  },
  barca_atletic: {
    label: "Barça Atlètic",
    dotColor: "bg-[#004D98]",
    bgClass: "bg-white dark:bg-gray-900",
    textClass: "text-[#004D98] dark:text-blue-300 font-bold",
    borderClass: "border-[#004D98]/30 dark:border-blue-500/40 shadow-xs",
  },
  juvenil_a: {
    label: "Juvenil (U19)",
    dotColor: "bg-purple-600",
    bgClass: "bg-white dark:bg-gray-900",
    textClass: "text-purple-700 dark:text-purple-300 font-bold",
    borderClass: "border-purple-300/80 dark:border-purple-500/40 shadow-xs",
  },
  academy: {
    label: "Barça Atlètic",
    dotColor: "bg-[#004D98]",
    bgClass: "bg-white dark:bg-gray-900",
    textClass: "text-[#004D98] dark:text-blue-300 font-bold",
    borderClass: "border-[#004D98]/30 dark:border-blue-500/40 shadow-xs",
  },
  loaned: {
    label: "Loaned",
    dotColor: "bg-amber-500",
    bgClass: "bg-white dark:bg-gray-900",
    textClass: "text-amber-700 dark:text-amber-300 font-bold",
    borderClass: "border-amber-300/80 dark:border-amber-500/40 shadow-xs",
  },
  released: {
    label: "Released",
    dotColor: "bg-rose-500",
    bgClass: "bg-white dark:bg-gray-900",
    textClass: "text-rose-700 dark:text-rose-300 font-bold",
    borderClass: "border-rose-300/80 dark:border-rose-500/40 shadow-xs",
  },
  transferred: {
    label: "Transferred",
    dotColor: "bg-slate-400",
    bgClass: "bg-white dark:bg-gray-900",
    textClass: "text-slate-700 dark:text-slate-300 font-bold",
    borderClass: "border-slate-300 dark:border-slate-600 shadow-xs",
  },
  sold: {
    label: "Sold",
    dotColor: "bg-slate-400",
    bgClass: "bg-white dark:bg-gray-900",
    textClass: "text-slate-700 dark:text-slate-300 font-bold",
    borderClass: "border-slate-300 dark:border-slate-600 shadow-xs",
  },
};

const positionConfig: Record<
  Position,
  { label: string; bgClass: string; textClass: string; borderClass: string }
> = {
  GK: {
    label: "GK",
    bgClass: "bg-white dark:bg-gray-900",
    textClass: "text-amber-700 dark:text-amber-300",
    borderClass: "border-amber-300/80 dark:border-amber-500/40 shadow-xs",
  },
  CB: {
    label: "CB",
    bgClass: "bg-white dark:bg-gray-900",
    textClass: "text-purple-700 dark:text-purple-300",
    borderClass: "border-purple-300/80 dark:border-purple-500/40 shadow-xs",
  },
  LB: {
    label: "LB",
    bgClass: "bg-white dark:bg-gray-900",
    textClass: "text-purple-700 dark:text-purple-300",
    borderClass: "border-purple-300/80 dark:border-purple-500/40 shadow-xs",
  },
  RB: {
    label: "RB",
    bgClass: "bg-white dark:bg-gray-900",
    textClass: "text-purple-700 dark:text-purple-300",
    borderClass: "border-purple-300/80 dark:border-purple-500/40 shadow-xs",
  },
  DEF: {
    label: "DEF",
    bgClass: "bg-white dark:bg-gray-900",
    textClass: "text-purple-700 dark:text-purple-300",
    borderClass: "border-purple-300/80 dark:border-purple-500/40 shadow-xs",
  },
  CDM: {
    label: "CDM",
    bgClass: "bg-white dark:bg-gray-900",
    textClass: "text-[#004D98] dark:text-blue-300",
    borderClass: "border-[rgba(0,77,152,0.3)] dark:border-blue-500/40 shadow-xs",
  },
  CM: {
    label: "CM",
    bgClass: "bg-white dark:bg-gray-900",
    textClass: "text-[#004D98] dark:text-blue-300",
    borderClass: "border-[rgba(0,77,152,0.3)] dark:border-blue-500/40 shadow-xs",
  },
  CAM: {
    label: "CAM",
    bgClass: "bg-white dark:bg-gray-900",
    textClass: "text-[#004D98] dark:text-blue-300",
    borderClass: "border-[rgba(0,77,152,0.3)] dark:border-blue-500/40 shadow-xs",
  },
  MID: {
    label: "MID",
    bgClass: "bg-white dark:bg-gray-900",
    textClass: "text-[#004D98] dark:text-blue-300",
    borderClass: "border-[rgba(0,77,152,0.3)] dark:border-blue-500/40 shadow-xs",
  },
  LW: {
    label: "LW",
    bgClass: "bg-white dark:bg-gray-900",
    textClass: "text-[#A2001D] dark:text-red-400",
    borderClass: "border-[rgba(162,0,29,0.3)] dark:border-red-500/40 shadow-xs",
  },
  RW: {
    label: "RW",
    bgClass: "bg-white dark:bg-gray-900",
    textClass: "text-[#A2001D] dark:text-red-400",
    borderClass: "border-[rgba(162,0,29,0.3)] dark:border-red-500/40 shadow-xs",
  },
  ST: {
    label: "ST",
    bgClass: "bg-white dark:bg-gray-900",
    textClass: "text-[#A2001D] dark:text-red-400",
    borderClass: "border-[rgba(162,0,29,0.3)] dark:border-red-500/40 shadow-xs",
  },
  FWD: {
    label: "FWD",
    bgClass: "bg-white dark:bg-gray-900",
    textClass: "text-[#A2001D] dark:text-red-400",
    borderClass: "border-[rgba(162,0,29,0.3)] dark:border-red-500/40 shadow-xs",
  },
};

export function StatusBadge({ status, size = "sm", className = "" }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.barca_atletic;
  const widthClass = size === "sm" ? "w-[100px]" : "w-[116px]";

  // Flagship: Iconic Blaugrana Gradient Border + Gradient Text for First Team
  if (status === "promoted") {
    const innerPadding = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs";
    return (
      <span
        className={`inline-flex ${widthClass} p-[1.25px] rounded-full bg-gradient-to-r from-[#A2001D] via-[#7B1020] to-[#004D98] shadow-xs shrink-0 ${className}`}
      >
        <span
          className={`w-full flex items-center justify-center gap-1.5 rounded-full bg-white dark:bg-gray-900 ${innerPadding}`}
        >
          <span className="flex items-center -space-x-0.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A2001D] ring-1 ring-white dark:ring-gray-900" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#004D98] ring-1 ring-white dark:ring-gray-900" />
          </span>
          <span className="bg-gradient-to-r from-[#A2001D] via-[#5C0A18] to-[#004D98] bg-clip-text text-transparent font-extrabold tracking-tight whitespace-nowrap">
            First Team
          </span>
        </span>
      </span>
    );
  }

  const padding = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex ${widthClass} items-center justify-center gap-1.5 rounded-full font-semibold border shrink-0 ${padding} ${config.bgClass} ${config.textClass} ${config.borderClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotColor} ring-1 ring-white dark:ring-gray-900`} />
      <span className="whitespace-nowrap">{config.label}</span>
    </span>
  );
}

export function PositionBadge({ position, size = "sm", className = "" }: PositionBadgeProps) {
  const config = positionConfig[position] || positionConfig.MID;
  const widthClass = size === "sm" ? "w-[36px]" : "w-[42px]";
  const padding = size === "sm" ? "py-0.5 text-[10px]" : "py-0.5 text-xs";

  return (
    <span
      className={`inline-flex ${widthClass} items-center justify-center rounded-lg font-bold tracking-wider border shrink-0 text-center ${padding} ${config.bgClass} ${config.textClass} ${config.borderClass} ${className}`}
    >
      {config.label}
    </span>
  );
}

