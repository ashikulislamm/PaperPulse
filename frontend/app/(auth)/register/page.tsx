"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/lib/api/auth-store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

const registerSchema = z
  .object({
    role: z.enum(["Student", "Teacher"]),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email address"),
    phoneNumber: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "Student",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiClient.post("/auth/register", {
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber || undefined,
        role: values.role,
      });

      if (response.data?.success && response.data?.data) {
        const { accessToken, token, refreshToken, user } = response.data.data;
        const jwtToken = accessToken || token;
        setAuth(user, jwtToken, refreshToken);

        toast.success("Account registered successfully!");
        router.push("/dashboard");
      } else {
        setErrorMessage(response.data?.message || "Registration failed.");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.title || "Registration failed.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card p-6 border border-slate-200/90 shadow-xl">
      <CardHeader className="p-0 pb-6 text-center space-y-1">
        <CardTitle className="text-xl font-bold">Create Your Account</CardTitle>
        <CardDescription>
          Register as a Student or Teacher to join PaperPulse.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Account Role */}
          <Select
            label="Account Role"
            error={errors.role?.message}
            {...register("role")}
            options={[
              { label: "Student", value: "Student" },
              { label: "Teacher", value: "Teacher" },
            ]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="First Name"
              placeholder="John"
              error={errors.firstName?.message}
              {...register("firstName")}
            />
            <Input
              label="Last Name"
              placeholder="Doe"
              error={errors.lastName?.message}
              {...register("lastName")}
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            placeholder="john.doe@paperpulse.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Phone Number (Optional)"
            placeholder="+1 (555) 019-2834"
            error={errors.phoneNumber?.message}
            {...register("phoneNumber")}
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold tracking-wide text-[var(--text-secondary)] uppercase">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                error={errors.password?.message}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold tracking-wide text-[var(--text-secondary)] uppercase">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••••••"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Create Account
          </Button>

          <div className="text-center text-xs text-[var(--text-secondary)] pt-4 border-t border-[var(--border-subtle)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
