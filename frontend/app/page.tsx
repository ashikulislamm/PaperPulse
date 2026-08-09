import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] relative overflow-hidden flex flex-col justify-between">
      {/* Soft Ambient Glow Overlays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-indigo-500/15 via-sky-500/5 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header Bar */}
      <header className="w-full glass-panel border-b border-[var(--border-subtle)]/80 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-500/25">
              P
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 bg-clip-text text-transparent">
                PaperPulse
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="primary" size="sm">
                Go to Dashboard →
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Content Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center space-y-8">

        {/* Hero Headline */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] max-w-3xl">
          Elevate Academic Workflows &amp;{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-600 bg-clip-text text-transparent">
            Assignment Management
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed max-w-2xl font-normal">
          A modern, high-performance workspace for institutions, teachers, and students. Streamline assignment publishing, submission tracking, and real-time grading.
        </p>

        {/* Hero Action CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full justify-center">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="primary" className="w-full px-8 shadow-lg shadow-indigo-500/20 text-base">
              Sign In to Workspace
            </Button>
          </Link>
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full px-8 text-base">
              Register Account
            </Button>
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button size="lg" variant="ghost" className="w-full px-6 text-base text-slate-700">
              View Live Dashboard →
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--border-subtle)]/80 px-6 py-4 glass-panel text-center text-xs text-[var(--text-secondary)]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 PaperPulse Academic Systems. All rights reserved.</span>
          <div className="flex items-center gap-4 font-medium">
            <Link href="/login" className="hover:text-indigo-600 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-indigo-600 transition-colors">
              Register
            </Link>
            <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
