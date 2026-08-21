"use client";

import { useState } from "react";

export type DividerStyle = "slash" | "fade" | "arch" | "line";

interface HeroDividerProps {
  initialStyle?: DividerStyle;
  position?: "top" | "bottom";
  onStyleChange?: (style: DividerStyle) => void;
  activeStyle?: DividerStyle;
}

export function HeroDividerSwitcher({
  currentStyle,
  onSelect,
}: {
  currentStyle: DividerStyle;
  onSelect: (style: DividerStyle) => void;
}) {
  const styles: { id: DividerStyle; label: string; icon: string }[] = [
    { id: "slash", label: "1. ตัดเฉียง Angled", icon: "⚡" },
    { id: "fade", label: "2. ไล่เฉด Seamless", icon: "🌫️" },
    { id: "arch", label: "3. โค้งคัมป์นู Arch", icon: "🏟️" },
    { id: "line", label: "4. เส้นตรง Precision", icon: "📏" },
  ];

  return (
    <div className="relative z-30 flex items-center justify-center -mt-6 mb-4 px-4">
      <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-[#0B1528]/90 border border-white/20 shadow-2xl backdrop-blur-xl">
        <span className="text-[11px] font-bold text-[var(--barca-gold)] px-2.5 hidden sm:inline">
          ลองเลือกสไตล์:
        </span>
        {styles.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentStyle === s.id
                ? "bg-gradient-to-r from-[var(--barca-crimson)] to-[var(--barca-navy)] text-white shadow-md font-bold scale-105"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function RenderHeroDivider({
  style,
  position = "top",
}: {
  style: DividerStyle;
  position?: "top" | "bottom";
}) {
  if (position === "top") {
    switch (style) {
      case "slash":
        // Style 1: Dynamic Angled Slash Cut (High Speed Sport Angle)
        return (
          <div className="relative h-16 sm:h-24 overflow-hidden -mt-px pointer-events-none">
            <svg
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              className="w-full h-full text-[#F8FAFD] fill-current"
            >
              <polygon points="0,40 1200,0 1200,120 0,120" />
            </svg>
            {/* Top Accent Glowing Line along the diagonal slash */}
            <div
              className="absolute top-0 left-0 right-0 h-0.5"
              style={{
                background:
                  "linear-gradient(90deg, transparent 5%, #EDBB00 25%, #A2001D 50%, #004D98 75%, transparent 95%)",
                transform: "rotate(-1.9deg)",
                transformOrigin: "center",
                opacity: 0.8,
              }}
            />
          </div>
        );

      case "fade":
        // Style 2: Seamless Multi-stop Atmospheric Ambient Fade
        return (
          <div
            className="relative h-28 sm:h-36 -mt-px pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, #02050E 0%, rgba(7, 25, 66, 0.5) 30%, rgba(248, 250, 253, 0.7) 75%, #F8FAFD 100%)",
            }}
          />
        );

      case "arch":
        // Style 3: Camp Nou Grand Arch (Parabolic Monolithic Curve)
        return (
          <div className="relative h-16 sm:h-24 overflow-hidden -mt-px pointer-events-none">
            <svg
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              className="w-full h-full text-[#F8FAFD] fill-current"
            >
              <path d="M0,0 Q600,90 1200,0 L1200,120 L0,120 Z" />
            </svg>
            {/* Arch Glow Line */}
            <div
              className="absolute top-0 left-0 right-0 h-10 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 60% 100% at 50% 0%, rgba(237, 187, 0, 0.2) 0%, transparent 80%)",
              }}
            />
          </div>
        );

      case "line":
      default:
        // Style 4: Precision Minimalist Line with Centered Diamond
        return (
          <div className="relative py-8 bg-[#F8FAFD] overflow-hidden -mt-px pointer-events-none">
            <div
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5"
              style={{
                background:
                  "linear-gradient(90deg, transparent 5%, #A2001D 25%, #EDBB00 50%, #004D98 75%, transparent 95%)",
              }}
            />
            <div className="relative flex justify-center">
              <span className="px-4 bg-[#F8FAFD] text-[var(--barca-gold)] text-sm tracking-widest font-black">
                ◆
              </span>
            </div>
          </div>
        );
    }
  } else {
    // Bottom Divider (Light Canvas -> Footer)
    switch (style) {
      case "slash":
        return (
          <div className="relative h-16 sm:h-24 overflow-hidden -mt-px bg-white pointer-events-none">
            <svg
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              className="w-full h-full text-[#06060F] fill-current"
            >
              <polygon points="0,0 1200,40 1200,120 0,120" />
            </svg>
          </div>
        );

      case "fade":
        return (
          <div
            className="relative h-28 -mt-px pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, #FFFFFF 0%, rgba(6, 6, 15, 0.6) 60%, #06060F 100%)",
            }}
          />
        );

      case "arch":
        return (
          <div className="relative h-16 sm:h-24 overflow-hidden -mt-px bg-white pointer-events-none">
            <svg
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              className="w-full h-full text-[#06060F] fill-current"
            >
              <path d="M0,80 Q600,0 1200,80 L1200,120 L0,120 Z" />
            </svg>
          </div>
        );

      case "line":
      default:
        return (
          <div className="relative py-6 bg-white overflow-hidden -mt-px pointer-events-none">
            <div
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5"
              style={{
                background:
                  "linear-gradient(90deg, transparent 5%, #A2001D 25%, #EDBB00 50%, #004D98 75%, transparent 95%)",
              }}
            />
          </div>
        );
    }
  }
}
