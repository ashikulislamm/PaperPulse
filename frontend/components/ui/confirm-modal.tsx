"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, Info } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

const variantConfig = {
  danger: {
    icon: Trash2,
    iconBg: "bg-rose-100",
    iconText: "text-rose-600",
    buttonVariant: "danger" as const,
    accentRing: "ring-rose-500/10",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-100",
    iconText: "text-amber-600",
    buttonVariant: "primary" as const,
    accentRing: "ring-amber-500/10",
  },
  info: {
    icon: Info,
    iconBg: "bg-sky-100",
    iconText: "text-sky-600",
    buttonVariant: "primary" as const,
    accentRing: "ring-sky-500/10",
  },
};

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="space-y-5">
        {/* Icon & Message */}
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-2xl shrink-0 ring-1 ${config.iconBg} ${config.iconText} ${config.accentRing}`}
          >
            <IconComponent className="h-6 w-6" />
          </div>
          <div className="space-y-1.5 pt-0.5">
            <h3 className="text-sm font-bold text-slate-900 leading-snug">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-slate-500 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={config.buttonVariant}
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
