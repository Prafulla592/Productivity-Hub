import { AppLayout } from "@/components/layout";
import { useRoadmaps } from "@/hooks/use-roadmap";
import { motion } from "framer-motion";
import { Map, Flag, PlayCircle, CheckCircle2, ChevronRight, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "wouter";
import { type RoadmapStep } from "@shared/schema";

export default function Roadmaps() {
  const { data: roadmaps, isLoading } = useRoadmaps();

  return (
    <AppLayout>
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground flex items-center gap-3">
              <div className="bg-indigo-500/10 p-2 rounded-xl text-indigo-500">
                <Map className="h-6 w-6" />
              </div>
              Learning Roadmaps
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Your generated step-by-step action plans to reach your career goals.
            </p>
          </div>
          <Button variant="outline" className="rounded-xl border-2 hover:bg-secondary" asChild>
            <Link href="/recommendations">Explore More Careers</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2].map(i => <div key={i} className="h-64 bg-card/50 rounded-3xl border-2 border-border animate-pulse" />)}
          </div>
        ) : roadmaps && roadmaps.length > 0 ? (
          <div className="space-y-8">
            {roadmaps.map((roadmap, index) => {
              // Cast jsonb to typed steps
              const steps = roadmap.steps as unknown as RoadmapStep[];
              
              return (
                <motion.div
                  key={roadmap.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border-2 border-border/80 shadow-xl shadow-black/5 rounded-3xl overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-indigo-500/10 to-primary/5 p-6 md:p-8 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <Badge className="bg-indigo-500 text-white hover:bg-indigo-600 mb-3 rounded-lg border-0">Action Plan</Badge>
                      <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">{roadmap.careerName}</h2>
                      <p className="text-muted-foreground mt-1 flex items-center gap-2">
                        <Flag className="h-4 w-4" /> Generated {new Date(roadmap.createdAt || '').toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-background px-4 py-2 rounded-xl border border-border shadow-sm flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-indigo-500" />
                      <span className="font-semibold">{steps.length} Phases</span>
                    </div>
                  </div>

                  <div className="p-6 md:p-8">
                    <Accordion type="single" collapsible className="w-full space-y-4">
                      {steps.map((step, i) => (
                        <AccordionItem value={`step-${i}`} key={i} className="border-2 border-border rounded-2xl bg-background/50 overflow-hidden shadow-sm data-[state=open]:border-indigo-500/50 data-[state=open]:shadow-md transition-all">
                          <AccordionTrigger className="px-6 py-4 hover:no-underline group">
                            <div className="flex items-center gap-4 text-left">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg border-2 border-indigo-200 dark:border-indigo-800 shrink-0">
                                {step.stepNumber}
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-foreground group-hover:text-indigo-600 transition-colors">{step.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{step.description}</p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-6 pt-2">
                            <div className="ml-14 pl-4 border-l-2 border-indigo-100 dark:border-indigo-900/50 space-y-4">
                              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                              
                              <div className="bg-secondary/50 p-4 rounded-xl border border-border">
                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                  <PlayCircle className="h-4 w-4 text-indigo-500" /> Focus Areas
                                </h4>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {step.skills.map((skill, j) => (
                                    <li key={j} className="flex items-center gap-2 text-sm">
                                      <CheckCircle2 className="h-4 w-4 text-primary/60 shrink-0" />
                                      <span className="font-medium">{skill}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 glass-card rounded-3xl border-2 border-dashed">
            <Map className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">No roadmaps generated</h2>
            <p className="text-muted-foreground mb-6">Go to your career recommendations to generate a custom learning path.</p>
            <Button size="lg" className="rounded-xl shadow-lg shadow-indigo-500/20 bg-indigo-500 hover:bg-indigo-600" asChild>
              <Link href="/recommendations">View Recommendations</Link>
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
