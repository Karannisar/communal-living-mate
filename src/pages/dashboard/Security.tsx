
import { useState, useEffect } from "react";
import { SecurityDashboard } from "@/components/dashboard/SecurityDashboard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LoadingScreen } from "@/components/ui/loading-screen";

const SecurityPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return <LoadingScreen message="Loading Security Dashboard" theme="theme-security" />;
  }
  
  return (
    <DashboardLayout role="security" userName="Security User" theme="theme-security">
      <SecurityDashboard />
    </DashboardLayout>
  );
};

export default SecurityPage;
