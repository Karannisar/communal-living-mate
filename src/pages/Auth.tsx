
import { useState, useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Check for admin login first
        if (data.session.user.email === "admin@dormmate.com") {
          navigate('/admin');
          return;
        }
        
        // For other users, check their role from the database
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.session.user.id)
          .maybeSingle();
        
        if (userData?.role) {
          navigate(`/${userData.role}`);
        } else if (error) {
          console.error("Error fetching user role:", error);
          navigate('/student'); // Default to student if error
        } else {
          // If no role found in the database, create a student role
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.session.user.id,
              email: data.session.user.email,
              role: 'student'
            });
            
          if (insertError) {
            console.error("Error creating user record:", insertError);
          }
          
          navigate('/student'); // Default to student if role not found
        }
      }
    };
    
    checkSession();
  }, [navigate]);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  const handleLoginSuccess = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // For the hardcoded admin login
        const email = data.session.user.email;
        if (email === "admin@dormmate.com") {
          // Ensure admin exists in the users table
          const { error: userCheckError, data: userExists } = await supabase
            .from('users')
            .select('*')
            .eq('email', 'admin@dormmate.com')
            .maybeSingle();
            
          if (userCheckError || !userExists) {
            // Create admin user in the users table if it doesn't exist
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: data.session.user.id,
                email: 'admin@dormmate.com',
                full_name: 'Admin User',
                role: 'admin'
              });
              
            if (insertError) {
              console.error("Error ensuring admin user:", insertError);
            }
          }
          
          navigate('/admin');
          return;
        }
        
        // For regular users, check their role
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.session.user.id)
          .maybeSingle();
        
        if (userData?.role) {
          navigate(`/${userData.role}`);
        } else if (error) {
          console.error("Error fetching user role:", error);
          navigate('/student'); // Default to student if error
        } else {
          // If no role found in the database, create a student role
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.session.user.id,
              email: data.session.user.email,
              role: 'student'
            });
            
          if (insertError) {
            console.error("Error creating user record:", insertError);
          }
          
          navigate('/student'); // Default to student if role not found
        }
      }
    } catch (error) {
      console.error("Error during login success handling:", error);
      navigate('/student'); // Default fallback
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
