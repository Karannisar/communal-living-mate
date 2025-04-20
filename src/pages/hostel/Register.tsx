import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainNavbar } from "@/components/layout/MainNavbar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building, Check, ChevronsUpDown, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getCommissionRate,
  hostelSchema,
  HostelSize,
  HostelType,
  LocationTier
} from "@/utils/hostel";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const HostelRegisterSchema = z.object({
  name: z.string().min(3, "Hostel name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  size: z.enum([HostelSize.SMALL, HostelSize.MEDIUM, HostelSize.LARGE]),
  location: z.enum([LocationTier.TIER_1, LocationTier.TIER_2, LocationTier.TIER_3]),
  address: z.string().min(10, "Address must be at least 10 characters"),
  city: z.string().min(2, "City name must be at least 2 characters"),
  description: z.string().optional(),
}).required();

const HostelRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof HostelRegisterSchema>>({
    resolver: zodResolver(HostelRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      size: HostelSize.MEDIUM,
      location: LocationTier.TIER_2,
      address: "",
      city: "",
      description: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof HostelRegisterSchema>) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const commissionRate = getCommissionRate(data.size, data.location);
      
      // Check if user with this email already exists
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', data.email)
        .maybeSingle();
      
      if (existingUser) {
        setErrorMessage("A user with this email already exists. Please use a different email or login.");
        setIsLoading(false);
        return;
      }
      
      // Create user with email and password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            role: "hostel",
            name: data.name,
            full_name: data.name,
          }
        }
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          setErrorMessage("This email is already registered. Please use a different email or login.");
        } else {
          setErrorMessage(`Authentication failed: ${authError.message}`);
        }
        console.error('Auth Error:', authError);
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setErrorMessage('Failed to create user account');
        setIsLoading(false);
        return;
      }

      // Create the hostel record
      const { error: hostelError } = await supabase
        .from('hostels')
        .insert({
          id: authData.user.id,
          name: data.name,
          size: data.size,
          location_tier: data.location,
          address: data.address,
          city: data.city,
          email: data.email,
          phone: data.phone,
          description: data.description || null,
          commission_rate: commissionRate,
          is_verified: false,
          is_approved: false,
          photos: ['/placeholder.svg']
        });

      if (hostelError) {
        console.error('Hostel Error:', hostelError);
        setErrorMessage(`Failed to create hostel record: ${hostelError.message}`);
        setIsLoading(false);
        return;
      }

      toast({
        title: "Hostel Registration Successful",
        description: "You can now login with your email and password",
      });

      // Redirect to login page
      navigate('/auth');

    } catch (error) {
      console.error("Error registering hostel:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to register hostel");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavbar />
      
      <div className="container pt-24 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Register Your Hostel</h1>
            <p className="text-muted-foreground">
              Join our platform and reach thousands of potential residents
            </p>
          </div>
          
          {errorMessage && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Registration Failed</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Hostel Information</CardTitle>
              <CardDescription>
                Provide the details of your hostel to get started. All fields are required.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hostel Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter hostel name" {...field} />
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
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="contact@yourhostel.com" 
                              type="email"
                              {...field} 
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
                              type="password" 
                              placeholder="Create a secure password" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Full Address</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter the complete address" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hostel Size</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select hostel size" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={HostelSize.SMALL}>
                                Small (up to 50 rooms)
                              </SelectItem>
                              <SelectItem value={HostelSize.MEDIUM}>
                                Medium (51-100 rooms)
                              </SelectItem>
                              <SelectItem value={HostelSize.LARGE}>
                                Large (101+ rooms)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            This affects your commission rate
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location Tier</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select location tier" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={LocationTier.TIER_1}>
                                Tier 1 (Premium location)
                              </SelectItem>
                              <SelectItem value={LocationTier.TIER_2}>
                                Tier 2 (Good location)
                              </SelectItem>
                              <SelectItem value={LocationTier.TIER_3}>
                                Tier 3 (Standard location)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            This affects your commission rate
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Hostel Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your hostel, its amenities, and unique features" 
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            This will be displayed to potential students
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full md:w-auto"
                    >
                      {isLoading ? "Registering..." : "Register Hostel"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HostelRegister;
