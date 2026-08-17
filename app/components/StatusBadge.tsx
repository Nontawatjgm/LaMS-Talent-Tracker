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
  promoted: { label: "First Team", className: "status-promoted", icon: "✦" },
  barca_atletic: { label: "Barça Atlètic", className: "status-atletic", icon: "◈" },
  juvenil_a: { label: "Juvenil (U19)", className: "status-juvenil", icon: "❖" },
  academy: { label: "Barça Atlètic", className: "status-atletic", icon: "◈" },
  loaned: { label: "Loaned", className: "status-loaned", icon: "↗" },
  released: { label: "Released", className: "status-released", icon: "×" },
  transferred: { label: "Transferred", className: "status-transferred", icon: "⇆" },
  sold: { label: "Sold", className: "status-transferred", icon: "⇆" },
};

const positionConfig: Record<Position, { label: string; className: string }> = {
  GK: { label: "GK", className: "pos-gk" },
  CB: { label: "CB", className: "pos-def" },
  LB: { label: "LB", className: "pos-def" },
  RB: { label: "RB", className: "pos-def" },
  DEF: { label: "DEF", className: "pos-def" },
  CDM: { label: "CDM", className: "pos-mid" },
  CM: { label: "CM", className: "pos-mid" },
  CAM: { label: "CAM", className: "pos-mid" },
  MID: { label: "MID", className: "pos-mid" },
  LW: { label: "LW", className: "pos-fwd" },
  RW: { label: "RW", className: "pos-fwd" },
  ST: { label: "ST", className: "pos-fwd" },
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
