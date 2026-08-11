"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";

const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().optional(),
  password: z.string().optional(),
  roles: z.array(z.string()).min(1, "At least one role must be selected"),
});

export type UserFormValues = z.infer<typeof userSchema>;

export interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  status: string;
  roles: string[];
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userToEdit?: UserItem | null;
}

export function UserModal({ isOpen, onClose, onSuccess, userToEdit }: UserModalProps) {
  const isEditing = !!userToEdit;
  const [isLoading, setIsLoading] = React.useState(false);
  const [passwordValue, setPasswordValue] = React.useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      roles: ["Student"],
    },
  });

  const selectedRoles = watch("roles") || [];

  React.useEffect(() => {
    if (userToEdit) {
      reset({
        firstName: userToEdit.firstName,
        lastName: userToEdit.lastName,
        email: userToEdit.email,
        phoneNumber: userToEdit.phoneNumber || "",
        password: "",
        roles: userToEdit.roles || ["Student"],
      });
      setPasswordValue("");
    } else {
      reset({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "InitialPassword123!",
        roles: ["Student"],
      });
      setPasswordValue("InitialPassword123!");
    }
  }, [userToEdit, reset]);

  const handleRoleToggle = (role: string) => {
    if (selectedRoles.includes(role)) {
      setValue(
        "roles",
        selectedRoles.filter((r) => r !== role)
      );
    } else {
      setValue("roles", [...selectedRoles, role]);
    }
  };

  // Password Policy Indicator Validation
  const hasMinLength = passwordValue.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasDigit = /[0-9]/.test(passwordValue);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(passwordValue);

  const onSubmit = async (values: UserFormValues) => {
    setIsLoading(true);
    try {
      if (isEditing) {
        await apiClient.put(`/users/${userToEdit.id}`, {
          id: userToEdit.id,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phoneNumber: values.phoneNumber || undefined,
        });
        toast.success("User updated successfully!");
      } else {
        await apiClient.post("/users", {
          email: values.email,
          password: values.password || "InitialPassword123!",
          firstName: values.firstName,
          lastName: values.lastName,
          phoneNumber: values.phoneNumber || undefined,
          roles: values.roles,
        });
        toast.success("User created with mandatory first-login password update!");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      // Toast handles global error display
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit System User" : "Create New User"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            placeholder="Sarah"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <Input
            label="Last Name"
            placeholder="Connor"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="sarah.connor@paperpulse.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Phone Number"
          placeholder="+1 (555) 333-4444"
          error={errors.phoneNumber?.message}
          {...register("phoneNumber")}
        />

        {/* Roles Selection Checkboxes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold tracking-wide text-[var(--text-secondary)] uppercase">
            Assign System Roles
          </label>
          <div className="flex items-center gap-4 p-3 rounded-lg border border-[var(--border-subtle)] bg-slate-50/50">
            {["Admin", "Teacher", "Student"].map((role) => (
              <Checkbox
                key={role}
                label={role}
                checked={selectedRoles.includes(role)}
                onChange={() => handleRoleToggle(role)}
              />
            ))}
          </div>
          {errors.roles && (
            <span className="text-xs font-medium text-[var(--color-danger)]">
              {errors.roles.message}
            </span>
          )}
        </div>

        {/* Password Policy Section for New Users */}
        {!isEditing && (
          <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
            <Input
              label="Initial Password"
              type="password"
              placeholder="InitialPassword123!"
              error={errors.password?.message}
              {...register("password", {
                onChange: (e) => setPasswordValue(e.target.value),
              })}
            />

            {/* Policy Criteria */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-xs font-mono">
              <div className="font-sans font-bold text-slate-700 mb-1 text-[11px] uppercase">
                Password Policy Checklist:
              </div>
              <div className={hasMinLength ? "text-emerald-700 font-semibold" : "text-slate-500"}>
                {hasMinLength ? "✓" : "○"} At least 8 characters
              </div>
              <div className={hasUppercase ? "text-emerald-700 font-semibold" : "text-slate-500"}>
                {hasUppercase ? "✓" : "○"} At least 1 uppercase letter
              </div>
              <div className={hasDigit ? "text-emerald-700 font-semibold" : "text-slate-500"}>
                {hasDigit ? "✓" : "○"} At least 1 number (0-9)
              </div>
              <div className={hasSpecialChar ? "text-emerald-700 font-semibold" : "text-slate-500"}>
                {hasSpecialChar ? "✓" : "○"} At least 1 special character
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEditing ? "Save Changes" : "Create User"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
