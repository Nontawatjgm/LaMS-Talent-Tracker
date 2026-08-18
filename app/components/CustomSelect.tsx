"use client";

import { useState, useRef, useEffect, ReactNode } from "react";

export interface CustomSelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

export interface CustomSelectGroup {
  label: string;
  options: CustomSelectOption[];
}

interface CustomSelectProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options?: CustomSelectOption[];
  groups?: CustomSelectGroup[];
  placeholder?: string;
  size?: "sm" | "md";
  className?: string;
  minMenuWidth?: string;
  prefix?: ReactNode;
  name?: string;
  required?: boolean;
  disabled?: boolean;
}

export function CustomSelect({
  value: controlledValue,
  defaultValue = "",
  onChange,
  options = [],
  groups = [],
  placeholder = "เลือก...",
  size = "sm",
  className = "",
  minMenuWidth = "min-w-[190px]",
  prefix,
  name,
  required = false,
  disabled = false,
}: CustomSelectProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : uncontrolledValue;

  // Flatten all options to find current selected label
  const allOptions: CustomSelectOption[] = [
    ...options,
    ...groups.flatMap((g) => g.options),
  ];

  const selectedOption = allOptions.find((opt) => opt.value === currentValue);

  const handleSelect = (val: string) => {
    if (!isControlled) {
      setUncontrolledValue(val);
    }
    onChange?.(val);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const sizeClasses =
    size === "sm"
      ? "py-2 px-3.5 text-xs font-semibold rounded-xl"
      : "py-2.5 px-4 text-sm font-medium rounded-xl";

  return (
    <div ref={dropdownRef} className={`relative ${className.includes("w-full") ? "w-full" : "inline-block"} ${className}`}>
      {/* Hidden input for Native Form / Server Action submission */}
      {name && (
        <input
          type="text"
          name={name}
          value={currentValue}
          required={required}
          readOnly
          tabIndex={-1}
          className="sr-only"
        />
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2.5 bg-white border border-[rgba(0,77,152,0.15)] shadow-2xs hover:border-[rgba(0,77,152,0.35)] hover:bg-[#F8FAFD] focus:outline-none focus:border-[#004D98] focus:ring-2 focus:ring-[#004D98]/10 transition-all cursor-pointer text-left ${sizeClasses} ${
          isOpen ? "border-[#004D98] ring-2 ring-[#004D98]/10 bg-[#F8FAFD]" : ""
        } ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`}
      >
        <span className="truncate flex items-center gap-1.5">
          {prefix}
          {selectedOption ? (
            <span className="text-[#0B1F40] font-medium">{selectedOption.label}</span>
          ) : (
            <span className="text-gray-400 font-normal">{placeholder}</span>
          )}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-[#354875] shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#004D98]" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Floating Menu - STRICTLY OPENS DOWNWARDS (top-full mt-1.5) */}
      {isOpen && (
        <div
          className={`absolute top-full left-0 mt-1.5 w-full ${minMenuWidth} bg-white border border-[rgba(0,77,152,0.15)] rounded-xl shadow-2xl py-1.5 z-50 animate-scale-in max-h-64 overflow-y-auto`}
          style={{ transformOrigin: "top center" }}
        >
          {/* Render flat options */}
          {options.length > 0 &&
            options.map((opt) => {
              const isSelected = opt.value === currentValue;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-blue-50/90 text-[#004D98] font-bold"
                      : "text-[#0B1F40] hover:bg-[#F8FAFD] hover:text-[#004D98] font-medium"
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    {opt.icon}
                    <span>{opt.label}</span>
                  </span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#004D98] shrink-0 ml-2" />
                  )}
                </button>
              );
            })}

          {/* Render grouped options */}
          {groups.length > 0 &&
            groups.map((group, gIdx) => (
              <div key={group.label || gIdx} className="border-b border-gray-100 last:border-0 pb-1 mb-1 last:pb-0 last:mb-0">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#7A8FAD] bg-gray-50/60">
                  {group.label}
                </div>
                {group.options.map((opt) => {
                  const isSelected = opt.value === currentValue;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-blue-50/90 text-[#004D98] font-bold"
                          : "text-[#0B1F40] hover:bg-[#F8FAFD] hover:text-[#004D98] font-medium"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate pl-1">
                        {opt.icon}
                        <span>{opt.label}</span>
                      </span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#004D98] shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
