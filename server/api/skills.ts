import type { Express } from "express";
import { z } from "zod";
import { api } from "@shared/routes";
import { storage } from "../storage";

export function registerSkillsRoutes(app: Express) {
  app.get(api.skills.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const skills = await storage.getUserSkills(req.user!.id);
    return res.json(skills);
  });

  app.post(api.skills.add.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    try {
      const input = api.skills.add.input.parse(req.body);
      const skill = await storage.addUserSkill({
        userId: req.user!.id,
        skillName: input.skillName,
      });
      return res.status(201).json(skill);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.skills.gapAnalysis.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    try {
      const input = api.skills.gapAnalysis.input.parse(req.body);
      const rec = await storage.getRecommendation(input.targetCareerId);
      if (!rec || rec.userId !== req.user!.id) {
        return res.status(404).json({ message: "Recommendation not found" });
      }

      const userSkills = await storage.getUserSkills(req.user!.id);
      const userSkillNames = userSkills.map((s) => s.skillName.toLowerCase());

      const skillsYouHave = rec.skillsRequired.filter((s) =>
        userSkillNames.some((u) => s.toLowerCase().includes(u) || u.includes(s.toLowerCase()))
      );

      const skillsYouNeed = rec.skillsRequired.filter((s) => !skillsYouHave.includes(s));

      return res.json({
        skillsYouHave,
        skillsYouNeed,
      });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      return res.status(500).json({ message: "Internal server error" });
    }
  });
}
