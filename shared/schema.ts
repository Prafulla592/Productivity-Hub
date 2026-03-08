import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  educationLevel: text("education_level").notNull(),
  college: text("college"),
  city: text("city"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  careerName: text("career_name").notNull(),
  description: text("description").notNull(),
  salaryRange: text("salary_range").notNull(),
  marketDemand: text("market_demand").notNull(),
  skillsRequired: text("skills_required").array().notNull(),
  responsibilities: text("responsibilities").array().notNull(),
  exampleCompanies: text("example_companies").array().notNull(),
  matchReason: text("match_reason").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSkills = pgTable("user_skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  skillName: text("skill_name").notNull(),
});

export const roadmaps = pgTable("roadmaps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  careerName: text("career_name").notNull(),
  steps: jsonb("steps").notNull(), // Array of { stepNumber, title, description, skills }
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobMarketData = pgTable("job_market_data", {
  id: serial("id").primaryKey(),
  careerName: text("career_name").notNull().unique(),
  jobOpenings: integer("job_openings").notNull(),
  avgSalary: integer("avg_salary").notNull(),
  growthRate: text("growth_rate").notNull(), // e.g., "15% YoY"
  demandLevel: text("demand_level").notNull(), // High, Medium, Low
  topCompanies: text("top_companies").array().notNull(),
  requiredSkills: text("required_skills").array().notNull(),
  commonLocations: text("common_locations").array().notNull(),
  linkedinJobsCount: integer("linkedin_jobs_count").notNull(),
  naukriJobsCount: integer("naukri_jobs_count").notNull(),
  industryInsights: text("industry_insights"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertAssessmentSchema = createInsertSchema(assessments).omit({ id: true, createdAt: true });
export const insertRecommendationSchema = createInsertSchema(recommendations).omit({ id: true, createdAt: true });
export const insertUserSkillSchema = createInsertSchema(userSkills).omit({ id: true });
export const insertRoadmapSchema = createInsertSchema(roadmaps).omit({ id: true, createdAt: true });
export const insertJobMarketDataSchema = createInsertSchema(jobMarketData).omit({ id: true, lastUpdated: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;

export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;

export type UserSkill = typeof userSkills.$inferSelect;
export type InsertUserSkill = z.infer<typeof insertUserSkillSchema>;

export type Roadmap = typeof roadmaps.$inferSelect;
export type InsertRoadmap = z.infer<typeof insertRoadmapSchema>;

export type JobMarketData = typeof jobMarketData.$inferSelect;
export type InsertJobMarketData = z.infer<typeof insertJobMarketDataSchema>;

export type RoadmapStep = {
  stepNumber: number;
  title: string;
  description: string;
  skills: string[];
};

// API specific schemas
export const signupSchema = insertUserSchema;
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const submitAssessmentSchema = z.object({
  answers: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })),
});

export const addSkillSchema = z.object({
  skillName: z.string().min(1),
});

export const gapAnalysisRequestSchema = z.object({
  targetCareerId: z.number(),
});

export const generateRoadmapRequestSchema = z.object({
  targetCareerId: z.number(),
});
