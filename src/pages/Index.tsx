
import { useState, useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RoleSelection } from "@/components/auth/RoleSelection";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { SecurityDashboard } from "@/components/dashboard/SecurityDashboard";
import { MessDashboard } from "@/components/dashboard/MessDashboard";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { LandingPage } from "@/components/LandingPage";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type AuthState = "not-authenticated" | "role-selection" | "authenticated";
type UserRole = "admin" | "student" | "security" | "mess" | null;

const Index = () => {
  const [authState, setAuthState] = useState<AuthState>("not-authenticated");
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userName, setUserName] = useState<string>("");
  const [theme, setTheme] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        // User is logged in, fetch their role
        const { data: userData, error } = await supabase
          .from('users')
          .select('role, full_name')
          .eq('id', data.session.user.id)
          .single();
          
        if (userData && !error) {
          const role = userData.role as UserRole;
          setUserRole(role);
          setUserName(userData.full_name || data.session.user.email || "");
          
          // Set theme based on role
          switch (role) {
            case "admin":
              setTheme("theme-admin");
              break;
            case "student":
              setTheme("theme-student");
              break;
            case "security":
              setTheme("theme-security");
              break;
            case "mess":
              setTheme("theme-mess");
              break;
            default:
              setTheme("");
          }
          
          setAuthState("authenticated");
        } else {
          // User exists but no role assigned
          setAuthState("role-selection");
        }
      }
      
      setIsLoading(false);
    };
    
    checkSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Redirect to Auth page to handle role assignment
          navigate('/auth');
        } else if (event === 'SIGNED_OUT') {
          setAuthState("not-authenticated");
          setUserRole(null);
          setUserName("");
          setTheme("");
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);
  
  // Redirect to auth page for login/signup
  const handleBookNow = () => {
    navigate('/auth');
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
        // Show Landing page for non-authenticated users
        return <LandingPage />;
        
      case "role-selection":
        return (
          <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/50">
            <RoleSelection onRoleSelect={handleRoleSelect} />
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
  
  // Handle role selection
  const handleRoleSelect = (role: string, themeClass: string) => {
    setUserRole(role as UserRole);
    setTheme(themeClass);
    setAuthState("authenticated");
  };

  return renderContent();
};

export default Index;
