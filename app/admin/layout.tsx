"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/players", label: "จัดการนักเตะ", icon: "👥" },
    { href: "/admin/stats", label: "จัดการสถิติพรีซีซั่น", icon: "📈" },
    { href: "/", label: "กลับสู่เว็บไซต์", icon: "🏠", external: true },
  ];

  return (
    <div className="min-h-screen bg-[#06060F] flex flex-col md:flex-row font-sans text-white pt-[72px]">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[var(--surface)] border-b border-white/10 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--barca-crimson)] to-[var(--barca-navy)] flex items-center justify-center font-display font-bold text-sm">
            LM
          </div>
          <span className="font-display font-bold text-lg">Admin Panel</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-[var(--surface-2)] rounded-lg text-white"
        >
          {isSidebarOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-[72px] left-0 h-[calc(100vh-72px)] w-64 bg-[var(--surface)] border-r border-white/10 flex flex-col transition-transform duration-300 z-10 md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 hidden md:flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--barca-crimson)] to-[var(--barca-navy)] flex items-center justify-center font-display font-bold text-base shadow-lg shadow-[var(--barca-crimson)]/20">
            LM
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight">La Masia</h1>
            <p className="text-[10px] text-[var(--text-muted)] tracking-widest uppercase">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href) && !item.external);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[var(--surface-3)] text-white shadow-md border border-white/10"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-white/5">
            <div className="w-8 h-8 rounded-full bg-[var(--barca-gold)] flex items-center justify-center text-[#06060F] font-bold text-sm">
              AD
            </div>
            <div>
              <p className="text-sm font-bold text-white">Administrator</p>
              <p className="text-[10px] text-[var(--text-muted)]">Mock User Mode</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-[100vw]">
        {children}
      </main>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-0 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
