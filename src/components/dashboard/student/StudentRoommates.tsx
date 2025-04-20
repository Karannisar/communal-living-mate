import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, User, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Roommate {
  id: string;
  full_name: string;
  email?: string;
}

interface RoomAssignment {
  rooms: {
    id: string;
    capacity?: number;
  };
}

export function StudentRoommates() {
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomCapacity, setRoomCapacity] = useState<number | null>(null);

  useEffect(() => {
    const fetchRoommates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        console.log("Fetching roommates for user:", user.id);

        // First get the user's room assignment
        const { data: userBooking, error: bookingError } = await supabase
          .from("bookings")
          .select(`
            room_id,
            rooms:room_id (
              capacity
            )
          `)
          .eq("user_id", user.id)
          .eq("status", "approved")
          .single();

        console.log("User booking data:", userBooking);
        console.log("Booking error:", bookingError);

        if (bookingError) {
          if (bookingError.code === 'PGRST116') {
            console.log("No active room assignment found");
            setRoommates([]);
            return;
          }
          throw bookingError;
        }

        if (!userBooking?.room_id) {
          console.log("No room_id found in booking");
          setError("Room assignment data is incomplete");
          return;
        }

        setRoomCapacity(userBooking.rooms?.capacity || null);

        // Then get all other users in the same room
        const { data: roommatesData, error: roommatesError } = await supabase
          .from("bookings")
          .select(`
            users:user_id (
              id,
              email,
              full_name
            )
          `)
          .eq("room_id", userBooking.room_id)
          .eq("status", "approved")
          .neq("user_id", user.id);

        console.log("Roommates data:", roommatesData);
        console.log("Roommates error:", roommatesError);

        if (roommatesError) throw roommatesError;

        const formattedRoommates: Roommate[] = (roommatesData || []).map(booking => ({
          id: booking.users.id,
          full_name: booking.users.full_name || "Anonymous",
          email: booking.users.email
        }));

        console.log("Formatted roommates:", formattedRoommates);
        setRoommates(formattedRoommates);
      } catch (error) {
        console.error("Error fetching roommates:", error);
        setError("Failed to load roommate details");
        toast.error("Failed to load roommate details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoommates();
  }, []);

  return (
    <Card className="h-full border-none shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-background to-muted/30">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Users className="h-6 w-6 text-primary" />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Roommates
            </span>
          </CardTitle>
          {roomCapacity && (
            <Badge 
              variant="outline" 
              className="bg-background/50 flex items-center gap-1.5 px-3 py-1"
            >
              <User className="h-3.5 w-3.5" />
              <span>{roommates.length}/{roomCapacity - 1}</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground animate-pulse">Loading roommates...</p>
            </div>
          </div>
        ) : roommates.length > 0 ? (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-5 duration-500">
            {roommates.map((roommate, index) => (
              <div 
                key={roommate.id || index} 
                className="group flex items-center gap-4 p-4 rounded-lg bg-muted/50 backdrop-blur-sm hover:bg-muted/70 transition-all duration-200"
              >
                <Avatar className="h-12 w-12 border-2 border-background group-hover:border-primary transition-colors">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                    {roommate.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-medium text-base truncate group-hover:text-primary transition-colors">
                    {roommate.full_name || "Anonymous Student"}
                  </p>
                  {roommate.email && (
                    <p className="text-sm text-muted-foreground truncate">
                      {roommate.email}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="text-center space-y-4">
              <div className="relative">
                <Users className="h-16 w-16 text-muted-foreground/30 mx-auto" />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              </div>
              <p className="text-muted-foreground">
                {roomCapacity ? "No roommates currently assigned." : "No room assigned yet."}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
