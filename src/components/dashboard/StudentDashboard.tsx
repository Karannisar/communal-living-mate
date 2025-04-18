import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { BedDouble, Clock, Utensils } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
        <div className="animate-spin text-primary">
          <Clock className="h-8 w-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome back, {student?.full_name || "Student"}!</CardTitle>
            <CardDescription>
              Manage your room, attendance, and mess menu all in one place.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3' : 'grid-cols-3'} p-2`}>
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BedDouble className="h-4 w-4" />
                  <span>Room</span>
                </TabsTrigger>
                <TabsTrigger value="attendance" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Attendance</span>
                </TabsTrigger>
                <TabsTrigger value="mess" className="flex items-center gap-2">
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
