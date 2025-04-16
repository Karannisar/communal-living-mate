
import { ReactNode, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface DashboardLayoutProps {
  children: ReactNode;
  role: string;
  userName?: string;
  theme: string;
}

export function DashboardLayout({ children, role, userName = "", theme }: DashboardLayoutProps) {
  useEffect(() => {
    // Apply theme class to body
    document.body.classList.forEach(cls => {
      if (cls.startsWith('theme-')) document.body.classList.remove(cls);
    });
    document.body.classList.add(theme);
    
    return () => {
      document.body.classList.remove(theme);
    };
  }, [theme]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role={role} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar userName={userName} role={role} />
        <main className="flex-1 overflow-auto p-6">
          <div className="container mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
