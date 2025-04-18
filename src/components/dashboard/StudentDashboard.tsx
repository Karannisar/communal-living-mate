
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Calendar, Clock, BedDouble, Utensils, User, CheckCircle2, XCircle } from "lucide-react";

export function StudentDashboard({ activeSection = "dashboard", setActiveSection }: { activeSection?: string, setActiveSection?: (section: string) => void }) {
  const [student, setStudent] = useState<any>(null);
  const [roomAssignment, setRoomAssignment] = useState<any>(null);
  const [roommates, setRoommates] = useState<any[]>([]);
  const [todayMenu, setTodayMenu] = useState<any[]>([]);
  const [attendanceStatus, setAttendanceStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkingInOut, setCheckingInOut] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      setIsLoading(true);
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        // Get student details
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (userError) throw userError;
        setStudent(userData);

        // Get room assignment
        const { data: bookingData, error: bookingError } = await supabase
          .from("bookings")
          .select(`
            id, 
            start_date, 
            end_date, 
            payment_status, 
            status,
            rooms:room_id (id, room_number, floor, capacity, amenities, price_per_month)
          `)
          .eq("user_id", user.id)
          .eq("status", "active")
          .single();

        if (bookingData) {
          setRoomAssignment(bookingData);

          // Get roommates if room is assigned
          if (bookingData.rooms?.id) {
            const { data: roommatesData, error: roommatesError } = await supabase
              .from("bookings")
              .select(`
                users:user_id (id, full_name)
              `)
              .eq("room_id", bookingData.rooms.id)
              .eq("status", "active")
              .neq("user_id", user.id);

            if (!roommatesError && roommatesData) {
              setRoommates(roommatesData.map((item: any) => item.users));
            }
          }
        }

        // Get today's menu
        const dayOfWeek = new Date().toLocaleString('en-US', { weekday: 'long' });
        const { data: menuData, error: menuError } = await supabase
          .from("mess_menu")
          .select("*")
          .eq("day_of_week", dayOfWeek);

        if (!menuError && menuData) {
          setTodayMenu(menuData);
        }

        // Check attendance status
        const today = new Date().toISOString().split('T')[0];
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("attendance")
          .select("*")
          .eq("user_id", user.id)
          .eq("date", today)
          .maybeSingle();

        if (!attendanceError) {
          setAttendanceStatus(attendanceData);
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
        toast.error("Failed to load student data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();

    // Set up real-time updates for attendance
    const channel = supabase
      .channel('student-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'attendance',
        filter: `user_id=eq.${supabase.auth.getUser().then(({ data }) => data.user?.id)}`
      }, () => {
        // Refetch attendance status when it changes
        const fetchAttendance = async () => {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase
              .from("attendance")
              .select("*")
              .eq("user_id", user.id)
              .eq("date", today)
              .maybeSingle();

            if (!error) {
              setAttendanceStatus(data);
            }
          } catch (error) {
            console.error("Error updating attendance status:", error);
          }
        };
        fetchAttendance();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeSection]);

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

      // Refetch attendance status
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();

      if (!error) {
        setAttendanceStatus(data);
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

      // Refetch attendance status
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();

      if (!error) {
        setAttendanceStatus(data);
      }
    } catch (error) {
      console.error("Check-out error:", error);
      toast.error("Failed to check out. Please try again.");
    } finally {
      setCheckingInOut(false);
    }
  };

  const renderAttendanceCard = () => {
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Attendance
          </CardTitle>
          <CardDescription>Your check-in/out status for today ({today})</CardDescription>
        </CardHeader>
        <CardContent>
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
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Student Dashboard</CardTitle>
          <CardDescription>
            Welcome back, {student?.full_name || "Student"}! Here's your dormitory information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Room Assignment Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BedDouble className="h-5 w-5" /> Your Room
                </CardTitle>
              </CardHeader>
              <CardContent>
                {roomAssignment ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Room Number:</span>
                        <span className="font-medium">{roomAssignment.rooms?.room_number || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Floor:</span>
                        <span className="font-medium">{roomAssignment.rooms?.floor || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Capacity:</span>
                        <span className="font-medium">{roomAssignment.rooms?.capacity || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-medium">${roomAssignment.rooms?.price_per_month || 'N/A'}/month</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">
                          {new Date(roomAssignment.start_date).toLocaleDateString()} - {new Date(roomAssignment.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Status:</span>
                        <Badge variant={
                          roomAssignment.payment_status === "paid" ? "success" : 
                          roomAssignment.payment_status === "pending" ? "warning" : 
                          "destructive"
                        }>
                          {roomAssignment.payment_status.charAt(0).toUpperCase() + roomAssignment.payment_status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    {roomAssignment.rooms?.amenities && roomAssignment.rooms.amenities.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Amenities:</p>
                        <div className="flex flex-wrap gap-1">
                          {roomAssignment.rooms.amenities.map((amenity: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No room currently assigned.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => toast.info("Please contact the admin for room assignment.")}
                    >
                      Request Room
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Attendance Card */}
            {renderAttendanceCard()}

            {/* Roommates Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" /> Roommates
                </CardTitle>
              </CardHeader>
              <CardContent>
                {roommates.length > 0 ? (
                  <div className="space-y-2">
                    {roommates.map((roommate, index) => (
                      <div key={roommate.id || index} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{roommate.full_name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <span>{roommate.full_name || "Anonymous Student"}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      {roomAssignment ? "No roommates currently assigned." : "No room assigned yet."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Today's Menu Card */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" /> Today's Mess Menu
                </CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todayMenu.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {todayMenu.map((meal) => (
                      <Card key={meal.id} className="overflow-hidden">
                        <CardHeader className="p-4 bg-muted">
                          <CardTitle className="text-base">{meal.meal_type}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <ScrollArea className="h-[100px]">
                            <ul className="space-y-1">
                              {meal.items && meal.items.map((item: string, i: number) => (
                                <li key={i} className="text-sm">• {item}</li>
                              ))}
                            </ul>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No menu items available for today.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Used in the StudentDashboard component
const Avatar = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}>
    {children}
  </div>
);

const AvatarFallback = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
    {children}
  </div>
);

// Utility function for classnames
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
