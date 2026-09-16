"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { DataTable, Column } from "@/components/common/data-table";
import { PaginationControl } from "@/components/common/pagination-control";
import { PageHeader } from "@/components/common/page-header";
import { ControlBar } from "@/components/common/control-bar";
import { StatCard } from "@/components/common/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { UserModal, UserItem } from "@/components/users/user-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  Users as UsersIcon,
  CheckCircle2,
  Ban,
  Plus,
  Pencil,
  Play,
  Pause,
  Trash2,
  Settings2,
  Eye,
} from "lucide-react";

interface PagedUserResponse {
  items: UserItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export default function UsersPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState<string>("All");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("All");
  const [pageNumber, setPageNumber] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserItem | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<UserItem | null>(null);

  // Debounce Search Input
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  // TanStack Query Fetching User Management Feed
  const { data, isLoading, refetch } = useQuery({
    queryKey: queryKeys.users.all({
      search: debouncedSearch,
      role: selectedRole === "All" ? undefined : selectedRole,
      status: selectedStatus === "All" ? undefined : selectedStatus,
      pageNumber,
      pageSize,
    }),
    queryFn: async () => {
      const response = await apiClient.get("/users", {
        params: {
          search: debouncedSearch || undefined,
          role: selectedRole === "All" ? undefined : selectedRole,
          status: selectedStatus === "All" ? undefined : selectedStatus,
          pageNumber,
          pageSize,
        },
      });
      return response.data?.data as PagedUserResponse;
    },
  });

  const handleActivate = async (userId: string) => {
    try {
      await apiClient.patch(`/users/${userId}/activate`);
      toast.success("User account activated.");
      refetch();
    } catch {
      toast.error("Failed to activate user.");
    }
  };

  const handleDeactivate = async (userId: string) => {
    try {
      await apiClient.patch(`/users/${userId}/deactivate`);
      toast.warning("User account deactivated.");
      refetch();
    } catch {
      toast.error("Failed to deactivate user.");
    }
  };

  const handleBan = async (userId: string) => {
    try {
      await apiClient.patch(`/users/${userId}/ban`);
      toast.error("User account suspended.");
      refetch();
    } catch {
      toast.error("Failed to suspend user.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/users/${deleteTarget.id}`);
      toast.success("User deleted.");
      setDeleteTarget(null);
      refetch();
    } catch {
      toast.error("Failed to delete user.");
    }
  };

  const columns: Column<UserItem>[] = [
    {
      header: "User Profile",
      cell: (row) => (
        <a
          href={`/users/${row.id}`}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <Avatar name={`${row.firstName} ${row.lastName}`} size="sm" />
          <div className="flex flex-col">
            <span className="font-semibold text-[var(--text-primary)]">
              {row.firstName} {row.lastName}
            </span>
            <span className="text-[11px] text-[var(--text-muted)] font-mono">{row.email}</span>
          </div>
        </a>
      ),
    },
    {
      header: "Roles",
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.roles?.map((role) => (
            <Badge
              key={role}
              variant={
                role === "Admin"
                  ? "primary"
                  : role === "Teacher"
                  ? "info"
                  : "default"
              }
            >
              {role}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: "Status",
      cell: (row) => (
        <Badge
          variant={
            row.status === "Active"
              ? "success"
              : row.status === "Suspended"
              ? "danger"
              : "draft"
          }
          dot
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Last Active",
      cell: (row) => (
        <span className="text-[11px] font-mono text-[var(--text-muted)]">
          {row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleDateString() : "Never"}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (row) => (
        <DropdownMenu
          trigger={
            <Button size="sm" variant="outline" className="gap-1 text-xs">
              <Settings2 className="h-3.5 w-3.5" /> Options
            </Button>
          }
          items={[
            {
              label: "View Profile",
              icon: <Eye className="h-3.5 w-3.5" />,
              onClick: () => router.push(`/users/${row.id}`),
            },
            {
              label: "Edit User",
              icon: <Pencil className="h-3.5 w-3.5" />,
              onClick: () => {
                setEditingUser(row);
                setIsModalOpen(true);
              },
            },
            ...(row.status !== "Active"
              ? [
                  {
                    label: "Activate Account",
                    icon: <Play className="h-3.5 w-3.5 text-emerald-600" />,
                    onClick: () => handleActivate(row.id),
                  },
                ]
              : [
                  {
                    label: "Deactivate Account",
                    icon: <Pause className="h-3.5 w-3.5 text-amber-600" />,
                    onClick: () => handleDeactivate(row.id),
                  },
                ]),
            ...(row.status !== "Suspended"
              ? [
                  {
                    label: "Suspend User",
                    icon: <Ban className="h-3.5 w-3.5 text-rose-600" />,
                    danger: true,
                    onClick: () => handleBan(row.id),
                  },
                ]
              : []),
            {
              label: "Delete User",
              icon: <Trash2 className="h-3.5 w-3.5 text-rose-600" />,
              danger: true,
              onClick: () => setDeleteTarget(row),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Universal Page Header */}
      <PageHeader
        heading="User Accounts &amp; Access"
        description="Provision institution accounts, manage role permissions, and track active statuses."
        badge="Users"
        icon={<UsersIcon className="h-4 w-4" />}
        actions={
          <Button
            variant="primary"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              setEditingUser(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" /> Add User
          </Button>
        }
      />

      {/* User Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Registered Accounts"
          value={data?.totalCount || 0}
          subtext="Configured users across institution"
          icon={<UsersIcon className="h-4 w-4" />}
        />
        <StatCard
          title="Active Accounts"
          value={data?.items?.filter((u) => u.status === "Active").length || 0}
          subtext="Eligible to sign in and submit"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <StatCard
          title="Suspended Accounts"
          value={data?.items?.filter((u) => u.status === "Suspended").length || 0}
          subtext="Access temporarily restricted"
          icon={<Ban className="h-4 w-4" />}
        />
      </div>

      {/* Unified Control Bar */}
      <ControlBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or email..."
        statusFilters={["All", "Active", "Inactive", "Suspended"]}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      >
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-[var(--text-muted)] font-medium">Role:</span>
          {["All", "Admin", "Teacher", "Student"].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRole(role)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                selectedRole === role
                  ? "bg-indigo-600 text-white font-semibold shadow-2xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </ControlBar>

      {/* Table & Pagination */}
      <div className="space-y-3">
        <DataTable
          columns={columns}
          data={data?.items || []}
          isLoading={isLoading}
          emptyMessage="No matching user accounts found."
        />

        <PaginationControl
          currentPage={data?.pageNumber || pageNumber}
          totalPages={data?.totalPages || 1}
          totalItems={data?.totalCount || 0}
          pageSize={pageSize}
          onPageChange={setPageNumber}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Add / Edit User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
        userToEdit={editingUser}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete "${deleteTarget?.firstName} ${deleteTarget?.lastName}"?`}
        description="This user will be soft-deleted and will no longer be able to log in."
        confirmLabel="Delete User"
        variant="danger"
      />
    </div>
  );
}
