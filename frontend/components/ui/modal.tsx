"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

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
      {/* Crisp Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Elevated Modal Dialog Surface */}
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-xl transition-all animate-in fade-in zoom-in-95",
          className
        )}
      >
        {/* Header & Close Button */}
        <div className="flex items-start justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div className="space-y-0.5">
            <h2 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
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
            className="h-7 w-7 rounded-md border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
}
