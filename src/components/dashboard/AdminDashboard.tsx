
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { StudentsManagement } from "./StudentsManagement";
import { RoomsManagement } from "./RoomsManagement";
import { RoomAssignments } from "./RoomAssignments";
import { AttendanceMonitoring } from "./AttendanceMonitoring";
import { MessMenuManagement } from "./MessMenuManagement";
import { Loader2 } from "lucide-react";

export function AdminDashboard({ activeSection = "dashboard", setActiveSection }: { activeSection?: string, setActiveSection?: (section: string) => void }) {
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    availableRooms: 0,
    currentCheckins: 0,
    occupancyRate: "0%"
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      setIsLoading(true);
      try {
        // Get total students
        const { data: students, error: studentsError } = await supabase
          .from("users")
          .select("id")
          .eq("role", "student");
          
        if (studentsError) throw studentsError;
        
        // Get available rooms
        const { data: availableRooms, error: roomsError } = await supabase
          .from("rooms")
          .select("id")
          .eq("is_available", true);
          
        if (roomsError) throw roomsError;
        
        // Get total rooms for occupancy calculation
        const { data: totalRooms, error: totalRoomsError } = await supabase
          .from("rooms")
          .select("id");
          
        if (totalRoomsError) throw totalRoomsError;
        
        // Get current check-ins
        const today = new Date().toISOString().split('T')[0];
        const { data: checkIns, error: checkInsError } = await supabase
          .from("attendance")
          .select("id")
          .eq("date", today)
          .not("check_in", "is", null);
          
        if (checkInsError) throw checkInsError;
        
        // Calculate occupancy rate
        const occupancyRate = totalRooms.length > 0 
          ? Math.round(((totalRooms.length - availableRooms.length) / totalRooms.length) * 100) 
          : 0;
        
        setDashboardStats({
          totalStudents: students?.length || 0,
          availableRooms: availableRooms?.length || 0,
          currentCheckins: checkIns?.length || 0,
          occupancyRate: `${occupancyRate}%`
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (activeSection === "dashboard") {
      fetchDashboardStats();
    }
  }, [activeSection]);
  
  // Dashboard overview component
  const DashboardOverview = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold">{dashboardStats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Registered students in system
              </p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold">{dashboardStats.availableRooms}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.occupancyRate} occupancy rate
              </p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Check-ins</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold">{dashboardStats.currentCheckins}</div>
              <p className="text-xs text-muted-foreground">
                Today's active check-ins
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
  
  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>
                Welcome to the DormMate admin dashboard. Manage students, rooms, assignments, and more.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DashboardOverview />
            </CardContent>
          </Card>
        );
      case "students":
        return <StudentsManagement />;
      case "rooms":
        return <RoomsManagement />;
      case "room-assignments":
        return <RoomAssignments />;
      case "attendance":
        return <AttendanceMonitoring />;
      case "mess-menu":
        return <MessMenuManagement />;
      case "settings":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Configure your application settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Settings functionality coming soon.</p>
            </CardContent>
          </Card>
        );
      default:
        return <StudentsManagement />;
    }
  };
  
  return (
    <div className="space-y-6">
      {renderActiveSection()}
    </div>
  );
}
