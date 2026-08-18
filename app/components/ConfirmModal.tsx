"use client";

import { useEffect, ReactNode } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isPending?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "ยืนยันการลบ",
  description,
  confirmText = "ลบข้อมูล",
  cancelText = "ยกเลิก",
  variant = "danger",
  isPending = false,
}: ConfirmModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isPending) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPending, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={() => !isPending && onClose()}
        className="fixed inset-0 bg-[#0B1F40]/50 backdrop-blur-[2px] transition-opacity animate-fade-in"
      />

      {/* Compact Modal Card */}
      <div
        className="relative w-full max-w-[360px] bg-white rounded-2xl shadow-2xl border border-[rgba(0,77,152,0.15)] overflow-hidden z-10 animate-scale-in"
        style={{ transformOrigin: "center center" }}
      >
        <div className="p-5 space-y-3.5">
          {/* Header Row: Icon + Title */}
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                variant === "danger"
                  ? "bg-red-50 text-red-600 border border-red-200/80"
                  : variant === "warning"
                  ? "bg-amber-50 text-amber-600 border border-amber-200/80"
                  : "bg-blue-50 text-[#004D98] border border-blue-200/80"
              }`}
            >
              {variant === "danger" ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <h3 className="text-sm font-display font-bold text-[#0B1F40]">
              {title}
            </h3>
          </div>

          {/* Description Body */}
          <div className="text-xs text-[#526488] leading-relaxed pl-0.5">
            {description}
          </div>

          {/* Compact Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
            <button
              type="button"
              disabled={isPending}
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#354875] bg-gray-100 hover:bg-gray-200 hover:text-[#0B1F40] transition-colors cursor-pointer disabled:opacity-50"
            >
              {cancelText}
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={onConfirm}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                variant === "danger"
                  ? "bg-[#A2001D] hover:bg-[#850017] shadow-red-500/15"
                  : variant === "warning"
                  ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/15"
                  : "bg-[#004D98] hover:bg-[#003A73] shadow-blue-500/15"
              }`}
            >
              {isPending ? (
                <>
                  <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>กำลังลบ...</span>
                </>
              ) : (
                <span>{confirmText}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
