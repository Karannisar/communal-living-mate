
import { useState, useEffect } from "react";
import { MessDashboard } from "@/components/dashboard/MessDashboard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LoadingScreen } from "@/components/ui/loading-screen";

const MessPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return <LoadingScreen message="Loading Mess Dashboard" theme="theme-mess" />;
  }
  
  return (
    <DashboardLayout role="mess" userName="Mess Staff" theme="theme-mess">
      <MessDashboard />
    </DashboardLayout>
  );
};

export default MessPage;
