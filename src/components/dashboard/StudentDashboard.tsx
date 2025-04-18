
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Calendar, Clock, BedDouble, Utensils, User, CheckCircle2, XCircle } from "lucide-react";
import { StudentRoomInfo } from "./student/StudentRoomInfo";
import { StudentAttendance } from "./student/StudentAttendance";
import { StudentRoommates } from "./student/StudentRoommates";
import { StudentMessMenu } from "./student/StudentMessMenu";
import { StudentAIAssistant } from "./student/StudentAIAssistant";
import { useIsMobile } from "@/hooks/use-mobile";

export function StudentDashboard({ activeSection = "dashboard", setActiveSection }: { activeSection?: string, setActiveSection?: (section: string) => void }) {
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchStudentData = async () => {
      setIsLoading(true);
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        // Get student details
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (userError) throw userError;
        setStudent(userData);
      } catch (error) {
        console.error("Error fetching student data:", error);
        toast.error("Failed to load student data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [activeSection]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // For mobile view, render tabs navigation
  if (isMobile) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Card>
          <CardHeader>
            <CardTitle>Student Dashboard</CardTitle>
            <CardDescription>
              Welcome back, {student?.full_name || "Student"}!
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="menu">Menu</TabsTrigger>
                <TabsTrigger value="ai">AI Help</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="p-4 space-y-4">
                <StudentRoomInfo />
                <StudentRoommates />
              </TabsContent>
              <TabsContent value="attendance" className="p-4">
                <StudentAttendance />
              </TabsContent>
              <TabsContent value="menu" className="p-4">
                <StudentMessMenu />
              </TabsContent>
              <TabsContent value="ai" className="p-4">
                <StudentAIAssistant />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Desktop view
  return (
    <div className="space-y-8 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Student Dashboard</CardTitle>
          <CardDescription>
            Welcome back, {student?.full_name || "Student"}! Here's your dormitory information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <StudentRoomInfo />
            <StudentAttendance />
            <StudentRoommates />
            <StudentMessMenu />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI Assistant</CardTitle>
          <CardDescription>
            Ask any questions about your accommodation or services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StudentAIAssistant />
        </CardContent>
      </Card>
    </div>
  );
}
