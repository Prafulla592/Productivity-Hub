import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type AssessmentInput = {
  answers: { question: string; answer: string }[];
};

export function useAssessment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: assessments, isLoading } = useQuery({
    queryKey: [api.assessment.get.path],
    queryFn: async () => {
      const res = await fetch(api.assessment.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch assessment");
      return res.json();
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: AssessmentInput) => {
      const res = await fetch(api.assessment.submit.path, {
        method: api.assessment.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit assessment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.assessment.get.path] });
      toast({ title: "Assessment complete!", description: "We are generating your recommendations." });
      // After submission, trigger recommendations generation
      generateRecommendationsMutation.mutate();
    },
    onError: (error: Error) => {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
    }
  });

  const generateRecommendationsMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(api.recommendations.generate.path, {
        method: api.recommendations.generate.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate recommendations");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.recommendations.get.path] });
      toast({ title: "Recommendations ready!", description: "Your AI-powered career paths have been generated." });
      setLocation("/recommendations");
    }
  });

  return {
    assessments,
    isLoading,
    submit: submitMutation.mutate,
    isSubmitting: submitMutation.isPending || generateRecommendationsMutation.isPending,
  };
}
