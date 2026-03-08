import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type GapAnalysisResponse } from "@shared/routes";
import { type UserSkill } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useSkills() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: skills, isLoading } = useQuery<UserSkill[]>({
    queryKey: [api.skills.get.path],
    queryFn: async () => {
      const res = await fetch(api.skills.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch skills");
      return res.json();
    },
  });

  const addSkillMutation = useMutation({
    mutationFn: async (skillName: string) => {
      const res = await fetch(api.skills.add.path, {
        method: api.skills.add.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillName }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add skill");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.skills.get.path] });
      toast({ title: "Skill added!" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add skill", description: error.message, variant: "destructive" });
    }
  });

  const gapAnalysisMutation = useMutation<GapAnalysisResponse, Error, number>({
    mutationFn: async (targetCareerId: number) => {
      const res = await fetch(api.skills.gapAnalysis.path, {
        method: api.skills.gapAnalysis.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetCareerId }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to perform gap analysis");
      return res.json();
    }
  });

  return {
    skills,
    isLoading,
    addSkill: addSkillMutation.mutate,
    isAddingSkill: addSkillMutation.isPending,
    performGapAnalysis: gapAnalysisMutation.mutateAsync,
    isAnalyzing: gapAnalysisMutation.isPending,
  };
}
