"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";

interface DatePickerInputProps {
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

// Format date to DD/MM/YYYY
function formatToDMY(val?: string | null): string {
  if (!val) return "";
  const str = val.trim();
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) return str;
  const ymd = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (ymd) {
    const [, y, m, d] = ymd;
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }
  return str;
}

// Convert DD/MM/YYYY to YYYY-MM-DD for native date picker helper
function formatToYMD(val?: string | null): string {
  if (!val) return "";
  const dmy = val.trim().match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return "";
}

export function DatePickerInput({
  name,
  defaultValue = "",
  required = false,
  placeholder = "13/07/2007",
  className = "",
}: DatePickerInputProps) {
  const [textValue, setTextValue] = useState(formatToDMY(defaultValue));
  const hiddenDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (defaultValue) {
      setTextValue(formatToDMY(defaultValue));
    }
  }, [defaultValue]);

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTextValue(e.target.value);
  };

  const handlePickerChange = (e: ChangeEvent<HTMLInputElement>) => {
    const ymd = e.target.value;
    if (ymd) {
      const [y, m, d] = ymd.split("-");
      setTextValue(`${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`);
    }
  };

  const openCalendar = () => {
    if (hiddenDateRef.current) {
      try {
        if ("showPicker" in HTMLInputElement.prototype) {
          hiddenDateRef.current.showPicker();
        } else {
          hiddenDateRef.current.focus();
        }
      } catch {
        hiddenDateRef.current.focus();
      }
    }
  };

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      {/* Main visible input: Strictly DD/MM/YYYY */}
      <input
        type="text"
        name={name}
        value={textValue}
        onChange={handleTextChange}
        required={required}
        placeholder={placeholder}
        pattern="^(\d{1,2}\/\d{1,2}\/\d{4})?$"
        title="รูปแบบ: วัน/เดือน/ปี (เช่น 13/07/2007)"
        className="w-full bg-white text-[#0B1F40] pl-4 pr-11 py-2.5 rounded-xl border border-[rgba(0,77,152,0.15)] focus:outline-none focus:border-[#004D98] focus:ring-2 focus:ring-[#004D98]/10 text-sm font-medium placeholder:text-gray-400 shadow-2xs hover:border-[rgba(0,77,152,0.35)] transition-all"
      />

      {/* Hidden date input to trigger calendar picker */}
      <input
        ref={hiddenDateRef}
        type="date"
        tabIndex={-1}
        value={formatToYMD(textValue)}
        onChange={handlePickerChange}
        className="sr-only"
        aria-hidden="true"
      />

      {/* Calendar Icon Button */}
      <button
        type="button"
        onClick={openCalendar}
        title="เปิดปฏิทินเลือกวันที่ (DD/MM/YYYY)"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#354875] hover:text-[#004D98] hover:bg-blue-50/80 transition-colors cursor-pointer"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.75}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>
    </div>
  );
}
