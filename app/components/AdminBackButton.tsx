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
      title={label}
      aria-label={label}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-xl bg-white hover:bg-[#F4F7FD] border border-[#004D98]/15 hover:border-[#004D98]/35 text-[#004D98] shadow-xs hover:-translate-x-0.5 transition-all duration-200 group shrink-0 ${className}`}
    >
      <svg
        className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </Link>
  );
}
