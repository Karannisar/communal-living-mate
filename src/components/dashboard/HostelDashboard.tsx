
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building2, 
  Users, 
  BedDouble, 
  Calendar,
  Settings,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

interface HostelDashboardProps {
  hostelData: any;
  activeSection?: string;
}

export function HostelDashboard({ 
  hostelData, 
  activeSection = "overview"
}: HostelDashboardProps) {
  const [activeTab, setActiveTab] = useState(activeSection);
  const { toast } = useToast();
  
  const getLocationBadgeStyle = (tier: string) => {
    switch (tier) {
      case "tier_1":
        return "bg-blue-100 text-blue-800";
      case "tier_2":
        return "bg-green-100 text-green-800";
      case "tier_3":
        return "bg-orange-100 text-orange-800";
      default:
        return "";
    }
  };

  const getLocationTierName = (tier: string) => {
    switch (tier) {
      case "tier_1":
        return "Premium Location";
      case "tier_2":
        return "Good Location";
      case "tier_3":
        return "Standard Location";
      default:
        return tier;
    }
  };

  if (!hostelData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Hostel Data</CardTitle>
          <CardDescription>
            Please make sure your hostel is properly registered.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{hostelData.name}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Building2 className="h-4 w-4 mr-1" />
                {hostelData.address}, {hostelData.city}
              </CardDescription>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="capitalize">{hostelData.size} Size</Badge>
              <Badge className={getLocationBadgeStyle(hostelData.location_tier)}>
                {getLocationTierName(hostelData.location_tier)}
              </Badge>
              <Badge variant="outline" className={hostelData.is_approved ? "bg-green-100" : "bg-yellow-100"}>
                {hostelData.is_approved ? "Approved" : "Pending Approval"}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 p-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="rooms">Rooms</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <div className="p-4">
              <TabsContent value="overview">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Hostel Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Contact Information</h4>
                        <p className="text-sm">Email: {hostelData.email}</p>
                        <p className="text-sm">Phone: {hostelData.phone}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-1">Description</h4>
                        <p className="text-sm text-muted-foreground">
                          {hostelData.description}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-1">Commission Rate</h4>
                        <p className="text-sm">
                          Current Rate: {(hostelData.commission_rate * 100).toFixed(1)}%
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="rooms">
                <Card>
                  <CardHeader>
                    <CardTitle>Rooms Management</CardTitle>
                    <CardDescription>
                      Manage your hostel rooms and availability
                    </CardDescription>
                  </CardHeader>
                </Card>
              </TabsContent>

              <TabsContent value="bookings">
                <Card>
                  <CardHeader>
                    <CardTitle>Bookings Management</CardTitle>
                    <CardDescription>
                      View and manage your bookings
                    </CardDescription>
                  </CardHeader>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Hostel Settings</CardTitle>
                    <CardDescription>
                      Manage your hostel settings and preferences
                    </CardDescription>
                  </CardHeader>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
