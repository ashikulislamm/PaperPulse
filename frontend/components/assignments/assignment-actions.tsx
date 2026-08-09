"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Lock, ArrowLeftRight } from "lucide-react";

export type ActionType = "publish" | "unpublish" | "close";

interface AssignmentActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  actionType: ActionType;
  assignmentTitle: string;
  isLoading?: boolean;
}

export function AssignmentActionDialog({
  isOpen,
  onClose,
  onConfirm,
  actionType,
  assignmentTitle,
  isLoading = false,
}: AssignmentActionDialogProps) {
  const actionConfigs = {
    publish: {
      title: "Publish Assignment",
      description: "This will make the assignment visible to all enrolled students and enable submissions.",
      confirmText: "Publish Now",
      variant: "primary" as const,
      icon: <CheckCircle2 className="h-6 w-6 text-indigo-600" />,
    },
    unpublish: {
      title: "Unpublish Assignment",
      description: "Reverts the assignment back to Draft mode. Students will temporarily not see this assignment.",
      confirmText: "Unpublish to Draft",
      variant: "outline" as const,
      icon: <ArrowLeftRight className="h-6 w-6 text-amber-600" />,
    },
    close: {
      title: "Close Assignment Submissions",
      description: "Locks the assignment to prevent further student submissions.",
      confirmText: "Close Submissions",
      variant: "danger" as const,
      icon: <Lock className="h-6 w-6 text-rose-600" />,
    },
  };

  const config = actionConfigs[actionType];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={config.title}>
      <div className="space-y-4 pt-2">
        <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="p-2 rounded-xl bg-white shadow-xs shrink-0">{config.icon}</div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">{assignmentTitle}</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {config.description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={config.variant}
            isLoading={isLoading}
            onClick={onConfirm}
          >
            {config.confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
