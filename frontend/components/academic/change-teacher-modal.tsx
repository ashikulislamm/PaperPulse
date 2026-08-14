"use client";

import * as React from "react";
import { toast } from "sonner";
import { UserCog } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";

export interface ChangeTeacherTarget {
  id: string;
  classSubjectId: string;
  subjectName: string;
  className: string;
  currentTeacherName: string;
}

interface ChangeTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: ChangeTeacherTarget | null;
  teachers: { id: string; name: string }[];
  onSuccess: () => void;
}

export function ChangeTeacherModal({
  isOpen,
  onClose,
  target,
  teachers,
  onSuccess,
}: ChangeTeacherModalProps) {
  const [selectedTeacherId, setSelectedTeacherId] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && target) {
      setSelectedTeacherId("");
    }
  }, [isOpen, target]);

  const handleSubmit = async () => {
    if (!target || !selectedTeacherId) return;
    setIsSubmitting(true);
    try {
      await apiClient.put(`/academic/subjects/${target.classSubjectId}/teacher`, {
        classSubjectId: target.classSubjectId,
        newTeacherId: selectedTeacherId,
      });
      toast.success(`Teacher for "${target.subjectName}" changed successfully.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.title || "Failed to change teacher.";
      if (!err.response || err.response.status >= 500) return;
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Subject Teacher"
      description={
        target
          ? `${target.subjectName} · ${target.className} — currently assigned to ${target.currentTeacherName}`
          : undefined
      }
      className="max-w-lg"
    >
      <div className="space-y-4 pt-2">
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-xs font-medium text-amber-800">
            Reassignment is blocked while this subject has any active (non-archived) assignments. Previous
            teacher history is preserved for existing assignments.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            New Teacher <span className="text-rose-500">*</span>
          </label>
          <select
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-[var(--border-subtle)] bg-white text-xs font-medium text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            <option value="">Select a teacher...</option>
            {teachers
              .filter((t) => !target || t.name !== target.currentTeacherName)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
          </select>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            isLoading={isSubmitting}
            disabled={!selectedTeacherId}
            onClick={handleSubmit}
            className="gap-2"
          >
            <UserCog className="h-3.5 w-3.5" /> Reassign Teacher
          </Button>
        </div>
      </div>
    </Modal>
  );
}