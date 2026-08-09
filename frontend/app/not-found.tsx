import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileQuestion, ArrowLeft, LayoutDashboard, Home as HomeIcon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-base)] text-[var(--text-primary)] p-6 relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="w-full max-w-md text-center space-y-6">
        <Card className="glass-card p-8 border border-slate-200/90 shadow-2xl space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
            <FileQuestion className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <span className="text-4xl font-extrabold font-mono text-indigo-600">404</span>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Page Not Found
            </h1>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              The page or module you are looking for does not exist, has been moved, or is currently under development.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <Link href="/dashboard" className="w-full">
              <Button variant="primary" size="lg" className="w-full gap-2">
                <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
              </Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="outline" size="lg" className="w-full gap-2">
                <HomeIcon className="h-4 w-4" /> Return to Home
              </Button>
            </Link>
          </div>
        </Card>

        <p className="text-xs font-mono text-[var(--text-muted)]">
          PaperPulse Academic System • 404 Route Trap
        </p>
      </div>
    </div>
  );
}
