"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSent, setIsSent] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (values: ForgotFormValues) => {
    setIsLoading(true);
    // Simulate recovery request dispatch
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
      toast.success("Password recovery instructions sent to your email!");
    }, 1000);
  };

  return (
    <Card className="glass-card p-6 border border-slate-200/90 shadow-xl">
      <CardHeader className="p-0 pb-6 text-center space-y-1">
        <CardTitle className="text-xl font-bold">Reset Password</CardTitle>
        <CardDescription>
          Enter your registered email address to receive password reset instructions.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {isSent ? (
          <div className="space-y-4 text-center py-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              We have dispatched a password recovery link to your email address. Please check your inbox.
            </p>
            <Button
              variant="outline"
              size="lg"
              className="w-full mt-2"
              onClick={() => setIsSent(false)}
            >
              Send Instructions Again
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="user@paperpulse.com"
              error={errors.email?.message}
              {...register("email")}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Send Reset Link
            </Button>
          </form>
        )}

        <div className="text-center text-xs text-[var(--text-secondary)] pt-4 border-t border-[var(--border-subtle)] mt-4">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
