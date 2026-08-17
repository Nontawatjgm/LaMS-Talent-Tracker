"use client";

import { useState } from "react";
import Link from "next/link";
import type { Player } from "@/types/player";
import { StatusBadge, PositionBadge } from "@/app/components/StatusBadge";
import { FlagIcon } from "@/app/components/FlagIcon";

interface AdminStatsListProps {
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

export default function AdminStatsList({ initialPlayers }: AdminStatsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [positionFilter, setPositionFilter] = useState<string>("all");

  const filteredPlayers = initialPlayers.filter((player) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      player.name.toLowerCase().includes(q) ||
      player.position.toLowerCase().includes(q) ||
      player.nationality.toLowerCase().includes(q) ||
      (player.jerseyNumber && String(player.jerseyNumber).includes(q)) ||
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
    const orderA = POSITION_ORDER[a.position] || 99;
    const orderB = POSITION_ORDER[b.position] || 99;
    if (orderA !== orderB) return orderA - orderB;
    if (a.jerseyNumber && b.jerseyNumber) return a.jerseyNumber - b.jerseyNumber;
    if (a.jerseyNumber) return -1;
    if (b.jerseyNumber) return 1;
    return a.name.localeCompare(b.name);
  });

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPositionFilter("all");
  };

  return (
    <div className="glass rounded-2xl border border-white/10 overflow-hidden">
      {/* Search & Filter Bar */}
      <div className="p-4 border-b border-white/10 bg-[var(--surface-2)] space-y-3">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหานักเตะเยาวชน..."
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
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[var(--surface-3)] text-xs text-white px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-[var(--barca-gold)] cursor-pointer"
            >
              <option value="all">สถานะทั้งหมด</option>
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

            {(searchQuery || statusFilter !== "all" || positionFilter !== "all") && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-[var(--barca-gold)] hover:underline px-2 py-1"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
        </div>

        <div className="text-xs text-[var(--text-muted)] pt-1">
          แสดงผล <strong className="text-white">{sortedPlayers.length}</strong> จากทั้งหมด {initialPlayers.length} คน
          {" (เรียงตามผังตำแหน่ง GK ➔ DEF ➔ MID ➔ ATT)"}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[var(--text-secondary)]">
          <thead className="text-xs uppercase bg-[var(--surface-3)]/50 text-[var(--text-muted)]">
            <tr>
              <th scope="col" className="px-6 py-4 rounded-tl-xl font-semibold">นักเตะ</th>
              <th scope="col" className="px-6 py-4 font-semibold">ตำแหน่ง</th>
              <th scope="col" className="px-6 py-4 font-semibold">สถานะ</th>
              <th scope="col" className="px-6 py-4 rounded-tr-xl font-semibold text-right">จัดการสถิติ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedPlayers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-[var(--text-muted)]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-2xl">🔎</span>
                    <p className="text-sm">ไม่พบนักเตะเยาวชนที่ตรงกับการค้นหา</p>
                    {(searchQuery || positionFilter !== "all") && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="text-xs text-[var(--barca-gold)] hover:underline mt-1"
                      >
                        ล้างคำค้นหา
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              sortedPlayers.map((player) => (
                <tr key={player.id} className="hover:bg-[var(--surface-2)] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm text-white overflow-hidden border border-white/10"
                        style={{
                          background: player.imageUrl
                            ? "transparent"
                            : ["ST", "LW", "RW", "FWD"].includes(player.position)
                            ? "linear-gradient(135deg, #A2001D, #D4002A)"
                            : ["CAM", "CM", "CDM", "MID"].includes(player.position)
                            ? "linear-gradient(135deg, #004D98, #0060BA)"
                            : ["CB", "LB", "RB", "DEF"].includes(player.position)
                            ? "linear-gradient(135deg, #7C3AED, #A78BFA)"
                            : "linear-gradient(135deg, #EDBB00, #F59E0B)",
                        }}
                      >
                        {player.imageUrl ? (
                          <img
                            src={player.imageUrl}
                            alt={player.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          player.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                        )}
                      </div>
                      <div>
                        <div className="text-white font-bold">{player.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                          <FlagIcon nationality={player.nationality} emoji={player.flagEmoji} /> เข้าปี {player.lamasiaYear}
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/players/${player.id}/stats`}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface-3)] hover:bg-[var(--barca-navy)] text-white text-xs font-bold transition-colors border border-white/10"
                    >
                      📈 เพิ่ม/ดูสถิติ
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
