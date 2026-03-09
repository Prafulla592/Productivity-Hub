import type { Express } from "express";
import { api } from "@shared/routes";
import { storage } from "../storage";
import { openai } from "../openai";
import { enrichRecommendationWithMarketData } from "../jobMarketService";

export function registerRecommendationRoutes(app: Express) {
  app.get(api.recommendations.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const recs = await storage.getRecommendations(req.user!.id);
    const enriched = await Promise.all(recs.map(enrichRecommendationWithMarketData));
    return res.json(enriched);
  });

  app.get(api.recommendations.getById.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const id = parseInt(req.params.id);
    const rec = await storage.getRecommendation(id);
    if (!rec || rec.userId !== req.user!.id) {
      return res.status(404).json({ message: "Recommendation not found" });
    }
    const enriched = await enrichRecommendationWithMarketData(rec);
    return res.json(enriched);
  });

  app.post(api.recommendations.generate.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const userId = req.user!.id;

    try {
      const assessments = await storage.getAssessments(userId);
      const userSkills = await storage.getUserSkills(userId);

      const prompt = `Based on the following user assessment and skills, suggest the top 5 career paths for them.
      
      Assessments: ${JSON.stringify(assessments)}
      Skills: ${JSON.stringify(userSkills.map((s) => s.skillName))}
      
      Format the output as a JSON array of objects with the following keys:
      - careerName (string)
      - description (string)
      - salaryRange (string, e.g. '??L - ??5L per year' or '$60k - $120k')
      - marketDemand (string, 'Low', 'Medium', or 'High')
      - skillsRequired (array of strings)
      - responsibilities (array of strings)
      - exampleCompanies (array of strings)
      - matchReason (string, why this is a good fit for the user)
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("No response from AI");

      const parsed = JSON.parse(content);
      const generatedRecs = Array.isArray(parsed) ? parsed : (parsed.careers || parsed.recommendations || []);

      await storage.clearRecommendations(userId);

      const savedRecs = [];
      for (const rec of generatedRecs) {
        const saved = await storage.createRecommendation({
          userId,
          careerName: rec.careerName || "Unknown Career",
          description: rec.description || "",
          salaryRange: rec.salaryRange || "",
          marketDemand: rec.marketDemand || "Medium",
          skillsRequired: rec.skillsRequired || [],
          responsibilities: rec.responsibilities || [],
          exampleCompanies: rec.exampleCompanies || [],
          matchReason: rec.matchReason || "",
        });
        const enriched = await enrichRecommendationWithMarketData(saved);
        savedRecs.push(enriched);
      }

      return res.json(savedRecs);
    } catch (error) {
      console.error("AI Error:", error);
      return res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });
}
