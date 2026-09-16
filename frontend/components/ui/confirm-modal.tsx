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
    iconText: "text-rose-600 dark:text-rose-400",
    buttonVariant: "danger" as const,
  },
  warning: {
    icon: AlertTriangle,
    iconText: "text-amber-600 dark:text-amber-400",
    buttonVariant: "primary" as const,
  },
  info: {
    icon: Info,
    iconText: "text-indigo-600 dark:text-indigo-400",
    buttonVariant: "primary" as const,
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
      <div className="space-y-4">
        {/* Icon & Message */}
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] shrink-0 ${config.iconText}`}>
            <IconComponent className="h-5 w-5" />
          </div>
          <div className="space-y-1 pt-0.5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
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
