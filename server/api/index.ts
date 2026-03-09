import type { Express } from "express";
import { registerAuthRoutes } from "./auth";
import { registerAssessmentRoutes } from "./assessment";
import { registerRecommendationRoutes } from "./recommendations";
import { registerSkillsRoutes } from "./skills";
import { registerRoadmapRoutes } from "./roadmap";
import { registerJobMarketRoutes } from "./job-market";

export function registerApiRoutes(app: Express) {
  registerAuthRoutes(app);
  registerAssessmentRoutes(app);
  registerRecommendationRoutes(app);
  registerSkillsRoutes(app);
  registerRoadmapRoutes(app);
  registerJobMarketRoutes(app);
}
