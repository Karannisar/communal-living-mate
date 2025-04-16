
import { useState, useEffect } from "react";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LoadingScreen } from "@/components/ui/loading-screen";

const AdminPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return <LoadingScreen message="Loading Admin Dashboard" theme="theme-admin" />;
  }
  
  return (
    <DashboardLayout role="admin" userName="Admin User" theme="theme-admin">
      <AdminDashboard />
    </DashboardLayout>
  );
};

export default AdminPage;
