import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 pt-20 pb-16 relative overflow-hidden">
      {/* Background ambient orbs */}
      <div
        className="hero-orb w-96 h-96 opacity-20 animate-float"
        style={{
          background: "radial-gradient(circle, #A2001D 0%, transparent 70%)",
          top: "20%",
          left: "20%",
        }}
      />
      <div
        className="hero-orb w-96 h-96 opacity-20 animate-float"
        style={{
          background: "radial-gradient(circle, #004D98 0%, transparent 70%)",
          bottom: "20%",
          right: "20%",
          animationDelay: "2s",
        }}
      />

      <div className="relative z-10 max-w-md mx-auto">
        <div
          className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl border border-white/10"
          style={{ background: "var(--gradient-barca)" }}
        >
          <span className="text-4xl font-display font-black text-white">404</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-display font-black text-white mb-3">
          ไม่พบหน้าที่คุณต้องการ
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mb-8 leading-relaxed">
          หน้าที่คุณกำลังค้นหาอาจถูกย้าย ลบ หรือไม่มีข้อมูลในระบบ La Masia Tracker
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs text-white shadow-lg transition-all hover:scale-105"
            style={{
              background: "var(--gradient-barca)",
              boxShadow: "0 0 20px rgba(162, 0, 29, 0.3)",
            }}
          >
            ← กลับสู่หน้าหลัก
          </Link>
          <Link
            href="/timeline"
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-xs text-[var(--text-secondary)] glass border border-white/10 hover:text-white hover:bg-white/10 transition-all"
          >
            ดู Timeline นักเตะ
          </Link>
        </div>
      </div>
    </div>
  );
}
