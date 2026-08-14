"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Users, UserPlus, UserMinus, Search, Check } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [activeTab, setActiveTab] = React.useState<"enrolled" | "available">("enrolled");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedStudentIds, setSelectedStudentIds] = React.useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab("enrolled");
      setSearchQuery("");
      setSelectedStudentIds(new Set());
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
    enabled: isOpen,
  });

  const activeEnrolled = enrolled.filter((s) => s.isActive !== false);
  const seatsTaken = activeEnrolled.length || enrolledCount;
  const seatsLeft = Math.max(0, maxCapacity - seatsTaken);
  const isFull = seatsTaken >= maxCapacity;

  const filteredEnrolled = activeEnrolled.filter(
    (s) =>
      s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAvailable = available.filter(
    (s) =>
      s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const toggleAllVisible = (list: ClassEnrollmentStudent[]) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      const visibleIds = list.map((s) => s.studentId);
      const allSelected = visibleIds.every((id) => next.has(id));
      visibleIds.forEach((id) => {
        if (allSelected) {
          next.delete(id);
        } else {
          next.add(id);
        }
      });
      return next;
    });
  };

  const handleEnroll = async () => {
    if (selectedStudentIds.size === 0) return;
    setIsSubmitting(true);
    try {
      const response = await apiClient.post(`/academic/classes/${classId}/students`, {
        classId,
        studentIds: Array.from(selectedStudentIds),
      });
      const count = response.data?.data;
      toast.success(`${count ?? selectedStudentIds.size} student(s) enrolled into ${className}.`);
      setSelectedStudentIds(new Set());
      await queryClient.invalidateQueries({ queryKey: ["class-students", classId] });
      await queryClient.invalidateQueries({ queryKey: ["available-students", classId] });
      onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.title || "Failed to enroll students.";
      if (!err.response || err.response.status >= 500) return;
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnenroll = async () => {
    if (selectedStudentIds.size === 0) return;
    setIsSubmitting(true);
    try {
      const response = await apiClient.delete(`/academic/classes/${classId}/students`, {
        data: { classId, studentIds: Array.from(selectedStudentIds) },
      });
      const count = response.data?.data;
      toast.success(`${count ?? selectedStudentIds.size} student(s) removed from ${className}.`);
      setSelectedStudentIds(new Set());
      await queryClient.invalidateQueries({ queryKey: ["class-students", classId] });
      await queryClient.invalidateQueries({ queryKey: ["available-students", classId] });
      onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.title || "Failed to unenroll students.";
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

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 border border-slate-200/80">
            <button
              onClick={() => setActiveTab("enrolled")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                activeTab === "enrolled"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Enrolled ({seatsTaken})
            </button>
            <button
              onClick={() => setActiveTab("available")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                activeTab === "available"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Available ({available.length})
            </button>
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab} students...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-[var(--border-subtle)] bg-slate-50/50 text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Student list */}
        <div className="max-h-72 overflow-y-auto rounded-xl border border-[var(--border-subtle)]">
          {activeTab === "enrolled" ? (
            isLoadingEnrolled ? (
              <div className="p-8 text-center text-xs font-semibold text-slate-400">
                Loading enrolled students...
              </div>
            ) : filteredEnrolled.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Users className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No Enrolled Students</p>
                <p className="text-xs text-slate-400">Switch to the "Available" tab to enroll students.</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-subtle)] bg-slate-50/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {filteredEnrolled.length} enrolled student(s)
                  </span>
                  <button
                    onClick={() => toggleAllVisible(filteredEnrolled)}
                    className="text-[11px] font-bold text-indigo-600 hover:underline"
                  >
                    {filteredEnrolled.every((s) => selectedStudentIds.has(s.studentId)) ? "Deselect all" : "Select all"}
                  </button>
                </div>
                <div className="divide-y divide-[var(--border-subtle)]">
                  {filteredEnrolled.map((s) => (
                    <label
                      key={s.studentId}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50/60 transition-colors cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedStudentIds.has(s.studentId)}
                        onChange={() => toggleStudent(s.studentId)}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-extrabold text-slate-900 truncate">{s.studentName}</div>
                        <div className="text-[11px] text-slate-500 truncate">{s.email}</div>
                      </div>
                      {s.rollNumber && (
                        <Badge variant="default" className="text-[10px] font-mono">
                          {s.rollNumber}
                        </Badge>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )
          ) : isLoadingAvailable ? (
            <div className="p-8 text-center text-xs font-semibold text-slate-400">
              Loading available students...
            </div>
          ) : filteredAvailable.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <UserPlus className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No Available Students</p>
              <p className="text-xs text-slate-400">
                All students with the Student role are enrolled, or none exist yet.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-subtle)] bg-slate-50/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {filteredAvailable.length} available student(s)
                </span>
                <button
                  onClick={() => toggleAllVisible(filteredAvailable)}
                  className="text-[11px] font-bold text-indigo-600 hover:underline"
                >
                  {filteredAvailable.every((s) => selectedStudentIds.has(s.studentId)) ? "Deselect all" : "Select all"}
                </button>
              </div>
              <div className="divide-y divide-[var(--border-subtle)]">
                {filteredAvailable.map((s) => (
                  <label
                    key={s.studentId}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50/60 transition-colors cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedStudentIds.has(s.studentId)}
                      onChange={() => toggleStudent(s.studentId)}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-extrabold text-slate-900 truncate">{s.studentName}</div>
                      <div className="text-[11px] text-slate-500 truncate">{s.email}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {activeTab === "available" && isFull && (
          <p className="text-[11px] text-rose-500 font-medium">
            This class has reached its maximum capacity. Remove students to free up seats.
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[var(--border-subtle)]">
          <span className="text-xs font-semibold text-slate-500">
            {selectedStudentIds.size} selected
          </span>
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2">
            {activeTab === "enrolled" ? (
              <Button
                variant="outline"
                isLoading={isSubmitting}
                disabled={selectedStudentIds.size === 0}
                onClick={handleUnenroll}
                className="text-[11px] font-bold text-rose-600 hover:bg-rose-50 border-rose-200 gap-2"
              >
                <UserMinus className="h-3.5 w-3.5" /> Remove Selected
              </Button>
            ) : (
              <Button
                variant="primary"
                isLoading={isSubmitting}
                disabled={selectedStudentIds.size === 0 || isFull}
                onClick={handleEnroll}
                className="text-[11px] font-bold gap-2"
              >
                <Check className="h-3.5 w-3.5" /> Enroll Selected
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}