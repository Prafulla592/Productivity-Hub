import type { Express } from "express";
import { z } from "zod";
import { api } from "@shared/routes";
import { storage } from "../storage";

export function registerAssessmentRoutes(app: Express) {
  app.post(api.assessment.submit.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    try {
      const input = api.assessment.submit.input.parse(req.body);
      const userId = req.user!.id;

      for (const ans of input.answers) {
        await storage.createAssessment({
          userId,
          question: ans.question,
          answer: ans.answer,
        });
      }

      return res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.assessment.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const assessments = await storage.getAssessments(req.user!.id);
    return res.json(assessments);
  });
}
