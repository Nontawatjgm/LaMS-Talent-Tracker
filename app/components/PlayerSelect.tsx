"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import type { Player } from "@/types/player";
import { PositionBadge } from "./StatusBadge";
import { FlagIcon } from "./FlagIcon";

interface PlayerSelectProps {
  players: Player[];
  value: string | null;
  onChange: (playerId: string | null) => void;
  label: string;
  themeColor?: "crimson" | "navy";
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
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
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

export default function PlayerSelect({
  players,
  value,
  onChange,
  label,
  themeColor = "crimson",
}: PlayerSelectProps) {
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

  const isCrimson = themeColor === "crimson";
  const accentBorderHover = isCrimson
    ? "hover:border-[#A2001D]/70"
    : "hover:border-[#004D98]/70";
  const accentFocusBorder = isCrimson
    ? "focus:border-[#A2001D] focus:ring-[#A2001D]/15"
    : "focus:border-[#004D98] focus:ring-[#004D98]/15";
  const accentDot = isCrimson ? "bg-[#A2001D]" : "bg-[#004D98]";

  return (
    <div ref={containerRef} className="w-full relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${accentDot}`} />
          <label className="text-xs font-bold text-[#0B1F40] uppercase tracking-wider">
            {label}
          </label>
        </div>
        {selectedPlayer && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-semibold text-[#004D98] hover:text-[#A2001D] hover:underline cursor-pointer flex items-center gap-1"
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
          className={`w-full p-3.5 rounded-2xl bg-white border border-gray-200 shadow-xs ${accentBorderHover} hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center relative overflow-hidden border border-gray-200 bg-gray-50 shadow-2xs"
              style={{
                background: selectedPlayer.imageUrl
                  ? "transparent"
                  : getAvatarGradient(selectedPlayer.id),
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
                <span className="font-display font-bold text-[#0B1F40] text-base truncate group-hover:text-[#004D98] transition-colors">
                  {selectedPlayer.name}
                </span>
                {selectedPlayer.jerseyNumber && (
                  <span className="text-xs font-black font-display text-[#EDBB00]">
                    #{selectedPlayer.jerseyNumber}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-[#64748B]">
                <PositionBadge position={selectedPlayer.position} />
                <span className="flex items-center gap-1">
                  <FlagIcon
                    nationality={selectedPlayer.nationality}
                    emoji={selectedPlayer.flagEmoji}
                  />
                  <span>{selectedPlayer.nationality}</span>
                </span>
                {selectedPlayer.dateOfBirth && (
                  <span>· {getAge(selectedPlayer.dateOfBirth)} ปี</span>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="text-xs text-[#64748B] group-hover:text-[#004D98] transition-colors hidden sm:inline font-medium">
              คลิกเพื่อค้นหาใหม่
            </span>
            <svg
              className="w-4 h-4 text-gray-400 group-hover:text-[#004D98] transition-colors"
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
              className={`w-full bg-white text-[#0B1F40] pl-11 pr-10 py-3.5 rounded-2xl border border-gray-300 focus:outline-none ${accentFocusBorder} focus:ring-2 transition-all text-sm placeholder:text-gray-400 shadow-xs`}
            />

            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="absolute right-3.5 text-gray-400 hover:text-[#0B1F40] p-1 rounded-lg cursor-pointer text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Floating Search Results */}
          {isOpen && (
            <div
              onWheel={(e) => e.stopPropagation()}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto custom-dropdown-menu p-1.5 backdrop-blur-xl animate-scale-in"
              style={{ overscrollBehavior: "contain" }}
            >
              {filteredPlayers.length === 0 ? (
                <div className="py-8 text-center text-[#64748B] text-xs">
                  <span className="block text-sm font-semibold mb-1">ไม่พบนักเตะ</span>
                  ไม่พบนักเตะที่ตรงกับ &ldquo;{query}&rdquo;
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#64748B] flex items-center justify-between border-b border-gray-100">
                    <span>ผลการค้นหา ({filteredPlayers.length} คน)</span>
                    <span className="text-[9px] text-[#94A3B8] font-normal">ใช้ลูกศร ↑ ↓ และกด Enter</span>
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
                            ? isCrimson
                              ? "bg-[#FDF2F4] border border-[#A2001D]/30 text-[#A2001D]"
                              : "bg-[#EFF6FF] border border-[#004D98]/30 text-[#004D98]"
                            : isFocused
                            ? "bg-[#F8FAFD] text-[#0B1F40]"
                            : "text-[#0B1F40] hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Mini Avatar */}
                          <div
                            className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center relative overflow-hidden border border-gray-200 bg-gray-50"
                            style={{
                              background: player.imageUrl
                                ? "transparent"
                                : getAvatarGradient(player.id),
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
                              <span className="font-display font-bold text-sm text-[#0B1F40] truncate">
                                {player.name}
                              </span>
                              {player.jerseyNumber && (
                                <span className="text-[11px] font-black font-display text-[#EDBB00]">
                                  #{player.jerseyNumber}
                                </span>
                              )}
                              {(player.firstTeamDebutDate || player.firstTeamDebutMatch) && (
                                <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 font-bold">
                                  Debut
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#64748B]">
                              <span className="flex items-center gap-1">
                                <FlagIcon
                                  nationality={player.nationality}
                                  emoji={player.flagEmoji}
                                />
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
                            <span className={`w-2 h-2 rounded-full ${accentDot} shrink-0`} />
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
