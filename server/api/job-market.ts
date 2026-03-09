import type { Express } from "express";
import { getJobMarketData } from "../jobMarketService";

export function registerJobMarketRoutes(app: Express) {
  app.get("/api/job-market/:careerName", async (req, res) => {
    try {
      const careerName = decodeURIComponent(req.params.careerName);
      const marketData = await getJobMarketData(careerName);
      return res.json(marketData);
    } catch (error) {
      console.error("Error fetching job market data:", error);
      return res.status(500).json({ message: "Failed to fetch job market data" });
    }
  });
}
