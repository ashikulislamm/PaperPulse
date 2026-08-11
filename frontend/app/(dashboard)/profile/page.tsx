"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/lib/api/auth-store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { User, KeyRound, Save } from "lucide-react";
import { PageBanner } from "@/components/common/page-banner";

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

  // Live DB Fetch for User Profile
  useQuery({
    queryKey: ["auth", "profile"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/profile");
        if (response.data?.data) {
          updateUser(response.data.data);
        }
        return response.data?.data;
      } catch (e) {
        return null;
      }
    },
  });

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

      if (response.data?.data) {
        updateUser(response.data.data);
      }
      toast.success("Profile details updated successfully!");
    } catch (err: any) {
      toast.error("Failed to update profile.");
    } finally {
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
    } catch (err: any) {
      toast.error("Failed to change password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const userRoles = user?.roles || ["Student"];
  const userName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "User";

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Banner */}
      <PageBanner
        badge="Profile"
        heading="Account Settings & Profile"
        description="Manage your personal information, contact details, and account password."
        icon={<User className="h-5 w-5" />}
      />

      {/* Profile Overview Card */}
      <Card className="p-6 glass-card flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Avatar
            src={user?.avatarUrl}
            name={userName}
            size="xl"
            className="border-2 border-indigo-600 shadow-md"
          />
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-xs font-mono text-[var(--text-secondary)]">{user?.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
              {userRoles.map((role) => (
                <Badge key={role} variant="primary">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: "info",
            label: "Personal Details",
            icon: <User className="h-4 w-4" />,
          },
          {
            id: "security",
            label: "Password & Security",
            icon: <KeyRound className="h-4 w-4" />,
          },
        ]}
      />

      {/* Tab Body */}
      {activeTab === "info" ? (
        <Card className="p-6 space-y-6">
          <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              error={profileErrors.phoneNumber?.message}
              {...registerProfile("phoneNumber")}
            />

            <Input
              label="Avatar Image URL (Optional)"
              placeholder="https://example.com/avatar.jpg"
              error={profileErrors.avatarUrl?.message}
              {...registerProfile("avatarUrl")}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" isLoading={isUpdatingProfile} className="gap-2">
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="p-6 space-y-6">
          <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4 max-w-md">
            <Input
              type="password"
              label="Current Password"
              error={passwordErrors.currentPassword?.message}
              {...registerPassword("currentPassword")}
            />
            <Input
              type="password"
              label="New Password"
              error={passwordErrors.newPassword?.message}
              {...registerPassword("newPassword")}
            />
            <Input
              type="password"
              label="Confirm New Password"
              error={passwordErrors.confirmPassword?.message}
              {...registerPassword("confirmPassword")}
            />

            <div className="flex justify-start pt-2">
              <Button type="submit" variant="primary" isLoading={isUpdatingPassword} className="gap-2">
                <KeyRound className="h-4 w-4" /> Update Password
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
