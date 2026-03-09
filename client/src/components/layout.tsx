import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger 
} from "@/components/ui/sidebar";
import { LayoutDashboard, Target, Briefcase, Code, Map as MapIcon, LogOut, Loader2, Search, Sparkles } from "lucide-react";
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
  const activeItem = menuItems.find((item) => location.startsWith(item.url));

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
      <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-background to-primary/[0.03]">
        <Sidebar className="border-r border-border/60 bg-card/80 backdrop-blur-xl">
          <SidebarContent>
            <div className="mx-4 mt-5 mb-4 rounded-2xl border border-border/60 bg-background/60 p-4">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="Productivity Hub"
                  className="h-9 w-auto max-w-[8.5rem] object-contain shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-display text-lg font-semibold leading-tight text-foreground">Productivity Hub</p>
                  <p className="truncate text-xs text-muted-foreground">Productivity Hub Workspace</p>
                </div>
              </div>
            </div>
            
            <div className="px-6 pb-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
                Navigation
              </p>
            </div>

            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="px-3 space-y-1.5">
                  {menuItems.map((item) => {
                    const isActive = location.startsWith(item.url);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild tooltip={item.title}>
                          <Link 
                            href={item.url}
                            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                              isActive 
                                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30" 
                                : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                            }`}
                          >
                            <span className={`grid h-8 w-8 place-items-center rounded-lg ${
                              isActive ? "bg-primary-foreground/20" : "bg-muted/60 group-hover:bg-background"
                            }`}>
                              <item.icon className="h-4 w-4" />
                            </span>
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-auto p-4">
              <div className="mb-3 rounded-2xl border border-border/60 bg-secondary/35 p-4">
                <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Button 
                variant="ghost" 
                className="w-full justify-start rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={() => logout()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>
        
        <div className="flex h-screen flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-10 border-b border-border/60 bg-background/85 backdrop-blur-md">
            <div className="flex h-16 items-center gap-3 px-4 md:h-20 md:px-8">
              <SidebarTrigger className="mr-1 md:hidden" />
              <img
                src="/logo.png"
                alt="Productivity Hub"
                className="h-7 w-auto max-w-[7rem] object-contain shrink-0"
              />
              <div className="min-w-0">
                <p className="truncate font-display text-base font-semibold text-foreground md:text-lg">
                  {activeItem?.title ?? "Dashboard"}
                </p>
                <p className="hidden text-xs text-muted-foreground sm:block">
                  Track progress, plan goals, and keep your roadmap in sync.
                </p>
              </div>
              <div className="ml-auto hidden items-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-2 text-sm text-muted-foreground lg:flex">
                <Search className="h-4 w-4" />
                <span>Search</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold">Ctrl K</span>
              </div>
              <Button asChild size="sm" className="ml-auto md:ml-3">
                <Link href="/assessment">
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">Quick Assessment</span>
                  <span className="sm:hidden">Assess</span>
                </Link>
              </Button>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-7">
            <div className="mx-auto h-full w-full max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
