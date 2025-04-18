
import React, { ReactNode, useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface DashboardLayoutProps {
  children: ReactNode;
  role: string;
  userName?: string;
  theme: string;
}

export function DashboardLayout({ children, role, userName = "", theme }: DashboardLayoutProps) {
  const [activeItem, setActiveItem] = useState("dashboard");
  
  // Pass the active item to the specific component that's rendered
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, { 
        activeSection: activeItem,
        setActiveSection: setActiveItem 
      });
    }
    return child;
  });
  
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
      <Sidebar 
        role={role} 
        activeItem={activeItem} 
        onNavigate={(item) => setActiveItem(item)}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar userName={userName} role={role} />
        <main className="flex-1 overflow-auto p-6">
          <div className="container mx-auto animate-fade-in">
            {childrenWithProps}
          </div>
        </main>
      </div>
    </div>
  );
}
