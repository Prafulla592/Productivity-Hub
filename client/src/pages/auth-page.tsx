import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Compass, Mail, Lock, User, GraduationCap, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

export default function AuthPage({ isLogin = true }: { isLogin?: boolean }) {
  const { login, signup, isLoggingIn, isSigningUp } = useAuth();
  
  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // Signup State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [eduLevel, setEduLevel] = useState("");
  const [college, setCollege] = useState("");
  const [city, setCity] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email: loginEmail, password: loginPass });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    signup({ name, email, password, educationLevel: eduLevel, college, city });
  };

  {/* auth landing hero workspace clean desk laptop */}
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="absolute top-8 left-8 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Compass className="h-6 w-6 text-primary" />
            <span className="font-display font-bold text-xl">CareerCompass</span>
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <Tabs defaultValue={isLogin ? "login" : "signup"} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary/50 p-1 rounded-xl">
              <TabsTrigger value="login" className="rounded-lg">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg">Create Account</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h2>
                <p className="text-muted-foreground">Enter your credentials to access your dashboard.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="login-email" type="email" placeholder="you@example.com" 
                      className="pl-10 h-12 rounded-xl bg-card border-2 border-border focus-visible:ring-primary/20"
                      value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="login-password">Password</Label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="login-password" type="password" placeholder="••••••••" 
                      className="pl-10 h-12 rounded-xl bg-card border-2 border-border focus-visible:ring-primary/20"
                      value={loginPass} onChange={(e) => setLoginPass(e.target.value)} required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isLoggingIn} className="w-full h-12 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl transition-all">
                  {isLoggingIn ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <div className="mb-6">
                <h2 className="text-3xl font-bold tracking-tight mb-2">Start your journey</h2>
                <p className="text-muted-foreground">Tell us a bit about yourself to personalize your experience.</p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="name" placeholder="Jane Doe" 
                      className="pl-10 h-11 rounded-xl bg-card border-2"
                      value={name} onChange={(e) => setName(e.target.value)} required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="email" type="email" placeholder="jane@example.com" 
                      className="pl-10 h-11 rounded-xl bg-card border-2"
                      value={email} onChange={(e) => setEmail(e.target.value)} required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="password" type="password" placeholder="••••••••" 
                      className="pl-10 h-11 rounded-xl bg-card border-2"
                      value={password} onChange={(e) => setPassword(e.target.value)} required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edu">Current Education Level</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="edu" placeholder="e.g. Bachelor's in CS" 
                      className="pl-10 h-11 rounded-xl bg-card border-2"
                      value={eduLevel} onChange={(e) => setEduLevel(e.target.value)} required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="college">College/Uni (Optional)</Label>
                    <Input 
                      id="college" placeholder="University Name" 
                      className="h-11 rounded-xl bg-card border-2"
                      value={college} onChange={(e) => setCollege(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City (Optional)</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input 
                        id="city" placeholder="New York" 
                        className="pl-10 h-11 rounded-xl bg-card border-2"
                        value={city} onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <Button type="submit" disabled={isSigningUp} className="w-full h-12 rounded-xl font-semibold shadow-lg shadow-primary/25 mt-4">
                  {isSigningUp ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Right Image Side */}
      <div className="hidden lg:block w-1/2 relative bg-primary/5 border-l border-border/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 z-0 mix-blend-multiply" />
        <img 
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=1600&fit=crop" 
          alt="Team collaborating" 
          className="absolute inset-0 w-full h-full object-cover opacity-80 z-[-1]"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-0" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white p-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-4xl font-display font-bold mb-4 leading-tight">Your future is waiting to be built.</h2>
            <p className="text-lg text-white/80 max-w-lg">
              Join thousands of professionals using CareerCompass to map their journey into the tech industry.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
