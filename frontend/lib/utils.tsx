import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { FileText, FileArchive, FileSpreadsheet, Bell, Clock, GraduationCap } from "lucide-react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}

export function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1) return "just now"
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function getFileIcon(type?: string, size: "sm" | "md" | "lg" = "md") {
  const className = size === "lg" ? "h-6 w-6" : size === "sm" ? "h-4 w-4" : "h-5 w-5"
  const contentType = (type || "").toLowerCase()
  if (contentType.includes("pdf")) return <FileText className={`${className} text-rose-500`} />
  if (contentType.includes("zip") || contentType.includes("compressed"))
    return <FileArchive className={`${className} text-amber-500`} />
  if (contentType.includes("sheet") || contentType.includes("excel"))
    return <FileSpreadsheet className={`${className} text-emerald-500`} />
  return <FileText className={`${className} text-indigo-500`} />
}

export function notificationIcon(type: string) {
  switch (type) {
    case "AssignmentPublished":
      return <FileText className="h-4 w-4 text-indigo-500" />
    case "DeadlineReminder":
      return <Clock className="h-4 w-4 text-amber-500" />
    case "SubmissionGraded":
      return <GraduationCap className="h-4 w-4 text-emerald-500" />
    case "SubmissionReceived":
      return <FileText className="h-4 w-4 text-sky-500" />
    default:
      return <Bell className="h-4 w-4 text-slate-500" />
  }
}
