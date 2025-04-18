
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Calendar, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function StudentAttendance() {
  const [attendanceStatus, setAttendanceStatus] = useState<any>(null);
  const [checkingInOut, setCheckingInOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAttendanceStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");
        
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from("attendance")
          .select("*")
          .eq("user_id", user.id)
          .eq("date", today)
          .maybeSingle();

        if (error) throw error;
        setAttendanceStatus(data);
      } catch (error) {
        console.error("Error checking attendance status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceStatus();

    // Set up real-time updates for attendance
    const channel = supabase
      .channel('attendance-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'attendance',
        filter: `user_id=eq.${supabase.auth.getUser().then(({ data }) => data.user?.id)}`
      }, () => {
        fetchAttendanceStatus();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCheckIn = async () => {
    setCheckingInOut(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      if (!attendanceStatus) {
        // Create new attendance record
        const { error } = await supabase
          .from("attendance")
          .insert({
            user_id: user.id,
            date: today,
            check_in: now
          });

        if (error) throw error;
        toast.success("You have successfully checked in");
      } else {
        // Update existing record with check-in time
        const { error } = await supabase
          .from("attendance")
          .update({ check_in: now })
          .eq("id", attendanceStatus.id);

        if (error) throw error;
        toast.success("Your check-in time has been updated");
      }
    } catch (error) {
      console.error("Check-in error:", error);
      toast.error("Failed to check in. Please try again.");
    } finally {
      setCheckingInOut(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingInOut(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      if (!attendanceStatus) {
        // Create new attendance record with checkout time only
        const { error } = await supabase
          .from("attendance")
          .insert({
            user_id: user.id,
            date: today,
            check_out: now
          });

        if (error) throw error;
        toast.success("You have successfully checked out");
      } else {
        // Update existing record with check-out time
        const { error } = await supabase
          .from("attendance")
          .update({ check_out: now })
          .eq("id", attendanceStatus.id);

        if (error) throw error;
        toast.success("Your check-out time has been updated");
      }
    } catch (error) {
      console.error("Check-out error:", error);
      toast.error("Failed to check out. Please try again.");
    } finally {
      setCheckingInOut(false);
    }
  };

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" /> Attendance
        </CardTitle>
        <CardDescription>Your check-in/out status for today ({today})</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>Check-in:</span>
              </div>
              {attendanceStatus?.check_in ? (
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  {new Date(attendanceStatus.check_in).toLocaleTimeString()}
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-100 text-amber-800">Not checked in</Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>Check-out:</span>
              </div>
              {attendanceStatus?.check_out ? (
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  {new Date(attendanceStatus.check_out).toLocaleTimeString()}
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-100 text-amber-800">Not checked out</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Button 
          className="flex-1 gap-1"
          onClick={handleCheckIn}
          disabled={checkingInOut}
        >
          {checkingInOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )} 
          Check In
        </Button>
        <Button 
          className="flex-1 gap-1"
          onClick={handleCheckOut}
          disabled={checkingInOut}
        >
          {checkingInOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4" />
          )} 
          Check Out
        </Button>
      </CardFooter>
    </Card>
  );
}
