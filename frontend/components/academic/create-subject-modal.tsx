"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";

const subjectSchema = z.object({
  classId: z.string().min(1, "Please select an assigned class"),
  name: z.string().min(2, "Subject name must be at least 2 characters"),
  code: z.string().min(2, "Subject code must be at least 2 characters"),
  description: z.string().optional(),
  passMarks: z.number().min(0, "Pass marks cannot be negative"),
  teacherId: z.string().min(1, "Please select a teacher for this subject"),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

export interface ClassOption {
  id: string;
  name: string;
  code: string;
}

export interface TeacherOption {
  id: string;
  name: string;
}

interface CreateSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  classes: ClassOption[];
  teachers?: TeacherOption[];
}

export function CreateSubjectModal({
  isOpen,
  onClose,
  onSuccess,
  classes,
  teachers = [],
}: CreateSubjectModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      classId: "",
      name: "",
      code: "",
      description: "",
      passMarks: 40,
      teacherId: "",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        classId: classes.length > 0 ? classes[0].id : "",
        name: "",
        code: "",
        description: "",
        passMarks: 40,
        teacherId: teachers.length > 0 ? teachers[0].id : "",
      });
    }
  }, [isOpen, classes, teachers, reset]);

  const onSubmit = async (values: SubjectFormValues) => {
    setIsLoading(true);
    try {
      await apiClient.post("/academic/subjects", {
        classId: values.classId,
        name: values.name,
        code: values.code,
        description: values.description,
        passMarks: values.passMarks,
        teacherId: values.teacherId,
      });
      toast.success(`Subject "${values.name}" assigned to class successfully!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.title || "Failed to create subject.";
      if (!err.response || err.response.status >= 500) return;
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Subject" className="max-w-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        {/* Class Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Assigned Class <span className="text-rose-500">*</span>
          </label>
          <select
            {...register("classId")}
            className="w-full h-10 px-3 rounded-lg border border-[var(--border-subtle)] bg-white text-xs font-medium text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            {classes.length === 0 ? (
              <option value="">No classes available. Add a class first.</option>
            ) : (
              classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.code})
                </option>
              ))
            )}
          </select>
          {errors.classId && <p className="text-[11px] text-rose-500 font-medium">{errors.classId.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Subject Name"
            placeholder="Advanced Calculus"
            {...register("name")}
            error={errors.name?.message}
          />
          <Input
            label="Subject Code"
            placeholder="MATH-301"
            {...register("code")}
            error={errors.code?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Pass Marks"
            type="number"
            placeholder="40"
            {...register("passMarks", { valueAsNumber: true })}
            error={errors.passMarks?.message}
          />

          {/* Primary Teacher Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Primary Teacher <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("teacherId")}
              className="w-full h-10 px-3 rounded-lg border border-[var(--border-subtle)] bg-white text-xs font-medium text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              <option value="">Select a teacher...</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            {errors.teacherId && <p className="text-[11px] text-rose-500 font-medium">{errors.teacherId.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Description / Syllabus Overview
          </label>
          <textarea
            {...register("description")}
            rows={3}
            placeholder="Brief overview of subject content..."
            className="w-full p-3 rounded-lg border border-[var(--border-subtle)] bg-white text-xs text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
          {teachers.length === 0 && (
            <p className="text-[11px] text-amber-600 font-medium sm:mr-auto">
              No teachers available. Create a teacher user first.
            </p>
          )}
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} disabled={classes.length === 0 || teachers.length === 0}>
            Assign Subject to Class
          </Button>
        </div>
      </form>
    </Modal>
  );
}
