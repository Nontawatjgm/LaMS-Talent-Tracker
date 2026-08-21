"use client";

import { useState } from "react";
import { DividerStyle, HeroDividerSwitcher, RenderHeroDivider } from "./HeroDivider";

interface HomeSectionDividerWrapperProps {
  children: React.ReactNode;
}

export default function HomeSectionDividerWrapper({
  children,
}: HomeSectionDividerWrapperProps) {
  const [style, setStyle] = useState<DividerStyle>("slash");

  return (
    <>
      {/* Interactive Switcher Controls (Sticky / Centered between Hero & Light Zone) */}
      <div className="relative">
        <HeroDividerSwitcher currentStyle={style} onSelect={setStyle} />
        <RenderHeroDivider style={style} position="top" />
      </div>

      {/* Light Scouting Canvas Children */}
      {children}

      {/* Bottom Divider to Footer */}
      <RenderHeroDivider style={style} position="bottom" />
    </>
  );
}
