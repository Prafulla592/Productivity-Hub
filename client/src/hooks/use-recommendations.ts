import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type Recommendation } from "@shared/schema";

export function useRecommendations() {
  return useQuery<Recommendation[]>({
    queryKey: [api.recommendations.get.path],
    queryFn: async () => {
      const res = await fetch(api.recommendations.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      return res.json();
    },
  });
}

export function useRecommendation(id: number) {
  return useQuery<Recommendation>({
    queryKey: [api.recommendations.getById.path, id],
    queryFn: async () => {
      const url = buildUrl(api.recommendations.getById.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) throw new Error("Recommendation not found");
      if (!res.ok) throw new Error("Failed to fetch recommendation");
      return res.json();
    },
    enabled: !!id,
  });
}
