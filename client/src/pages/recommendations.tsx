import { AppLayout } from "@/components/layout";
import { useRecommendations } from "@/hooks/use-recommendations";
import { motion } from "framer-motion";
import { Briefcase, ArrowRight, DollarSign, TrendingUp, Search } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Recommendations() {
  const { data: recommendations, isLoading } = useRecommendations();
  const [search, setSearch] = useState("");

  const filtered = recommendations?.filter(r => 
    r.careerName.toLowerCase().includes(search.toLowerCase()) || 
    r.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <Briefcase className="h-6 w-6" />
              </div>
              Career Matches
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              AI-generated career paths tailored to your assessment profile.
            </p>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search careers..." 
              className="pl-10 h-12 rounded-xl bg-card border-2"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-card/50 rounded-3xl border-2 border-border animate-pulse" />
            ))}
          </div>
        ) : filtered && filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((rec, i) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border-2 border-border/60 hover:border-primary/50 shadow-lg shadow-black/5 rounded-3xl p-6 flex flex-col group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-4">
                  <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-0 rounded-lg mb-3">Top Match</Badge>
                  <h3 className="text-2xl font-bold font-display text-foreground group-hover:text-primary transition-colors leading-tight">
                    {rec.careerName}
                  </h3>
                </div>
                
                <p className="text-muted-foreground text-sm flex-1 mb-6 leading-relaxed line-clamp-3">
                  {rec.description}
                </p>

                <div className="space-y-3 mb-6 bg-secondary/30 p-4 rounded-2xl">
                  <div className="flex items-center text-sm font-medium text-foreground">
                    <DollarSign className="h-4 w-4 mr-2 text-emerald-500" /> 
                    {rec.salaryRange}
                  </div>
                  <div className="flex items-center text-sm font-medium text-foreground">
                    <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                    Demand: {rec.marketDemand}
                  </div>
                  {rec.marketData && (
                    <>
                      <div className="flex items-center text-sm font-medium text-foreground pt-2 border-t border-border/30">
                        <Briefcase className="h-4 w-4 mr-2 text-purple-500" />
                        {rec.marketData.jobOpenings.toLocaleString()} openings
                      </div>
                      <div className="text-xs text-muted-foreground">
                        📊 {rec.marketData.linkedinJobsCount} LinkedIn | 💼 {rec.marketData.naukriJobsCount} Naukri
                      </div>
                    </>
                  )}
                </div>

                <Button className="w-full rounded-xl shadow-md group-hover:shadow-primary/20 transition-all" asChild>
                  <Link href={`/recommendations/${rec.id}`}>
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-card rounded-3xl border-2 border-dashed">
            <Briefcase className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">No recommendations found</h2>
            <p className="text-muted-foreground mb-6">Complete the assessment to generate personalized career matches.</p>
            <Button size="lg" className="rounded-xl shadow-lg" asChild>
              <Link href="/assessment">Take Assessment</Link>
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
