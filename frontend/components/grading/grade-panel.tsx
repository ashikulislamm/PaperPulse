"use client";

import * as React from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScoreIndicator } from "@/components/ui/score-indicator";
import { Award, Send, CheckCircle2 } from "lucide-react";

interface GradePanelProps {
  submissionId: string;
  maxMarks: number;
  passMarks: number;
  currentScore?: number | null;
  currentStatus: string;
  onSuccess: () => void;
}

export function GradePanel({
  submissionId,
  maxMarks,
  passMarks,
  currentScore,
  currentStatus,
  onSuccess,
}: GradePanelProps) {
  const queryClient = useQueryClient();
  const [score, setScore] = React.useState<string>(currentScore?.toString() || "");
  const [comments, setComments] = React.useState("");
  const [isPrivate, setIsPrivate] = React.useState(false);

  // Reset form when submission changes
  React.useEffect(() => {
    setScore(currentScore?.toString() || "");
    setComments("");
    setIsPrivate(false);
  }, [submissionId, currentScore]);

  const gradeMutation = useMutation({
    mutationFn: async (payload: {
      submissionId: string;
      scoreObtained: number;
      comments: string;
      isPrivateFeedback: boolean;
    }) => {
      const response = await apiClient.post(
        `/grading/submissions/${payload.submissionId}/grade`,
        {
          submissionId: payload.submissionId,
          scoreObtained: payload.scoreObtained,
          comments: payload.comments,
          isPrivateFeedback: payload.isPrivateFeedback,
        }
      );
      return response.data?.data;
    },
    onSuccess: () => {
      toast.success("Submission graded successfully!");
      queryClient.invalidateQueries({
        queryKey: queryKeys.grading.detail(submissionId),
      });
      onSuccess();
    },
  });

  const handleGrade = () => {
    const scoreNum = parseFloat(score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > maxMarks) {
      toast.error(`Score must be between 0 and ${maxMarks}.`);
      return;
    }
    gradeMutation.mutate({
      submissionId,
      scoreObtained: scoreNum,
      comments,
      isPrivateFeedback: isPrivate,
    });
  };

  const isAlreadyGraded = currentStatus === "Graded" && currentScore !== null && currentScore !== undefined;

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Award className="h-4 w-4 text-indigo-600" /> Grade Submission
        </h3>
        {isAlreadyGraded && <Badge variant="graded">Already Graded</Badge>}
      </div>

      {/* Current Score Display */}
      {isAlreadyGraded && (
        <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
          <ScoreIndicator
            scoreObtained={currentScore}
            maxMarks={maxMarks}
            passMarks={passMarks}
          />
        </div>
      )}

      {/* Score Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          Score (0 — {maxMarks})
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={maxMarks}
            step={0.5}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder={`0 - ${maxMarks}`}
            className="flex h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-white/90 px-3 py-2 text-sm font-mono font-bold text-[var(--text-primary)] ring-offset-background transition-all focus-visible:outline-none focus-visible:border-[var(--border-focused)] focus-visible:ring-2 focus-visible:ring-indigo-500/20"
          />
          <span className="text-xs text-[var(--text-muted)] font-mono whitespace-nowrap">
            / {maxMarks}
          </span>
        </div>
        {score && !isNaN(parseFloat(score)) && (
          <p className="text-xs text-[var(--text-muted)]">
            {parseFloat(score) >= passMarks ? (
              <span className="text-emerald-600 font-semibold">Passing grade</span>
            ) : (
              <span className="text-rose-600 font-semibold">Below passing ({passMarks})</span>
            )}
          </p>
        )}
      </div>

      {/* Feedback Comments */}
      <Textarea
        label="Feedback Comments"
        placeholder="Provide detailed feedback on the submission quality, correctness, and areas for improvement..."
        rows={4}
        value={comments}
        onChange={(e) => setComments(e.target.value)}
      />

      {/* Private Notes Toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
        <div>
          <p className="text-xs font-bold text-slate-700">Private Teacher Note</p>
          <p className="text-[10px] text-[var(--text-muted)]">
            Only visible to teachers, not to the student
          </p>
        </div>
        <Switch
          checked={isPrivate}
          onCheckedChange={setIsPrivate}
        />
      </div>

      {/* Grade Button */}
      <Button
        variant="primary"
        className="w-full gap-2"
        isLoading={gradeMutation.isPending}
        onClick={handleGrade}
        disabled={!score || isNaN(parseFloat(score))}
      >
        <CheckCircle2 className="h-4 w-4" />
        {isAlreadyGraded ? "Update Grade" : "Submit Grade"}
      </Button>
    </Card>
  );
}
