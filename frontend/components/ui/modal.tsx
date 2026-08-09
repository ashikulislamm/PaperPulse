"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Translucent Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Glassmorphic Modal Dialog Surface */}
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-2xl border border-slate-200/90 glass-panel bg-white/95 p-6 shadow-2xl transition-all animate-in fade-in zoom-in-95",
          className
        )}
      >
        {/* Header & Close Button */}
        <div className="flex items-start justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-[var(--text-secondary)]">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg border border-[var(--border-subtle)] bg-slate-100/70 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer text-sm font-bold shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
}
