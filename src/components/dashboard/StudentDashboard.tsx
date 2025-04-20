import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { BedDouble, CalendarDays, Clock, User, Utensils } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { DormAiAssistant } from "../ai/DormAiAssistant";
import { StudentAttendance } from "./student/StudentAttendance";
import { StudentMessMenu } from "./student/StudentMessMenu";
import { StudentRoomInfo } from "./student/StudentRoomInfo";
import { StudentRoommates } from "./student/StudentRoommates";

interface StudentData {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export function StudentDashboard({ activeSection = "dashboard", setActiveSection }: { activeSection?: string, setActiveSection?: (section: string) => void }) {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchStudentData = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

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
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Clock className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col space-y-6">
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-none">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl">Welcome back, {student?.full_name || "Student"}!</CardTitle>
                <CardDescription className="text-base">
                  Manage your room, attendance, and mess menu all in one place.
                </CardDescription>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>Student</span>
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <CalendarDays className="w-3 h-3" />
                <span>Joined {new Date(student?.created_at || "").toLocaleDateString()}</span>
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{student?.email}</span>
              </Badge>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-0">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3' : 'grid-cols-3'} p-2`}>
                <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <BedDouble className="h-4 w-4" />
                  <span>Room</span>
                </TabsTrigger>
                <TabsTrigger value="attendance" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Attendance</span>
                </TabsTrigger>
                <TabsTrigger value="mess" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Utensils className="h-4 w-4" />
                  <span>Mess Menu</span>
                </TabsTrigger>
              </TabsList>

              <div className="p-4">
                <TabsContent value="overview" className="mt-0 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <StudentRoomInfo />
                    <StudentRoommates />
                  </div>
                </TabsContent>

                <TabsContent value="attendance" className="mt-0">
                  <StudentAttendance />
                </TabsContent>

                <TabsContent value="mess" className="mt-0">
                  <StudentMessMenu />
                </TabsContent>
              </div>
            </Tabs>
            <DormAiAssistant/>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
