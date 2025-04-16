
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Redirect to appropriate dashboard based on role
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.session.user.id)
          .single();
        
        if (userData?.role) {
          navigate(`/${userData.role}`);
        }
      }
    };
    
    checkSession();
  }, [navigate]);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  const handleLoginSuccess = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.session.user.id)
        .single();
      
      if (userData?.role) {
        navigate(`/${userData.role}`);
      } else {
        navigate('/student'); // Default to student if role not found
      }
    }
  };

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
