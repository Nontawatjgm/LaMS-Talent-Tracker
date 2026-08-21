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
    bgClass: "bg-[#FDF2F4] dark:bg-rose-950/40",
    textClass: "text-[#A2001D] dark:text-rose-300 font-extrabold",
    borderClass: "border border-[#A2001D]/35 dark:border-rose-500/40 shadow-xs",
  },
  barca_atletic: {
    label: "Barça Atlètic",
    dotColor: "bg-[#004D98]",
    bgClass: "bg-[#EFF6FF] dark:bg-blue-950/40",
    textClass: "text-[#004D98] dark:text-blue-300 font-extrabold",
    borderClass: "border border-[#004D98]/35 dark:border-blue-500/40 shadow-xs",
  },
  juvenil_a: {
    label: "Juvenil (U19)",
    dotColor: "bg-[#D97706]",
    bgClass: "bg-[#FFFBEB] dark:bg-amber-950/40",
    textClass: "text-[#92400E] dark:text-amber-300 font-extrabold",
    borderClass: "border border-amber-400/40 dark:border-amber-500/40 shadow-xs",
  },
  academy: {
    label: "Barça Atlètic",
    dotColor: "bg-[#004D98]",
    bgClass: "bg-[#EFF6FF] dark:bg-blue-950/40",
    textClass: "text-[#004D98] dark:text-blue-300 font-extrabold",
    borderClass: "border border-[#004D98]/35 dark:border-blue-500/40 shadow-xs",
  },
  loaned: {
    label: "Loaned",
    dotColor: "bg-amber-500",
    bgClass: "bg-amber-50 dark:bg-amber-950/40",
    textClass: "text-amber-800 dark:text-amber-300 font-bold",
    borderClass: "border border-amber-300 dark:border-amber-500/40 shadow-xs",
  },
  released: {
    label: "Released",
    dotColor: "bg-rose-500",
    bgClass: "bg-rose-50 dark:bg-rose-950/40",
    textClass: "text-rose-800 dark:text-rose-300 font-bold",
    borderClass: "border border-rose-300 dark:border-rose-500/40 shadow-xs",
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
    textClass: "text-emerald-700 dark:text-emerald-400",
    borderClass: "border-emerald-300/80 dark:border-emerald-500/40 shadow-xs",
  },
  CB: {
    label: "CB",
    bgClass: "bg-white dark:bg-gray-900",
    textClass: "text-amber-700 dark:text-amber-300",
    borderClass: "border-amber-300/80 dark:border-amber-500/40 shadow-xs",
  },
  LB: {
    label: "LB",
    bgClass: "bg-white dark:bg-gray-900",
    textClass: "text-amber-700 dark:text-amber-300",
    borderClass: "border-amber-300/80 dark:border-amber-500/40 shadow-xs",
  },
  RB: {
    label: "RB",
    bgClass: "bg-white dark:bg-gray-900",
    textClass: "text-amber-700 dark:text-amber-300",
    borderClass: "border-amber-300/80 dark:border-amber-500/40 shadow-xs",
  },
  DEF: {
    label: "DEF",
    bgClass: "bg-white dark:bg-gray-900",
    textClass: "text-amber-700 dark:text-amber-300",
    borderClass: "border-amber-300/80 dark:border-amber-500/40 shadow-xs",
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
  const widthClass = size === "sm" ? "w-[102px]" : "w-[118px]";
  const padding = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  if (status === "promoted") {
    return (
      <span
        className={`inline-flex ${widthClass} items-center justify-center gap-1.5 rounded-full shrink-0 ${padding} ${config.bgClass} ${config.textClass} ${config.borderClass} ${className}`}
      >
        <span className="flex items-center -space-x-0.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A2001D] ring-1 ring-white dark:ring-gray-900" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#004D98] ring-1 ring-white dark:ring-gray-900" />
        </span>
        <span className="whitespace-nowrap font-extrabold">{config.label}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex ${widthClass} items-center justify-center gap-1.5 rounded-full shrink-0 ${padding} ${config.bgClass} ${config.textClass} ${config.borderClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotColor} ring-1 ring-white dark:ring-gray-900`} />
      <span className="whitespace-nowrap font-extrabold">{config.label}</span>
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

