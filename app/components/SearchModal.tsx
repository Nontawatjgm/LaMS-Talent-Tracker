"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Player, Position } from "@/types/player";
import { PositionBadge, StatusBadge } from "./StatusBadge";

interface SearchModalProps {
  players: Player[];
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ players, isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedPos, setSelectedPos] = useState<Position | "ALL">("ALL");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter players based on search text and position filter
  const filteredPlayers = players.filter((player) => {
    const matchesPos = selectedPos === "ALL" || player.position === selectedPos;
    const q = query.trim().toLowerCase();
    if (!q) return matchesPos;
    const matchesName = player.name.toLowerCase().includes(q);
    const matchesNat = player.nationality.toLowerCase().includes(q);
    const matchesDesc = player.descriptionTH?.toLowerCase().includes(q) || false;
    const matchesStatus = player.currentStatus.toLowerCase().includes(q);
    return matchesPos && (matchesName || matchesNat || matchesDesc || matchesStatus);
  });

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query, selectedPos]);

  // Focus input when modal opens & prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
      setSelectedPos("ALL");
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Global keydown listeners inside modal
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
      className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="w-full max-w-2xl bg-[var(--surface)] border border-[var(--border-glass)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: "0 0 50px rgba(0, 77, 152, 0.25), 0 0 20px rgba(162, 0, 29, 0.2)",
        }}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--surface-2)]">
          <svg
            className="w-5 h-5 text-[var(--barca-gold)] mr-3 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
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
            className="w-full bg-transparent text-white placeholder-[var(--text-muted)] text-base focus:outline-none"
            placeholder="ค้นหาชื่อนักเตะ, ตำแหน่ง, สัญชาติ... (เช่น Lamine, Yamal, กองหลัง)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs px-2 py-1 rounded bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-white mr-2"
            >
              ล้าง
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--surface-3)] text-[var(--text-muted)] border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-[var(--surface-3)]/40 border-b border-[var(--border-subtle)] overflow-x-auto text-xs">
          <span className="text-[var(--text-muted)] text-[11px] mr-1 shrink-0">ตำแหน่ง:</span>
          {(["ALL", "FWD", "MID", "DEF", "GK"] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => setSelectedPos(pos)}
              className={`px-2.5 py-1 rounded-lg transition-colors shrink-0 font-medium ${
                selectedPos === pos
                  ? "bg-[var(--barca-navy)] text-white"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-white"
              }`}
            >
              {pos === "ALL" ? "ทั้งหมด" : pos}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-[var(--text-muted)] shrink-0">
            พบ {filteredPlayers.length} คน
          </span>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 divide-y divide-white/5 max-h-[420px]"
        >
          {filteredPlayers.length === 0 ? (
            <div className="py-12 text-center text-[var(--text-muted)]">
              <span className="text-3xl block mb-2">🔍</span>
              <p className="text-sm">ไม่พบนักเตะที่ตรงกับคำค้นหา &quot;{query}&quot;</p>
              <p className="text-xs mt-1 opacity-70">ลองค้นหาด้วยชื่อภาษาอังกฤษ หรือคลิกเลือกตำแหน่งด้านบน</p>
            </div>
          ) : (
            filteredPlayers.map((player, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <div
                  key={player.id}
                  onClick={() => handleSelectPlayer(player.id)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "bg-gradient-to-r from-[var(--barca-crimson)]/20 via-[var(--barca-navy)]/20 to-[var(--surface-2)] border border-[var(--barca-navy-light)]/40 shadow-md"
                      : "hover:bg-[var(--surface-2)]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0"
                      style={{
                        background:
                          player.position === "FWD"
                            ? "linear-gradient(135deg, #A2001D, #D4002A)"
                            : player.position === "MID"
                            ? "linear-gradient(135deg, #004D98, #0060BA)"
                            : player.position === "DEF"
                            ? "linear-gradient(135deg, #7C3AED, #A78BFA)"
                            : "linear-gradient(135deg, #EDBB00, #F59E0B)",
                      }}
                    >
                      {player.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-white text-sm truncate">
                          {player.name}
                        </span>
                        {player.jerseyNumber && (
                          <span className="text-[10px] px-1 rounded bg-[var(--surface-3)] text-[var(--text-muted)]">
                            #{player.jerseyNumber}
                          </span>
                        )}
                        <span className="text-xs">{player.flagEmoji}</span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] truncate max-w-sm">
                        เข้า La Masia ปี {player.lamasiaYear} · {player.nationality}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <PositionBadge position={player.position} size="sm" />
                    <StatusBadge status={player.currentStatus} size="sm" />
                    <span className="text-[var(--text-muted)] text-xs hidden sm:inline-block">
                      →
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Keyboard navigation hints footer */}
        <div className="px-4 py-2.5 bg-[var(--surface-2)] border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] text-white">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] text-white">↓</kbd>
              <span>เลือก</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] text-white">Enter</kbd>
              <span>เปิดโปรไฟล์</span>
            </span>
          </div>
          <span className="hidden sm:inline">FC Barcelona La Masia</span>
        </div>
      </div>
    </div>
  );
}
