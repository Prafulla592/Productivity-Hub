import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { useSkills } from "@/hooks/use-skills";
import { motion } from "framer-motion";
import { Code, Plus, Trash2, Zap, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Skills() {
  const { skills, isLoading, addSkill, isAddingSkill } = useSkills();
  const [newSkill, setNewSkill] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim().length > 0) {
      addSkill(newSkill.trim());
      setNewSkill("");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground flex items-center gap-3">
            <div className="bg-amber-500/10 p-2 rounded-xl text-amber-500">
              <Code className="h-6 w-6" />
            </div>
            My Skill Arsenal
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Log the skills you already know. The more accurate your profile, the better your gap analysis will be.
          </p>
        </div>

        <div className="bg-card border-2 border-border rounded-3xl p-6 md:p-8 shadow-xl shadow-black/5">
          <form onSubmit={handleAdd} className="flex gap-4 mb-10">
            <Input 
              placeholder="e.g. React, Python, Project Management..."
              className="flex-1 h-14 rounded-xl text-lg bg-background border-2 focus-visible:ring-amber-500/20"
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              disabled={isAddingSkill}
            />
            <Button 
              type="submit" 
              className="h-14 px-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 font-semibold"
              disabled={isAddingSkill || !newSkill.trim()}
            >
              <Plus className="mr-2 h-5 w-5" /> Add Skill
            </Button>
          </form>

          {isLoading ? (
            <div className="flex gap-3 flex-wrap">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 w-24 bg-secondary rounded-lg animate-pulse" />)}
            </div>
          ) : skills && skills.length > 0 ? (
            <div className="space-y-6">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <LayoutList className="h-5 w-5 text-muted-foreground" />
                Registered Skills ({skills.length})
              </h3>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, i) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-background border-2 border-border rounded-xl shadow-sm hover:border-amber-500/50 transition-colors group"
                  >
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="font-medium text-foreground">{skill.skillName}</span>
                    {/* No delete endpoint configured in API contract, but UI implies it could exist.
                        Leaving placeholder button logic that shows interaction state. */}
                    <button type="button" className="ml-2 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-2xl bg-secondary/30 border-2 border-dashed border-border">
              <Code className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="font-medium text-foreground mb-1">Your arsenal is empty</h3>
              <p className="text-sm text-muted-foreground">Add your first skill above to start building your profile.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
