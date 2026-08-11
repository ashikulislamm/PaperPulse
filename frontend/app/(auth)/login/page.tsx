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

const loginSchema = z.object({
  tenantId: z.string().min(1, "Tenant selection is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      tenantId: "11111111-1111-1111-1111-111111111111",
      email: "admin@paperpulse.com",
      password: "AdminPass123!",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiClient.post("/auth/login", {
        email: values.email,
        password: values.password,
        tenantId: values.tenantId,
      });

      if (response.data?.success && response.data?.data) {
        const { accessToken, token, refreshToken, user } = response.data.data;
        const jwtToken = accessToken || token;
        
        // Save state in Zustand persistent store
        setAuth(user, jwtToken, refreshToken);

        toast.success(`Welcome back, ${user.firstName}!`);

        if (user.mustChangePassword) {
          toast.warning("First login detected. Please update your password.");
          router.push("/profile");
        } else {
          router.push("/dashboard");
        }
      } else {
        setErrorMessage(response.data?.message || "Login failed.");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.title || "Invalid email or password.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card p-6 border border-slate-200/90 shadow-xl">
      <CardHeader className="p-0 pb-6 text-center space-y-1">
        <CardTitle className="text-xl font-bold">Sign In to Your Workspace</CardTitle>
        <CardDescription>
          Enter your credentials to access your dashboard.
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

          {/* Tenant Selector */}
          <Select
            label="Organization / Tenant"
            error={errors.tenantId?.message}
            {...register("tenantId")}
            options={[
              { label: "Primary School Tenant (Default)", value: "11111111-1111-1111-1111-111111111111" },
              { label: "Secondary Academy Campus", value: "22222222-2222-2222-2222-222222222222" },
            ]}
          />

          {/* Email Input */}
          <Input
            label="Email Address"
            type="email"
            placeholder="admin@paperpulse.com"
            error={errors.email?.message}
            {...register("email")}
          />

          {/* Password Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold tracking-wide text-[var(--text-secondary)] uppercase">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••••••"
              error={errors.password?.message}
              {...register("password")}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Sign In to Account
          </Button>

          {/* Registration Redirect Link */}
          <div className="text-center text-xs text-[var(--text-secondary)] pt-4 border-t border-[var(--border-subtle)]">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Register Account
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
