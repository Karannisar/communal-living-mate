
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { supabase } from "@/integrations/supabase/client";

const AdminPage = lazy(() => import("./pages/dashboard/Admin"));
const StudentPage = lazy(() => import("./pages/dashboard/Student"));
const SecurityPage = lazy(() => import("./pages/dashboard/Security"));
const MessPage = lazy(() => import("./pages/dashboard/Mess"));

const queryClient = new QueryClient();

const App = () => {
  // Initialize OpenRouter API key in Supabase (only during development)
  useEffect(() => {
    const setOpenRouterKey = async () => {
      try {
        // This is a development-only setup to help with testing
        // In production, the secret should be set through Supabase dashboard
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.app_metadata?.provider === 'email' && 
            window.location.hostname === 'localhost') {
          console.log("Development environment detected. You might need to set the OPENROUTER_API_KEY in Supabase.");
        }
      } catch (error) {
        console.error("Error during initialization:", error);
      }
    };
    setOpenRouterKey();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={
              <Suspense fallback={<div>Loading...</div>}>
                <AdminPage />
              </Suspense>
            } />
            <Route path="/student" element={
              <Suspense fallback={<div>Loading...</div>}>
                <StudentPage />
              </Suspense>
            } />
            <Route path="/security" element={
              <Suspense fallback={<div>Loading...</div>}>
                <SecurityPage />
              </Suspense>
            } />
            <Route path="/mess" element={
              <Suspense fallback={<div>Loading...</div>}>
                <MessPage />
              </Suspense>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
