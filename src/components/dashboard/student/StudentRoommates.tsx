
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

export function StudentRoommates() {
  const [roommates, setRoommates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roomAssignment, setRoomAssignment] = useState<any>(null);

  useEffect(() => {
    const fetchRoommates = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        // Get room assignment
        const { data: bookingData, error: bookingError } = await supabase
          .from("bookings")
          .select(`
            rooms:room_id (id)
          `)
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle();

        if (bookingError && bookingError.code !== 'PGRST116') {
          console.error("Error fetching room assignment:", bookingError);
        }
        
        setRoomAssignment(bookingData || null);

        // Get roommates if room is assigned
        if (bookingData?.rooms?.id) {
          const { data: roommatesData, error: roommatesError } = await supabase
            .from("bookings")
            .select(`
              users:user_id (id, full_name)
            `)
            .eq("room_id", bookingData.rooms.id)
            .eq("status", "active")
            .neq("user_id", user.id);

          if (roommatesError) throw roommatesError;
          setRoommates(roommatesData?.map((item: any) => item.users) || []);
        }
      } catch (error) {
        console.error("Error fetching roommates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoommates();
  }, []);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" /> Roommates
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : roommates.length > 0 ? (
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
  );
}
