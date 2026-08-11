"use client";

import * as React from "react";
import { FileText, UploadCloud, X, Download, FileArchive, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AttachmentItem {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
  _rawFile?: File;
}

interface FileUploaderProps {
  attachments: AttachmentItem[];
  onUpload: (file: File) => void;
  onRemove: (attachmentId: string) => void;
  isUploading?: boolean;
}

export function FileUploader({
  attachments,
  onUpload,
  onRemove,
  isUploading = false,
}: FileUploaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileIcon = (type?: string) => {
    const contentType = (type || "").toLowerCase();
    if (contentType.includes("pdf")) return <FileText className="h-5 w-5 text-rose-500" />;
    if (contentType.includes("zip") || contentType.includes("compressed"))
      return <FileArchive className="h-5 w-5 text-amber-500" />;
    if (contentType.includes("sheet") || contentType.includes("excel"))
      return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
    return <FileText className="h-5 w-5 text-indigo-500" />;
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold tracking-wide text-[var(--text-secondary)] uppercase">
        Material Attachments (PDF, DOCX, ZIP)
      </label>

      {/* Upload Drag & Drop Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-[var(--border-subtle)] hover:border-indigo-500/50 bg-slate-50/60 hover:bg-indigo-50/20 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group"
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.doc,.zip,.rar,.txt"
          onChange={handleFileChange}
        />
        <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
          <UploadCloud className="h-5 w-5" />
        </div>
        <p className="text-xs font-semibold text-slate-800">
          Click to upload <span className="font-normal text-slate-500">or drag &amp; drop files</span>
        </p>
        <p className="text-[10px] text-[var(--text-muted)] mt-1">
          Supports PDF, DOCX, ZIP up to 25MB
        </p>
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2 pt-1">
          {attachments.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-subtle)] bg-white shadow-2xs hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                {getFileIcon(file.contentType || (file as any).mimeType || file.fileName)}
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                    {file.fileName}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    {formatFileSize(file.fileSize)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                  title="Download File"
                >
                  <Download className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => onRemove(file.id)}
                  className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Remove Attachment"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
