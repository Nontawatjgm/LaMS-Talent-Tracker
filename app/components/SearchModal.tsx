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
    "linear-gradient(135deg, #A2001D, #004D98)",
    "linear-gradient(135deg, #004D98, #0060BA)",
    "linear-gradient(135deg, #7A0016, #003A73)",
    "linear-gradient(135deg, #A2001D, #8B0000)",
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
    { id: "promoted", label: "✦ First Team" },
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
      const matchesDesc = player.descriptionTH?.toLowerCase().includes(q);

      return matchesName || matchesNat || matchesClub || matchesDebut || matchesDesc;
    });
  }, [players, query, selectedCategory]);

  // Featured stars to suggest when query is empty
  const featuredSuggestions = useMemo(() => {
    return players
      .filter((p) => p.currentStatus === "promoted" || Boolean(p.firstTeamDebutDate))
      .slice(0, 5);
  }, [players]);

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
      className="fixed inset-0 z-[100] flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="w-full max-w-2xl bg-[var(--surface)] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: "0 0 60px rgba(0, 77, 152, 0.35), 0 0 30px rgba(162, 0, 29, 0.25)",
        }}
      >
        {/* ─── Search Input Bar ─── */}
        <div className="flex items-center px-4 sm:px-5 py-4 border-b border-white/10 bg-[var(--surface-2)]">
          <div className="w-8 h-8 rounded-xl bg-[var(--barca-navy)]/30 border border-[var(--barca-navy-light)]/40 flex items-center justify-center mr-3 shrink-0 text-[var(--barca-gold)]">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-white placeholder-[var(--text-muted)] text-base sm:text-lg font-medium focus:outline-none"
            placeholder="ค้นหาชื่อนักเตะ, ตำแหน่ง, สัญชาติ, สโมสร..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs px-2.5 py-1 rounded-lg bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-white mr-2 transition-colors cursor-pointer"
            >
              ล้าง
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="ปิด (ESC)"
            aria-label="ปิดหน้าต่างค้นหา"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ─── Category Filter Tabs ─── */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[var(--surface-3)]/40 border-b border-white/5 overflow-x-auto text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl transition-all shrink-0 font-medium ${
                selectedCategory === cat.id
                  ? "bg-gradient-to-r from-[var(--barca-crimson)] to-[var(--barca-navy)] text-white shadow-sm font-bold"
                  : "glass text-[var(--text-secondary)] hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-[var(--text-muted)] shrink-0 pl-2">
            พบ {filteredPlayers.length} คน
          </span>
        </div>

        {/* ─── Results List ─── */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 sm:p-3 divide-y divide-white/5 max-h-[440px]"
        >
          {filteredPlayers.length === 0 ? (
            <div className="py-14 text-center text-[var(--text-muted)]">
              <span className="text-4xl block mb-3">🔍</span>
              <p className="text-base font-bold text-white">ไม่พบนักเตะที่ตรงกับ &ldquo;{query}&rdquo;</p>
              <p className="text-xs mt-1 text-[var(--text-muted)]">
                ลองค้นหาด้วยชื่อนักเตะ (เช่น Lamine, Gavi, Bernal) หรือสัญชาติ
              </p>
              <div className="mt-6">
                <button
                  onClick={() => {
                    setQuery("");
                    setSelectedCategory("ALL");
                  }}
                  className="px-4 py-2 rounded-xl glass border border-white/10 text-xs font-semibold text-[var(--barca-gold)] hover:text-white transition-colors"
                >
                  ล้างคำค้นหาทั้งหมด
                </button>
              </div>
            </div>
          ) : (
            filteredPlayers.map((player, idx) => {
              const isSelected = idx === activeIndex;
              const hasDebut = Boolean(player.firstTeamDebutDate || player.firstTeamDebutMatch);
              const totalGoals = (player.preSeasons || []).reduce((s, ps) => s + (ps.goals || 0), 0);
              const totalApps = (player.preSeasons || []).reduce((s, ps) => s + (ps.appearances || 0), 0);

              return (
                <div
                  key={player.id}
                  data-index={idx}
                  onClick={() => handleSelectPlayer(player.id)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "bg-gradient-to-r from-[var(--barca-crimson)]/25 via-[var(--barca-navy)]/25 to-[var(--surface-2)] border border-[var(--barca-navy-light)]/50 shadow-md translate-x-1"
                      : "hover:bg-[var(--surface-2)]"
                  }`}
                >
                  {/* Left: Player Avatar + Details */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-11 h-11 rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative shadow-sm border border-white/10"
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
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-white text-sm truncate">
                          {player.name}
                        </span>
                        {player.jerseyNumber && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-[var(--barca-gold)] border border-white/10">
                            #{player.jerseyNumber}
                          </span>
                        )}
                        {hasDebut && (
                          <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-purple-300 font-semibold bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/30">
                            ⭐ Debut
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
                        <div className="inline-flex items-center gap-1 text-[var(--text-secondary)]">
                          <FlagIcon nationality={player.nationality} emoji={player.flagEmoji} className="h-3" />
                          <span>{player.nationality}</span>
                        </div>
                        <span className="text-[var(--text-muted)] text-[10px]">·</span>
                        <span className="text-[var(--text-muted)] text-xs">เข้าปี {player.lamasiaYear}</span>
                        {totalApps > 0 && (
                          <>
                            <span className="text-[var(--text-muted)] text-[10px]">·</span>
                            <span className="text-emerald-400 font-medium text-xs">
                              {totalApps} นัด {totalGoals > 0 && `(${totalGoals}G)`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Badges */}
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <PositionBadge position={player.position} size="sm" />
                    <StatusBadge status={player.currentStatus} size="sm" />
                    <span className="text-[var(--text-muted)] text-xs hidden sm:inline-block ml-1 transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ─── Footer Controls & Direct Link ─── */}
        <div className="px-4 py-3 bg-[var(--surface-2)] border-t border-white/10 flex items-center justify-between text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] text-white font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] text-white font-mono text-[10px]">↓</kbd>
              <span>เลือก</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] text-white font-mono text-[10px]">Enter</kbd>
              <span>เปิดโปรไฟล์</span>
            </span>
          </div>

          <Link
            href={query ? `/players?q=${encodeURIComponent(query)}` : "/players"}
            onClick={onClose}
            className="text-[var(--barca-gold)] hover:text-white font-semibold transition-colors flex items-center gap-1"
          >
            <span>ดูในทำเนียบนักเตะ</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
