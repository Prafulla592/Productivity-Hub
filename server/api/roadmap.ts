import type { Express } from "express";
import { z } from "zod";
import { api } from "@shared/routes";
import { storage } from "../storage";
import { openai } from "../openai";

export function registerRoadmapRoutes(app: Express) {
  app.get(api.roadmap.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const roadmaps = await storage.getRoadmaps(req.user!.id);
    return res.json(roadmaps);
  });

  app.post(api.roadmap.generate.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const userId = req.user!.id;
    try {
      const input = api.roadmap.generate.input.parse(req.body);
      const rec = await storage.getRecommendation(input.targetCareerId);
      if (!rec || rec.userId !== userId) {
        return res.status(404).json({ message: "Recommendation not found" });
      }

      const userSkills = await storage.getUserSkills(userId);

      const prompt = `Create a step-by-step learning roadmap for becoming a ${rec.careerName}.
      The user currently has these skills: ${userSkills.map((s) => s.skillName).join(", ")}.
      The career requires these skills: ${rec.skillsRequired.join(", ")}.
      
      Output JSON with a "steps" array, where each step has:
      - stepNumber (number)
      - title (string)
      - description (string)
      - skills (array of strings, which skills will be learned in this step)
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("No response from AI");

      const parsed = JSON.parse(content);
      const steps = parsed.steps || [];

      const roadmap = await storage.createRoadmap({
        userId,
        careerName: rec.careerName,
        steps,
      });

      return res.status(201).json(roadmap);
    } catch (err) {
      console.error("AI Roadmap Error:", err);
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      return res.status(500).json({ message: "Failed to generate roadmap" });
    }
  });
}
