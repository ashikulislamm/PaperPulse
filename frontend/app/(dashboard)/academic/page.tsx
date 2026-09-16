"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  GraduationCap,
  BookOpen,
  Plus,
  Layers,
  Building2,
  Trash2,
  UserCog,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { PageHeader } from "@/components/common/page-header";
import { ControlBar } from "@/components/common/control-bar";
import { StatCard } from "@/components/common/stat-card";
import { DataTable, Column } from "@/components/common/data-table";
import { apiClient } from "@/lib/api/client";
import { CreateClassModal } from "@/components/academic/create-class-modal";
import { CreateSubjectModal } from "@/components/academic/create-subject-modal";
import { ManageStudentsModal } from "@/components/academic/manage-students-modal";
import { ChangeTeacherModal, ChangeTeacherTarget } from "@/components/academic/change-teacher-modal";

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
  classSubjectId?: string;
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
  const [manageStudentsFor, setManageStudentsFor] = React.useState<ClassItem | null>(null);
  const [changeTeacherFor, setChangeTeacherFor] = React.useState<ChangeTeacherTarget | null>(null);
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
      title: `Delete "${cls.name}"?`,
      description: hasSubjects
        ? `"${cls.name}" has ${cls.assignedSubjectsCount} subject(s) assigned. Deleting it will remove all assigned subjects. This action cannot be undone.`
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

  const handleChangeTeacher = (sub: SubjectItem) => {
    setChangeTeacherFor({
      id: sub.id,
      classSubjectId: sub.classSubjectId || sub.id,
      subjectName: sub.name,
      className: sub.className,
      currentTeacherName: sub.assignedTeacherName || "Unassigned",
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

  // Class Columns for DataTable
  const classColumns: Column<ClassItem>[] = [
    {
      header: "Code",
      cell: (row) => (
        <span className="font-mono font-bold text-[var(--color-primary)]">
          {row.code}
        </span>
      ),
    },
    {
      header: "Class Name",
      cell: (row) => (
        <span className="font-semibold text-[var(--text-primary)]">{row.name}</span>
      ),
    },
    {
      header: "Subjects",
      className: "text-center",
      cell: (row) => (
        <span className="font-mono font-medium">{row.assignedSubjectsCount}</span>
      ),
    },
    {
      header: "Enrolled",
      className: "text-center",
      cell: (row) => {
        const isFull = row.enrolledStudentsCount >= row.maxCapacity;
        return (
          <span className={`font-mono font-semibold ${isFull ? "text-rose-600" : ""}`}>
            {row.enrolledStudentsCount}
          </span>
        );
      },
    },
    {
      header: "Capacity",
      className: "text-center",
      cell: (row) => (
        <span className="text-[var(--text-muted)] font-mono">{row.maxCapacity}</span>
      ),
    },
    {
      header: "Created",
      cell: (row) => (
        <span className="text-[11px] font-mono text-[var(--text-muted)]">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-emerald-600 hover:text-emerald-700"
            onClick={() => setManageStudentsFor(row)}
            title="Manage Students"
          >
            <UserPlus className="h-3 w-3" /> <span className="hidden sm:inline">Students</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-indigo-600 hover:text-indigo-700"
            onClick={() => setIsAddSubjectOpen(true)}
            title="Add Subject"
          >
            <Plus className="h-3 w-3" /> <span className="hidden sm:inline">Subject</span>
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            onClick={() => handleDeleteClass(row)}
            disabled={deleteClassMutation.isPending}
            title="Delete Class"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  // Subject Columns for DataTable
  const subjectColumns: Column<SubjectItem>[] = [
    {
      header: "Subject & Code",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {row.code}
          </span>
          <div className="min-w-0">
            <div className="font-semibold text-[var(--text-primary)] truncate">{row.name}</div>
            {row.description && (
              <div className="text-[10px] text-[var(--text-muted)] truncate max-w-xs">{row.description}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Assigned Class",
      cell: (row) => (
        <Badge variant="primary">{row.className}</Badge>
      ),
    },
    {
      header: "Pass Marks",
      cell: (row) => (
        <span className="font-mono text-xs font-medium">{row.passMarks} pts</span>
      ),
    },
    {
      header: "Teacher",
      cell: (row) => (
        <span className="text-xs font-medium text-[var(--text-secondary)]">{row.assignedTeacherName}</span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => handleChangeTeacher(row)}
            title="Reassign Teacher"
          >
            <UserCog className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            onClick={() => handleDeleteSubject(row)}
            disabled={deleteSubjectMutation.isPending}
            title="Delete Subject"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Universal Page Header */}
      <PageHeader
        heading="Academic Curricula"
        description="Configure academic classes, assign subject courses, and enroll students."
        badge="Academics"
        icon={<Building2 className="h-4 w-4" />}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddClassOpen(true)}
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Add Class
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddSubjectOpen(true)}
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Add Subject
            </Button>
          </>
        }
      />

      {/* Summary Metrics Row with StatCard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Classes"
          value={classesData.length}
          subtext="Configured academic cohorts"
          icon={<GraduationCap className="h-4 w-4" />}
        />
        <StatCard
          title="Curriculum Subjects"
          value={subjectsData.length}
          subtext="Assigned course offerings"
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatCard
          title="Structure Status"
          value="Synchronized"
          subtext="Class to subject mapping active"
          icon={<Layers className="h-4 w-4" />}
        />
      </div>

      {/* Control Bar */}
      <ControlBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={`Search ${activeTab}...`}
      >
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant={activeTab === "classes" ? "primary" : "ghost"}
            onClick={() => setActiveTab("classes")}
          >
            Classes ({classesData.length})
          </Button>
          <Button
            size="sm"
            variant={activeTab === "subjects" ? "primary" : "ghost"}
            onClick={() => setActiveTab("subjects")}
          >
            Subjects ({subjectsData.length})
          </Button>
        </div>
      </ControlBar>

      {/* Reusable DataTable Component */}
      {activeTab === "classes" ? (
        <DataTable
          columns={classColumns}
          data={filteredClasses}
          isLoading={isLoadingClasses}
          emptyMessage="No academic classes configured yet. Click 'Add Class' to create one."
        />
      ) : (
        <DataTable
          columns={subjectColumns}
          data={filteredSubjects}
          isLoading={isLoadingSubjects}
          emptyMessage="No subjects assigned yet. Click 'Add Subject' to map a subject to a class."
        />
      )}

      {/* Modals */}
      <CreateClassModal
        isOpen={isAddClassOpen}
        onClose={() => setIsAddClassOpen(false)}
        onSuccess={handleRefresh}
      />

      <CreateSubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        onSuccess={handleRefresh}
        classes={classesData.map((c) => ({ id: c.id, name: c.name, code: c.code }))}
        teachers={teachersData}
      />

      {manageStudentsFor && (
        <ManageStudentsModal
          isOpen={!!manageStudentsFor}
          onClose={() => setManageStudentsFor(null)}
          classId={manageStudentsFor.id}
          className={manageStudentsFor.name}
          classCode={manageStudentsFor.code}
          maxCapacity={manageStudentsFor.maxCapacity}
          enrolledCount={manageStudentsFor.enrolledStudentsCount}
          onSuccess={handleRefresh}
        />
      )}

      {changeTeacherFor && (
        <ChangeTeacherModal
          isOpen={!!changeTeacherFor}
          onClose={() => setChangeTeacherFor(null)}
          target={changeTeacherFor}
          teachers={teachersData}
          onSuccess={handleRefresh}
        />
      )}

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
