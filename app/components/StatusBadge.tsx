import type { Position, Status } from "@/types/player";

interface StatusBadgeProps {
  status: Status;
  size?: "sm" | "md";
}

interface PositionBadgeProps {
  position: Position;
  size?: "sm" | "md";
}

const statusConfig: Record<Status, { label: string; className: string; icon: string }> = {
  promoted: { label: "Promoted", className: "status-promoted", icon: "✦" },
  academy: { label: "Academy", className: "status-academy", icon: "◈" },
  loaned: { label: "Loaned", className: "status-loaned", icon: "↗" },
  released: { label: "Released", className: "status-released", icon: "×" },
};

const positionConfig: Record<Position, { label: string; className: string }> = {
  GK: { label: "GK", className: "pos-gk" },
  DEF: { label: "DEF", className: "pos-def" },
  MID: { label: "MID", className: "pos-mid" },
  FWD: { label: "FWD", className: "pos-fwd" },
};

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const padding = size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3.5 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${padding} ${config.className}`}
    >
      <span className="text-[10px]">{config.icon}</span>
      {config.label}
    </span>
  );
}

export function PositionBadge({ position, size = "sm" }: PositionBadgeProps) {
  const config = positionConfig[position];
  const padding = size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3.5 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center rounded-md font-bold tracking-wider ${padding} ${config.className}`}
    >
      {config.label}
    </span>
  );
}
