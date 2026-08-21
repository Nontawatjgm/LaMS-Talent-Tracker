"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Player, Position, Status } from "@/types/player";
import { PositionBadge, StatusBadge } from "./StatusBadge";
import { FlagIcon } from "./FlagIcon";

interface SearchModalProps {
  players: Player[];
  isOpen: boolean;
  onClose: () => void;
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
    "linear-gradient(135deg, #004D98 0%, #1a1a3a 100%)",
    "linear-gradient(135deg, #A2001D 0%, #1a1a3a 100%)",
    "linear-gradient(135deg, #003060 0%, #004D98 100%)",
    "linear-gradient(135deg, #600010 0%, #A2001D 100%)",
  ];
  const idx = id.charCodeAt(0) % gradients.length;
  return gradients[idx];
}

export default function SearchModal({ players, isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Quick filter categories
  const categories = [
    { id: "ALL", label: "ทั้งหมด" },
    { id: "promoted", label: "ชุดใหญ่ (First Team)" },
    { id: "FWD", label: "กองหน้า" },
    { id: "MID", label: "กองกลาง" },
    { id: "DEF", label: "กองหลัง" },
    { id: "GK", label: "ผู้รักษาประตู" },
  ];

  // Filter players based on search query & category
  const filteredPlayers = useMemo(() => {
    const q = query.trim().toLowerCase();

    return players.filter((player) => {
      // Category match
      let matchesCat = true;
      if (selectedCategory === "promoted") {
        matchesCat = player.currentStatus === "promoted";
      } else if (["FWD", "MID", "DEF", "GK"].includes(selectedCategory)) {
        matchesCat = player.position === selectedCategory;
      }

      if (!matchesCat) return false;
      if (!q) return true;

      const matchesName = player.name.toLowerCase().includes(q);
      const matchesNat = player.nationality?.toLowerCase().includes(q);
      const matchesClub = player.currentClub?.toLowerCase().includes(q);
      const matchesDebut = player.firstTeamDebutMatch?.toLowerCase().includes(q);
      const matchesJersey = player.jerseyNumber ? player.jerseyNumber.toString().includes(q) : false;

      return matchesName || matchesNat || matchesClub || matchesDebut || matchesJersey;
    });
  }, [players, query, selectedCategory]);

  // Reset active index when query or category changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query, selectedCategory]);

  // Focus input when modal opens & handle body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 40);
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
      setSelectedCategory("ALL");
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [activeIndex]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
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
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  const handleSelectPlayer = (id: string) => {
    onClose();
    router.push(`/players/${id}`);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="w-full max-w-2xl bg-[#091120]/95 border border-white/12 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-scale-in backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: "0 20px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px -10px rgba(0, 77, 152, 0.3)",
        }}
      >
        {/* ─── Search Input Bar (Modern Minimalist Spotlight Style) ─── */}
        <div className="flex items-center px-5 py-4 border-b border-white/8 bg-white/[0.02]">
          <svg
            className="w-5 h-5 text-[var(--barca-gold)] mr-3.5 shrink-0"
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
            className="w-full bg-transparent text-white placeholder-gray-400 text-base sm:text-lg font-medium focus:outline-none tracking-wide"
            placeholder="ค้นหาชื่อนักเตะ, ตำแหน่ง, สัญชาติ..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs px-2 py-1 rounded-md bg-white/10 text-gray-300 hover:text-white mr-2 transition-colors cursor-pointer"
            >
              ล้าง
            </button>
          )}

          <button
            onClick={onClose}
            className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="ปิด (ESC)"
          >
            ESC
          </button>
        </div>

        {/* ─── Category Filter Tabs (Sleek Clean Pills) ─── */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-black/20 border-b border-white/5 overflow-x-auto text-xs no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl transition-all shrink-0 text-xs font-medium cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-white/15 text-white font-semibold border border-white/20 shadow-xs"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              }`}
            >
              {cat.label}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-gray-400 shrink-0 pl-2 font-mono">
            {filteredPlayers.length} คน
          </span>
        </div>

        {/* ─── Results List (Modern, Clean, High Hierarchy) ─── */}
        <div
          ref={listRef}
          onWheel={(e) => e.stopPropagation()}
          className="flex-1 overflow-y-auto p-2 sm:p-2.5 space-y-1 max-h-[460px] custom-dropdown-menu"
          style={{ overscrollBehavior: "contain" }}
        >
          {filteredPlayers.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <span className="text-3xl block mb-2 opacity-60">🔍</span>
              <p className="text-sm font-semibold text-gray-200">ไม่พบนักเตะที่ตรงกับ &ldquo;{query}&rdquo;</p>
              <p className="text-xs mt-1 text-gray-400">
                ลองค้นหาด้วยชื่อนักเตะ, ตำแหน่ง (เช่น GK, CB, MID), หรือสัญชาติ
              </p>
            </div>
          ) : (
            filteredPlayers.map((player, idx) => {
              const isSelected = idx === activeIndex;
              const hasDebut = Boolean(player.firstTeamDebutDate || player.firstTeamDebutMatch);
              const totalApps = (player.preSeasons || []).reduce((s, ps) => s + (ps.appearances || 0), 0);

              return (
                <div
                  key={player.id}
                  data-index={idx}
                  onClick={() => handleSelectPlayer(player.id)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl cursor-pointer transition-all duration-150 group ${
                    isSelected
                      ? "bg-white/[0.08] border border-white/15 shadow-sm"
                      : "hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  {/* Left: Player Avatar + Details */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Compact Avatar with Gold Jersey Number */}
                    <div
                      className="w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative border border-white/10 shadow-xs"
                      style={{ background: player.imageUrl ? "transparent" : getAvatarGradient(player.id) }}
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

                      {/* Clean Jersey Number Badge on Avatar Corner */}
                      {player.jerseyNumber && (
                        <span className="absolute bottom-0.5 right-1 text-[10px] font-black font-display text-[#EDBB00] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] leading-none select-none">
                          #{player.jerseyNumber}
                        </span>
                      )}
                    </div>

                    {/* Clean Typography */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-display font-bold text-sm truncate transition-colors ${
                          isSelected ? "text-[var(--barca-gold)]" : "text-white group-hover:text-[var(--barca-gold)]"
                        }`}>
                          {player.name}
                        </span>

                        {hasDebut && (
                          <span className="inline-flex items-center text-[10px] text-amber-300 font-medium bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
                            ⭐ Debut
                          </span>
                        )}
                      </div>

                      {/* Clean Subtitle Info */}
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <FlagIcon nationality={player.nationality} emoji={player.flagEmoji} className="h-3" />
                          <span>{player.nationality}</span>
                        </span>
                        <span className="text-gray-600">·</span>
                        <PositionBadge position={player.position} size="sm" />
                        <span className="text-gray-600 hidden sm:inline">·</span>
                        <span className="hidden sm:inline">เข้าปี {player.lamasiaYear}</span>
                        {totalApps > 0 && (
                          <>
                            <span className="text-gray-600 hidden sm:inline">·</span>
                            <span className="text-gray-400 hidden sm:inline">{totalApps} นัดพรีซีซั่น</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Clean Status Badge & Subtle Arrow */}
                  <div className="flex items-center gap-2.5 shrink-0 ml-3">
                    <StatusBadge status={player.currentStatus} size="sm" />
                    <span className={`text-xs transition-transform duration-200 ${
                      isSelected ? "translate-x-1 text-[var(--barca-gold)]" : "text-gray-500 group-hover:text-gray-300 group-hover:translate-x-1"
                    }`}>
                      →
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ─── Footer Controls ─── */}
        <div className="px-5 py-3 bg-black/30 border-t border-white/8 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-mono text-[10px]">↓</kbd>
              <span>เลื่อน</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-mono text-[10px]">↵ Enter</kbd>
              <span>เปิดโปรไฟล์</span>
            </span>
          </div>

          <Link
            href={query ? `/players?q=${encodeURIComponent(query)}` : "/players"}
            onClick={onClose}
            className="text-[var(--barca-gold)] hover:text-white font-medium transition-colors flex items-center gap-1 text-xs"
          >
            <span>ดูในทำเนียบนักเตะ</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
