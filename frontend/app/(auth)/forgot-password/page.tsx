"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <Card className="p-6 border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-sm">
      <CardHeader className="p-0 pb-5 text-center space-y-1">
        <div className="mx-auto h-10 w-10 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
          <Construction className="h-5 w-5" />
        </div>
        <CardTitle className="text-lg font-bold">Password Recovery</CardTitle>
        <CardDescription>
          Contact institution administrators to recover credentials.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <div className="space-y-4 text-center py-2">
          <div className="p-3 rounded-md border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-xs font-medium leading-relaxed">
            Institutional accounts are centrally managed. Please contact your campus system administrator or faculty desk to request an account password reset.
          </div>

          <Link href="/login">
            <Button variant="outline" size="md" className="w-full gap-1.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" /> Return to Sign In
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
