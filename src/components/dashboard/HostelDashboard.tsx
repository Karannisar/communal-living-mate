import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  BarChart3, 
  BedDouble, 
  Building, 
  CreditCard, 
  DollarSign, 
  Home, 
  Users,
  Settings,
  AlertTriangle,
  Clock,
  CheckCircle
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { PhotoUpload } from "@/components/hostel/PhotoUpload";

interface HostelDashboardProps {
  hostelData: any;
  activeSection?: string;
  setActiveSection?: (section: string) => void;
}

export function HostelDashboard({ 
  hostelData, 
  activeSection = "dashboard", 
  setActiveSection 
}: HostelDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const isMobile = useIsMobile();
  
  const getLocationBadgeStyle = (tier: string) => {
    switch (tier) {
      case "tier_1":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
      case "tier_2":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      case "tier_3":
        return "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100";
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
  
  const stats = {
    totalRooms: 48,
    occupiedRooms: 32,
    totalStudents: 76,
    occupancyRate: 67,
    totalRevenue: 38500,
    pendingBookings: 12
  };
  
  const recentBookings = [
    { id: 1, student: "Emma Johnson", room: "103", date: "2025-04-15", status: "confirmed" },
    { id: 2, student: "Jason Williams", room: "215", date: "2025-04-14", status: "pending" },
    { id: 3, student: "Sara Parker", room: "118", date: "2025-04-12", status: "confirmed" },
    { id: 4, student: "Michael Brown", room: "304", date: "2025-04-10", status: "cancelled" }
  ];
  
  const commissionRate = hostelData?.commission_rate || 0.1; // Default to 10% if not set
  
  const updateHostelPhotos = async (photos: string[]) => {
    try {
      const { error } = await supabase
        .from('hostels')
        .update({ photos })
        .eq('id', hostelData.id);

      if (error) throw error;
      
      hostelData.photos = photos;
    } catch (error: any) {
      console.error('Error updating photos:', error);
      toast.error('Failed to update photos');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">{hostelData?.name || "Hostel Dashboard"}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <Building className="h-4 w-4 mr-1" />
                  {hostelData?.address}, {hostelData?.city}
                </CardDescription>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{hostelData?.size?.toUpperCase() || "Medium"} Size</Badge>
                <Badge 
                  className={getLocationBadgeStyle(hostelData?.location_tier || "tier_2")}
                >
                  {getLocationTierName(hostelData?.location_tier || "tier_2")}
                </Badge>
                {!hostelData?.is_verified && (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Pending Verification
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Hostel Photos</h3>
              <PhotoUpload 
                onUpload={updateHostelPhotos}
                existingPhotos={hostelData.photos || []}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Occupancy Rate
              </CardTitle>
              <BedDouble className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="text-2xl font-bold mr-2">{stats.occupancyRate}%</div>
                <Progress value={stats.occupancyRate} className="h-2 w-16" />
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.occupiedRooms} of {stats.totalRooms} rooms filled
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Commission Rate
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(commissionRate * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Based on hostel size and location
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Bookings
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingBookings}</div>
              <p className="text-xs text-muted-foreground">
                +3 new since yesterday
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} p-2`}>
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="bookings" className="flex items-center gap-2">
                  <BedDouble className="h-4 w-4" />
                  <span>Bookings</span>
                </TabsTrigger>
                <TabsTrigger value="students" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Students</span>
                </TabsTrigger>
                <TabsTrigger value="finances" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Finances</span>
                </TabsTrigger>
              </TabsList>

              <div className="p-4">
                <TabsContent value="overview" className="mt-0 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Recent Bookings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {recentBookings.map((booking) => (
                            <div key={booking.id} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Avatar className="h-9 w-9 mr-3">
                                  <AvatarImage src="/placeholder.svg" alt={booking.student} />
                                  <AvatarFallback>{booking.student.slice(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{booking.student}</p>
                                  <p className="text-xs text-muted-foreground">Room {booking.room} • {booking.date}</p>
                                </div>
                              </div>
                              <Badge 
                                variant={booking.status === 'confirmed' ? 'default' : booking.status === 'pending' ? 'outline' : 'destructive'}
                                className="capitalize"
                              >
                                {booking.status === 'confirmed' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {booking.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                {booking.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                        <Separator className="my-4" />
                        <Button variant="outline" size="sm" className="w-full">View All Bookings</Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Hostel Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Contact Information</h4>
                          <p className="text-sm">Email: {hostelData?.email || "info@yourhost.com"}</p>
                          <p className="text-sm">Phone: {hostelData?.phone || "+1 (555) 123-4567"}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Description</h4>
                          <p className="text-sm text-muted-foreground">
                            {hostelData?.description || "No description available."}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Commission Details</h4>
                          <p className="text-sm">
                            Current Rate: {(commissionRate * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Commission is calculated based on hostel size and location tier.
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

                <TabsContent value="bookings" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Bookings Management</CardTitle>
                      <CardDescription>
                        View and manage all your hostel bookings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Bookings management interface coming soon...</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="students" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Students Management</CardTitle>
                      <CardDescription>
                        Manage student residents and applications
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Students management interface coming soon...</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="finances" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Financial Overview</CardTitle>
                      <CardDescription>
                        Track revenue, commissions and financial performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Financial tracking interface coming soon...</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
