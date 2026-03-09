import { db, pool } from "./config/database";
import {
  users, assessments, recommendations, userSkills, roadmaps,
  type User, type InsertUser, type Assessment, type InsertAssessment,
  type Recommendation, type InsertRecommendation, type UserSkill, type InsertUserSkill,
  type Roadmap, type InsertRoadmap
} from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  markEmailAsVerified(userId: number): Promise<void>;
  setVerificationToken(userId: number, token: string): Promise<void>;
  setResetPasswordToken(userId: number, token: string, expiresAt: Date): Promise<void>;
  getUserByValidResetToken(token: string): Promise<User | undefined>;
  updateUserPassword(userId: number, password: string): Promise<void>;
  clearResetPasswordToken(userId: number): Promise<void>;

  getAssessments(userId: number): Promise<Assessment[]>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;

  getRecommendations(userId: number): Promise<Recommendation[]>;
  getRecommendation(id: number): Promise<Recommendation | undefined>;
  createRecommendation(rec: InsertRecommendation): Promise<Recommendation>;
  clearRecommendations(userId: number): Promise<void>;

  getUserSkills(userId: number): Promise<UserSkill[]>;
  addUserSkill(skill: InsertUserSkill): Promise<UserSkill>;

  getRoadmaps(userId: number): Promise<Roadmap[]>;
  createRoadmap(roadmap: InsertRoadmap): Promise<Roadmap>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.verificationToken, token));
    return user;
  }

  async markEmailAsVerified(userId: number): Promise<void> {
    await db
      .update(users)
      .set({ emailVerified: true, verificationToken: null })
      .where(eq(users.id, userId));
  }

  async setVerificationToken(userId: number, token: string): Promise<void> {
    await db.update(users).set({ verificationToken: token }).where(eq(users.id, userId));
  }

  async setResetPasswordToken(userId: number, token: string, expiresAt: Date): Promise<void> {
    await db
      .update(users)
      .set({ resetPasswordToken: token, resetPasswordExpires: expiresAt })
      .where(eq(users.id, userId));
  }

  async getUserByValidResetToken(token: string): Promise<User | undefined> {
    const now = new Date();
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.resetPasswordToken, token),
          gt(users.resetPasswordExpires, now),
        ),
      );
    return user;
  }

  async updateUserPassword(userId: number, password: string): Promise<void> {
    await db.update(users).set({ password }).where(eq(users.id, userId));
  }

  async clearResetPasswordToken(userId: number): Promise<void> {
    await db
      .update(users)
      .set({ resetPasswordToken: null, resetPasswordExpires: null })
      .where(eq(users.id, userId));
  }

  async getAssessments(userId: number): Promise<Assessment[]> {
    return await db.select().from(assessments).where(eq(assessments.userId, userId));
  }

  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    const [result] = await db.insert(assessments).values(assessment).returning();
    return result;
  }

  async getRecommendations(userId: number): Promise<Recommendation[]> {
    return await db.select().from(recommendations).where(eq(recommendations.userId, userId));
  }

  async getRecommendation(id: number): Promise<Recommendation | undefined> {
    const [rec] = await db.select().from(recommendations).where(eq(recommendations.id, id));
    return rec;
  }

  async createRecommendation(rec: InsertRecommendation): Promise<Recommendation> {
    const [result] = await db.insert(recommendations).values(rec).returning();
    return result;
  }

  async clearRecommendations(userId: number): Promise<void> {
    await db.delete(recommendations).where(eq(recommendations.userId, userId));
  }

  async getUserSkills(userId: number): Promise<UserSkill[]> {
    return await db.select().from(userSkills).where(eq(userSkills.userId, userId));
  }

  async addUserSkill(skill: InsertUserSkill): Promise<UserSkill> {
    const [result] = await db.insert(userSkills).values(skill).returning();
    return result;
  }

  async getRoadmaps(userId: number): Promise<Roadmap[]> {
    return await db.select().from(roadmaps).where(eq(roadmaps.userId, userId));
  }

  async createRoadmap(roadmap: InsertRoadmap): Promise<Roadmap> {
    const [result] = await db.insert(roadmaps).values(roadmap).returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
