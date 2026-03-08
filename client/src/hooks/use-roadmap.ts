import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type Roadmap } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function useRoadmaps() {
  return useQuery<Roadmap[]>({
    queryKey: [api.roadmap.get.path],
    queryFn: async () => {
      const res = await fetch(api.roadmap.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch roadmaps");
      return res.json();
    },
  });
}

export function useGenerateRoadmap() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (targetCareerId: number) => {
      const res = await fetch(api.roadmap.generate.path, {
        method: api.roadmap.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetCareerId }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate roadmap");
      return res.json() as Promise<Roadmap>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.roadmap.get.path] });
      toast({ title: "Roadmap Generated!", description: "Your personalized learning path is ready." });
      setLocation(`/roadmaps`);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to generate roadmap", description: error.message, variant: "destructive" });
    }
  });
}
