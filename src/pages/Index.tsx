
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";
import { RoleSelection } from "@/components/auth/RoleSelection";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { SecurityDashboard } from "@/components/dashboard/SecurityDashboard";
import { MessDashboard } from "@/components/dashboard/MessDashboard";
import { LoadingScreen } from "@/components/ui/loading-screen";

// For demo purposes, we'll simulate authentication
type AuthState = "not-authenticated" | "role-selection" | "authenticated";
type UserRole = "admin" | "student" | "security" | "mess" | null;

const Index = () => {
  const [authState, setAuthState] = useState<AuthState>("not-authenticated");
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userName, setUserName] = useState<string>("");
  const [theme, setTheme] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Mock login function
  const handleLogin = async (email: string, password: string) => {
    // This would normally verify credentials with Supabase
    console.log("Login attempt:", email, password);
    
    // For demo, we'll accept any input
    const name = email.split("@")[0].split(".").map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(" ");
    
    setUserName(name);
    setAuthState("role-selection");
    
    // In a real app, we would get the role from the authentication service
    return Promise.resolve();
  };
  
  // Handle role selection
  const handleRoleSelect = (role: string, themeClass: string) => {
    setUserRole(role as UserRole);
    setTheme(themeClass);
    setAuthState("authenticated");
  };
  
  // Get dashboard based on role
  const getDashboard = () => {
    switch (userRole) {
      case "admin":
        return <AdminDashboard />;
      case "student":
        return <StudentDashboard />;
      case "security":
        return <SecurityDashboard />;
      case "mess":
        return <MessDashboard />;
      default:
        return null;
    }
  };

  // Render content based on auth state
  const renderContent = () => {
    if (isLoading) {
      return <LoadingScreen message="Welcome to DormMate" />;
    }
    
    switch (authState) {
      case "not-authenticated":
        return (
          <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/50">
            <div className="w-full max-w-md space-y-8 text-center animate-fade-in">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">DormMate</h1>
                <p className="text-xl text-muted-foreground">Dormitory Management System</p>
              </div>
              <LoginForm onLogin={handleLogin} />
            </div>
          </div>
        );
        
      case "role-selection":
        return (
          <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/50">
            <Card className="w-full max-w-3xl animate-scale-in">
              <CardContent className="pt-6">
                <RoleSelection onRoleSelect={handleRoleSelect} />
              </CardContent>
            </Card>
          </div>
        );
        
      case "authenticated":
        return (
          <DashboardLayout role={userRole as string} userName={userName} theme={theme}>
            {getDashboard()}
          </DashboardLayout>
        );
        
      default:
        return null;
    }
  };

  return renderContent();
};

export default Index;
