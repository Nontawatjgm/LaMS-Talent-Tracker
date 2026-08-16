"use client";

import { Player } from "@/types/player";

interface PlayerSelectProps {
  players: Player[];
  value: string | null;
  onChange: (playerId: string) => void;
  label: string;
}

export default function PlayerSelect({ players, value, onChange, label }: PlayerSelectProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
        {label}
      </label>
      <div className="relative">
        <select
          className="w-full appearance-none bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[var(--barca-navy)] transition-colors cursor-pointer"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" disabled>
            -- เลือกนักเตะ --
          </option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.position})
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[var(--text-muted)]">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
