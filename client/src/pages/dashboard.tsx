import { AppLayout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useRecommendations } from "@/hooks/use-recommendations";
import { useRoadmaps } from "@/hooks/use-roadmap";
import { motion } from "framer-motion";
import { Briefcase, Target, Map, ArrowRight, Zap, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: recommendations, isLoading: recLoading } = useRecommendations();
  const { data: roadmaps, isLoading: rmLoading } = useRoadmaps();

  const isLoading = recLoading || rmLoading;

  return (
    <AppLayout>
      <div className="space-y-8 pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Let's continue building your tech career journey.
            </p>
          </div>
          <Button className="rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-0.5" asChild>
            <Link href="/assessment">Take New Assessment</Link>
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Active Roadmaps" 
            value={roadmaps?.length.toString() || "0"} 
            icon={Map} 
            color="text-indigo-500" bg="bg-indigo-500/10" border="border-indigo-500/20"
            link="/roadmaps"
            delay={0.1}
          />
          <StatCard 
            title="Career Matches" 
            value={recommendations?.length.toString() || "0"} 
            icon={Target} 
            color="text-teal-500" bg="bg-teal-500/10" border="border-teal-500/20"
            link="/recommendations"
            delay={0.2}
          />
          <StatCard 
            title="Skills Logged" 
            value="View" 
            icon={Zap} 
            color="text-amber-500" bg="bg-amber-500/10" border="border-amber-500/20"
            link="/skills"
            delay={0.3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Top Recommendations */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl border-2 border-border/50 shadow-xl shadow-black/5 p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" /> Top Career Matches
              </h2>
              <Link href="/recommendations" className="text-sm font-medium text-primary hover:underline flex items-center">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {isLoading ? (
              <div className="flex-1 flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
              </div>
            ) : recommendations && recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.slice(0, 3).map((rec) => (
                  <Link key={rec.id} href={`/recommendations/${rec.id}`}>
                    <div className="group p-4 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{rec.careerName}</h3>
                        <span className="text-xs font-medium px-2 py-1 bg-green-500/10 text-green-600 rounded-md">High Match</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{rec.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-xl bg-background/50">
                <Target className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <h3 className="font-medium text-foreground mb-1">No matches yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Complete an assessment to get AI career recommendations.</p>
                <Button size="sm" asChild className="rounded-lg"><Link href="/assessment">Start Assessment</Link></Button>
              </div>
            )}
          </motion.div>

          {/* Recent Roadmaps */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-card rounded-2xl border-2 border-border/50 shadow-xl shadow-black/5 p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Map className="h-5 w-5 text-indigo-500" /> Active Learning Paths
              </h2>
              <Link href="/roadmaps" className="text-sm font-medium text-indigo-500 hover:underline flex items-center">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {isLoading ? (
              <div className="flex-1 flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
              </div>
            ) : roadmaps && roadmaps.length > 0 ? (
              <div className="space-y-4">
                {roadmaps.slice(0, 3).map((map) => (
                  <Link key={map.id} href={`/roadmaps`}>
                    <div className="group p-4 rounded-xl border border-border bg-background hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer">
                      <h3 className="font-semibold text-foreground group-hover:text-indigo-600 transition-colors mb-1">
                        {map.careerName} Path
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Map className="h-3 w-3" /> {(map.steps as any[]).length} Phases</span>
                        <span>Generated {new Date(map.createdAt || '').toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-xl bg-background/50">
                <Map className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <h3 className="font-medium text-foreground mb-1">No roadmaps</h3>
                <p className="text-sm text-muted-foreground mb-4">Generate a roadmap from your career recommendations.</p>
                <Button size="sm" variant="outline" asChild className="rounded-lg"><Link href="/recommendations">View Careers</Link></Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ title, value, icon: Icon, color, bg, border, link, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    >
      <Link href={link}>
        <div className={`p-6 rounded-2xl glass-card border-2 hover:-translate-y-1 transition-all duration-300 cursor-pointer ${border}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
              <h3 className="text-3xl font-display font-bold text-foreground">{value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
