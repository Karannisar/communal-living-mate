import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BedDouble, Calendar, CreditCard, Home, Loader2, MapPin, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Room {
  id: string;
  room_number: string;
  floor: string;
  capacity: number;
  amenities: string[];
  price_per_month: number;
}

interface RoomAssignment {
  id: string;
  start_date: string;
  end_date: string;
  payment_status: string;
  status: string;
  rooms: Room;
}

export function StudentRoomInfo() {
  const [roomAssignment, setRoomAssignment] = useState<RoomAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoomData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        console.log("Fetching room data for user:", user.id);

        // Get room assignment
        const { data: bookingData, error: bookingError } = await supabase
          .from("bookings")
          .select(`
            id, 
            start_date, 
            end_date, 
            payment_status, 
            status,
            rooms:room_id (
              id, 
              room_number, 
              floor, 
              capacity, 
              amenities, 
              price_per_month
            )
          `)
          .eq("user_id", user.id)
          .eq("status", "approved")
          .single();

        console.log("Room booking data:", bookingData);
        console.log("Room booking error:", bookingError);

        if (bookingError) {
          if (bookingError.code === 'PGRST116') {
            console.log("No active room assignment found");
            setRoomAssignment(null);
          } else {
            throw bookingError;
          }
        } else if (!bookingData?.rooms) {
          console.log("Room data is missing in the booking");
          setError("Room data is incomplete. Please contact support.");
        } else {
          console.log("Setting room assignment:", bookingData);
          setRoomAssignment(bookingData);
        }
      } catch (error) {
        console.error("Error fetching room data:", error);
        setError("Failed to load room details. Please try again later.");
        toast.error("Failed to load room details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomData();
  }, []);

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "partial":
        return "info";
      default:
        return "destructive";
    }
  };

  if (error) {
    return (
      <Card className="h-full border-none shadow-md">
        <CardContent className="flex flex-col items-center justify-center h-full py-8">
          <div className="text-center space-y-2">
            <p className="text-destructive">{error}</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-none shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-background to-muted/30">
      <CardHeader className="border-b border-border/50 pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <BedDouble className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Your Room
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground animate-pulse">Loading room details...</p>
            </div>
          </div>
        ) : roomAssignment && roomAssignment.rooms ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 p-4 rounded-lg bg-muted/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-primary">
                  <Home className="h-4 w-4" />
                  <span className="text-sm font-medium">Room Number</span>
                </div>
                <p className="text-2xl font-semibold">{roomAssignment.rooms.room_number}</p>
              </div>
              <div className="space-y-2 p-4 rounded-lg bg-muted/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-primary">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">Floor</span>
                </div>
                <p className="text-2xl font-semibold">{roomAssignment.rooms.floor}</p>
              </div>
              <div className="space-y-2 p-4 rounded-lg bg-muted/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-primary">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">Capacity</span>
                </div>
                <p className="text-2xl font-semibold">{roomAssignment.rooms.capacity}</p>
              </div>
              <div className="space-y-2 p-4 rounded-lg bg-muted/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-primary">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm font-medium">Price</span>
                </div>
                <p className="text-2xl font-semibold">₹{roomAssignment.rooms.price_per_month}/mo</p>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-lg bg-muted/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-primary">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Duration</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">From</span>
                  <p className="font-medium">{new Date(roomAssignment.start_date).toLocaleDateString()}</p>
                </div>
                <div className="h-[2px] w-12 bg-border rounded-full" />
                <div className="space-y-1 text-right">
                  <span className="text-sm text-muted-foreground">To</span>
                  <p className="font-medium">{new Date(roomAssignment.end_date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50 backdrop-blur-sm">
              <span className="text-sm font-medium text-primary">Payment Status</span>
              <Badge variant={getPaymentStatusColor(roomAssignment.payment_status)} className="capitalize">
                {roomAssignment.payment_status}
              </Badge>
            </div>

            {roomAssignment.rooms.amenities && roomAssignment.rooms.amenities.length > 0 && (
              <div className="space-y-3 p-4 rounded-lg bg-muted/50 backdrop-blur-sm">
                <span className="text-sm font-medium text-primary">Amenities</span>
                <div className="flex flex-wrap gap-2">
                  {roomAssignment.rooms.amenities.map((amenity: string, i: number) => (
                    <Badge 
                      key={i} 
                      variant="outline"
                      className="bg-background/50 hover:bg-background transition-colors"
                    >
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center py-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="text-center space-y-4">
              <div className="relative">
                <BedDouble className="h-16 w-16 text-muted-foreground/30 mx-auto" />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground">No room currently assigned.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-background/50 hover:bg-background transition-colors"
                  onClick={() => toast.info("Please contact the admin for room assignment.")}
                >
                  Request Room
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
