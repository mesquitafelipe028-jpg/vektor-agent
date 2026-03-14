import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { LogoVektor } from "@/components/branding/LogoVektor";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

import { useRecurringGenerator } from "@/hooks/useRecurringGenerator";
import { useAuth } from "@/contexts/AuthContext";
export default function AppLayout() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { theme, setTheme, resolvedTheme } = useTheme();
  useRecurringGenerator(user?.id);

  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-x-hidden">
        {!isMobile && <AppSidebar />}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="flex flex-col sticky top-0 z-50 bg-background border-b border-border" style={{ paddingTop: "env(safe-area-inset-top)" }}>
            <div className="h-14 flex items-center px-3 sm:px-4">
              {!isMobile && <SidebarTrigger className="mr-3 sm:mr-4" />}
              <LogoVektor size="sm" textClassName="text-muted-foreground" />
              <div className="ml-auto">
                <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Alternar tema">
                  {resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </header>
          
          <main 
            className="flex-1 overflow-x-hidden p-4 sm:p-6 md:pb-6"
            style={{ 
              paddingBottom: isMobile ? "calc(var(--mobile-nav-height) + var(--safe-area-bottom) + 1rem)" : "1.5rem" 
            }}
          >
            <Outlet />
          </main>
        </div>
      </div>
      {isMobile && <MobileBottomNav />}
    </SidebarProvider>
  );
}
