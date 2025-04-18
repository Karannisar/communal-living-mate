
import { useState, useEffect } from "react";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "sonner";

const StudentPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [studentData, setStudentData] = useState<any>(null);
  
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          setStudentData(data);
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        // Add a small delay to show loading screen
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };
    
    fetchStudentData();
  }, []);
  
  if (isLoading) {
    return <LoadingScreen message="Loading Student Dashboard" theme="theme-student" />;
  }
  
  return (
    <>
      <DashboardLayout role="student" userName={studentData?.full_name || "Student"} theme="theme-student">
        <StudentDashboard />
      </DashboardLayout>
      <Toaster position="top-right" />
    </>
  );
};

export default StudentPage;
