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

const classSchema = z.object({
  name: z.string().min(2, "Class name must be at least 2 characters"),
  code: z.string().min(2, "Class code must be at least 2 characters"),
  maxCapacity: z.number().min(1, "Max capacity must be at least 1"),
});

type ClassFormValues = z.infer<typeof classSchema>;

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateClassModal({ isOpen, onClose, onSuccess }: CreateClassModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: "",
      code: "",
      maxCapacity: 40,
    },
  });

  React.useEffect(() => {
    if (!isOpen) {
      reset({ name: "", code: "", maxCapacity: 40 });
    }
  }, [isOpen, reset]);

  const onSubmit = async (values: ClassFormValues) => {
    setIsLoading(true);
    try {
      await apiClient.post("/academic/classes", {
        name: values.name,
        code: values.code,
        maxCapacity: values.maxCapacity,
      });
      toast.success(`Academic Class "${values.name}" created successfully!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.title || "Failed to create class.";
      if (!err.response || err.response.status >= 500) return;
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Independent Academic Class" className="max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <Input
          label="Class Name"
          placeholder="Grade 11 - Section B"
          {...register("name")}
          error={errors.name?.message}
        />
        <Input
          label="Class Code"
          placeholder="G11-B"
          {...register("code")}
          error={errors.code?.message}
        />
        <Input
          label="Max Student Capacity"
          type="number"
          placeholder="40"
          {...register("maxCapacity", { valueAsNumber: true })}
          error={errors.maxCapacity?.message}
        />

        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Create Class
          </Button>
        </div>
      </form>
    </Modal>
  );
}
