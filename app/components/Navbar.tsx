"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { Player } from "@/types/player";
import NavbarSearch from "./NavbarSearch";

const navLinks = [
  { href: "/", label: "หน้าหลัก" },
  { href: "/players", label: "นักเตะทั้งหมด" },
  { href: "/timeline", label: "Timeline" },
  { href: "/compare", label: "เปรียบเทียบนักเตะ" },
];

export default function Navbar({ players }: { players: Player[] }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Do not render public Navbar when inside admin portal (admin layout manages its own sidebar & header)
  if (isAdmin) {
    return null;
  }

  // ==========================================
  // PUBLIC / FRONTEND NAVBAR
  // ==========================================
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 h-[72px] ${
        scrolled ? "shadow-2xl" : ""
      }`}
      style={{
        backgroundColor: scrolled
          ? "rgba(6, 6, 15, 0.95)"
          : "rgba(6, 6, 15, 0.8)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full">
        <div className="flex items-center justify-between h-full w-full">
          {/* 1. Left - Logo */}
          <div className="flex-1 flex justify-start">
            <Link
              href="/"
              className="flex items-center gap-3 group"
              aria-label="La Masia Tracker Home"
            >
              {/* Barça Crest SVG simplified */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden shadow-xs"
                style={{ background: "linear-gradient(135deg, #A2001D, #004D98)" }}
              >
                <span className="text-white font-black text-sm font-display">LM</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-display font-black text-base text-white leading-none block">
                  La Masia
                </span>
                <span className="text-[10px] text-[#94A3B8] tracking-widest uppercase font-mono">
                  Rising Stars
                </span>
              </div>
            </Link>
          </div>

          {/* 2. Middle - Links (Flex centered) */}
          <div className="flex-none hidden md:flex items-center justify-center gap-1 bg-white/[0.03] p-1 rounded-2xl border border-white/[0.06] backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`w-28 text-center py-2 rounded-xl text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-white/[0.1] text-white font-bold shadow-xs border border-white/15"
                      : "text-[#CBD5E1] hover:text-white hover:bg-white/[0.05] font-medium"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* 3. Right - Inline Navbar Search & Admin Portal */}
          <div className="flex-1 flex justify-end items-center gap-2 sm:gap-3">
            {/* Inline Search with Floating Dropdown (No full-screen blocking overlay!) */}
            <NavbarSearch players={players} />

            {/* Barça Season badge pill */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs text-[#CBD5E1] shadow-xs">
              <span className="flex items-center -space-x-0.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A2001D]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#004D98]" />
              </span>
              <span className="font-bold text-white">2026/27</span>
            </div>

            {/* Admin Portal Button */}
            <Link
              href="/admin"
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-[#CBD5E1] hover:text-white transition-all duration-200 hover:scale-105 group relative"
              title="เข้าสู่ระบบจัดการข้อมูล (Admin Portal)"
              aria-label="Admin Portal"
            >
              <svg
                className="w-4 h-4 transition-transform duration-500 group-hover:rotate-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-xl bg-white/[0.04] text-[#CBD5E1] hover:text-white transition-colors border border-white/10"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden mt-3 rounded-2xl bg-[#091120]/95 backdrop-blur-xl p-3 flex flex-col gap-1 border border-white/10 shadow-2xl">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white/[0.1] text-white font-bold"
                      : "text-[#CBD5E1] hover:bg-white/[0.05]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between transition-all duration-200 border-t border-white/10 mt-1 pt-3 text-[#CBD5E1] hover:text-white"
            >
              <span>ระบบจัดการ (Admin Portal)</span>
              <span className="text-xs text-[#94A3B8]">→</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
