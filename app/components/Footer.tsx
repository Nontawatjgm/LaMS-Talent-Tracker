"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlagIcon } from "./FlagIcon";

export default function Footer() {
  const pathname = usePathname();

  // Hide public footer in admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const featuredStars = [
    { name: "Lamine Yamal", id: "lamine-yamal", pos: "FWD", nationality: "Spain", flag: "🇪🇸" },
    { name: "Pau Cubarsí", id: "pau-cubarsi", pos: "DEF", nationality: "Spain", flag: "🇪🇸" },
    { name: "Marc Bernal", id: "marc-bernal", pos: "MID", nationality: "Spain", flag: "🇪🇸" },
    { name: "Gerard Martín", id: "gerard-martin", pos: "DEF", nationality: "Spain", flag: "🇪🇸" },
    { name: "Héctor Fort", id: "hector-fort", pos: "DEF", nationality: "Spain", flag: "🇪🇸" },
    { name: "Marc Casadó", id: "marc-casado", pos: "MID", nationality: "Spain", flag: "🇪🇸" },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.08] bg-[#06060F] text-[#94A3B8]">
      {/* Top ambient glow & Barça accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#A2001D] via-[#EDBB00] to-[#004D98] opacity-60" />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[120px] pointer-events-none opacity-15 filter blur-[60px]"
        style={{
          background:
            "radial-gradient(ellipse at top, #A2001D 0%, #004D98 60%, transparent 80%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        {/* Main 4-column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-white/[0.08]">
          {/* Column 1: Brand & Heritage (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <Link
              href="/"
              className="flex items-center gap-3 group w-fit"
              aria-label="La Masia Tracker Home"
            >
              {/* Barça Crest LM badge */}
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300"
                style={{
                  background:
                    "linear-gradient(135deg, #A2001D, #004D98)",
                  boxShadow: "0 0 20px rgba(162, 0, 29, 0.3)",
                }}
              >
                <span className="text-white font-black text-base font-display">
                  LM
                </span>
              </div>
              <div>
                <div className="font-display font-black text-xl text-white tracking-tight flex items-center gap-2">
                  <span>La Masia</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-[#EDBB00] border border-[#EDBB00]/30 font-bold">
                    FC Barcelona
                  </span>
                </div>
                <span className="text-xs text-[#64748B] tracking-wider uppercase font-medium">
                  Pre-Season Rising Stars Tracker
                </span>
              </div>
            </Link>

            <p className="text-sm text-[#94A3B8] leading-relaxed max-w-md">
              ศูนย์รวมข้อมูลและสถิติดาวรุ่งจากสถาบัน <strong className="text-white">La Masia</strong> ที่ได้รับโอกาสก้าวขึ้นสู่ทีมชุดใหญ่ของ FC Barcelona ในช่วง Pre-Season แต่ละฤดูกาล
            </p>

            {/* Catalan Motto Badge */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 w-fit text-xs text-[#CBD5E1]">
              <span className="text-[#EDBB00] font-bold">❝</span>
              <span className="italic">Formem persones, eduquem futbolistes</span>
              <span className="text-[#EDBB00] font-bold">❞</span>
            </div>

            {/* Academy Quick Stats Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-3 py-1 rounded-lg bg-white/[0.04] text-xs text-[#94A3B8] border border-white/10">
                🏛️ ก่อตั้ง 1979
              </span>
              <span className="px-3 py-1 rounded-lg bg-white/[0.04] text-xs text-[#94A3B8] border border-white/10">
                📍 Ciutat Esportiva
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/[0.04] text-xs text-[#CBD5E1] border border-white/10">
                <span className="flex items-center -space-x-0.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A2001D]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#004D98]" />
                </span>
                <span>ฤดูกาล 2026/27</span>
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links (2 cols on lg) */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EDBB00]" />
              เมนูหลัก
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-[#94A3B8] hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200"
                >
                  <span className="text-white/30 text-xs">›</span>
                  <span>หน้าหลัก</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/players"
                  className="text-[#94A3B8] hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200"
                >
                  <span className="text-white/30 text-xs">›</span>
                  <span>นักเตะทั้งหมด</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/timeline"
                  className="text-[#94A3B8] hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200"
                >
                  <span className="text-white/30 text-xs">›</span>
                  <span>Timeline พรีซีซั่น</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/compare"
                  className="text-[#94A3B8] hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200"
                >
                  <span className="text-white/30 text-xs">›</span>
                  <span>เปรียบเทียบนักเตะ</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/#featured"
                  className="text-[#94A3B8] hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200"
                >
                  <span className="text-white/30 text-xs">›</span>
                  <span>ดาวรุ่งชุดใหญ่</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/#recent"
                  className="text-[#94A3B8] hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200"
                >
                  <span className="text-white/30 text-xs">›</span>
                  <span>นักเตะล่าสุด</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Featured Stars (3 cols on lg) */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A2001D]" />
              นักเตะดาวเด่น
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {featuredStars.map((player) => (
                <Link
                  key={player.id}
                  href={`/players/${player.id}`}
                  className="group flex items-center justify-between p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-all duration-200"
                >
                  <div className="flex items-center gap-2 text-sm text-[#94A3B8] group-hover:text-white">
                    <FlagIcon nationality={player.nationality} emoji={player.flag} />
                    <span className="font-medium">{player.name}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/[0.06] text-[#CBD5E1] border border-white/10 group-hover:text-[#EDBB00] group-hover:border-[#EDBB00]/30 transition-colors">
                    {player.pos}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Column 4: Status Legend & Action (2 cols on lg) */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#004D98]" />
              สถานะนักเตะ
            </h3>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="flex items-center -space-x-0.5 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-[#A2001D]" />
                  <span className="w-2 h-2 rounded-full bg-[#004D98]" />
                </span>
                <div>
                  <span className="font-bold text-white block">First Team</span>
                  <span className="text-[#64748B] text-[11px]">ขึ้นทีมชุดใหญ่</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="w-2 h-2 rounded-full bg-[#004D98] shrink-0" />
                <div>
                  <span className="font-bold text-white block">Barça Atlètic</span>
                  <span className="text-[#64748B] text-[11px]">ทีมสำรอง / B Team</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="w-2 h-2 rounded-full bg-[#D97706] shrink-0" />
                <div>
                  <span className="font-bold text-white block">Juvenil (U19)</span>
                  <span className="text-[#64748B] text-[11px]">ทีมเยาวชนอคาเดมี่</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="w-2 h-2 rounded-full bg-[#E65100] shrink-0" />
                <div>
                  <span className="font-bold text-white block">Loaned</span>
                  <span className="text-[#64748B] text-[11px]">ยืมตัวเก็บประสบการณ์</span>
                </div>
              </div>
            </div>

            {/* Back to top button */}
            <button
              onClick={scrollToTop}
              className="mt-2 w-full py-2.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-[#CBD5E1] hover:text-white flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              aria-label="เลื่อนขึ้นบนสุด"
            >
              <span>↑</span>
              <span>กลับสู่ด้านบนสุด</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-center md:text-left">
            <span>© 2026 La Masia Rising Stars Tracker.</span>
            <span>Made with <span className="text-[#004D98]">💙</span><span className="text-[#A2001D]">❤️</span> for Culers worldwide.</span>
          </div>

          <div className="text-center md:text-right max-w-lg opacity-80">
            โปรเจกต์นี้สร้างขึ้นโดยแฟนบอลเพื่อติดตามสถิติเท่านั้น ไม่มีส่วนเกี่ยวข้องอย่างเป็นทางการกับ FC Barcelona
          </div>
        </div>
      </div>
    </footer>
  );
}
