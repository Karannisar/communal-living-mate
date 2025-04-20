
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { RoleSelection } from "@/components/auth/RoleSelection";
import { supabase } from "@/integrations/supabase/client";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { MainNavbar } from "@/components/layout/MainNavbar";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

type AuthView = "login" | "signup" | "role";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<AuthView>("login");
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        // User is already logged in, fetch their role
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.session.user.id)
          .single();
          
        if (userData && !error) {
          // Redirect to appropriate dashboard based on role
          redirectBasedOnRole(userData.role);
        } else {
          // User exists but no role assigned
          setView("role");
          setIsLoading(false);
        }
      } else {
        // No active session, show login
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, [navigate]);
  
  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case "admin":
        navigate("/admin");
        break;
      case "student":
        navigate("/student");
        break;
      case "security":
        navigate("/security");
        break;
      case "hostel":
        navigate("/hostel");
        break;
      default:
        navigate("/");
    }
  };
  
  const handleLogin = async () => {
    // After successful login, get user role and redirect
    const { data } = await supabase.auth.getSession();
    
    if (data.session) {
      const { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.session.user.id)
        .single();
        
      if (userData && !error) {
        redirectBasedOnRole(userData.role);
      } else {
        // No role assigned, show role selection
        setView("role");
      }
    }
  };
  
  const handleSignup = () => {
    // After signup, show login view
    setView("login");
  };
  
  const handleRoleSelect = async (role: string) => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Update user role
      const { error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', user.id);
        
      if (!error) {
        // Redirect based on selected role
        redirectBasedOnRole(role);
      }
    }
  };
  
  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <MainNavbar />
      
      <div className="container flex items-center justify-center min-h-screen py-16">
        <div className="w-full max-w-md">
          <div className="absolute top-6 right-6">
            <ThemeSwitcher />
          </div>
          
          {view === "login" && (
            <LoginForm
              onLogin={handleLogin}
              onSignupClick={() => setView("signup")}
            />
          )}
          
          {view === "signup" && (
            <SignupForm
              onSignup={handleSignup}
              onLoginClick={() => setView("login")}
            />
          )}
          
          {view === "role" && (
            <RoleSelection onRoleSelect={handleRoleSelect} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
