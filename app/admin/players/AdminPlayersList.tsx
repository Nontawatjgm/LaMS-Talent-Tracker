"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Player } from "@/types/player";
import { StatusBadge, PositionBadge } from "@/app/components/StatusBadge";
import { FlagIcon } from "@/app/components/FlagIcon";
import { deletePlayer } from "@/app/actions/playerActions";

interface AdminPlayersListProps {
  initialPlayers: Player[];
}

const POSITION_ORDER: Record<string, number> = {
  GK: 1,
  CB: 10,
  LB: 11,
  RB: 12,
  DEF: 13,
  CDM: 20,
  CM: 21,
  CAM: 22,
  MID: 23,
  LW: 30,
  RW: 31,
  ST: 32,
  FWD: 33,
};

const POSITION_GRADIENT: Record<string, string> = {
  GK: "linear-gradient(135deg, #EDBB00, #F59E0B)",
  DEF: "linear-gradient(135deg, #7C3AED, #A78BFA)",
  MID: "linear-gradient(135deg, #004D98, #0060BA)",
  FWD: "linear-gradient(135deg, #A2001D, #D4002A)",
};

function getPositionGradient(position: string) {
  if (["ST", "LW", "RW", "FWD"].includes(position)) return POSITION_GRADIENT.FWD;
  if (["CAM", "CM", "CDM", "MID"].includes(position)) return POSITION_GRADIENT.MID;
  if (["CB", "LB", "RB", "DEF"].includes(position)) return POSITION_GRADIENT.DEF;
  return POSITION_GRADIENT.GK;
}

type SortOption = "position" | "jersey" | "name" | "year_desc" | "year_asc";
type ViewMode = "table" | "grid";

export default function AdminPlayersList({ initialPlayers }: AdminPlayersListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("position");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredPlayers = initialPlayers.filter((player) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      player.name.toLowerCase().includes(q) ||
      player.position.toLowerCase().includes(q) ||
      player.nationality.toLowerCase().includes(q) ||
      (player.jerseyNumber && String(player.jerseyNumber).includes(q)) ||
      (player.currentClub && player.currentClub.toLowerCase().includes(q)) ||
      (player.lamasiaYear && String(player.lamasiaYear).includes(q));

    const matchesStatus =
      statusFilter === "all" || player.currentStatus === statusFilter;

    const matchesPosition =
      positionFilter === "all" ||
      (positionFilter === "ATT"
        ? ["ST", "LW", "RW", "FWD"].includes(player.position)
        : positionFilter === "MID"
        ? ["CAM", "CM", "CDM", "MID"].includes(player.position)
        : positionFilter === "DEF"
        ? ["CB", "LB", "RB", "DEF"].includes(player.position)
        : player.position === positionFilter);

    return matchesSearch && matchesStatus && matchesPosition;
  });

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (sortBy === "position") {
      const orderA = POSITION_ORDER[a.position] || 99;
      const orderB = POSITION_ORDER[b.position] || 99;
      if (orderA !== orderB) return orderA - orderB;
      if (a.jerseyNumber && b.jerseyNumber) return a.jerseyNumber - b.jerseyNumber;
      if (a.jerseyNumber) return -1;
      if (b.jerseyNumber) return 1;
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "jersey") {
      if (a.jerseyNumber && b.jerseyNumber) return a.jerseyNumber - b.jerseyNumber;
      if (a.jerseyNumber) return -1;
      if (b.jerseyNumber) return 1;
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "year_desc") return b.lamasiaYear - a.lamasiaYear;
    if (sortBy === "year_asc") return a.lamasiaYear - b.lamasiaYear;
    return 0;
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลของ "${name}" ออกจากระบบ?`)) {
      setDeletingId(id);
      startTransition(async () => {
        try {
          await deletePlayer(id);
        } catch (err) {
          alert("เกิดข้อผิดพลาดในการลบ: " + (err instanceof Error ? err.message : String(err)));
        } finally {
          setDeletingId(null);
        }
      });
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPositionFilter("all");
    setSortBy("position");
  };

  const hasActiveFilters =
    searchQuery || statusFilter !== "all" || positionFilter !== "all" || sortBy !== "position";

  return (
    <div className="glass rounded-2xl border border-white/10 overflow-hidden">
      {/* Search & Filters Bar */}
      <div className="p-4 border-b border-white/10 bg-[var(--surface-2)] space-y-3">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อ, ตำแหน่ง, สัญชาติ, เบอร์เสื้อ..."
              className="bg-[var(--surface-3)] text-sm text-white pl-9 pr-8 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-[var(--barca-gold)] w-full placeholder:text-gray-400 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white bg-white/10 rounded-full w-4 h-4 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-[var(--surface-3)] px-3 py-1.5 rounded-xl border border-white/10 text-xs">
              <span className="text-[var(--text-muted)]">เรียง:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="position" className="bg-[var(--surface-3)]">🛡️ ตำแหน่ง (GK ➔ กองหน้า)</option>
                <option value="jersey" className="bg-[var(--surface-3)]">🔢 เบอร์เสื้อ (น้อย ➔ มาก)</option>
                <option value="name" className="bg-[var(--surface-3)]">🔤 ชื่อ (A-Z)</option>
                <option value="year_desc" className="bg-[var(--surface-3)]">📅 เข้า La Masia (ใหม่ ➔ เก่า)</option>
                <option value="year_asc" className="bg-[var(--surface-3)]">📅 เข้า La Masia (เก่า ➔ ใหม่)</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[var(--surface-3)] text-xs text-white px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-[var(--barca-gold)] cursor-pointer"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="promoted">ชุดใหญ่ (First Team)</option>
              <option value="barca_atletic">Barça Atlètic</option>
              <option value="juvenil_a">Juvenil (U19)</option>
              <option value="loaned">ยืมตัว (Loaned)</option>
              <option value="released">ปล่อยตัว (Released)</option>
              <option value="transferred">ย้ายทีม (Transferred)</option>
            </select>

            {/* Position Filter */}
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="bg-[var(--surface-3)] text-xs text-white px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-[var(--barca-gold)] cursor-pointer"
            >
              <option value="all">ตำแหน่งทั้งหมด</option>
              <option value="GK">ผู้รักษาประตู (GK)</option>
              <option value="DEF">กองหลัง (CB/LB/RB)</option>
              <option value="MID">กองกลาง (CAM/CM/CDM)</option>
              <option value="ATT">กองหน้า (ST/LW/RW)</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-[var(--barca-gold)] hover:underline px-2 py-1"
              >
                รีเซ็ต
              </button>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[var(--surface-3)] rounded-xl border border-white/10 p-1 gap-0.5">
              <button
                type="button"
                title="มุมมองตาราง"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                  viewMode === "table"
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                {/* Table icon */}
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 10h18M3 14h18M10 3v18M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6z" />
                </svg>
              </button>
              <button
                type="button"
                title="มุมมองการ์ด"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                {/* Grid icon */}
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Filter count feedback */}
        <div className="flex justify-between items-center text-xs text-[var(--text-muted)] pt-1">
          <span>
            แสดงผล <strong className="text-white">{sortedPlayers.length}</strong> จากทั้งหมด {initialPlayers.length} คน
            {sortBy === "position" && " (เรียงตามผังตำแหน่ง GK ➔ DEF ➔ MID ➔ ATT)"}
          </span>
          <span className="text-[var(--text-muted)]/60 hidden sm:inline">
            {viewMode === "grid" ? "📋 มุมมองการ์ด" : "📊 มุมมองตาราง"}
          </span>
        </div>
      </div>

      {/* ========== TABLE VIEW ========== */}
      {viewMode === "table" && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--text-secondary)]">
            <thead className="text-xs uppercase bg-[var(--surface-3)]/50 text-[var(--text-muted)]">
              <tr>
                <th scope="col" className="px-6 py-4 rounded-tl-xl font-semibold">นักเตะ</th>
                <th scope="col" className="px-6 py-4 font-semibold">ตำแหน่ง</th>
                <th scope="col" className="px-6 py-4 font-semibold">สถานะ</th>
                <th scope="col" className="px-6 py-4 font-semibold hidden md:table-cell">สัญชาติ</th>
                <th scope="col" className="px-6 py-4 rounded-tr-xl font-semibold text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedPlayers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-muted)]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="text-2xl">🔎</span>
                      <p className="text-sm">ไม่พบนักเตะที่ตรงกับเงื่อนไขการค้นหา</p>
                      <button type="button" onClick={clearFilters} className="text-xs text-[var(--barca-gold)] hover:underline mt-1">
                        ล้างคำค้นหาทั้งหมด
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedPlayers.map((player) => (
                  <tr key={player.id} className="hover:bg-[var(--surface-2)] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white overflow-hidden border border-white/10 shrink-0 shadow-sm"
                          style={{ background: player.imageUrl ? "var(--surface-3)" : getPositionGradient(player.position) }}
                        >
                          {player.imageUrl ? (
                            <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover" />
                          ) : (
                            player.name.split(" ").map((n) => n[0]).slice(0, 2).join("")
                          )}
                        </div>
                        <div>
                          <div className="text-[var(--text-primary)] font-bold">{player.name}</div>
                          <div className="text-[10px] text-[var(--text-muted)]">
                            เข้าปี {player.lamasiaYear}{" "}
                            {player.jerseyNumber ? `• #${player.jerseyNumber}` : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PositionBadge position={player.position} size="sm" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={player.currentStatus} size="sm" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <span className="inline-flex items-center gap-2">
                        <FlagIcon nationality={player.nationality} emoji={player.flagEmoji} />
                        {player.nationality}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-4">
                        <Link
                          href={`/admin/players/${player.id}/edit`}
                          className="text-[var(--barca-gold)] hover:text-white transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(player.id, player.name)}
                          disabled={deletingId === player.id || isPending}
                          className="text-red-500 hover:text-red-400 disabled:opacity-50 transition-colors bg-transparent border-none cursor-pointer"
                        >
                          {deletingId === player.id ? "กำลังลบ..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ========== GRID / CARD VIEW ========== */}
      {viewMode === "grid" && (
        <div className="p-5">
          {sortedPlayers.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
              <span className="text-3xl">🔎</span>
              <p className="text-sm">ไม่พบนักเตะที่ตรงกับเงื่อนไขการค้นหา</p>
              <button type="button" onClick={clearFilters} className="text-xs text-[var(--barca-gold)] hover:underline mt-1">
                ล้างคำค้นหาทั้งหมด
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {sortedPlayers.map((player) => (
                <div
                  key={player.id}
                  className="group relative rounded-2xl border border-white/10 bg-[var(--surface-2)] hover:border-white/25 hover:bg-[var(--surface-3)] transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Position color accent bar */}
                  <div
                    className="h-1 w-full"
                    style={{ background: getPositionGradient(player.position) }}
                  />

                  {/* Player Photo Area */}
                  <div className="relative mx-auto mt-5 mb-3">
                    <div
                      className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/15 shadow-lg"
                      style={{
                        background: player.imageUrl ? "var(--surface-3)" : getPositionGradient(player.position),
                      }}
                    >
                      {player.imageUrl ? (
                        <img
                          src={player.imageUrl}
                          alt={player.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-display font-black text-2xl text-white/80">
                          {player.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                      )}
                    </div>
                    {/* Jersey number badge */}
                    {player.jerseyNumber && (
                      <div
                        className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full border-2 border-[var(--surface-2)] flex items-center justify-center text-[10px] font-black text-white shadow-md"
                        style={{ background: getPositionGradient(player.position) }}
                      >
                        {player.jerseyNumber}
                      </div>
                    )}
                  </div>

                  {/* Player Info */}
                  <div className="px-3 pb-3 flex flex-col gap-2 flex-1">
                    <div className="text-center">
                      <p className="text-[var(--text-primary)] font-bold text-sm leading-tight truncate" title={player.name}>
                        {player.name}
                      </p>
                      <div className="flex items-center justify-center gap-1.5 mt-1">
                        <FlagIcon nationality={player.nationality} emoji={player.flagEmoji} />
                        <span className="text-[10px] text-[var(--text-muted)] truncate">{player.nationality}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <PositionBadge position={player.position} size="sm" />
                      <span className="text-[10px] text-[var(--text-muted)]">{player.lamasiaYear}</span>
                    </div>

                    <StatusBadge status={player.currentStatus} size="sm" />

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 pt-1 mt-auto border-t border-white/5">
                      <Link
                        href={`/admin/players/${player.id}/edit`}
                        className="flex-1 py-1.5 rounded-lg bg-[var(--barca-navy)] hover:bg-[var(--barca-navy-light)] text-white text-xs font-bold text-center transition-all"
                      >
                        ✏️ แก้ไข
                      </Link>
                      <Link
                        href={`/admin/players/${player.id}/stats`}
                        className="px-2 py-1.5 rounded-lg bg-[var(--surface-3)] hover:bg-white/15 text-[var(--text-muted)] hover:text-white text-xs font-medium transition-all"
                        title="จัดการสถิติ"
                      >
                        📊
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(player.id, player.name)}
                        disabled={deletingId === player.id || isPending}
                        className="px-2 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 hover:text-red-300 text-xs font-medium transition-all disabled:opacity-40"
                        title="ลบนักเตะ"
                      >
                        {deletingId === player.id ? "⏳" : "🗑️"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="p-4 border-t border-white/10 bg-[var(--surface-2)] flex justify-center text-xs text-[var(--text-muted)]">
        ข้อมูลดึงมาจากฐานข้อมูล Supabase (PostgreSQL) แบบ Real-time
      </div>
    </div>
  );
}
