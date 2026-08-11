"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  GraduationCap,
  BookOpen,
  Plus,
  Search,
  Users,
  Award,
  Layers,
  Sparkles,
  Building2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { PageBanner } from "@/components/common/page-banner";
import { apiClient } from "@/lib/api/client";
import { CreateClassModal } from "@/components/academic/create-class-modal";
import { CreateSubjectModal } from "@/components/academic/create-subject-modal";

interface ClassItem {
  id: string;
  name: string;
  code: string;
  maxCapacity: number;
  assignedSubjectsCount: number;
  enrolledStudentsCount: number;
  createdAt: string;
}

interface SubjectItem {
  id: string;
  classId: string;
  className: string;
  name: string;
  code: string;
  description?: string;
  passMarks: number;
  assignedTeacherName: string;
  createdAt: string;
}

interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
}

export default function AcademicManagementPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<"classes" | "subjects">("classes");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAddClassOpen, setIsAddClassOpen] = React.useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = React.useState(false);
  const [confirmState, setConfirmState] = React.useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant: "danger" | "warning";
  }>({ isOpen: false, title: "", description: "", onConfirm: () => {}, variant: "danger" });

  // Fetch Classes
  const { data: classesData = [], isLoading: isLoadingClasses } = useQuery<ClassItem[]>({
    queryKey: ["academic-classes"],
    queryFn: async () => {
      const response = await apiClient.get("/academic/classes");
      return response.data?.data || [];
    },
  });

  // Fetch Subjects
  const { data: subjectsData = [], isLoading: isLoadingSubjects } = useQuery<SubjectItem[]>({
    queryKey: ["academic-subjects"],
    queryFn: async () => {
      const response = await apiClient.get("/academic/subjects");
      return response.data?.data || [];
    },
  });

  // Fetch Teachers
  const { data: teachersData = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["teachers-list"],
    queryFn: async () => {
      const response = await apiClient.get("/users?pageSize=100");
      const users: UserItem[] = response.data?.data?.items || [];
      return users
        .filter((u) => u.roles?.includes("Teacher"))
        .map((u) => ({ id: u.id, name: `${u.firstName} ${u.lastName}` }));
    },
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["academic-classes"] });
    queryClient.invalidateQueries({ queryKey: ["academic-subjects"] });
  };

  // Delete Class Mutation
  const deleteClassMutation = useMutation({
    mutationFn: async (classId: string) => {
      await apiClient.delete(`/academic/classes/${classId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-classes"] });
      queryClient.invalidateQueries({ queryKey: ["academic-subjects"] });
      toast.success("Class deleted successfully.");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const msg = error?.response?.data?.message || "Failed to delete class. Please try again.";
      toast.error(msg);
    },
  });

  // Delete Subject Mutation
  const deleteSubjectMutation = useMutation({
    mutationFn: async (subjectId: string) => {
      await apiClient.delete(`/academic/subjects/${subjectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-subjects"] });
      toast.success("Subject deleted successfully.");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const msg = error?.response?.data?.message || "Failed to delete subject. Please try again.";
      toast.error(msg);
    },
  });

  const handleDeleteClass = (cls: ClassItem) => {
    const hasSubjects = cls.assignedSubjectsCount > 0;
    setConfirmState({
      isOpen: true,
      title: hasSubjects ? `Delete "${cls.name}"?` : `Delete "${cls.name}"?`,
      description: hasSubjects
        ? `"${cls.name}" has ${cls.assignedSubjectsCount} subject(s) assigned. Deleting it will also remove all assigned subjects. This action cannot be undone.`
        : `Are you sure you want to delete this class? This action cannot be undone.`,
      variant: hasSubjects ? "warning" : "danger",
      onConfirm: () => {
        setConfirmState((s) => ({ ...s, isOpen: false }));
        deleteClassMutation.mutate(cls.id);
      },
    });
  };

  const handleDeleteSubject = (sub: SubjectItem) => {
    setConfirmState({
      isOpen: true,
      title: `Delete "${sub.name}"?`,
      description: `Are you sure you want to delete "${sub.name}" (${sub.code})? This action cannot be undone.`,
      variant: "danger",
      onConfirm: () => {
        setConfirmState((s) => ({ ...s, isOpen: false }));
        deleteSubjectMutation.mutate(sub.id);
      },
    });
  };

  const filteredClasses = classesData.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubjects = subjectsData.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <PageBanner
        badge="Academics"
        heading="Classes & Subjects Management"
        description="Create independent academic classes and configure subject curricula assigned to each class."
        icon={<Building2 className="h-5 w-5" />}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setIsAddClassOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold gap-2"
            >
              <Plus className="h-4 w-4" /> Add Independent Class
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsAddSubjectOpen(true)}
              className="shadow-lg shadow-indigo-500/25 text-xs font-bold gap-2"
            >
              <Plus className="h-4 w-4" /> Add Subject to Class
            </Button>
          </>
        }
      />

      {/* Analytics Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6 glass-card flex items-center gap-4 border-indigo-200/50">
          <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Classes
            </span>
            <div className="text-2xl font-extrabold font-mono text-slate-900">
              {classesData.length}
            </div>
          </div>
        </Card>

        <Card className="p-6 glass-card flex items-center gap-4 border-indigo-200/50">
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Assigned Subjects
            </span>
            <div className="text-2xl font-extrabold font-mono text-slate-900">
              {subjectsData.length}
            </div>
          </div>
        </Card>

        <Card className="p-6 glass-card flex items-center gap-4 border-indigo-200/50">
          <div className="p-3.5 rounded-xl bg-amber-50 text-amber-600">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active Structure
            </span>
            <div className="text-xs font-bold text-slate-900 mt-1">
              Class &rarr; Subject Mapping Active
            </div>
          </div>
        </Card>
      </div>

      {/* Main Studio Tabs & Controls */}
      <Card className="p-6 glass-card space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100/80 border border-slate-200/80 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("classes")}
              className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all ${
                activeTab === "classes"
                  ? "bg-white text-indigo-600 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Independent Classes ({classesData.length})
            </button>
            <button
              onClick={() => setActiveTab("subjects")}
              className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all ${
                activeTab === "subjects"
                  ? "bg-white text-indigo-600 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Class Subjects ({subjectsData.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[var(--border-subtle)] bg-slate-50/50 text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Tab 1: Independent Classes */}
        {activeTab === "classes" && (
          <div>
            {isLoadingClasses ? (
              <div className="p-8 sm:p-12 text-center text-xs font-semibold text-slate-400">
                Loading academic classes...
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="p-8 sm:p-12 text-center space-y-3">
                <GraduationCap className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No Academic Classes Found</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Create an independent class first (e.g. Grade 10 - Section A), then assign subjects to it.
                </p>
                <Button
                  variant="primary"
                  onClick={() => setIsAddClassOpen(true)}
                  className="text-xs font-bold gap-2"
                >
                  <Plus className="h-4 w-4" /> Add First Class
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-white hover:border-indigo-300 hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 font-mono font-bold text-xs shrink-0">
                          {cls.code}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-extrabold text-slate-900 truncate">{cls.name}</h3>
                          <span className="text-[10px] text-slate-500 font-medium">Independent Class</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2 text-slate-600">
                        <BookOpen className="h-4 w-4 text-indigo-500" />
                        <span>
                          <strong className="text-slate-900">{cls.assignedSubjectsCount}</strong> Subjects
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Users className="h-4 w-4 text-emerald-500" />
                        <span>
                          <strong className="text-slate-900">{cls.enrolledStudentsCount}</strong> / {cls.maxCapacity} Seats
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-slate-400">
                        Created {new Date(cls.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsAddSubjectOpen(true)}
                          className="text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 border-indigo-200"
                        >
                          + Add Subject
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClass(cls)}
                          disabled={deleteClassMutation.isPending}
                          className="text-[11px] font-bold text-rose-600 hover:bg-rose-50 border-rose-200 gap-1"
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Class Subjects Catalog */}
        {activeTab === "subjects" && (
          <div>
            {isLoadingSubjects ? (
              <div className="p-8 sm:p-12 text-center text-xs font-semibold text-slate-400">
                Loading class subjects...
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="p-8 sm:p-12 text-center space-y-3">
                <BookOpen className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No Subjects Assigned</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Assign subjects to an existing independent class to start authoring assignments.
                </p>
                <Button
                  variant="primary"
                  onClick={() => setIsAddSubjectOpen(true)}
                  className="text-xs font-bold gap-2"
                >
                  <Plus className="h-4 w-4" /> Add Subject to Class
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-[var(--border-subtle)]">
                      <th className="p-4">Subject Name &amp; Code</th>
                      <th className="p-4 hidden sm:table-cell">Assigned Class</th>
                      <th className="p-4 hidden md:table-cell">Pass Marks</th>
                      <th className="p-4 hidden lg:table-cell">Primary Teacher</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)] text-xs font-medium text-slate-800">
                    {filteredSubjects.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 font-mono font-bold text-xs shrink-0">
                              {sub.code}
                            </div>
                            <div className="min-w-0">
                              <div className="font-extrabold text-slate-900 truncate">{sub.name}</div>
                              {sub.description && (
                                <div className="text-[10px] text-slate-500 line-clamp-1">{sub.description}</div>
                              )}
                              <div className="sm:hidden text-[10px] text-slate-500 mt-0.5">{sub.className}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <Badge variant="primary" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                            {sub.className}
                          </Badge>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <span className="font-mono font-bold text-slate-900">{sub.passMarks} Points</span>
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <span className="font-bold text-slate-800">{sub.assignedTeacherName}</span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteSubject(sub)}
                            disabled={deleteSubjectMutation.isPending}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete Subject"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Add Class Modal */}
      <CreateClassModal
        isOpen={isAddClassOpen}
        onClose={() => setIsAddClassOpen(false)}
        onSuccess={handleRefresh}
      />

      {/* Add Subject Modal */}
      <CreateSubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        onSuccess={handleRefresh}
        classes={classesData.map((c) => ({ id: c.id, name: c.name, code: c.code }))}
        teachers={teachersData}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState((s) => ({ ...s, isOpen: false }))}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        description={confirmState.description}
        variant={confirmState.variant}
        confirmLabel="Delete"
        isLoading={deleteClassMutation.isPending || deleteSubjectMutation.isPending}
      />
    </div>
  );
}
