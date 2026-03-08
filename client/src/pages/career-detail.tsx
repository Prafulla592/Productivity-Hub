import { AppLayout } from "@/components/layout";
import { useRecommendation } from "@/hooks/use-recommendations";
import { useGenerateRoadmap } from "@/hooks/use-roadmap";
import { useSkills } from "@/hooks/use-skills";
import { useParams, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, ArrowLeft, Target, Map, Building2, ListChecks, CheckCircle2, ChevronRight, Loader2, Sparkles, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { GapAnalysisResponse } from "@shared/routes";

export default function CareerDetail() {
  const { id } = useParams();
  const recId = parseInt(id || "0");
  const { data: rec, isLoading: isRecLoading } = useRecommendation(recId);
  const { performGapAnalysis, isAnalyzing } = useSkills();
  const generateRoadmap = useGenerateRoadmap();

  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysisResponse | null>(null);

  if (isRecLoading) {
    return <AppLayout><div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div></AppLayout>;
  }
  if (!rec) {
    return <AppLayout><div className="text-center py-20 text-2xl font-bold text-muted-foreground">Career not found</div></AppLayout>;
  }

  const handleGapAnalysis = async () => {
    try {
      const data = await performGapAnalysis(recId);
      setGapAnalysis(data);
    } catch (e) {
      // Error handled by hook
    }
  };

  const handleGenerateRoadmap = () => {
    generateRoadmap.mutate(recId);
  };

  return (
    <AppLayout>
      <div className="space-y-8 pb-12">
        <Button variant="ghost" className="mb-4 text-muted-foreground rounded-lg -ml-4" asChild>
          <Link href="/recommendations"><ArrowLeft className="mr-2 h-4 w-4" /> Back to matches</Link>
        </Button>

        <div className="bg-card rounded-3xl border-2 border-border p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
            <div className="max-w-3xl">
              <Badge className="bg-primary/10 text-primary border-0 rounded-lg mb-4 px-3 py-1 text-sm font-semibold">Perfect Match</Badge>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 leading-tight">
                {rec.careerName}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {rec.description}
              </p>
            </div>
            <div className="flex flex-col gap-3 min-w-[200px] w-full md:w-auto">
              <div className="bg-secondary/50 rounded-2xl p-4 border border-border text-center">
                <p className="text-sm font-medium text-muted-foreground mb-1">Expected Salary</p>
                <p className="text-2xl font-bold text-emerald-600">{rec.salaryRange}</p>
              </div>
              <div className="bg-secondary/50 rounded-2xl p-4 border border-border text-center">
                <p className="text-sm font-medium text-muted-foreground mb-1">Market Demand</p>
                <p className="text-xl font-bold text-blue-600">{rec.marketDemand}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-md">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> Key Responsibilities</h2>
              <ul className="space-y-3">
                {rec.responsibilities.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 shadow-md">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ListChecks className="h-5 w-5 text-accent" /> Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {rec.skillsRequired.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="px-3 py-1.5 rounded-lg text-sm bg-secondary hover:bg-secondary/80">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {rec.marketData && (
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/20 p-6 shadow-md">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Job Market Data</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Open Positions</span>
                    <span className="font-bold text-foreground">{rec.marketData.jobOpenings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Growth Rate</span>
                    <span className="font-bold text-emerald-600">{rec.marketData.growthRate}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">LinkedIn Jobs</span>
                    <span className="font-bold text-blue-600">{rec.marketData.linkedinJobsCount}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Naukri Jobs</span>
                    <span className="font-bold text-orange-600">{rec.marketData.naukriJobsCount}</span>
                  </div>
                  {rec.marketData.industryInsights && (
                    <div className="mt-4 p-3 bg-white/70 dark:bg-black/30 rounded-lg border border-border/50">
                      <p className="text-sm text-muted-foreground italic">{rec.marketData.industryInsights}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.2}} className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-md">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Building2 className="h-5 w-5 text-amber-500" /> Example Companies</h2>
              <div className="flex flex-wrap gap-3">
                {rec.exampleCompanies.map((company, i) => (
                  <div key={i} className="px-4 py-2 rounded-xl bg-background border border-border text-sm font-medium shadow-sm">
                    {company}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Panel */}
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border-2 border-primary/20 p-8 shadow-lg text-center relative overflow-hidden">
              <Sparkles className="absolute -top-4 -right-4 h-24 w-24 text-primary/10 rotate-12" />
              <h2 className="text-2xl font-display font-bold mb-2">Ready to transition?</h2>
              <p className="text-muted-foreground mb-8">Analyze your current skills against this role and generate a personalized roadmap.</p>
              
              <div className="space-y-4 relative z-10">
                {!gapAnalysis ? (
                  <Button 
                    size="lg" 
                    className="w-full rounded-xl h-14 text-base shadow-lg shadow-primary/20"
                    onClick={handleGapAnalysis}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing Profile...</> : <><Target className="mr-2 h-5 w-5" /> Run Skill Gap Analysis</>}
                  </Button>
                ) : (
                  <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="bg-card border border-border rounded-xl p-4 text-left shadow-sm mb-4">
                    <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground mb-3">Analysis Results</h3>
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-green-600 mb-2">Skills You Have ({gapAnalysis.skillsYouHave.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {gapAnalysis.skillsYouHave.map(s => <Badge key={s} variant="outline" className="bg-green-50 text-green-700 border-green-200">{s}</Badge>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-destructive mb-2">Skills To Learn ({gapAnalysis.skillsYouNeed.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {gapAnalysis.skillsYouNeed.map(s => <Badge key={s} variant="outline" className="bg-red-50 text-red-700 border-red-200">{s}</Badge>)}
                      </div>
                    </div>
                  </motion.div>
                )}

                <Button 
                  size="lg" 
                  className={`w-full rounded-xl h-14 text-base ${gapAnalysis ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:opacity-90' : 'bg-background text-foreground border-2 border-border hover:bg-secondary'}`}
                  onClick={handleGenerateRoadmap}
                  disabled={generateRoadmap.isPending}
                >
                  {generateRoadmap.isPending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Crafting Learning Path...</> : <><Map className="mr-2 h-5 w-5" /> Generate Action Plan Roadmap</>}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
