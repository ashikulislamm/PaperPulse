"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <Card className="glass-card p-6 border border-slate-200/90 shadow-xl">
      <CardHeader className="p-0 pb-6 text-center space-y-1">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
          <Construction className="h-7 w-7" />
        </div>
        <CardTitle className="text-xl font-bold">Password Reset</CardTitle>
        <CardDescription>
          This feature is currently under development and will be available in a future release.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <div className="space-y-4 text-center py-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold leading-relaxed">
            Password reset functionality requires a backend email service integration that is not yet configured.
            Please contact your system administrator to reset your password.
          </div>

          <Link href="/login">
            <Button variant="primary" size="lg" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Sign In
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
