import type { Express } from "express";
import type { Server } from "http";
import { setupAuth } from "./auth";
import { registerApiRoutes } from "./api";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);
  registerApiRoutes(app);
  return httpServer;
}
