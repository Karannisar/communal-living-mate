
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BedDouble } from "lucide-react";

export function StudentRoomInfo() {
  const [roomAssignment, setRoomAssignment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

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

        if (bookingError && bookingError.code !== 'PGRST116') {
          // PGRST116 is the error code for "no rows returned"
          console.error("Error fetching room assignment:", bookingError);
        }
        
        setRoomAssignment(bookingData || null);
      } catch (error) {
        console.error("Error fetching room data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomData();
  }, []);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BedDouble className="h-5 w-5" /> Your Room
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : roomAssignment ? (
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
  );
}
