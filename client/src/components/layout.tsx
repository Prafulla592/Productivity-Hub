import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger 
} from "@/components/ui/sidebar";
import { Compass, LayoutDashboard, Target, Briefcase, Code, Map as MapIcon, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Assessment", url: "/assessment", icon: Target },
  { title: "Recommendations", url: "/recommendations", icon: Briefcase },
  { title: "My Skills", url: "/skills", icon: Code },
  { title: "Roadmaps", url: "/roadmaps", icon: MapIcon },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={style}>
      <div className="flex min-h-screen w-full bg-background/50">
        <Sidebar className="border-r border-border/50 bg-card/50 backdrop-blur-xl">
          <SidebarContent>
            <div className="p-6 mb-4 flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl">
                <Compass className="h-6 w-6 text-primary" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">CareerCompass</span>
            </div>
            
            <SidebarGroup>
              <SidebarGroupLabel className="px-6 text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="px-4 space-y-1">
                  {menuItems.map((item) => {
                    const isActive = location.startsWith(item.url);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild tooltip={item.title}>
                          <Link 
                            href={item.url}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                              isActive 
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            }`}
                          >
                            <item.icon className="h-5 w-5" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-auto p-6">
              <div className="bg-secondary/50 rounded-2xl p-4 mb-4">
                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                onClick={() => logout()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>
        
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="h-16 px-6 flex items-center border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-10">
            <SidebarTrigger className="hover-elevate mr-4 md:hidden" />
            <div className="flex-1" />
            {/* Can add notifications/profile avatars here */}
          </header>
          
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-6xl mx-auto h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
