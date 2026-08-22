"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Player } from "@/types/player";
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
    "linear-gradient(135deg, #004D98 0%, #002D59 100%)",
    "linear-gradient(135deg, #A2001D 0%, #600010 100%)",
    "linear-gradient(135deg, #004D98 0%, #A2001D 100%)",
    "linear-gradient(135deg, #1C050B 0%, #0D162B 100%)",
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
      className="fixed inset-0 z-[100] flex items-start justify-center pt-14 sm:pt-20 px-3 sm:px-4 bg-[#060E21]/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="w-full max-w-2xl bg-white border border-gray-200/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] animate-scale-in relative"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.25), 0 0 30px -10px rgba(0, 77, 152, 0.15)",
        }}
      >
        {/* ─── Blaugrana Heritage Dual-Stripe Top Edge ─── */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex z-20">
          <div className="flex-1 bg-[#A2001D]" />
          <div className="flex-1 bg-[#004D98]" />
        </div>

        {/* ─── Search Input Bar (Spotlight Style) ─── */}
        <div className="flex items-center px-5 py-4 pt-5 border-b border-gray-100 bg-white">
          <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] border border-[#004D98]/20 flex items-center justify-center mr-3 shrink-0">
            <svg
              className="w-4 h-4 text-[#004D98]"
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
            className="w-full bg-transparent text-[#0B1F40] placeholder-gray-400 text-base sm:text-lg font-medium focus:outline-none tracking-wide"
            placeholder="ค้นหาชื่อนักเตะ, ตำแหน่ง, สัญชาติ, สโมสร..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 hover:text-[#0B1F40] hover:bg-gray-200 mr-2 transition-colors cursor-pointer font-medium"
            >
              ล้าง
            </button>
          )}

          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 text-[11px] font-mono text-gray-500 hover:text-[#0B1F40] hover:bg-gray-200 transition-colors cursor-pointer"
            title="ปิด (ESC)"
          >
            ESC
          </button>
        </div>

        {/* ─── Category Filter Tabs ─── */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#F8FAFD] border-b border-gray-100 overflow-x-auto text-xs no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl transition-all shrink-0 text-xs font-semibold cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-[#004D98] text-white shadow-xs"
                  : "text-[#64748B] hover:text-[#0B1F40] hover:bg-gray-200/60"
              }`}
            >
              {cat.label}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-[#64748B] shrink-0 pl-2 font-mono font-medium">
            {filteredPlayers.length} คน
          </span>
        </div>

        {/* ─── Results List ─── */}
        <div
          ref={listRef}
          onWheel={(e) => e.stopPropagation()}
          className="flex-1 overflow-y-auto p-2 sm:p-2.5 space-y-1 max-h-[460px]"
          style={{ overscrollBehavior: "contain" }}
        >
          {filteredPlayers.length === 0 ? (
            <div className="py-16 text-center text-[#64748B]">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-[#0B1F40]">ไม่พบนักเตะที่ตรงกับ &ldquo;{query}&rdquo;</p>
              <p className="text-xs mt-1 text-[#64748B]">
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
                      ? "bg-[#EFF6FF] border border-[#004D98]/25 shadow-2xs"
                      : "hover:bg-[#F8FAFD] border border-transparent"
                  }`}
                >
                  {/* Left: Player Avatar + Details */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Compact Avatar with Jersey Number */}
                    <div
                      className={`w-11 h-11 rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative border shadow-2xs bg-gray-50 ${
                        isSelected ? "border-[#004D98]/40" : "border-gray-200"
                      }`}
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

                    {/* Typography & Subtitle */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-display font-bold text-sm sm:text-base truncate transition-colors ${
                          isSelected ? "text-[#004D98]" : "text-[#0B1F40] group-hover:text-[#004D98]"
                        }`}>
                          {player.name}
                        </span>

                        {hasDebut && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#B45309] bg-[#FFFBEB] px-1.5 py-0.2 rounded border border-amber-300/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>DEBUT</span>
                          </span>
                        )}
                      </div>

                      {/* Subtitle Info */}
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-[#64748B]">
                        <span className="inline-flex items-center gap-1">
                          <FlagIcon nationality={player.nationality} emoji={player.flagEmoji} className="h-3" />
                          <span>{player.nationality}</span>
                        </span>
                        <span className="text-gray-300">·</span>
                        <PositionBadge position={player.position} size="sm" />
                        {player.lamasiaYear && (
                          <>
                            <span className="text-gray-300 hidden sm:inline">·</span>
                            <span className="hidden sm:inline">เข้าปี {player.lamasiaYear}</span>
                          </>
                        )}
                        {totalApps > 0 && (
                          <>
                            <span className="text-gray-300 hidden sm:inline">·</span>
                            <span className="text-[#004D98] font-semibold hidden sm:inline">{totalApps} นัดพรีซีซั่น</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Clean Status Badge & Subtle Arrow */}
                  <div className="flex items-center gap-2.5 shrink-0 ml-3">
                    <StatusBadge status={player.currentStatus} size="sm" />
                    <span className={`text-sm font-bold transition-transform duration-200 ${
                      isSelected ? "translate-x-1 text-[#004D98]" : "text-gray-300 group-hover:text-[#004D98] group-hover:translate-x-1"
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
        <div className="px-5 py-3 bg-[#F8FAFD] border-t border-gray-100 flex items-center justify-between text-xs text-[#64748B]">
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[#0B1F40] font-mono text-[10px] shadow-2xs">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[#0B1F40] font-mono text-[10px] shadow-2xs">↓</kbd>
              <span>เลื่อน</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[#0B1F40] font-mono text-[10px] shadow-2xs">↵ Enter</kbd>
              <span>เปิดโปรไฟล์</span>
            </span>
          </div>

          <Link
            href={query ? `/players?q=${encodeURIComponent(query)}` : "/players"}
            onClick={onClose}
            className="text-[#004D98] hover:text-[#A2001D] font-bold transition-colors flex items-center gap-1 text-xs"
          >
            <span>ดูในทำเนียบนักเตะทั้งหมด</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
