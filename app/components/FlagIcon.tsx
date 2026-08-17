import { getCountryCode } from "@/app/utils/flags";

interface FlagIconProps {
  nationality: string;
  emoji?: string;
  className?: string;
}

export function FlagIcon({ nationality, emoji, className = "" }: FlagIconProps) {
  const code = getCountryCode(nationality);
  
  if (!code) {
    // If no country code mapping exists, fallback to the emoji they entered (or the default flag)
    return <span className={`inline-block ${className}`}>{emoji || "🏳️"}</span>;
  }

  // Use flagcdn for rendering high-quality SVG/PNG flags
  return (
    <img 
      src={`https://flagcdn.com/w20/${code}.png`} 
      srcSet={`https://flagcdn.com/w40/${code}.png 2x`}
      alt={nationality}
      title={nationality}
      className={`inline-block h-3.5 sm:h-4 w-auto rounded-[2px] shadow-sm align-baseline ${className}`}
      loading="lazy"
    />
  );
}
