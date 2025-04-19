
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "sonner";
import { HostelDashboard } from "@/components/dashboard/HostelDashboard";

const HostelPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [hostelData, setHostelData] = useState<any>(null);
  
  useEffect(() => {
    const fetchHostelData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (userError) throw userError;
          
          // Check if user has hostel role
          if (userData.role === 'hostel') {
            setIsAuthorized(true);
            
            // Get hostel data
            const { data: hostelData, error: hostelError } = await supabase
              .from('hostels')
              .select('*')
              .eq('id', user.id)
              .single();
              
            if (hostelError) throw hostelError;
            setHostelData(hostelData);
          } else {
            setIsAuthorized(false);
          }
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Error fetching hostel data:", error);
        setIsAuthorized(false);
      } finally {
        // Add a small delay to show loading screen
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };
    
    fetchHostelData();
  }, []);
  
  if (isLoading) {
    return <LoadingScreen message="Loading Hostel Dashboard" theme="theme-admin" />;
  }
  
  if (!isAuthorized) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <>
      <DashboardLayout 
        role="hostel" 
        userName={hostelData?.name || "Hostel Admin"} 
        theme="theme-admin"
      >
        <HostelDashboard hostelData={hostelData} />
      </DashboardLayout>
      <Toaster position="top-right" />
    </>
  );
};

export default HostelPage;
