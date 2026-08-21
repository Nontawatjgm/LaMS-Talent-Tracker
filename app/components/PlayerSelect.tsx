"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import type { Player } from "@/types/player";
import { PositionBadge, StatusBadge } from "./StatusBadge";
import { FlagIcon } from "./FlagIcon";

interface PlayerSelectProps {
  players: Player[];
  value: string | null;
  onChange: (playerId: string | null) => void;
  label: string;
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #004D98 0%, #1a1a3a 100%)",
  "linear-gradient(135deg, #A2001D 0%, #1a1a3a 100%)",
  "linear-gradient(135deg, #003060 0%, #004D98 100%)",
  "linear-gradient(135deg, #600010 0%, #A2001D 100%)",
];

function getAvatarGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function getAge(dateOfBirth?: string): number | null {
  if (!dateOfBirth) return null;
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export default function PlayerSelect({ players, value, onChange, label }: PlayerSelectProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedPlayer = useMemo(() => {
    return players.find((p) => p.id === value) || null;
  }, [players, value]);

  // Filter players based on search query
  const filteredPlayers = useMemo(() => {
    if (!query.trim()) return players;
    const q = query.toLowerCase().trim();
    return players.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchPos = p.position.toLowerCase().includes(q);
      const matchNat = p.nationality.toLowerCase().includes(q);
      const matchJersey = p.jerseyNumber ? p.jerseyNumber.toString().includes(q) : false;
      return matchName || matchPos || matchNat || matchJersey;
    });
  }, [players, query]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < filteredPlayers.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : filteredPlayers.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredPlayers[focusedIndex]) {
        handleSelect(filteredPlayers[focusedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelect = (player: Player) => {
    onChange(player.id);
    setQuery("");
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setQuery("");
    setTimeout(() => {
      inputRef.current?.focus();
      setIsOpen(true);
    }, 50);
  };

  return (
    <div ref={containerRef} className="w-full relative">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-[var(--text-secondary)]">
          {label}
        </label>
        {selectedPlayer && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-[var(--barca-gold)] hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>เปลี่ยนนักเตะ</span>
            <span>✕</span>
          </button>
        )}
      </div>

      {/* When player is already selected: Show sleek selected card preview */}
      {selectedPlayer && !isOpen ? (
        <div
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="w-full p-3 rounded-2xl bg-[var(--surface-3)] border border-white/10 hover:border-[var(--barca-gold)]/40 hover:bg-white/5 transition-all cursor-pointer flex items-center justify-between gap-3 group shadow-md"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center relative overflow-hidden border border-white/10"
              style={{
                background: selectedPlayer.imageUrl ? "transparent" : getAvatarGradient(selectedPlayer.id),
              }}
            >
              {selectedPlayer.imageUrl ? (
                <img
                  src={selectedPlayer.imageUrl}
                  alt={selectedPlayer.name}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <span className="text-white font-bold text-sm font-display">
                  {getInitials(selectedPlayer.name)}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-white text-base truncate group-hover:text-[var(--barca-gold)] transition-colors">
                  {selectedPlayer.name}
                </span>
                {selectedPlayer.jerseyNumber && (
                  <span className="text-xs font-black font-display text-[#EDBB00]">
                    #{selectedPlayer.jerseyNumber}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--text-muted)]">
                <PositionBadge position={selectedPlayer.position} />
                <span className="flex items-center gap-1">
                  <FlagIcon nationality={selectedPlayer.nationality} emoji={selectedPlayer.flagEmoji} />
                  <span>{selectedPlayer.nationality}</span>
                </span>
                {selectedPlayer.dateOfBirth && (
                  <span>· {getAge(selectedPlayer.dateOfBirth)} ปี</span>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] group-hover:text-white transition-colors hidden sm:inline">
              คลิกเพื่อค้นหาใหม่
            </span>
            <svg
              className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--barca-gold)] transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      ) : (
        /* Search Input Mode */
        <div className="relative">
          <div className="relative flex items-center">
            <svg
              className="absolute left-4 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
                setFocusedIndex(0);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="พิมพ์ค้นหาชื่อนักเตะ, ตำแหน่ง หรือสัญชาติ..."
              className="w-full bg-[var(--surface-3)] text-white pl-11 pr-10 py-3 rounded-2xl border border-white/15 focus:outline-none focus:border-[var(--barca-gold)] focus:ring-2 focus:ring-[var(--barca-gold)]/20 transition-all text-sm placeholder:text-gray-400 shadow-md"
            />

            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="absolute right-3.5 text-gray-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Floating Search Results */}
          {isOpen && (
            <div
              onWheel={(e) => e.stopPropagation()}
              className="absolute top-full left-0 right-0 mt-2 bg-[#0B1528] border border-white/15 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto custom-dropdown-menu p-1.5 backdrop-blur-xl animate-scale-in"
              style={{ overscrollBehavior: "contain" }}
            >
              {filteredPlayers.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-xs">
                  <span className="block text-xl mb-1">🔍</span>
                  ไม่พบนักเตะที่ตรงกับ &ldquo;{query}&rdquo;
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
                    <span>ผลการค้นหา ({filteredPlayers.length} คน)</span>
                    <span className="text-[9px] text-gray-500 font-normal">ใช้ลูกศร ↑ ↓ และกด Enter เพื่อเลือก</span>
                  </div>

                  {filteredPlayers.map((player, idx) => {
                    const isSelected = player.id === value;
                    const isFocused = idx === focusedIndex;
                    const age = getAge(player.dateOfBirth);

                    return (
                      <button
                        key={player.id}
                        type="button"
                        onClick={() => handleSelect(player)}
                        onMouseEnter={() => setFocusedIndex(idx)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[var(--barca-gold)]/15 border border-[var(--barca-gold)]/30 text-white"
                            : isFocused
                            ? "bg-white/10 text-white"
                            : "text-gray-200 hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Mini Avatar */}
                          <div
                            className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center relative overflow-hidden border border-white/10"
                            style={{
                              background: player.imageUrl ? "transparent" : getAvatarGradient(player.id),
                            }}
                          >
                            {player.imageUrl ? (
                              <img
                                src={player.imageUrl}
                                alt={player.name}
                                className="w-full h-full object-cover object-top"
                              />
                            ) : (
                              <span className="text-white font-bold text-xs font-display">
                                {getInitials(player.name)}
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-display font-bold text-white text-sm truncate">
                                {player.name}
                              </span>
                              {player.jerseyNumber && (
                                <span className="text-[11px] font-black font-display text-[#EDBB00]">
                                  #{player.jerseyNumber}
                                </span>
                              )}
                              {(player.firstTeamDebutDate || player.firstTeamDebutMatch) && (
                                <span className="text-[9px] text-amber-300 bg-amber-500/15 px-1.5 py-0.2 rounded border border-amber-400/20">
                                  ⭐ Debut
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                              <span className="flex items-center gap-1">
                                <FlagIcon nationality={player.nationality} emoji={player.flagEmoji} />
                                <span>{player.nationality}</span>
                              </span>
                              {age && <span>· {age} ปี</span>}
                              <span>· เข้าปี {player.lamasiaYear}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right side badge */}
                        <div className="shrink-0 flex items-center gap-2 pl-2">
                          <PositionBadge position={player.position} />
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-[var(--barca-gold)] shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
