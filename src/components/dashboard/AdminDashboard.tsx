import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AttendanceMonitoring } from "./AttendanceMonitoring";
import { MessMenuManagement } from "./MessMenuManagement";
import { RoomAssignments } from "./RoomAssignments";
import { RoomsManagement } from "./RoomsManagement";
import { StudentsManagement } from "./StudentsManagement";

export function AdminDashboard({ activeSection = "dashboard", setActiveSection }: { activeSection?: string, setActiveSection?: (section: string) => void }) {
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    availableRooms: 0,
    currentCheckins: 0,
    occupancyRate: "0%",
    totalRooms: 0,
    totalCapacity: 0,
    totalOccupied: 0
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
        
        // Get rooms with their booking counts
        const { data: rooms, error: roomsError } = await supabase
          .from("rooms")
          .select(`
            id,
            capacity,
            bookings:bookings(count)
          `);
          
        if (roomsError) throw roomsError;
        
        // Calculate available rooms and occupancy
        const roomStats = (rooms || []).reduce((acc, room) => {
          const currentOccupancy = room.bookings?.[0]?.count || 0;
          const isAvailable = currentOccupancy < room.capacity;
          return {
            totalRooms: acc.totalRooms + 1,
            availableRooms: acc.availableRooms + (isAvailable ? 1 : 0),
            totalCapacity: acc.totalCapacity + room.capacity,
            totalOccupied: acc.totalOccupied + currentOccupancy
          };
        }, { totalRooms: 0, availableRooms: 0, totalCapacity: 0, totalOccupied: 0 });
        
        // Get current check-ins
        const today = new Date().toISOString().split('T')[0];
        const { data: checkIns, error: checkInsError } = await supabase
          .from("attendance")
          .select("id")
          .eq("date", today)
          .not("check_in", "is", null);
          
        if (checkInsError) throw checkInsError;
        
        // Calculate occupancy rate based on total capacity vs occupied spots
        const occupancyRate = roomStats.totalCapacity > 0 
          ? Math.round((roomStats.totalOccupied / roomStats.totalCapacity) * 100)
          : 0;
        
        setDashboardStats({
          totalStudents: students?.length || 0,
          availableRooms: roomStats.availableRooms,
          currentCheckins: checkIns?.length || 0,
          occupancyRate: `${occupancyRate}%`,
          totalRooms: roomStats.totalRooms,
          totalCapacity: roomStats.totalCapacity,
          totalOccupied: roomStats.totalOccupied
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardStats.totalStudents}</div>
          <p className="text-xs text-muted-foreground">Registered students</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Room Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardStats.availableRooms} / {dashboardStats.totalRooms}</div>
          <p className="text-xs text-muted-foreground">
            Available rooms ({dashboardStats.totalOccupied} spots occupied out of {dashboardStats.totalCapacity} total capacity)
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Check-ins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardStats.currentCheckins}</div>
          <p className="text-xs text-muted-foreground">Students checked in today</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardStats.occupancyRate}</div>
          <p className="text-xs text-muted-foreground">Of total room capacity</p>
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
    <div className="space-y-4">
      {activeSection === "dashboard" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">Registered students</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Room Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.availableRooms} / {dashboardStats.totalRooms}</div>
              <p className="text-xs text-muted-foreground">
                Available rooms ({dashboardStats.totalOccupied} spots occupied out of {dashboardStats.totalCapacity} total capacity)
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Check-ins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.currentCheckins}</div>
              <p className="text-xs text-muted-foreground">Students checked in today</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.occupancyRate}</div>
              <p className="text-xs text-muted-foreground">Of total room capacity</p>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSection === "students" && <StudentsManagement />}
      {activeSection === "rooms" && <RoomsManagement />}
      {activeSection === "room-assignments" && <RoomAssignments />}
      {activeSection === "attendance" && <AttendanceMonitoring />}
      {activeSection === "mess-menu" && <MessMenuManagement />}
    </div>
  );
}
