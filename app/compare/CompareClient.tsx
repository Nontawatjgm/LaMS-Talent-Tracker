"use client";

import { useState } from "react";
import type { Player } from "@/types/player";
import PlayerSelect from "@/app/components/PlayerSelect";
import CompareStats from "@/app/components/CompareStats";
import { FlagIcon } from "@/app/components/FlagIcon";
import { StatusBadge, PositionBadge } from "@/app/components/StatusBadge";
import Link from "next/link";

function getAge(dateOfBirth: string): number {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

function PlayerProfileSummary({ player, alignRight = false }: { player: Player | null, alignRight?: boolean }) {
  if (!player) {
    return (
      <div className="h-full flex items-center justify-center min-h-[300px] border-2 border-dashed border-[var(--border-subtle)] rounded-3xl opacity-50">
        <span className="text-sm text-[var(--text-muted)]">รอเลือกนักเตะ</span>
      </div>
    );
  }

  const age = getAge(player.dateOfBirth);

  return (
    <div className={`glass rounded-3xl p-6 md:p-8 flex flex-col gap-6 h-full border-t-4 ${alignRight ? 'border-t-[var(--barca-navy)]' : 'border-t-[var(--barca-crimson)]'}`}>
      <div className={`flex items-start gap-4 ${alignRight ? 'flex-row-reverse text-right' : ''}`}>
        {/* Avatar */}
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 overflow-hidden"
          style={{ background: player.imageUrl ? 'transparent' : (alignRight ? 'var(--barca-navy)' : 'var(--barca-crimson)') }}>
          {player.imageUrl ? (
            <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover object-top" />
          ) : (
            <span className="font-display font-black text-2xl text-white opacity-80">{getInitials(player.name)}</span>
          )}
        </div>
        
        <div className="flex-1">
          <h2 className="font-display font-black text-2xl md:text-3xl text-white mb-2">{player.name}</h2>
          <div className={`flex flex-wrap items-center gap-2 ${alignRight ? 'justify-end' : ''}`}>
            <PositionBadge position={player.position} />
            <span className="flex items-center gap-1.5 text-sm">
              <FlagIcon nationality={player.nationality} emoji={player.flagEmoji} /> {player.nationality}
            </span>
          </div>
        </div>
      </div>

      <div className="divider-barca opacity-30" />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="block text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">อายุ</span>
          <span className="font-bold text-white">{age} ปี</span>
        </div>
        <div>
          <span className="block text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">เข้า La Masia ปี</span>
          <span className="font-bold text-white">{player.lamasiaYear}</span>
        </div>
        <div className="col-span-2">
          <span className="block text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">สถานะปัจจุบัน</span>
          <div className="mt-1">
            <StatusBadge status={player.currentStatus} />
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <Link
          href={`/players/${player.id}`}
          className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors"
        >
          ดูโปรไฟล์เต็ม {alignRight ? '←' : '→'}
        </Link>
      </div>
    </div>
  );
}

export default function CompareClient({ players }: { players: Player[] }) {
  const [p1Id, setP1Id] = useState<string | null>(null);
  const [p2Id, setP2Id] = useState<string | null>(null);

  const player1 = players.find(p => p.id === p1Id) || null;
  const player2 = players.find(p => p.id === p2Id) || null;

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="font-display font-black text-4xl md:text-5xl text-white mb-4">
          <span className="gradient-text">Compare</span> Players
        </h1>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
          เปรียบเทียบสถิติและเส้นทางช่วง Pre-Season ของนักเตะดาวรุ่งจาก La Masia
        </p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in-up delay-100">
        <PlayerSelect
          label="นักเตะคนที่ 1 (สีแดง)"
          players={players.filter(p => p.id !== p2Id)}
          value={p1Id}
          onChange={setP1Id}
        />
        <PlayerSelect
          label="นักเตะคนที่ 2 (สีน้ำเงิน)"
          players={players.filter(p => p.id !== p1Id)}
          value={p2Id}
          onChange={setP2Id}
        />
      </div>

      {/* Profile Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in-up delay-200">
        <PlayerProfileSummary player={player1} />
        <PlayerProfileSummary player={player2} alignRight />
      </div>

      {/* Stats Comparison */}
      <div className="animate-fade-in-up delay-300">
        <CompareStats player1={player1} player2={player2} />
      </div>
    </div>
  );
}
