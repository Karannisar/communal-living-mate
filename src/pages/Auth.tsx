
import { useState, useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingScreen } from "@/components/ui/loading-screen";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        await handleUserNavigation(session);
      }
    } catch (error) {
      console.error("Session check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserNavigation = async (session) => {
    const email = session.user.email;
    
    if (email === "admin@dormmate.com") {
      navigate('/admin');
      return;
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user role:", error);
      // Default to student role if there's an error
      navigate('/student');
      return;
    }

    if (userData?.role) {
      navigate(`/${userData.role}`);
    } else {
      // Handle new user with no role - create default student role
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: session.user.id,
          email: session.user.email,
          role: 'student'
        });

      if (insertError) {
        console.error("Error creating user record:", insertError);
      }
      
      navigate('/student');
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  const handleLoginSuccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await handleUserNavigation(session);
    }
  };

  if (loading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/50">
      <div className="w-full max-w-md space-y-8 text-center animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">DormMate</h1>
          <p className="text-xl text-muted-foreground">Dormitory Management System</p>
        </div>
        
        {isLogin ? (
          <LoginForm onLogin={handleLoginSuccess} onSignupClick={toggleAuthMode} />
        ) : (
          <SignupForm onSignup={toggleAuthMode} onLoginClick={toggleAuthMode} />
        )}
      </div>
    </div>
  );
};

export default Auth;
