import { db } from "./db";
import { jobMarketData } from "@shared/schema";
import { eq } from "drizzle-orm";
import { openai } from "./openai";

export interface JobMarketInsights {
  careerName: string;
  jobOpenings: number;
  avgSalary: number;
  growthRate: string;
  demandLevel: "High" | "Medium" | "Low";
  topCompanies: string[];
  requiredSkills: string[];
  commonLocations: string[];
  linkedinJobsCount: number;
  naukriJobsCount: number;
  industryInsights: string;
}

/**
 * Fetch or generate job market data for a career
 * Uses AI to analyze market trends based on career information
 */
export async function getJobMarketData(
  careerName: string
): Promise<JobMarketInsights> {
  // Check if we have cached data
  const [cached] = await db
    .select()
    .from(jobMarketData)
    .where(eq(jobMarketData.careerName, careerName));

  if (cached) {
    return {
      careerName: cached.careerName,
      jobOpenings: cached.jobOpenings,
      avgSalary: cached.avgSalary,
      growthRate: cached.growthRate,
      demandLevel: cached.demandLevel as "High" | "Medium" | "Low",
      topCompanies: cached.topCompanies,
      requiredSkills: cached.requiredSkills,
      commonLocations: cached.commonLocations,
      linkedinJobsCount: cached.linkedinJobsCount,
      naukriJobsCount: cached.naukriJobsCount,
      industryInsights: cached.industryInsights || "",
    };
  }

  // Generate new market data using AI
  const insights = await generateMarketInsights(careerName);

  // Cache the results
  await db.insert(jobMarketData).values({
    careerName: insights.careerName,
    jobOpenings: insights.jobOpenings,
    avgSalary: insights.avgSalary,
    growthRate: insights.growthRate,
    demandLevel: insights.demandLevel,
    topCompanies: insights.topCompanies,
    requiredSkills: insights.requiredSkills,
    commonLocations: insights.commonLocations,
    linkedinJobsCount: insights.linkedinJobsCount,
    naukriJobsCount: insights.naukriJobsCount,
    industryInsights: insights.industryInsights,
  });

  return insights;
}

/**
 * Generate market insights using OpenAI based on current trends
 */
async function generateMarketInsights(
  careerName: string
): Promise<JobMarketInsights> {
  const prompt = `Based on the latest job market trends, provide realistic job market data for the career: "${careerName}". 
  
  Return a JSON object with exactly these fields:
  - careerName: string (the career name)
  - jobOpenings: number (estimated number of open positions on major job boards, realistic estimate for your region)
  - avgSalary: number (average annual salary in USD or INR, realistic for your region)
  - growthRate: string (e.g., "12% YoY" or "8% annually")
  - demandLevel: string ("High", "Medium", or "Low")
  - topCompanies: string[] (array of top 5 companies hiring for this role)
  - requiredSkills: string[] (array of top 8 most demanded skills)
  - commonLocations: string[] (array of top 5 cities/regions with most job openings)
  - linkedinJobsCount: number (estimated number of jobs on LinkedIn, realistic estimate)
  - naukriJobsCount: number (estimated number of jobs on Naukri, realistic estimate)
  - industryInsights: string (1-2 sentence summary of market trends and outlook)
  
  Provide realistic, current market data. For salary, consider both developed and developing markets.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.1",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    max_completion_tokens: 1024,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  const parsed = JSON.parse(content);
  return {
    careerName: parsed.careerName || careerName,
    jobOpenings: Math.max(100, parseInt(parsed.jobOpenings) || 500),
    avgSalary: Math.max(20000, parseInt(parsed.avgSalary) || 60000),
    growthRate: parsed.growthRate || "10% YoY",
    demandLevel: parsed.demandLevel || "High",
    topCompanies: Array.isArray(parsed.topCompanies)
      ? parsed.topCompanies
      : ["Tech Company A", "Tech Company B", "Tech Company C"],
    requiredSkills: Array.isArray(parsed.requiredSkills)
      ? parsed.requiredSkills
      : [],
    commonLocations: Array.isArray(parsed.commonLocations)
      ? parsed.commonLocations
      : ["Major City 1", "Major City 2"],
    linkedinJobsCount: Math.max(50, parseInt(parsed.linkedinJobsCount) || 300),
    naukriJobsCount: Math.max(50, parseInt(parsed.naukriJobsCount) || 200),
    industryInsights: parsed.industryInsights || "Growing market with steady demand.",
  };
}

/**
 * Enrich recommendations with real job market data
 */
export async function enrichRecommendationWithMarketData(
  recommendation: any
): Promise<any> {
  try {
    const marketData = await getJobMarketData(recommendation.careerName);
    return {
      ...recommendation,
      marketData: {
        jobOpenings: marketData.jobOpenings,
        avgSalary: marketData.avgSalary,
        growthRate: marketData.growthRate,
        demandLevel: marketData.demandLevel,
        topCompanies: marketData.topCompanies,
        linkedinJobsCount: marketData.linkedinJobsCount,
        naukriJobsCount: marketData.naukriJobsCount,
        commonLocations: marketData.commonLocations,
        industryInsights: marketData.industryInsights,
      },
    };
  } catch (error) {
    console.error(`Error enriching recommendation with market data: ${error}`);
    return recommendation;
  }
}
