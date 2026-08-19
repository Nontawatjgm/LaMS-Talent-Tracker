"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastItem, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

function ToastUrlListener() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  useEffect(() => {
    const toastType = searchParams.get("toast");
    if (!toastType) return;

    const name = searchParams.get("name");
    const season = searchParams.get("season");

    if (toastType === "created") {
      showToast({
        type: "success",
        title: "เพิ่มนักเตะใหม่สำเร็จ 🎉",
        message: name ? `เพิ่มข้อมูลของ "${name}" เข้าระบบเรียบร้อยแล้ว` : "เพิ่มข้อมูลนักเตะเรียบร้อยแล้ว",
      });
    } else if (toastType === "updated") {
      showToast({
        type: "success",
        title: "บันทึกการแก้ไขสำเร็จ ✨",
        message: name ? `อัปเดตข้อมูลของ "${name}" เรียบร้อยแล้ว` : "อัปเดตข้อมูลนักเตะเรียบร้อยแล้ว",
      });
    } else if (toastType === "stat_created") {
      showToast({
        type: "success",
        title: "บันทึกสถิติสำเร็จ ⚽",
        message: season ? `เพิ่มสถิติพรีซีซั่นฤดูกาล ${season} เรียบร้อยแล้ว` : "เพิ่มสถิติเรียบร้อยแล้ว",
      });
    } else if (toastType === "stat_updated") {
      showToast({
        type: "success",
        title: "บันทึกการแก้ไขสถิติสำเร็จ ✨",
        message: season ? `อัปเดตสถิติพรีซีซั่นฤดูกาล ${season} เรียบร้อยแล้ว` : "อัปเดตสถิติเรียบร้อยแล้ว",
      });
    }

    // Clean URL without reloading page
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete("toast");
    newUrl.searchParams.delete("name");
    newUrl.searchParams.delete("season");
    window.history.replaceState({}, "", newUrl.toString());
  }, [searchParams, showToast]);

  return null;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 3500 }: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).slice(2, 9);
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => {
    showToast({ type: "success", title, message });
  }, [showToast]);

  const error = useCallback((title: string, message?: string) => {
    showToast({ type: "error", title, message });
  }, [showToast]);

  const info = useCallback((title: string, message?: string) => {
    showToast({ type: "info", title, message });
  }, [showToast]);

  const warning = useCallback((title: string, message?: string) => {
    showToast({ type: "warning", title, message });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      <Suspense fallback={null}>
        <ToastUrlListener />
      </Suspense>

      {children}

      {/* Floating Toasts Container */}
      <div className="fixed top-4 right-4 z-[110] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-[rgba(0,77,152,0.15)] p-4 flex items-start gap-3 animate-scale-in transition-all"
            style={{ transformOrigin: "top right" }}
          >
            {/* Icon */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                toast.type === "success"
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : toast.type === "error"
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : toast.type === "warning"
                  ? "bg-amber-50 text-amber-600 border border-amber-200"
                  : "bg-blue-50 text-[#004D98] border border-blue-200"
              }`}
            >
              {toast.type === "success" && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {toast.type === "error" && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {toast.type === "warning" && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              {toast.type === "info" && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-[#0B1F40] leading-snug">{toast.title}</h4>
              {toast.message && (
                <p className="text-[11px] text-[#526488] mt-0.5 leading-relaxed">{toast.message}</p>
              )}
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-[#0B1F40] p-1 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Return dummy fallback if used outside Provider
    return {
      showToast: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
      warning: () => {},
    };
  }
  return context;
}
