"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { FileUploader, AttachmentItem } from "./file-uploader";
import { apiClient } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";

const assignmentSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters long"),
    description: z.string().min(5, "Description must be at least 5 characters long"),
    teacherAssignmentId: z.string().min(1, "Please select a class and subject allocation"),
    maxMarks: z.number().min(1, "Max marks must be greater than 0"),
    passMarks: z.number().min(1, "Pass marks must be greater than 0"),
    dueDate: z.string().min(1, "Due date and time is required"),
    allowLateSubmissions: z.boolean(),
    latePenaltyPercentage: z.number().min(0).max(100),
  })
  .refine((data) => data.passMarks <= data.maxMarks, {
    message: "Passing marks cannot exceed maximum marks",
    path: ["passMarks"],
  });

export type AssignmentFormValues = z.infer<typeof assignmentSchema>;

export interface AssignmentItem {
  id: string;
  title: string;
  description: string;
  status: "Draft" | "Published" | "Closed" | "Archived";
  maxMarks: number;
  passMarks: number;
  dueDate: string;
  allowLateSubmission?: boolean;
  allowLateSubmissions?: boolean;
  latePenaltyPercentage: number;
  teacherAssignmentId: string;
  className?: string;
  subjectName?: string;
  teacherName?: string;
  attachments?: AttachmentItem[];
}

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assignmentToEdit?: AssignmentItem | null;
}

export function AssignmentModal({
  isOpen,
  onClose,
  onSuccess,
  assignmentToEdit,
}: AssignmentModalProps) {
  const isEditing = !!assignmentToEdit;
  const [isLoading, setIsLoading] = React.useState(false);
  const [attachments, setAttachments] = React.useState<AttachmentItem[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: "",
      description: "",
      teacherAssignmentId: "018f4a2b-8910-7400-8000-000000000001",
      maxMarks: 100,
      passMarks: 40,
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16),
      allowLateSubmissions: true,
      latePenaltyPercentage: 10,
    },
  });

  const allowLate = watch("allowLateSubmissions");

  // Fetch existing assignments to extract unique teacherAllocation options
  const { data: allocationsData } = useQuery({
    queryKey: queryKeys.assignments.all({ _allocations: true }),
    queryFn: async () => {
      try {
        const response = await apiClient.get("/assignments", {
          params: { pageNumber: 1, pageSize: 100 },
        });
        const items = response.data?.data?.items as Array<{
          teacherAssignmentId: string;
          className: string;
          subjectName: string;
        }>;
        // Extract unique teacherAssignmentId + class/subject combos
        const seen = new Map<string, { label: string; value: string }>();
        items?.forEach((item) => {
          if (!seen.has(item.teacherAssignmentId)) {
            seen.set(item.teacherAssignmentId, {
              label: `${item.className} — ${item.subjectName}`,
              value: item.teacherAssignmentId,
            });
          }
        });
        return Array.from(seen.values());
      } catch {
        return [];
      }
    },
  });

  const allocationOptions = allocationsData?.length
    ? allocationsData
    : [
        { label: "Grade 10-A — Mathematics", value: "018f4a2b-8910-7400-8000-000000000001" },
        { label: "Grade 11-B — Physics Lab", value: "018f4a2b-8910-7400-8000-000000000002" },
        { label: "Grade 12-A — Organic Chemistry", value: "018f4a2b-8910-7400-8000-000000000003" },
      ];

  React.useEffect(() => {
    if (assignmentToEdit) {
      reset({
        title: assignmentToEdit.title,
        description: assignmentToEdit.description,
        teacherAssignmentId: assignmentToEdit.teacherAssignmentId || "018f4a2b-8910-7400-8000-000000000001",
        maxMarks: assignmentToEdit.maxMarks,
        passMarks: assignmentToEdit.passMarks,
        dueDate: assignmentToEdit.dueDate
          ? new Date(assignmentToEdit.dueDate).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        allowLateSubmissions: assignmentToEdit.allowLateSubmissions ?? assignmentToEdit.allowLateSubmission ?? true,
        latePenaltyPercentage: assignmentToEdit.latePenaltyPercentage,
      });
      setAttachments(assignmentToEdit.attachments || []);
    } else {
      reset({
        title: "",
        description: "",
        teacherAssignmentId: "018f4a2b-8910-7400-8000-000000000001",
        maxMarks: 100,
        passMarks: 40,
        dueDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16),
        allowLateSubmissions: true,
        latePenaltyPercentage: 10,
      });
      setAttachments([]);
    }
  }, [assignmentToEdit, reset]);

  const handleFileUpload = async (file: File) => {
    const newAttachment: AttachmentItem = {
      id: Math.random().toString(),
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      fileSize: file.size,
      contentType: file.type || "application/pdf",
      _rawFile: file,
    };
    setAttachments((prev) => [...prev, newAttachment]);
    toast.success(`Attached "${file.name}"`);
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    toast.info("Attachment removed.");
  };

  const onSubmit = async (values: AssignmentFormValues) => {
    setIsLoading(true);
    try {
      let assignmentId: string | null = null;

      if (isEditing) {
        await apiClient.put(`/assignments/${assignmentToEdit.id}`, {
          id: assignmentToEdit.id,
          title: values.title,
          description: values.description,
          maxMarks: values.maxMarks,
          passMarks: values.passMarks,
          dueDate: new Date(values.dueDate).toISOString(),
          allowLateSubmission: values.allowLateSubmissions,
          allowLateSubmissions: values.allowLateSubmissions,
          latePenaltyPercentage: values.latePenaltyPercentage,
        });
        assignmentId = assignmentToEdit.id;
        toast.success("Assignment updated successfully!");
      } else {
        const response = await apiClient.post("/assignments", {
          title: values.title,
          description: values.description,
          teacherAssignmentId: values.teacherAssignmentId,
          maxMarks: values.maxMarks,
          passMarks: values.passMarks,
          dueDate: new Date(values.dueDate).toISOString(),
          allowLateSubmission: values.allowLateSubmissions,
          allowLateSubmissions: values.allowLateSubmissions,
          latePenaltyPercentage: values.latePenaltyPercentage,
        });
        assignmentId = response.data?.data?.id;
        toast.success("Assignment authored successfully as Draft!");
      }

      // Upload new attachments that don't have a real server path
      if (assignmentId) {
        const newAttachments = attachments.filter(
          (a) => a.fileUrl && typeof a.fileUrl === "string" && a.fileUrl.startsWith("blob:")
        );
        for (const att of newAttachments) {
          try {
            if (att._rawFile) {
              const formData = new FormData();
              formData.append("file", att._rawFile);
              await apiClient.post(`/assignments/${assignmentId}/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
            }
          } catch (uploadErr: any) {
            if (!uploadErr.response || uploadErr.response.status < 500) {
              toast.error("Attachment upload failed. The assignment was saved without this file.");
            }
          }
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.title || "Failed to save assignment.";
      if (!err.response || err.response.status >= 500) return;
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Assignment Specification" : "Author New Assignment"}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <Input
          label="Assignment Title"
          placeholder="Calculus Problem Set #4 — Derivatives & Limits"
          error={errors.title?.message}
          {...register("title")}
        />

        <Select
          label="Class & Subject Allocation"
          error={errors.teacherAssignmentId?.message}
          {...register("teacherAssignmentId")}
          options={allocationOptions}
        />

        <Textarea
          label="Instructions & Evaluation Criteria"
          placeholder="Detailed description of problems, submission format, and reference materials..."
          rows={3}
          error={errors.description?.message}
          {...register("description")}
        />

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Max Marks"
            type="number"
            placeholder="100"
            error={errors.maxMarks?.message}
            {...register("maxMarks", { valueAsNumber: true })}
          />
          <Input
            label="Pass Marks"
            type="number"
            placeholder="40"
            error={errors.passMarks?.message}
            {...register("passMarks", { valueAsNumber: true })}
          />
          <Input
            label="Due Date & Time"
            type="datetime-local"
            error={errors.dueDate?.message}
            {...register("dueDate")}
          />
        </div>

        {/* Late Submission Rules */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Late Submission Rules
              </h4>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Control whether students can turn in work past the deadline.
              </p>
            </div>
            <Switch
              checked={allowLate}
              onCheckedChange={(val) => setValue("allowLateSubmissions", val)}
            />
          </div>

          {allowLate && (
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-4">
              <label className="text-xs font-semibold text-slate-700">
                Late Penalty Deduction (%):
              </label>
              <div className="w-36">
                <Input
                  type="number"
                  placeholder="10"
                  error={errors.latePenaltyPercentage?.message}
                  {...register("latePenaltyPercentage", { valueAsNumber: true })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Attachment Uploader */}
        <FileUploader
          attachments={attachments}
          onUpload={handleFileUpload}
          onRemove={handleRemoveAttachment}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEditing ? "Save Changes" : "Save Assignment Draft"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
