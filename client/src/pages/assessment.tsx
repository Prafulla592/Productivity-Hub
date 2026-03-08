import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { useAssessment } from "@/hooks/use-assessment";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Target, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const QUESTIONS = [
  "What are your primary interests or passions inside and outside of work?",
  "Describe a project or task where you felt most energized and engaged.",
  "Which subjects or technical skills have you enjoyed learning the most?",
  "Do you prefer working independently, in small teams, or leading large groups?",
  "What kind of impact do you want your work to have on the world?",
  "Are you more drawn to creative problem solving, deep analytical thinking, or organizing people/processes?",
  "What is your ideal work environment (e.g., fast-paced startup, stable corporate, remote/async)?",
  "If you had to learn one new technology tomorrow, what would it be and why?"
];

export default function Assessment() {
  const { submit, isSubmitting } = useAssessment();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(QUESTIONS.length).fill(""));

  const isLast = step === QUESTIONS.length - 1;
  const currentAnswer = answers[step];
  const canProceed = currentAnswer.trim().length > 10; // Simple validation

  const handleNext = () => {
    if (canProceed && !isLast) setStep(s => s + 1);
  };
  const handlePrev = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const handleSubmit = () => {
    const formattedAnswers = QUESTIONS.map((q, i) => ({
      question: q,
      answer: answers[i]
    }));
    submit({ answers: formattedAnswers });
  };

  const progress = ((step + 1) / QUESTIONS.length) * 100;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto py-8">
        <div className="mb-10">
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              <Target className="h-6 w-6" />
            </div>
            AI Career Discovery
          </h1>
          <p className="text-muted-foreground mt-2">Answer these questions thoughtfully so our AI can find your perfect path.</p>
        </div>

        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex justify-between text-sm font-medium mb-2 text-muted-foreground">
            <span>Question {step + 1} of {QUESTIONS.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="bg-card border-2 border-border shadow-xl shadow-black/5 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent opacity-50" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[250px] flex flex-col"
            >
              <Label className="text-2xl font-display font-semibold leading-relaxed mb-6 block">
                {QUESTIONS[step]}
              </Label>
              <Textarea 
                placeholder="Type your answer here... (be as detailed as possible)"
                className="flex-1 min-h-[150px] text-lg p-5 rounded-2xl resize-none border-2 focus-visible:ring-primary/20 bg-background/50"
                value={answers[step]}
                onChange={(e) => {
                  const newAnswers = [...answers];
                  newAnswers[step] = e.target.value;
                  setAnswers(newAnswers);
                }}
                disabled={isSubmitting}
              />
              {!canProceed && answers[step].length > 0 && (
                <p className="text-sm text-amber-600 mt-3 font-medium flex items-center gap-1">
                  Please provide a bit more detail (at least 10 characters).
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-10 pt-6 border-t border-border">
            <Button 
              variant="outline" 
              size="lg"
              onClick={handlePrev} 
              disabled={step === 0 || isSubmitting}
              className="rounded-xl h-12 px-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            
            {isLast ? (
              <Button 
                size="lg" 
                onClick={handleSubmit} 
                disabled={!canProceed || isSubmitting}
                className="rounded-xl h-12 px-8 shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all border-0"
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</>
                ) : (
                  <><CheckCircle2 className="mr-2 h-5 w-5" /> Submit Assessment</>
                )}
              </Button>
            ) : (
              <Button 
                size="lg" 
                onClick={handleNext} 
                disabled={!canProceed}
                className="rounded-xl h-12 px-8 shadow-md shadow-primary/20"
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
