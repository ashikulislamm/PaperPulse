"use client";

import * as React from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api/client";
import { ShieldCheck } from "lucide-react";

const AVAILABLE_ROLES = ["Admin", "Teacher", "Student"] as const;

interface RoleAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  userName: string;
  currentRoles: string[];
}

export function RoleAssignmentModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
  userName,
  currentRoles,
}: RoleAssignmentModalProps) {
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>(currentRoles);
  const [isLoading, setIsLoading] = React.useState(false);

  // Sync roles when modal opens with new user
  React.useEffect(() => {
    if (isOpen) {
      setSelectedRoles(currentRoles);
    }
  }, [isOpen, currentRoles]);

  const handleRoleToggle = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = async () => {
    if (selectedRoles.length === 0) {
      toast.error("At least one role must be selected.");
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post(`/users/${userId}/roles`, selectedRoles);
      toast.success(`Roles updated for ${userName}.`);
      onSuccess();
      onClose();
    } catch {
      // Toast handles global error display
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges =
    JSON.stringify(selectedRoles.sort()) !== JSON.stringify([...currentRoles].sort());

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage User Roles"
      description={`Update role assignments for ${userName}`}
    >
      <div className="space-y-4 pt-2">
        {/* Current Roles Display */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Current Roles
          </label>
          <div className="flex flex-wrap gap-1.5">
            {currentRoles.length > 0 ? (
              currentRoles.map((role) => (
                <Badge
                  key={role}
                  variant={
                    role === "Admin"
                      ? "primary"
                      : role === "Teacher"
                      ? "published"
                      : "default"
                  }
                >
                  {role}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-[var(--text-muted)]">No roles assigned</span>
            )}
          </div>
        </div>

        {/* Role Selection Checkboxes */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Assign New Roles
          </label>
          <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-slate-50/50 space-y-3">
            {AVAILABLE_ROLES.map((role) => (
              <div
                key={role}
                className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200/80 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    label={role}
                    checked={selectedRoles.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                  />
                  <span className="text-xs text-[var(--text-muted)]">
                    {role === "Admin" && "Full system access"}
                    {role === "Teacher" && "Assignment & grading management"}
                    {role === "Student" && "Submit work & view grades"}
                  </span>
                </div>
                {selectedRoles.includes(role) && (
                  <Badge variant="success" className="text-[10px]">
                    Selected
                  </Badge>
                )}
              </div>
            ))}
          </div>
          {selectedRoles.length === 0 && (
            <p className="text-xs font-medium text-[var(--color-danger)]">
              At least one role must be selected.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            isLoading={isLoading}
            onClick={handleSubmit}
            disabled={!hasChanges || selectedRoles.length === 0}
          >
            <ShieldCheck className="h-4 w-4 mr-1.5" />
            Save Role Assignments
          </Button>
        </div>
      </div>
    </Modal>
  );
}
