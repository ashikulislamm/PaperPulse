"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/lib/api/auth-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { RoleAssignmentModal } from "@/components/users/role-assignment-modal";
import {
  ArrowLeft,
  Play,
  Pause,
  Ban,
  Trash2,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  Clock,
  UserCheck,
} from "lucide-react";

interface UserDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  status: string;
  roles: string[];
  mustChangePassword: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.roles?.includes("Admin");

  const [isRoleModalOpen, setIsRoleModalOpen] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState<{
    type: "ban" | "delete";
  } | null>(null);

  // Fetch user detail
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: async () => {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data?.data as UserDetail;
    },
    enabled: !!userId,
  });

  // Action handlers
  const handleActivate = async () => {
    try {
      await apiClient.patch(`/users/${userId}/activate`);
      toast.success("User activated successfully.");
      refetch();
    } catch (err) {
      toast.error("Failed to activate user.");
    }
  };

  const handleDeactivate = async () => {
    try {
      await apiClient.patch(`/users/${userId}/deactivate`);
      toast.warning("User deactivated.");
      refetch();
    } catch (err) {
      toast.error("Failed to deactivate user.");
    }
  };

  const handleBan = async () => {
    setConfirmAction(null);
    try {
      await apiClient.patch(`/users/${userId}/ban`);
      toast.error("User has been banned.");
      refetch();
    } catch (err) {
      toast.error("Failed to ban user.");
    }
  };

  const handleDelete = async () => {
    setConfirmAction(null);
    try {
      await apiClient.delete(`/users/${userId}`);
      toast.success("User deleted.");
      router.push("/users");
    } catch (err) {
      toast.error("Failed to delete user.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Card className="p-5 sm:p-8 space-y-6">
          <div className="flex items-center gap-6">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-px w-full" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Link
          href="/users"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Users
        </Link>
        <Card className="p-8 sm:p-12 text-center">
          <p className="text-sm text-[var(--text-secondary)]">User not found.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Navigation */}
      <Link
        href="/users"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to User Management
      </Link>

      {/* User Profile Header Card */}
      <Card className="p-5 sm:p-8 glass-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Avatar
              name={`${user.firstName} ${user.lastName}`}
              size="xl"
            />
            <div className="space-y-1.5">
              <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-sm text-[var(--text-secondary)] font-mono">{user.email}</p>
              <div className="flex items-center gap-2 pt-1">
                <Badge
                  variant={
                    user.status === "Active"
                      ? "success"
                      : user.status === "Suspended"
                      ? "danger"
                      : user.status === "Inactive"
                      ? "closed"
                      : "warning"
                  }
                  dot
                >
                  {user.status}
                </Badge>
                {user.roles.map((role) => (
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
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isAdmin && (
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setIsRoleModalOpen(true)}
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Manage Roles
              </Button>
              {user.status === "Active" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-amber-700 border-amber-200"
                  onClick={handleDeactivate}
                >
                  <Pause className="h-3.5 w-3.5" /> Deactivate
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-emerald-700 border-emerald-200"
                  onClick={handleActivate}
                >
                  <Play className="h-3.5 w-3.5" /> Activate
                </Button>
              )}
              <Button
                variant="danger"
                size="sm"
                className="gap-1.5"
                onClick={() => setConfirmAction({ type: "ban" })}
              >
                <Ban className="h-3.5 w-3.5" /> Ban
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* User Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            <Mail className="h-4 w-4 text-indigo-600" /> Email Address
          </div>
          <p className="text-sm font-semibold text-[var(--text-primary)] font-mono">{user.email}</p>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            <Phone className="h-4 w-4 text-indigo-600" /> Phone Number
          </div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {user.phoneNumber || "Not provided"}
          </p>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            <UserCheck className="h-4 w-4 text-indigo-600" /> Assigned Roles
          </div>
          <div className="flex flex-wrap gap-1.5">
            {user.roles.length > 0 ? (
              user.roles.map((role) => (
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
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            <ShieldCheck className="h-4 w-4 text-indigo-600" /> Account Status
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                user.status === "Active"
                  ? "success"
                  : user.status === "Suspended"
                  ? "danger"
                  : "closed"
              }
              dot
            >
              {user.status}
            </Badge>
            {user.mustChangePassword && (
              <Badge variant="warning">Must Change Password</Badge>
            )}
          </div>
        </Card>

        {user.createdAt && (
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              <Calendar className="h-4 w-4 text-indigo-600" /> Created At
            </div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </Card>
        )}

        {user.updatedAt && (
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              <Clock className="h-4 w-4 text-indigo-600" /> Last Updated
            </div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {new Date(user.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </Card>
        )}
      </div>

      {/* Danger Zone */}
      {isAdmin && (
        <Card className="p-6 border-rose-200 bg-rose-50/30">
          <h3 className="text-sm font-bold text-rose-700 mb-3">Danger Zone</h3>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs text-rose-600 font-medium">
                Permanently soft-delete this user account. The user will no longer be able to log in.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              className="gap-1.5 shrink-0"
              onClick={() => setConfirmAction({ type: "delete" })}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete User
            </Button>
          </div>
        </Card>
      )}

      {/* Role Assignment Modal */}
      <RoleAssignmentModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onSuccess={() => refetch()}
        userId={userId}
        userName={`${user.firstName} ${user.lastName}`}
        currentRoles={user.roles}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={confirmAction?.type === "ban" ? handleBan : handleDelete}
        title={confirmAction?.type === "ban" ? `Ban "${user.firstName} ${user.lastName}"?` : `Delete "${user.firstName} ${user.lastName}"?`}
        description={
          confirmAction?.type === "ban"
            ? "This will terminate all their active sessions and prevent them from logging in. An administrator can reverse this later."
            : "This user will be soft-deleted and will no longer be able to log in. An administrator can reverse this action later."
        }
        confirmLabel={confirmAction?.type === "ban" ? "Ban User" : "Delete User"}
        variant={confirmAction?.type === "ban" ? "warning" : "danger"}
      />
    </div>
  );
}
