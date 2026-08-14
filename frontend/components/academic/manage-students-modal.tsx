"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Users, UserPlus, UserMinus, Search, Check, X, ChevronDown } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api/client";

export interface ClassEnrollmentStudent {
  enrollmentId?: string;
  studentId: string;
  studentName: string;
  email: string;
  rollNumber?: string;
  isActive?: boolean;
}

interface ManageStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className: string;
  classCode: string;
  maxCapacity: number;
  enrolledCount: number;
  onSuccess: () => void;
}

export function ManageStudentsModal({
  isOpen,
  onClose,
  classId,
  className,
  classCode,
  maxCapacity,
  enrolledCount,
  onSuccess,
}: ManageStudentsModalProps) {
  const queryClient = useQueryClient();
  const [showAddPanel, setShowAddPanel] = React.useState(false);
  const [addSearchQuery, setAddSearchQuery] = React.useState("");
  const [selectedToAdd, setSelectedToAdd] = React.useState<Set<string>>(new Set());
  const [isEnrolling, setIsEnrolling] = React.useState(false);
  const [removingId, setRemovingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setShowAddPanel(false);
      setAddSearchQuery("");
      setSelectedToAdd(new Set());
    }
  }, [isOpen]);

  const { data: enrolled = [], isLoading: isLoadingEnrolled } = useQuery<ClassEnrollmentStudent[]>({
    queryKey: ["class-students", classId],
    queryFn: async () => {
      const response = await apiClient.get(`/academic/classes/${classId}/students`);
      return response.data?.data || [];
    },
    enabled: isOpen,
  });

  const { data: available = [], isLoading: isLoadingAvailable } = useQuery<ClassEnrollmentStudent[]>({
    queryKey: ["available-students", classId],
    queryFn: async () => {
      const response = await apiClient.get(`/academic/classes/${classId}/available-students`);
      return response.data?.data || [];
    },
    enabled: isOpen && showAddPanel,
  });

  const activeEnrolled = enrolled.filter((s) => s.isActive !== false);
  const seatsTaken = activeEnrolled.length || enrolledCount;
  const seatsLeft = Math.max(0, maxCapacity - seatsTaken);
  const isFull = seatsTaken >= maxCapacity;

  const filteredAvailable = available.filter(
    (s) =>
      s.studentName.toLowerCase().includes(addSearchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(addSearchQuery.toLowerCase())
  );

  const toggleSelectToAdd = (studentId: string) => {
    setSelectedToAdd((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const handleEnrollSelected = async () => {
    if (selectedToAdd.size === 0) return;
    setIsEnrolling(true);
    try {
      const response = await apiClient.post(`/academic/classes/${classId}/students`, {
        classId,
        studentIds: Array.from(selectedToAdd),
      });
      const count = response.data?.data;
      toast.success(`${count ?? selectedToAdd.size} student(s) added to ${className}.`);
      setSelectedToAdd(new Set());
      setAddSearchQuery("");
      setShowAddPanel(false);
      await queryClient.invalidateQueries({ queryKey: ["class-students", classId] });
      await queryClient.invalidateQueries({ queryKey: ["available-students", classId] });
      onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.title || "Failed to enroll students.";
      if (!err.response || err.response.status >= 500) return;
      toast.error(msg);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleRemoveSingle = async (studentId: string, studentName: string) => {
    setRemovingId(studentId);
    try {
      await apiClient.delete(`/academic/classes/${classId}/students`, {
        data: { classId, studentIds: [studentId] },
      });
      toast.success(`${studentName} removed from ${className}.`);
      await queryClient.invalidateQueries({ queryKey: ["class-students", classId] });
      await queryClient.invalidateQueries({ queryKey: ["available-students", classId] });
      onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to remove student.";
      if (!err.response || err.response.status >= 500) return;
      toast.error(msg);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Students — ${className}`}
      className="max-w-2xl"
    >
      <div className="space-y-4 pt-2">
        {/* Seat capacity summary */}
        <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${isFull ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"}`}>
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {classCode} · Seats
              </span>
              <div className="text-sm font-extrabold text-slate-900">
                {seatsTaken} / {maxCapacity}
                {isFull && <span className="ml-2 text-rose-600 text-xs">Class is full</span>}
              </div>
            </div>
          </div>
          <Badge variant={isFull ? "danger" : "primary"}>
            {seatsLeft > 0 ? `${seatsLeft} seat(s) available` : "Full"}
          </Badge>
        </div>

        {/* Enrolled Students List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Enrolled Students ({activeEnrolled.length})
            </h3>
            {!isFull && (
              <Button
                variant="primary"
                size="sm"
                className="gap-1.5 text-[11px] font-bold"
                onClick={() => setShowAddPanel(!showAddPanel)}
              >
                <UserPlus className="h-3.5 w-3.5" />
                Add Student
                <ChevronDown className={`h-3 w-3 transition-transform ${showAddPanel ? "rotate-180" : ""}`} />
              </Button>
            )}
          </div>

          {/* Add Student Panel (collapsible) */}
          {showAddPanel && (
            <div className="mb-3 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 overflow-hidden">
              <div className="p-3 border-b border-indigo-100 bg-indigo-50/50">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search students to add..."
                    value={addSearchQuery}
                    onChange={(e) => setAddSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-indigo-200 bg-white text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                    autoFocus
                  />
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto">
                {isLoadingAvailable ? (
                  <div className="p-6 text-center text-xs font-semibold text-slate-400">
                    Loading students...
                  </div>
                ) : filteredAvailable.length === 0 ? (
                  <div className="p-6 text-center space-y-1">
                    <UserPlus className="h-6 w-6 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-600">
                      {available.length === 0 ? "No students available" : "No matching students"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {available.length === 0
                        ? "All students are already enrolled or none exist yet."
                        : "Try a different search term."}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-indigo-100">
                    {filteredAvailable.map((s) => (
                      <label
                        key={s.studentId}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-indigo-50/50 transition-colors cursor-pointer"
                      >
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                            selectedToAdd.has(s.studentId)
                              ? "bg-indigo-600 border-indigo-600"
                              : "border-slate-300 bg-white"
                          }`}
                          onClick={() => toggleSelectToAdd(s.studentId)}
                        >
                          {selectedToAdd.has(s.studentId) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1" onClick={() => toggleSelectToAdd(s.studentId)}>
                          <div className="text-xs font-extrabold text-slate-900 truncate">{s.studentName}</div>
                          <div className="text-[11px] text-slate-500 truncate">{s.email}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {filteredAvailable.length > 0 && (
                <div className="flex items-center justify-between p-3 border-t border-indigo-100 bg-indigo-50/50">
                  <span className="text-[11px] font-bold text-slate-500">
                    {selectedToAdd.size} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[11px]"
                      onClick={() => {
                        setShowAddPanel(false);
                        setSelectedToAdd(new Set());
                        setAddSearchQuery("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="text-[11px] font-bold gap-1.5"
                      isLoading={isEnrolling}
                      disabled={selectedToAdd.size === 0}
                      onClick={handleEnrollSelected}
                    >
                      <Check className="h-3.5 w-3.5" />
                      Add {selectedToAdd.size > 0 ? `(${selectedToAdd.size})` : ""}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Enrolled students list */}
          <div className="max-h-64 overflow-y-auto rounded-xl border border-[var(--border-subtle)]">
            {isLoadingEnrolled ? (
              <div className="p-8 text-center text-xs font-semibold text-slate-400">
                Loading enrolled students...
              </div>
            ) : activeEnrolled.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Users className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No Students Enrolled</p>
                <p className="text-xs text-slate-400">
                  Click &quot;Add Student&quot; above to enroll students into this class.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)]">
                {activeEnrolled.map((s) => (
                  <div
                    key={s.studentId}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-extrabold text-slate-900 truncate">{s.studentName}</div>
                      <div className="text-[11px] text-slate-500 truncate">{s.email}</div>
                    </div>
                    {s.rollNumber && (
                      <Badge variant="default" className="text-[10px] font-mono shrink-0">
                        {s.rollNumber}
                      </Badge>
                    )}
                    <button
                      onClick={() => handleRemoveSingle(s.studentId, s.studentName)}
                      disabled={removingId === s.studentId}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 disabled:opacity-50"
                      title={`Remove ${s.studentName}`}
                    >
                      {removingId === s.studentId ? (
                        <div className="h-3.5 w-3.5 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-[var(--border-subtle)]">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
