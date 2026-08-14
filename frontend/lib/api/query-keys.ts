export const queryKeys = {
  auth: {
    me: () => ["auth", "me"] as const,
    profile: () => ["auth", "profile"] as const,
  },
  users: {
    all: (filters?: Record<string, unknown>) => ["users", filters] as const,
    detail: (id: string) => ["users", "detail", id] as const,
  },
  academic: {
    classes: () => ["academic", "classes"] as const,
    subjects: () => ["academic", "subjects"] as const,
    teacherAssignmentsMe: () => ["academic", "teacher-assignments", "me"] as const,
    classStudents: (classId: string) => ["academic", "class-students", classId] as const,
    availableStudents: (classId: string) => ["academic", "available-students", classId] as const,
  },
  assignments: {
    all: (filters?: Record<string, unknown>) => ["assignments", filters] as const,
    detail: (id: string) => ["assignments", "detail", id] as const,
  },
  studentAssignments: {
    feed: (filter?: string) => ["student", "assignments", filter] as const,
    grades: (filters?: Record<string, unknown>) => ["student", "grades", filters] as const,
  },
  submissions: {
    byAssignment: (assignmentId: string) =>
      ["submissions", "assignment", assignmentId] as const,
    detail: (submissionId: string) =>
      ["submissions", "detail", submissionId] as const,
    forAssignment: (assignmentId: string, status?: string) =>
      ["submissions", "assignment", assignmentId, status] as const,
  },
  grading: {
    submissions: (assignmentId: string) => ["grading", "submissions", assignmentId] as const,
    detail: (submissionId: string) => ["grading", "detail", submissionId] as const,
  },
  notifications: {
    list: (status?: string) => ["notifications", status] as const,
    unreadCount: () => ["notifications", "unread-count"] as const,
  },
  dashboard: {
    admin: () => ["dashboard", "admin"] as const,
    teacher: () => ["dashboard", "teacher"] as const,
    student: () => ["dashboard", "student"] as const,
  },
  auditLogs: {
    all: (filters?: Record<string, unknown>) => ["audit-logs", filters] as const,
    security: () => ["audit-logs", "security"] as const,
    detail: (id: string) => ["audit-logs", "detail", id] as const,
  },
};
