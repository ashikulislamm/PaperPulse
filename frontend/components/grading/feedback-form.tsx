"use client";

import * as React from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MessageSquare, Send } from "lucide-react";

interface FeedbackFormProps {
  submissionId: string;
  onSuccess: () => void;
}

export function FeedbackForm({ submissionId, onSuccess }: FeedbackFormProps) {
  const queryClient = useQueryClient();
  const [comment, setComment] = React.useState("");
  const [isPrivate, setIsPrivate] = React.useState(false);

  const feedbackMutation = useMutation({
    mutationFn: async (payload: {
      submissionId: string;
      comments: string;
      isPrivate: boolean;
    }) => {
      const response = await apiClient.post(
        `/grading/submissions/${payload.submissionId}/feedback`,
        {
          submissionId: payload.submissionId,
          comments: payload.comments,
          isPrivate: payload.isPrivate,
        }
      );
      return response.data?.data;
    },
    onSuccess: () => {
      toast.success("Feedback added successfully!");
      setComment("");
      setIsPrivate(false);
      queryClient.invalidateQueries({
        queryKey: queryKeys.grading.detail(submissionId),
      });
      onSuccess();
    },
  });

  const handleSubmit = () => {
    if (!comment.trim()) {
      toast.error("Please enter a feedback comment.");
      return;
    }
    feedbackMutation.mutate({
      submissionId,
      comments: comment.trim(),
      isPrivate,
    });
  };

  return (
    <Card className="p-5 space-y-4">
      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-indigo-600" /> Add Feedback
      </h3>

      <Textarea
        label="Feedback Comment"
        placeholder="Write additional feedback, suggestions, or notes for the student..."
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
        <div>
          <p className="text-xs font-bold text-slate-700">Private Note</p>
          <p className="text-[10px] text-[var(--text-muted)]">
            Only visible to teachers
          </p>
        </div>
        <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
      </div>

      <Button
        variant="outline"
        className="w-full gap-2 border-indigo-200 text-indigo-700"
        isLoading={feedbackMutation.isPending}
        onClick={handleSubmit}
        disabled={!comment.trim()}
      >
        <Send className="h-4 w-4" /> Add Feedback
      </Button>
    </Card>
  );
}
