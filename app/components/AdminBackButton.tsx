import Link from "next/link";

interface AdminBackButtonProps {
  href: string;
  label?: string;
  className?: string;
}

export function AdminBackButton({
  href,
  label = "ย้อนกลับ",
  className = "",
}: AdminBackButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--surface-3)] hover:bg-[var(--surface-4)] border border-white/10 text-xs font-semibold text-[var(--text-secondary)] hover:text-white transition-all duration-200 hover:-translate-x-0.5 group shrink-0 shadow-sm ${className}`}
    >
      <svg
        className="w-4 h-4 text-[var(--barca-gold)] transition-transform duration-200 group-hover:-translate-x-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M15 19l-7-7 7-7"
        />
      </svg>
      <span>{label}</span>
    </Link>
  );
}
