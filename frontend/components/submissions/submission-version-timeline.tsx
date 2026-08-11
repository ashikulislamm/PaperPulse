"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FileText, Download, Clock, History, AlertTriangle, CheckCircle2, MessageSquare } from "lucide-react";

export interface SubmissionVersionItem {
  id: string;
  versionNumber: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
  comments?: string;
  submittedAt: string;
  isLate: boolean;
  latePenaltyDeduction?: number;
  status: string;
}

interface SubmissionVersionTimelineProps {
  versions: SubmissionVersionItem[];
}

export function SubmissionVersionTimeline({ versions }: SubmissionVersionTimelineProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);

  if (versions.length === 0) {
    return (
      <Card className="p-6 sm:p-8 text-center glass-card border border-dashed border-slate-200">
        <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <History className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">No Submission History Yet</h4>
        <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
          Upload your solution file and submit your work to generate Version 1 on the timeline.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-indigo-600" />
          <h3 className="text-base font-extrabold text-slate-900">Submission Version History</h3>
        </div>
        <Badge variant="primary">{versions.length} Version{versions.length > 1 ? "s" : ""}</Badge>
      </div>

      {/* Timeline Feed */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {sortedVersions.map((v, index) => {
          const isLatest = index === 0;
          return (
            <div key={v.id} className="relative group">
              {/* Timeline Bullet Node */}
              <div
                className={`absolute -left-6 top-1.5 h-5 w-5 rounded-full border-2 flex items-center justify-center bg-white transition-transform ${
                  isLatest
                    ? "border-indigo-600 text-indigo-600 shadow-xs ring-4 ring-indigo-50"
                    : "border-slate-300 text-slate-400"
                }`}
              >
                <div className={`h-2 w-2 rounded-full ${isLatest ? "bg-indigo-600" : "bg-slate-300"}`} />
              </div>

              {/* Version Detail Card */}
              <Card className={`p-5 transition-all ${isLatest ? "glass-card border-indigo-200/80 shadow-md" : "border-slate-200/80 opacity-90 hover:opacity-100"}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-extrabold text-indigo-600 font-mono">
                      Version {v.versionNumber}
                    </span>
                    {isLatest && <Badge variant="published">Active Revision</Badge>}
                    {v.isLate ? (
                      <Badge variant="overdue" dot>
                        Late Submitted (-{v.latePenaltyDeduction || 10}%)
                      </Badge>
                    ) : (
                      <Badge variant="success" dot>
                        On Time
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{new Date(v.submittedAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Submitted Comments / Notes */}
                {v.comments && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <MessageSquare className="h-3.5 w-3.5 text-slate-400" /> Student Notes:
                    </div>
                    <p className="leading-relaxed italic">&ldquo;{v.comments}&rdquo;</p>
                  </div>
                )}

                {/* File Attachment Footer */}
                <div className="mt-3 pt-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {v.fileName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {formatFileSize(v.fileSize)}
                      </span>
                    </div>
                  </div>

                  <a
                    href={v.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition-colors shadow-2xs shrink-0 flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <Download className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Download</span>
                  </a>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
