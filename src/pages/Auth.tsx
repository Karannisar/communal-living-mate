import { useState, useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
      await ensureAdminUser(session);
      navigate('/admin');
      return;
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error("Error fetching user role:", error);
      await createDefaultUser(session);
      navigate('/student');
      return;
    }

    if (userData?.role) {
      navigate(`/${userData.role}`);
    } else {
      await createDefaultUser(session);
      navigate('/student');
    }
  };

  const ensureAdminUser = async (session) => {
    const { error: insertError } = await supabase
      .from('users')
      .upsert({
        id: session.user.id,
        email: 'admin@dormmate.com',
        full_name: 'Admin User',
        role: 'admin'
      }, { onConflict: 'id' });

    if (insertError) {
      console.error("Error ensuring admin user:", insertError);
    }
  };

  const createDefaultUser = async (session) => {
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
    return <div>Loading...</div>;
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
