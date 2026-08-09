"use client";

import * as React from "react";
import { UploadCloud, FileText, FileArchive, FileSpreadsheet, X, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SelectedFile {
  file: File;
  name: string;
  size: number;
  type: string;
}

interface StudentFileUploaderProps {
  selectedFile: SelectedFile | null;
  onSelectFile: (file: SelectedFile | null) => void;
  maxSizeMB?: number;
}

export function StudentFileUploader({
  selectedFile,
  onSelectFile,
  maxSizeMB = 25,
}: StudentFileUploaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    // Check file size
    if (file.size > maxSizeBytes) {
      setErrorMessage(`File exceeds maximum size limit of ${maxSizeMB}MB.`);
      return;
    }

    // Check file extension
    const allowedExtensions = [".pdf", ".docx", ".doc", ".zip", ".rar", ".txt"];
    const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      setErrorMessage(`Invalid file type. Allowed formats: PDF, DOCX, ZIP.`);
      return;
    }

    onSelectFile({
      file,
      name: file.name,
      size: file.size,
      type: file.type || "application/pdf",
    });
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.includes("pdf")) return <FileText className="h-6 w-6 text-rose-500" />;
    if (contentType.includes("zip") || contentType.includes("compressed"))
      return <FileArchive className="h-6 w-6 text-amber-500" />;
    return <FileText className="h-6 w-6 text-indigo-500" />;
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
        Upload Solution File (PDF, DOCX, ZIP)
      </label>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!selectedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[var(--border-subtle)] hover:border-indigo-500 bg-slate-50/60 hover:bg-indigo-50/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group"
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.doc,.zip,.rar,.txt"
            onChange={handleFileChange}
          />
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
            <UploadCloud className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-slate-800">
            Click to upload <span className="font-normal text-slate-500">or drag &amp; drop</span>
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Accepted formats: PDF, DOCX, ZIP (Max {maxSizeMB}MB)
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="p-2.5 rounded-xl bg-white shadow-2xs shrink-0">
              {getFileIcon(selectedFile.type)}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold text-slate-900 truncate">
                {selectedFile.name}
              </span>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                <span>{formatFileSize(selectedFile.size)}</span>
                <span>•</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Ready for submission
                </span>
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            onClick={() => onSelectFile(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
