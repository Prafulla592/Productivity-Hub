import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { api } from "@shared/routes";
import { z } from "zod";
import { openai } from "./openai";
import { insertRecommendationSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  // Auth routes
  app.post(api.auth.signup.path, async (req, res, next) => {
    try {
      const input = api.auth.signup.input.parse(req.body);
      const existingUser = await storage.getUserByEmail(input.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const { scrypt, randomBytes } = await import("crypto");
      const { promisify } = await import("util");
      const scryptAsync = promisify(scrypt);
      const salt = randomBytes(16).toString("hex");
      const buf = (await scryptAsync(input.password, salt, 64)) as Buffer;
      const hashedPassword = `${buf.toString("hex")}.${salt}`;
      
      const user = await storage.createUser({ ...input, password: hashedPassword });
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      next(err);
    }
  });

  app.post(api.auth.login.path, (req, res, next) => {
    const passport = require("passport");
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Login failed" });
      }
      req.login(user, (err: any) => {
        if (err) return next(err);
        res.json(user);
      });
    })(req, res, next);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ success: true });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });

  // Assessment routes
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
      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.assessment.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const assessments = await storage.getAssessments(req.user!.id);
    res.json(assessments);
  });

  // Recommendation routes
  app.get(api.recommendations.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const recs = await storage.getRecommendations(req.user!.id);
    res.json(recs);
  });

  app.get(api.recommendations.getById.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const id = parseInt(req.params.id);
    const rec = await storage.getRecommendation(id);
    if (!rec || rec.userId !== req.user!.id) {
      return res.status(404).json({ message: "Recommendation not found" });
    }
    res.json(rec);
  });

  app.post(api.recommendations.generate.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const userId = req.user!.id;
    
    try {
      const assessments = await storage.getAssessments(userId);
      const userSkills = await storage.getUserSkills(userId);
      
      const prompt = `Based on the following user assessment and skills, suggest the top 5 career paths for them.
      
      Assessments: ${JSON.stringify(assessments)}
      Skills: ${JSON.stringify(userSkills.map(s => s.skillName))}
      
      Format the output as a JSON array of objects with the following keys:
      - careerName (string)
      - description (string)
      - salaryRange (string, e.g. '₹6L - ₹15L per year' or '$60k - $120k')
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
        savedRecs.push(saved);
      }
      
      res.json(savedRecs);
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // Skills routes
  app.get(api.skills.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const skills = await storage.getUserSkills(req.user!.id);
    res.json(skills);
  });

  app.post(api.skills.add.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    try {
      const input = api.skills.add.input.parse(req.body);
      const skill = await storage.addUserSkill({
        userId: req.user!.id,
        skillName: input.skillName,
      });
      res.status(201).json(skill);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Internal server error" });
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
      const userSkillNames = userSkills.map(s => s.skillName.toLowerCase());
      
      const skillsYouHave = rec.skillsRequired.filter(s => 
        userSkillNames.some(u => s.toLowerCase().includes(u) || u.includes(s.toLowerCase()))
      );
      
      const skillsYouNeed = rec.skillsRequired.filter(s => !skillsYouHave.includes(s));
      
      res.json({
        skillsYouHave,
        skillsYouNeed,
      });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Roadmap routes
  app.get(api.roadmap.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const roadmaps = await storage.getRoadmaps(req.user!.id);
    res.json(roadmaps);
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
      The user currently has these skills: ${userSkills.map(s => s.skillName).join(", ")}.
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

      res.status(201).json(roadmap);
    } catch (err) {
      console.error("AI Roadmap Error:", err);
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to generate roadmap" });
    }
  });

  return httpServer;
}
