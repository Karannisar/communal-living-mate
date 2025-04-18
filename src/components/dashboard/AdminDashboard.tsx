
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BedDouble, CalendarClock, ClipboardList } from "lucide-react";
import { StudentsManagement } from "./StudentsManagement";
import { RoomsManagement } from "./RoomsManagement";
import { RoomAssignments } from "./RoomAssignments";
import { AttendanceMonitoring } from "./AttendanceMonitoring";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("students");
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Manage students, rooms, assignments, and monitor attendance.
        </p>
      </div>
      
      <Tabs defaultValue="students" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Students</span>
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex items-center gap-2">
            <BedDouble className="h-4 w-4" />
            <span>Rooms</span>
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span>Assignments</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            <span>Attendance</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="students" className="space-y-4">
          <StudentsManagement />
        </TabsContent>
        
        <TabsContent value="rooms" className="space-y-4">
          <RoomsManagement />
        </TabsContent>
        
        <TabsContent value="assignments" className="space-y-4">
          <RoomAssignments />
        </TabsContent>
        
        <TabsContent value="attendance" className="space-y-4">
          <AttendanceMonitoring />
        </TabsContent>
      </Tabs>
    </div>
  );
}
