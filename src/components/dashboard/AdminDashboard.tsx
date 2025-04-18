
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentsManagement } from "./StudentsManagement";
import { RoomsManagement } from "./RoomsManagement";
import { RoomAssignments } from "./RoomAssignments";
import { AttendanceMonitoring } from "./AttendanceMonitoring";
import { MessMenuManagement } from "./MessMenuManagement";

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  
  // Dashboard overview component
  const DashboardOverview = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">25</div>
          <p className="text-xs text-muted-foreground">
            +4 from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">
            75% occupancy rate
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Check-ins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">18</div>
          <p className="text-xs text-muted-foreground">
            72% of total students
          </p>
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
