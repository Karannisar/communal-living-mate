
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

const signupSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignupValues = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSignup?: () => void;
  onLoginClick: () => void;
}

export function SignupForm({ onSignup, onLoginClick }: SignupFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (values: SignupValues) => {
    try {
      setLoading(true);
      
      // All new users are assigned 'student' role by default
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name, role } } });
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      // Manually create a record in the users table to ensure it's there
      if (data.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: values.email,
            full_name: values.fullName,
            role: 'student'
          });
          
        if (insertError) {
          console.error("Error inserting user data:", insertError);
          // Don't show this error to user if the trigger already added the user
        }
      }
      
      toast({
        title: "Success",
        description: "Your account has been created. Please check your email for verification.",
      });
      
      if (onSignup) onSignup();
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
          Create your account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
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
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Button 
                  variant="link" 
                  className="p-0 h-auto" 
                  onClick={onLoginClick}
                >
                  Sign In
                </Button>
              </p>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
