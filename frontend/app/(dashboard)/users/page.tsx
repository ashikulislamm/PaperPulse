"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { DataTable, Column } from "@/components/common/data-table";
import { PaginationControl } from "@/components/common/pagination-control";
import { StatCard } from "@/components/common/stat-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { UserModal, UserItem } from "@/components/users/user-modal";
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
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState<string>("All");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("All");
  const [pageNumber, setPageNumber] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserItem | null>(null);

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

  // Action Handlers
  const handleActivate = async (userId: string) => {
    try {
      await apiClient.patch(`/users/${userId}/activate`);
      toast.success("User account activated successfully.");
      refetch();
    } catch (err) {}
  };

  const handleDeactivate = async (userId: string) => {
    try {
      await apiClient.patch(`/users/${userId}/deactivate`);
      toast.warning("User account deactivated.");
      refetch();
    } catch (err) {}
  };

  const handleBan = async (userId: string) => {
    try {
      await apiClient.patch(`/users/${userId}/ban`);
      toast.error("User account suspended / banned.");
      refetch();
    } catch (err) {}
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to soft delete this user?")) return;
    try {
      await apiClient.delete(`/users/${userId}`);
      toast.success("User deleted.");
      refetch();
    } catch (err) {}
  };

  const columns: Column<UserItem>[] = [
    {
      header: "User Profile",
      cell: (row) => (
        <a
          href={`/users/${row.id}`}
          className="flex items-center gap-3 hover:bg-slate-50 rounded-lg p-1 -m-1 transition-colors"
        >
          <Avatar name={`${row.firstName} ${row.lastName}`} size="md" />
          <div className="flex flex-col">
            <span className="font-bold text-[var(--text-primary)] hover:text-indigo-600 transition-colors">
              {row.firstName} {row.lastName}
            </span>
            <span className="text-xs text-[var(--text-secondary)] font-mono">{row.email}</span>
          </div>
        </a>
      ),
    },
    {
      header: "Assigned Roles",
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.roles?.map((role) => (
            <Badge key={role} variant={role === "Admin" ? "primary" : role === "Teacher" ? "published" : "default"}>
              {role}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: "Account Status",
      cell: (row) => (
        <Badge
          variant={
            row.status === "Active"
              ? "success"
              : row.status === "Suspended"
              ? "danger"
              : "closed"
          }
          dot
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Phone Number",
      cell: (row) => (
        <span className="font-mono text-xs text-slate-600">
          {row.phoneNumber || "N/A"}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <DropdownMenu
          trigger={
            <Button size="sm" variant="outline" className="gap-1.5">
              <Settings2 className="h-3.5 w-3.5" /> Manage
            </Button>
          }
          items={[
            {
              label: "View Profile",
              icon: <Eye className="h-4 w-4 text-slate-500" />,
              onClick: () => (window.location.href = `/users/${row.id}`),
            },
            {
              label: "Edit Profile",
              icon: <Pencil className="h-4 w-4 text-slate-500" />,
              onClick: () => {
                setEditingUser(row);
                setIsModalOpen(true);
              },
            },
            {
              label: row.status === "Active" ? "Deactivate Account" : "Activate Account",
              icon: row.status === "Active" ? <Pause className="h-4 w-4 text-amber-600" /> : <Play className="h-4 w-4 text-emerald-600" />,
              onClick: () => (row.status === "Active" ? handleDeactivate(row.id) : handleActivate(row.id)),
            },
            {
              label: "Ban / Suspend User",
              icon: <Ban className="h-4 w-4 text-rose-600" />,
              danger: true,
              onClick: () => handleBan(row.id),
            },
            {
              label: "Delete User",
              icon: <Trash2 className="h-4 w-4 text-rose-600" />,
              danger: true,
              onClick: () => handleDelete(row.id),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title & Create User Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">System User Administration</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage System &amp; Tenant users, role claims, status enforcement, and account provisioning.
          </p>
        </div>
        <Button
          variant="primary"
          className="gap-2"
          onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add New User
        </Button>
      </div>

      {/* User Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Total Registered Users"
          value={data?.totalCount || 0}
          accentColor="indigo"
          icon={<UsersIcon className="h-5 w-5" />}
        />
        <StatCard
          title="Active Accounts"
          value={data?.items?.filter((u) => u.status === "Active").length || 0}
          accentColor="emerald"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatCard
          title="Suspended / Banned"
          value={data?.items?.filter((u) => u.status === "Suspended").length || 0}
          accentColor="rose"
          icon={<Ban className="h-5 w-5" />}
        />
      </div>

      {/* Filter & Table Container */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="space-y-4">
            {/* Top Bar: Search Input & Reset Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="w-full sm:w-80">
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {(search || selectedRole !== "All" || selectedStatus !== "All") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setSelectedRole("All");
                    setSelectedStatus("All");
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-indigo-600 self-start sm:self-auto"
                >
                  Reset Filters
                </Button>
              )}
            </div>

            {/* Filter Pills Bar */}
            <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-[var(--border-subtle)]">
              {/* Role Filter Group */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Role:
                </span>
                <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
                  {["All", "Admin", "Teacher", "Student"].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        selectedRole === role
                          ? "bg-white text-indigo-600 shadow-xs font-bold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              {/* Status Filter Group */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Status:
                </span>
                <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
                  {["All", "Active", "Inactive", "Suspended"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setSelectedStatus(status)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        selectedStatus === status
                          ? "bg-white text-indigo-600 shadow-xs font-bold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <div className="p-6 pt-0 space-y-4">
          <DataTable
            columns={columns}
            data={data?.items || []}
            isLoading={isLoading}
            emptyMessage="No matching system users found."
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
      </Card>

      {/* Add / Edit User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
        userToEdit={editingUser}
      />
    </div>
  );
}
