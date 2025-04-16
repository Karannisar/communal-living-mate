import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

interface LoginFormProps {
  onLogin: () => Promise<void>;
  onSignupClick: () => void;
}

export function LoginForm({ onLogin, onSignupClick }: LoginFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleAdminLogin = async () => {
    try {
      setLoading(true);
      
      // First verify the password using the custom function
      const { data: verifyData, error: verifyError } = await supabase.rpc(
        'verify_password',
        { 
          email: 'admin@dormmate.com',
          password: 'admin123456'
        }
      );
      
      if (verifyError || !verifyData) {
        toast({
          title: "Error",
          description: "Invalid admin credentials",
          variant: "destructive",
        });
        return;
      }
      
      // If password is verified, proceed with sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "admin@dormmate.com",
        password: "admin123456",
      });
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Admin login successful!",
      });
      
      await onLogin();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      
      // First verify the password
      const { data: verifyData, error: verifyError } = await supabase.rpc(
        'verify_password',
        { 
          email: values.email,
          password: values.password
        }
      );
      
      if (verifyError || !verifyData) {
        toast({
          title: "Error",
          description: "Invalid credentials",
          variant: "destructive",
        });
        return;
      }
      
      // If password is verified, proceed with sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      // Ensure the user exists in the users table
      const { error: userCheckError, data: userExists } = await supabase
        .from('users')
        .select('*')
        .eq('email', values.email)
        .maybeSingle();
        
      if (userCheckError || !userExists) {
        // Create user in the users table if it doesn't exist
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: values.email,
            password_hash: await supabase.rpc('hash_password', { password: values.password }),
            role: 'student'
          });
          
        if (insertError) {
          console.error("Error ensuring user exists:", insertError);
        }
      }
      
      toast({
        title: "Success",
        description: "Login successful!",
      });
      
      await onLogin();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl animate-slide-up">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Sign in to your account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="your.email@example.com"
                      type="email"
                      {...field}
                      className="hover-lift"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      {...field}
                      className="hover-lift"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>
            
            <Button 
              type="button" 
              className="w-full bg-admin hover:bg-admin/90" 
              onClick={handleAdminLogin}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Login as Admin"
              )}
            </Button>
            
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Button 
                  variant="link" 
                  className="p-0 h-auto" 
                  onClick={onSignupClick}
                >
                  Sign Up
                </Button>
              </p>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}