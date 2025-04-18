
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Edit, Trash2, Search, RefreshCw, Calendar } from "lucide-react";

// Define schema for booking form
const bookingFormSchema = z.object({
  user_id: z.string().min(1, { message: "Student is required." }),
  room_id: z.string().min(1, { message: "Room is required." }),
  start_date: z.string().min(1, { message: "Start date is required." }),
  end_date: z.string().min(1, { message: "End date is required." }),
  payment_status: z.string().min(1, { message: "Payment status is required." }),
  status: z.string().min(1, { message: "Status is required." }),
});

export function RoomAssignments() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const form = useForm<z.infer<typeof bookingFormSchema>>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      user_id: "",
      room_id: "",
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      payment_status: "pending",
      status: "active",
    },
  });

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          users:user_id (id, full_name, email),
          rooms:room_id (id, room_number, floor, capacity)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching bookings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, email")
        .eq("role", "student");

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching students",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("id, room_number, floor, capacity, is_available")
        .eq("is_available", true);

      if (error) throw error;
      setRooms(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching rooms",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchStudents();
    fetchRooms();
    
    // Set up real-time updates for bookings
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    const studentName = booking.users?.full_name || "";
    const studentEmail = booking.users?.email || "";
    const roomNumber = booking.rooms?.room_number || "";
    
    return (
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const openAddDialog = () => {
    form.reset({
      user_id: "",
      room_id: "",
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      payment_status: "pending",
      status: "active",
    });
    setIsEditing(false);
    setCurrentBooking(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (booking: any) => {
    setIsEditing(true);
    setCurrentBooking(booking);
    form.reset({
      user_id: booking.user_id,
      room_id: booking.room_id,
      start_date: booking.start_date,
      end_date: booking.end_date,
      payment_status: booking.payment_status,
      status: booking.status,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof bookingFormSchema>) => {
    try {
      if (isEditing && currentBooking) {
        // Handle room availability for the old room
        const { error: updateOldRoomError } = await supabase
          .from("rooms")
          .update({ is_available: true })
          .eq("id", currentBooking.room_id);
          
        if (updateOldRoomError) throw updateOldRoomError;
        
        // Update booking
        const { error } = await supabase
          .from("bookings")
          .update({
            user_id: values.user_id,
            room_id: values.room_id,
            start_date: values.start_date,
            end_date: values.end_date,
            payment_status: values.payment_status,
            status: values.status,
          })
          .eq("id", currentBooking.id);

        if (error) throw error;
        
        // Update room availability for the new room
        const { error: updateNewRoomError } = await supabase
          .from("rooms")
          .update({ is_available: false })
          .eq("id", values.room_id);
          
        if (updateNewRoomError) throw updateNewRoomError;
        
        toast({
          title: "Success",
          description: "Room assignment updated successfully",
        });
      } else {
        // Create new booking
        const { error } = await supabase
          .from("bookings")
          .insert({
            user_id: values.user_id,
            room_id: values.room_id,
            start_date: values.start_date,
            end_date: values.end_date,
            payment_status: values.payment_status,
            status: values.status,
          });

        if (error) throw error;
        
        // Update room availability
        const { error: updateRoomError } = await supabase
          .from("rooms")
          .update({ is_available: false })
          .eq("id", values.room_id);
          
        if (updateRoomError) throw updateRoomError;
        
        toast({
          title: "Success",
          description: "Room assigned successfully",
        });
      }
      
      setIsDialogOpen(false);
      fetchBookings();
      fetchRooms(); // Refresh available rooms
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteBooking = async (booking: any) => {
    if (!confirm("Are you sure you want to delete this room assignment?")) return;
    
    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", booking.id);

      if (error) throw error;
      
      // Update room availability
      const { error: updateRoomError } = await supabase
        .from("rooms")
        .update({ is_available: true })
        .eq("id", booking.room_id);
        
      if (updateRoomError) throw updateRoomError;
      
      toast({
        title: "Success",
        description: "Room assignment deleted successfully",
      });
      
      fetchBookings();
      fetchRooms(); // Refresh available rooms
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Room Assignments</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search assignments..."
              className="pl-9 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            onClick={() => {
              fetchBookings();
              fetchRooms();
              fetchStudents();
            }} 
            variant="outline" 
            size="icon"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={openAddDialog} className="flex items-center gap-1">
            <Plus className="h-4 w-4" /> Assign Room
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>
            {isLoading ? "Loading assignments..." : `A list of all room assignments (${filteredBookings.length})`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No room assignments found</TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{booking.users?.full_name || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">{booking.users?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{booking.rooms?.room_number || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">{booking.rooms?.floor}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <div>
                        <p className="text-xs">From: {new Date(booking.start_date).toLocaleDateString()}</p>
                        <p className="text-xs">To: {new Date(booking.end_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      booking.payment_status === "paid" ? "success" : 
                      booking.payment_status === "pending" ? "warning" : 
                      "destructive"
                    }>
                      {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      booking.status === "active" ? "success" : 
                      booking.status === "pending" ? "warning" : 
                      "destructive"
                    }>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openEditDialog(booking)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteBooking(booking)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Room Assignment" : "Assign New Room"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update room assignment details." 
                : "Assign a room to a student."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.full_name} ({student.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="room_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a room" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.room_number} ({room.floor}) - {room.capacity} beds
                          </SelectItem>
                        ))}
                        {isEditing && currentBooking && (
                          <SelectItem value={currentBooking.room_id}>
                            {currentBooking.rooms?.room_number} ({currentBooking.rooms?.floor})
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="payment_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Booking Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? "Update Assignment" : "Assign Room"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
