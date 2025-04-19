import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Building, Check, ChevronsUpDown, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MainNavbar } from "@/components/layout/MainNavbar";

import {
  hostelSchema,
  HostelType,
  HostelSize,
  LocationTier,
  getCommissionRate
} from "@/utils/hostel";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const HostelRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<HostelType>({
    resolver: zodResolver(hostelSchema),
    defaultValues: {
      name: "",
      size: HostelSize.MEDIUM,
      location: LocationTier.TIER_2,
      address: "",
      city: "",
      email: "",
      phone: "",
      description: "",
    },
  });

  const onSubmit = async (data: HostelType) => {
    setIsLoading(true);
    try {
      // Get commission rate based on hostel size and location
      const commissionRate = getCommissionRate(data.size, data.location);
      
      // Generate admin credentials
      const safeHostelName = data.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      const adminEmail = `admin@${safeHostelName}.com`;
      const adminPassword = `${safeHostelName}123`;
      
      // First create the admin user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          data: {
            full_name: `${data.name} Admin`,
            role: "hostel",
          }
        }
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // Now create the hostel record
        const { error: hostelError } = await supabase.from('hostels').insert({
          id: authData.user.id,
          ...data,
          commission_rate: commissionRate,
          is_verified: false
        });
          
        if (hostelError) throw hostelError;
        
        toast({
          title: "Hostel registered successfully",
          description: "Your hostel has been registered. Please check your email for verification.",
        });
        
        // Show admin credentials
        setCredentials({
          email: adminEmail,
          password: adminPassword
        });
        setShowCredentials(true);
      }
    } catch (error: any) {
      console.error("Error registering hostel:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to register hostel",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    setShowCredentials(false);
    navigate("/auth");
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
          
          <Card>
            <CardHeader>
              <CardTitle>Hostel Information</CardTitle>
              <CardDescription>
                Provide the details of your hostel to get started. All fields are required unless marked optional.
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
      
      {/* Credentials Dialog */}
      <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Admin Credentials</DialogTitle>
            <DialogDescription>
              Please save these credentials securely. You'll need them to log in to your hostel admin dashboard.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Admin Email</p>
              <div className="flex items-center justify-between rounded-md border p-2">
                <code className="text-sm">{credentials.email}</code>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(credentials.email);
                    toast({
                      title: "Copied!",
                      description: "Email copied to clipboard",
                    });
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Admin Password</p>
              <div className="flex items-center justify-between rounded-md border p-2">
                <code className="text-sm">{credentials.password}</code>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(credentials.password);
                    toast({
                      title: "Copied!",
                      description: "Password copied to clipboard",
                    });
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={handleContinue}>Continue to Login</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HostelRegister;
