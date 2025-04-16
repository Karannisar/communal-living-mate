
import { useState, useEffect } from "react";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LoadingScreen } from "@/components/ui/loading-screen";

const StudentPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return <LoadingScreen message="Loading Student Dashboard" theme="theme-student" />;
  }
  
  return (
    <DashboardLayout role="student" userName="Student User" theme="theme-student">
      <StudentDashboard />
    </DashboardLayout>
  );
};

export default StudentPage;
