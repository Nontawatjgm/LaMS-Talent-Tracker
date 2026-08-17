"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

function getPageInfo(pathname: string): { title: string; subtitle?: string } {
  if (pathname === "/admin") {
    return { title: "Dashboard Overview", subtitle: "ภาพรวมระบบและข้อมูลสถิติทั่วไป" };
  }
  if (pathname === "/admin/players/new") {
    return { title: "เพิ่มนักเตะใหม่", subtitle: "กรอกข้อมูลดาวรุ่ง La Masia เข้าสู่ระบบ" };
  }
  if (pathname.includes("/edit")) {
    return { title: "แก้ไขข้อมูลนักเตะ", subtitle: "ปรับปรุงรายละเอียดและสถิติส่วนบุคคล" };
  }
  if (pathname.includes("/stats/new")) {
    return { title: "เพิ่มสถิติพรีซีซั่น", subtitle: "บันทึกผลงานช่วงทัวร์อุ่นเครื่อง" };
  }
  if (pathname.includes("/stats")) {
    return { title: "จัดการสถิติพรีซีซั่น", subtitle: "บันทึกและแก้ไขสถิติการลงสนาม" };
  }
  if (pathname === "/admin/players") {
    return { title: "จัดการข้อมูลนักเตะ", subtitle: "รายชื่อนักเตะทั้งหมดในระบบ La Masia" };
  }
  return { title: "Admin Console", subtitle: "ระบบจัดการข้อมูล" };
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pageInfo = getPageInfo(pathname);

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/players", label: "จัดการนักเตะ", icon: "👥" },
    { href: "/admin/stats", label: "จัดการสถิติพรีซีซั่น", icon: "📈" },
  ];

  return (
    <div
      className="admin-theme min-h-screen flex font-sans"
      style={{ backgroundColor: "var(--bg-dark)", color: "var(--text-primary)" }}
    >
      {/* ========================================================
          1. FULL-HEIGHT SIDEBAR (Left Column - 100vh Sticky)
          Compact Width (w-56 = 224px)
         ======================================================== */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-56 flex flex-col transition-transform duration-300 z-40 shrink-0 md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          backgroundColor: "#002D64",
          borderRight: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Brand Header */}
        <div
          className="h-16 px-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-xs text-white shadow-lg transition-transform group-hover:scale-105 shrink-0"
              style={{
                background: "linear-gradient(135deg, #A2001D 0%, #004D98 100%)",
                boxShadow: "0 0 14px rgba(162, 0, 29, 0.4)",
              }}
            >
              LM
            </div>
            <div className="overflow-hidden">
              <h1 className="font-display font-bold text-sm leading-tight text-white truncate">La Masia</h1>
              <p className="text-[9px] tracking-wider uppercase font-mono font-bold text-[#EDBB00]">
                Admin Console
              </p>
            </div>
          </Link>

          {/* Close button on mobile drawer */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-white/70 hover:text-white p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Section: Main Menu */}
        <div className="px-4 pt-5 pb-1.5">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-white/35">เมนูจัดการ</p>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-2.5 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 relative"
                style={
                  isActive
                    ? {
                        backgroundColor: "rgba(255,255,255,0.14)",
                        color: "#FFFFFF",
                        border: "1px solid rgba(255,255,255,0.18)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                      }
                    : {
                        color: "rgba(255,255,255,0.65)",
                        border: "1px solid transparent",
                      }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.08)";
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.95)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "";
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)";
                  }
                }}
              >
                {/* Active Gold Left Indicator Bar */}
                {isActive && (
                  <div
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full"
                    style={{ background: "#EDBB00" }}
                  />
                )}
                <span className="text-sm shrink-0">{item.icon}</span>
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <div
                    className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: "#EDBB00" }}
                  />
                )}
              </Link>
            );
          })}

          {/* Section Separator */}
          <div className="my-3 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          <p className="px-3 mb-1 text-[10px] uppercase tracking-wider font-semibold text-white/35">พอร์ทัล</p>

          {/* Back to website button */}
          <Link
            href="/"
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
            style={{ color: "rgba(255,255,255,0.6)", border: "1px solid transparent" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.95)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "";
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)";
            }}
          >
            <span className="text-sm shrink-0">🌐</span>
            <span className="truncate">กลับสู่หน้าหลักแฟนบอล</span>
          </Link>
        </nav>

        {/* Admin Profile Footer */}
        <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
            style={{ backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[10px] shadow-sm shrink-0"
              style={{
                background: "linear-gradient(135deg, #A2001D, #D4002A)",
                boxShadow: "0 0 8px rgba(162,0,29,0.3)",
              }}
            >
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">Administrator</p>
              <p className="text-[9px] text-[#EDBB00]/80">Mock User Mode</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================
          2. RIGHT COLUMN (Top Header Bar + Main Content Canvas)
         ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar — Clean & Non-redundant */}
        <header
          className="h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm transition-all"
          style={{
            backgroundColor: "#FFFFFF",
            borderBottom: "1px solid rgba(0, 77, 152, 0.08)",
          }}
        >
          {/* Left: Mobile Toggle + Page Breadcrumb & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-[#0B1F40] bg-[#EFF3FB] border border-[#004D98]/10 hover:bg-[#E8EFF9] transition-colors"
              aria-label="Open navigation menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Breadcrumb Info */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#004D98]/8 text-[#004D98]">
                Admin
              </span>
              <span className="text-[#7A8FAD] text-xs">/</span>
              <span className="text-sm font-bold text-[#0B1F40] truncate">
                {pageInfo.title}
              </span>
            </div>
          </div>

          {/* Right: Live DB Status + Quick Actions + Back Link */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live DB Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live DB</span>
            </div>

            {/* Quick Add Player Shortcut */}
            <Link
              href="/admin/players/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white text-xs font-bold shadow-sm hover:opacity-95 transition-all"
              style={{
                background: "linear-gradient(135deg, #A2001D, #D4002A)",
                boxShadow: "0 2px 8px rgba(162,0,29,0.25)",
              }}
            >
              <span className="text-sm leading-none">+</span>
              <span className="hidden xs:inline">เพิ่มนักเตะ</span>
            </Link>

            {/* View Website Shortcut */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EFF3FB] hover:bg-[#E8EFF9] text-xs font-semibold text-[#354875] border border-[#004D98]/12 transition-all"
              title="เปิดดูหน้าหลักของแฟนบอล"
            >
              <span>🌐</span>
              <span className="hidden sm:inline">ดูหน้าเว็บ</span>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden backdrop-blur-sm"
          style={{ backgroundColor: "rgba(0, 20, 60, 0.5)" }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
