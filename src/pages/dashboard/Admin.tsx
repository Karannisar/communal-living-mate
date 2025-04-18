
import { useState, useEffect } from "react";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "sonner";

const AdminPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [adminData, setAdminData] = useState<any>(null);
  
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
    
    // Set up real-time table changes to enable notifications
    const channel = supabase.channel('admin-notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'attendance',
      }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          // Show notification when a student checks in or out
          const toast = window.document.createElement('div');
          toast.textContent = `Student activity: ${payload.eventType === 'INSERT' ? 'New check-in' : 'Updated attendance'}`;
          document.body.appendChild(toast);
          setTimeout(() => document.body.removeChild(toast), 3000);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  if (isLoading) {
    return <LoadingScreen message="Loading Admin Dashboard" theme="theme-admin" />;
  }
  
  return (
    <>
      <DashboardLayout role="admin" userName={adminData?.full_name || "Admin User"} theme="theme-admin">
        <AdminDashboard />
      </DashboardLayout>
      <Toaster position="top-right" />
    </>
  );
};

export default AdminPage;
