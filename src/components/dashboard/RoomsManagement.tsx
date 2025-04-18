
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Edit, Trash2, Search, RefreshCw, Users } from "lucide-react";

// Define schema for room form
const roomFormSchema = z.object({
  room_number: z.string().min(1, { message: "Room number is required." }),
  floor: z.string().min(1, { message: "Floor is required." }),
  capacity: z.coerce.number().min(1, { message: "Capacity must be at least 1." }),
  price_per_month: z.coerce.number().min(0, { message: "Price must be a positive number." }),
  is_available: z.boolean().default(true),
  amenities: z.array(z.string()).default([]),
});

type Amenity = { id: string; label: string };

export function RoomsManagement() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const amenities: Amenity[] = [
    { id: "wifi", label: "WiFi" },
    { id: "ac", label: "Air Conditioner" },
    { id: "tv", label: "Television" },
    { id: "fridge", label: "Refrigerator" },
    { id: "bathroom", label: "Attached Bathroom" },
    { id: "balcony", label: "Balcony" },
    { id: "study_desk", label: "Study Desk" },
  ];

  const form = useForm<z.infer<typeof roomFormSchema>>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      room_number: "",
      floor: "",
      capacity: 2,
      price_per_month: 0,
      is_available: true,
      amenities: [],
    },
  });

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("room_number", { ascending: true });

      if (error) throw error;
      setRooms(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching rooms",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    
    // Set up real-time updates for rooms
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms'
        },
        () => {
          fetchRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredRooms = rooms.filter((room) => 
    room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) || 
    room.floor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddDialog = () => {
    form.reset({
      room_number: "",
      floor: "",
      capacity: 2,
      price_per_month: 0,
      is_available: true,
      amenities: [],
    });
    setIsEditing(false);
    setCurrentRoom(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (room: any) => {
    setIsEditing(true);
    setCurrentRoom(room);
    form.reset({
      room_number: room.room_number,
      floor: room.floor,
      capacity: room.capacity,
      price_per_month: room.price_per_month,
      is_available: room.is_available,
      amenities: room.amenities || [],
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof roomFormSchema>) => {
    try {
      if (isEditing && currentRoom) {
        // Update existing room
        const { error } = await supabase
          .from("rooms")
          .update({
            room_number: values.room_number,
            floor: values.floor,
            capacity: values.capacity,
            price_per_month: values.price_per_month,
            is_available: values.is_available,
            amenities: values.amenities,
          })
          .eq("id", currentRoom.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Room updated successfully",
        });
      } else {
        // Create new room
        const { error } = await supabase
          .from("rooms")
          .insert({
            room_number: values.room_number,
            floor: values.floor,
            capacity: values.capacity,
            price_per_month: values.price_per_month,
            is_available: values.is_available,
            amenities: values.amenities,
          });

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Room created successfully",
        });
      }
      
      setIsDialogOpen(false);
      fetchRooms();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteRoom = async (id: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    
    try {
      const { error } = await supabase
        .from("rooms")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Room deleted successfully",
      });
      
      fetchRooms();
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
        <CardTitle>Rooms Management</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search rooms..."
              className="pl-9 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            onClick={() => fetchRooms()} 
            variant="outline" 
            size="icon"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={openAddDialog} className="flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add Room
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>
            {isLoading ? "Loading rooms..." : `A list of all rooms (${filteredRooms.length})`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Room Number</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Price/Month</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amenities</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : filteredRooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">No rooms found</TableCell>
              </TableRow>
            ) : (
              filteredRooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.room_number}</TableCell>
                  <TableCell>{room.floor}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {room.capacity}
                    </div>
                  </TableCell>
                  <TableCell>${room.price_per_month}</TableCell>
                  <TableCell>
                    <Badge variant={room.is_available ? "success" : "destructive"}>
                      {room.is_available ? "Available" : "Occupied"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {room.amenities && room.amenities.length > 0 ? (
                        room.amenities.slice(0, 3).map((amenity: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-xs">None</span>
                      )}
                      {room.amenities && room.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{room.amenities.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openEditDialog(room)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteRoom(room.id)}
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
            <DialogTitle>{isEditing ? "Edit Room" : "Add New Room"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update room information in the system." 
                : "Fill in the details to add a new room to the system."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="room_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Number</FormLabel>
                      <FormControl>
                        <Input placeholder="A101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor</FormLabel>
                      <FormControl>
                        <Input placeholder="1st Floor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="price_per_month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per Month ($)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="is_available"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Available</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Mark this room as available for booking
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="amenities"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Amenities</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Select the amenities available in this room
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {amenities.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="amenities"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? "Update Room" : "Add Room"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
