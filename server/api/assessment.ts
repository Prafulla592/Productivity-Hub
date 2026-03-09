import type { Express } from "express";
import { z } from "zod";
import { api } from "@shared/routes";
import { storage } from "../storage";
import { openai } from "../openai";
import { enrichRecommendationWithMarketData } from "../jobMarketService";

/**
 * Assessment Routes
 *
 * Handles:
 * - submitting assessment answers
 * - retrieving saved assessments
 *
 * IMPORTANT CHANGE:
 * After submitting assessment answers, we now automatically
 * generate career recommendations using OpenAI.
 */

export function registerAssessmentRoutes(app: Express) {

  /**
   * Submit assessment answers
   */
  app.post(api.assessment.submit.path, async (req, res) => {

    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const input = api.assessment.submit.input.parse(req.body);
      const userId = req.user!.id;

      /**
       * Save each assessment answer
       */
      for (const ans of input.answers) {
        await storage.createAssessment({
          userId,
          question: ans.question,
          answer: ans.answer,
        });
      }

      /**
       * Fetch saved assessments + skills
       * These will be used to generate recommendations
       */
      const assessments = await storage.getAssessments(userId);
      const userSkills = await storage.getUserSkills(userId);

      /**
       * Create prompt for AI
       */
      const prompt = `Based on the following user assessment and skills, suggest the top 5 career paths.

Assessments: ${JSON.stringify(assessments)}

Skills: ${JSON.stringify(userSkills.map((s) => s.skillName))}

Return JSON array with fields:
careerName
description
salaryRange
marketDemand
skillsRequired
responsibilities
exampleCompanies
matchReason
`;

      /**
       * Call OpenAI to generate recommendations
       */
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      });

      const content = response.choices[0].message.content;

      if (!content) {
        throw new Error("AI returned empty response");
      }

      const generatedRecs = JSON.parse(content);

      /**
       * Remove old recommendations
       */
      await storage.clearRecommendations(userId);

      /**
       * Save new recommendations
       */
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

      /**
       * Return recommendations immediately
       */
      return res.json({
        success: true,
        recommendations: savedRecs,
      });

    } catch (err) {

      console.error("Assessment Error:", err);

      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }

      return res.status(500).json({
        message: "Failed to process assessment",
      });
    }
  });


  /**
   * Get user assessments
   */
  app.get(api.assessment.get.path, async (req, res) => {

    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const assessments = await storage.getAssessments(req.user!.id);

    return res.json(assessments);
  });

}