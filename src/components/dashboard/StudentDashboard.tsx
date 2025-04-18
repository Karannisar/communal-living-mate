
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BedDouble, UtensilsCrossed, Calendar, LogIn, LogOut, Users } from "lucide-react";

export function StudentDashboard() {
  const [student, setStudent] = useState<any>(null);
  const [booking, setBooking] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);
  const [roommates, setRoommates] = useState<any[]>([]);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [todayMenu, setTodayMenu] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Get student data
          const { data: studentData, error: studentError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
            
          if (studentError) throw studentError;
          setStudent(studentData);
          
          // Get booking/room data
          const { data: bookingData, error: bookingError } = await supabase
            .from('bookings')
            .select(`
              *,
              rooms:room_id (*)
            `)
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle();
            
          if (bookingError) throw bookingError;
          setBooking(bookingData);
          
          if (bookingData?.rooms) {
            setRoom(bookingData.rooms);
            
            // Get roommates data
            const { data: roommatesData, error: roommatesError } = await supabase
              .from('bookings')
              .select(`
                users:user_id (id, full_name, email)
              `)
              .eq('room_id', bookingData.room_id)
              .eq('status', 'active')
              .neq('user_id', user.id);
              
            if (roommatesError) throw roommatesError;
            setRoommates(roommatesData?.map((item: any) => item.users) || []);
          }
          
          // Check attendance status for today
          const today = new Date().toISOString().split('T')[0];
          const { data: attendanceData, error: attendanceError } = await supabase
            .from('attendance')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', today)
            .maybeSingle();
            
          if (attendanceError) throw attendanceError;
          setIsCheckedIn(!!attendanceData?.check_in && !attendanceData?.check_out);
          
          // Get today's menu
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const dayOfWeek = days[new Date().getDay()];
          
          const { data: menuData, error: menuError } = await supabase
            .from('mess_menu')
            .select('*')
            .eq('day_of_week', dayOfWeek);
            
          if (menuError) throw menuError;
          setTodayMenu(menuData || []);
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
        toast.error("Failed to load student data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStudentData();
    
    // Setup realtime updates for attendance
    const channel = supabase.channel('student-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `user_id=eq.${(supabase.auth.getUser()).then(({ data }) => data.user?.id)}`
      }, () => {
        fetchStudentData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const handleCheckIn = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      
      // Check if there's an existing record for today
      const { data: existingRecord, error: fetchError } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', student.id)
        .eq('date', today)
        .maybeSingle();
        
      if (fetchError) throw fetchError;
      
      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('attendance')
          .update({ check_in: now })
          .eq('id', existingRecord.id);
          
        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('attendance')
          .insert({
            user_id: student.id,
            date: today,
            check_in: now
          });
          
        if (error) throw error;
      }
      
      setIsCheckedIn(true);
      toast.success("You have successfully checked in!");
    } catch (error: any) {
      console.error("Check-in error:", error);
      toast.error("Failed to check in: " + error.message);
    }
  };
  
  const handleCheckOut = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      
      // Get today's record
      const { data: existingRecord, error: fetchError } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', student.id)
        .eq('date', today)
        .maybeSingle();
        
      if (fetchError) throw fetchError;
      
      if (!existingRecord) {
        toast.error("No check-in record found for today");
        return;
      }
      
      // Update with check-out time
      const { error } = await supabase
        .from('attendance')
        .update({ check_out: now })
        .eq('id', existingRecord.id);
        
      if (error) throw error;
      
      setIsCheckedIn(false);
      toast.success("You have successfully checked out!");
    } catch (error: any) {
      console.error("Check-out error:", error);
      toast.error("Failed to check out: " + error.message);
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[300px]">Loading student data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">My Room</CardTitle>
          </CardHeader>
          <CardContent>
            {room ? (
              <div className="space-y-2">
                <div className="flex items-center">
                  <BedDouble className="h-5 w-5 mr-2" />
                  <span className="font-medium">{room.room_number}</span>
                  <span className="text-sm text-muted-foreground ml-2">({room.floor})</span>
                </div>
                <div className="text-sm">
                  <Badge variant={booking.payment_status === "paid" ? "success" : "warning"}>
                    {booking.payment_status}
                  </Badge>
                  <span className="ml-2 text-muted-foreground">
                    ${room.price_per_month}/month
                  </span>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Amenities:</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {room.amenities && room.amenities.length > 0 ? (
                      room.amenities.map((amenity: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">None specified</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No room assigned yet</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Today's Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 mr-2" />
              <span className="font-medium">{new Date().toDateString()}</span>
            </div>
            <div className="flex justify-center">
              {isCheckedIn ? (
                <Button onClick={handleCheckOut} className="bg-red-500 hover:bg-red-600">
                  <LogOut className="h-4 w-4 mr-2" /> Check Out
                </Button>
              ) : (
                <Button onClick={handleCheckIn} className="bg-green-500 hover:bg-green-600">
                  <LogIn className="h-4 w-4 mr-2" /> Check In
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">My Roommates</CardTitle>
          </CardHeader>
          <CardContent>
            {roommates.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  <span className="font-medium">{roommates.length} roommate(s)</span>
                </div>
                <ul className="space-y-2">
                  {roommates.map((roommate) => (
                    <li key={roommate.id} className="text-sm">
                      <div className="font-medium">{roommate.full_name}</div>
                      <div className="text-muted-foreground">{roommate.email}</div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No roommates currently</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Today's Mess Menu</CardTitle>
          <CardDescription>
            {new Date().toDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todayMenu.length > 0 ? (
            <div className="space-y-4">
              {todayMenu.map((meal) => (
                <div key={meal.id} className="border-b pb-3 last:border-0">
                  <div className="flex items-center mb-2">
                    <UtensilsCrossed className="h-5 w-5 mr-2" />
                    <h3 className="font-medium">{meal.meal_type}</h3>
                  </div>
                  <ul className="list-disc pl-10 space-y-1">
                    {meal.items.map((item: string, index: number) => (
                      <li key={index} className="text-sm">{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No menu available for today</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
