"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/lib/api/auth-store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { User, KeyRound, Save } from "lucide-react";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().optional(),
  avatarUrl: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters long"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = React.useState("info");
  const [isUpdatingProfile, setIsUpdatingProfile] = React.useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false);

  // Profile Form Hook
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phoneNumber: user?.phoneNumber || "",
      avatarUrl: user?.avatarUrl || "",
    },
  });

  // Password Form Hook
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onUpdateProfile = async (values: ProfileFormValues) => {
    setIsUpdatingProfile(true);
    try {
      const response = await apiClient.put("/profile", {
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber || undefined,
        avatarUrl: values.avatarUrl || undefined,
      });

      if (response.data?.success && response.data?.data) {
        updateUser(response.data.data);
        toast.success("Profile updated successfully!");
      }
    } catch (err) {}
    finally {
      setIsUpdatingProfile(false);
    }
  };

  const onChangePassword = async (values: PasswordFormValues) => {
    setIsUpdatingPassword(true);
    try {
      await apiClient.post("/profile/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success("Password changed successfully!");
      resetPasswordForm();
    } catch (err) {}
    finally {
      setIsUpdatingPassword(false);
    }
  };

  const userDisplayName = user ? `${user.firstName} ${user.lastName}` : "User Profile";

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Profile Banner */}
      <Card className="p-6 glass-card">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Avatar src={user?.avatarUrl} name={userDisplayName} size="xl" />
          <div className="flex flex-col text-center sm:text-left space-y-1">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <h1 className="text-2xl font-bold">{userDisplayName}</h1>
              <Badge variant="primary" dot>
                {user?.roles?.join(", ") || "User"}
              </Badge>
            </div>
            <p className="text-sm font-mono text-[var(--text-secondary)]">{user?.email}</p>
            <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start text-xs text-[var(--text-muted)]">
              <span>Account Status:</span>
              <span className="font-bold text-emerald-600 uppercase">{user?.status || "Active"}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs Navigation */}
      <Card className="p-6">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: "info", label: "Profile Details", icon: <User className="h-4 w-4" /> },
            { id: "password", label: "Change Password", icon: <KeyRound className="h-4 w-4" /> },
          ]}
          className="mb-6"
        />

        {activeTab === "info" ? (
          <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4 max-w-xl">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                error={profileErrors.firstName?.message}
                {...registerProfile("firstName")}
              />
              <Input
                label="Last Name"
                error={profileErrors.lastName?.message}
                {...registerProfile("lastName")}
              />
            </div>

            <Input
              label="Email Address"
              value={user?.email || ""}
              disabled
              className="bg-slate-100/70 cursor-not-allowed"
            />

            <Input
              label="Phone Number"
              placeholder="+1 (555) 019-2834"
              error={profileErrors.phoneNumber?.message}
              {...registerProfile("phoneNumber")}
            />

            <Input
              label="Avatar Image URL"
              placeholder="https://example.com/avatar.png"
              error={profileErrors.avatarUrl?.message}
              {...registerProfile("avatarUrl")}
            />

            <Button
              type="submit"
              variant="primary"
              className="gap-2"
              isLoading={isUpdatingProfile}
            >
              <Save className="h-4 w-4" /> Save Profile Changes
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4 max-w-xl">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••••••"
              error={passwordErrors.currentPassword?.message}
              {...registerPassword("currentPassword")}
            />

            <Input
              label="New Password"
              type="password"
              placeholder="••••••••••••"
              error={passwordErrors.newPassword?.message}
              {...registerPassword("newPassword")}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••••••"
              error={passwordErrors.confirmPassword?.message}
              {...registerPassword("confirmPassword")}
            />

            <Button
              type="submit"
              variant="primary"
              className="gap-2"
              isLoading={isUpdatingPassword}
            >
              <KeyRound className="h-4 w-4" /> Update Password
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
