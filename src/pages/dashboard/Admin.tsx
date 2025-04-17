
import { useState, useEffect } from "react";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { supabase } from "@/integrations/supabase/client";

const AdminPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email)
            .eq('role', 'admin')
            .maybeSingle();
            
          if (error) throw error;
          setAdminData(data);
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        // Add a small delay to show loading screen
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };
    
    fetchAdminData();
  }, []);
  
  if (isLoading) {
    return <LoadingScreen message="Loading Admin Dashboard" theme="theme-admin" />;
  }
  
  return (
    <DashboardLayout role="admin" userName={adminData?.full_name || "Admin User"} theme="theme-admin">
      <AdminDashboard />
    </DashboardLayout>
  );
};

export default AdminPage;
