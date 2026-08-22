"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Player } from "@/types/player";
import { PositionBadge, StatusBadge } from "./StatusBadge";
import { FlagIcon } from "./FlagIcon";

interface NavbarSearchProps {
  players: Player[];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function getAvatarGradient(id: string): string {
  const gradients = [
    "linear-gradient(135deg, #004D98 0%, #002D59 100%)",
    "linear-gradient(135deg, #A2001D 0%, #600010 100%)",
    "linear-gradient(135deg, #004D98 0%, #A2001D 100%)",
    "linear-gradient(135deg, #1C050B 0%, #0D162B 100%)",
  ];
  const idx = id.charCodeAt(0) % gradients.length;
  return gradients[idx];
}

export default function NavbarSearch({ players }: NavbarSearchProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter players purely by search query (only when typed)
  const filteredPlayers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return players.filter((player) => {
      const matchesName = player.name.toLowerCase().includes(q);
      const matchesNat = player.nationality?.toLowerCase().includes(q);
      const matchesPos = player.position.toLowerCase().includes(q);
      const matchesClub = player.currentClub?.toLowerCase().includes(q);
      const matchesJersey = player.jerseyNumber ? player.jerseyNumber.toString().includes(q) : false;

      return matchesName || matchesNat || matchesPos || matchesClub || matchesJersey;
    });
  }, [players, query]);

  // Reset active index on query change
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Focus input automatically when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 40);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Click outside to close
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
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % (filteredPlayers.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filteredPlayers.length) % (filteredPlayers.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredPlayers[activeIndex]) {
        handleSelectPlayer(filteredPlayers[activeIndex].id);
      } else if (query.trim()) {
        setIsOpen(false);
        router.push(`/players?q=${encodeURIComponent(query.trim())}`);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [activeIndex]);

  const handleSelectPlayer = (id: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/players/${id}`);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* ─── Fixed Navbar Search Trigger (Never resizes, never pushes neighboring buttons) ─── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 border cursor-pointer ${
          isOpen
            ? "bg-white text-[#004D98] border-white shadow-xs"
            : "bg-white/[0.05] hover:bg-white/[0.1] border-white/10 text-gray-300 hover:text-white"
        }`}
        title="ค้นหานักเตะ"
        aria-label="ค้นหานักเตะ"
      >
        <svg
          className="w-3.5 h-3.5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span className="text-xs font-medium">ค้นหา...</span>
      </button>

      {/* ─── Floating Sub-Navbar Search Dropdown (Floats right underneath Navbar) ─── */}
      {isOpen && (
        <div
          className="absolute top-11 right-0 w-[90vw] sm:w-[380px] max-w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-200/90 z-50 p-2 overflow-hidden animate-scale-in"
          style={{
            boxShadow: "0 20px 45px -15px rgba(0, 0, 0, 0.25), 0 0 20px -5px rgba(0, 77, 152, 0.1)",
          }}
        >
          {/* Sub-Navbar Search Input Box */}
          <div className="flex items-center gap-2 bg-[#F8FAFD] rounded-xl px-3 py-2 border border-gray-200">
            <svg
              className="w-4 h-4 text-[#004D98] shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="พิมพ์ชื่อนักเตะ, ตำแหน่ง..."
              className="w-full bg-transparent text-xs sm:text-sm text-[#0B1F40] placeholder-gray-400 font-medium focus:outline-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="text-xs text-gray-400 hover:text-[#0B1F40] p-0.5 rounded-full hover:bg-gray-200/60"
              >
                ✕
              </button>
            ) : (
              <span className="text-[10px] text-gray-400 font-mono">ESC</span>
            )}
          </div>

          {/* Results List (Appears only when user types) */}
          {query.trim().length > 0 && (
            <div className="mt-2 pt-1.5 border-t border-gray-100">
              <div
                ref={listRef}
                className="overflow-y-auto max-h-[280px] space-y-0.5"
              >
                {filteredPlayers.length === 0 ? (
                  <div className="py-6 text-center text-[#64748B]">
                    <p className="text-xs font-bold text-[#0B1F40]">ไม่พบนักเตะที่ตรงกับ &ldquo;{query}&rdquo;</p>
                    <p className="text-[11px] mt-0.5 text-[#64748B]">
                      ลองค้นหาด้วยชื่อ, สัญชาติ หรือตำแหน่ง
                    </p>
                  </div>
                ) : (
                  filteredPlayers.map((player, idx) => {
                    const isSelected = idx === activeIndex;
                    const totalApps = (player.preSeasons || []).reduce((s, ps) => s + (ps.appearances || 0), 0);

                    return (
                      <div
                        key={player.id}
                        data-index={idx}
                        onClick={() => handleSelectPlayer(player.id)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-[#EFF6FF] text-[#004D98]"
                            : "hover:bg-[#F8FAFD] text-[#0B1F40]"
                        }`}
                      >
                        {/* Left: Avatar + Details */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Avatar */}
                          <div
                            className="w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center relative border border-gray-200 bg-gray-50 shadow-2xs"
                            style={{ background: player.imageUrl ? "transparent" : getAvatarGradient(player.id) }}
                          >
                            {player.imageUrl ? (
                              <img
                                src={player.imageUrl}
                                alt={player.name}
                                className="w-full h-full object-cover object-top"
                              />
                            ) : (
                              <span className="text-white font-bold text-[10px] font-display">
                                {getInitials(player.name)}
                              </span>
                            )}
                            {player.jerseyNumber && (
                              <span className="absolute bottom-0.2 right-0.5 text-[8px] font-black font-display text-[#EDBB00] leading-none drop-shadow-xs">
                                #{player.jerseyNumber}
                              </span>
                            )}
                          </div>

                          {/* Name & Subtitle */}
                          <div className="min-w-0">
                            <span className="font-display font-bold text-xs sm:text-sm truncate block leading-tight">
                              {player.name}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] text-[#64748B] mt-0.5">
                              <FlagIcon nationality={player.nationality} emoji={player.flagEmoji} className="h-2.5" />
                              <span>{player.nationality}</span>
                              <span className="text-gray-300">·</span>
                              <PositionBadge position={player.position} size="sm" />
                              {totalApps > 0 && (
                                <>
                                  <span className="text-gray-300 hidden sm:inline">·</span>
                                  <span className="hidden sm:inline font-medium text-[#004D98]">{totalApps} นัด</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Status Badge & Arrow */}
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <StatusBadge status={player.currentStatus} size="sm" />
                          <span className={`text-xs font-bold transition-transform ${
                            isSelected ? "translate-x-0.5 text-[#004D98]" : "text-gray-300"
                          }`}>
                            →
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer Link */}
              {filteredPlayers.length > 0 && (
                <div className="px-2 pt-2 mt-1 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#64748B]">
                  <span className="text-[10px] text-gray-400">
                    พบ {filteredPlayers.length} คน
                  </span>

                  <Link
                    href={`/players?q=${encodeURIComponent(query)}`}
                    onClick={() => setIsOpen(false)}
                    className="text-[#004D98] hover:text-[#A2001D] font-bold text-xs ml-auto transition-colors flex items-center gap-0.5"
                  >
                    <span>ดูผลลัพธ์ทั้งหมด</span>
                    <span>→</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
