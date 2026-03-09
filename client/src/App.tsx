import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import LandingPage from "@/pages/landing";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Assessment from "@/pages/assessment";
import Recommendations from "@/pages/recommendations";
import CareerDetail from "@/pages/career-detail";
import Skills from "@/pages/skills";
import Roadmaps from "@/pages/roadmaps";

function getRouteTitle(pathname: string) {
  if (pathname === "/") return "Productivity Hub";
  if (pathname === "/login") return "Sign In";
  if (pathname === "/signup") return "Create Account";
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/assessment")) return "Assessment";
  if (pathname.startsWith("/recommendations")) return "Recommendations";
  if (pathname.startsWith("/skills")) return "My Skills";
  if (pathname.startsWith("/roadmaps")) return "Roadmaps";
  return "Productivity Hub";
}

function Router() {
  const [location] = useLocation();

  useEffect(() => {
    const pageTitle = getRouteTitle(location);
    document.title = pageTitle === "Productivity Hub" ? pageTitle : `${pageTitle} | Productivity Hub`;
  }, [location]);

  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login">
        <AuthPage isLogin={true} />
      </Route>
      <Route path="/signup">
        <AuthPage isLogin={false} />
      </Route>
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/assessment" component={Assessment} />
      <Route path="/recommendations" component={Recommendations} />
      <Route path="/recommendations/:id" component={CareerDetail} />
      <Route path="/skills" component={Skills} />
      <Route path="/roadmaps" component={Roadmaps} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
