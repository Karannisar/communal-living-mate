
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Edit, Trash2, Search, RefreshCw } from "lucide-react";

// Define schema for mess menu form
const menuFormSchema = z.object({
  day_of_week: z.string().min(1, { message: "Day of week is required." }),
  meal_type: z.string().min(1, { message: "Meal type is required." }),
  items: z.string().min(1, { message: "Menu items are required." }).transform(val => val.split(',').map(item => item.trim())),
});

export function MessMenuManagement() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const form = useForm<z.infer<typeof menuFormSchema>>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: {
      day_of_week: "",
      meal_type: "",
      items: "",
    },
  });

  const fetchMenuItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("mess_menu")
        .select("*")
        .order("day_of_week", { ascending: true });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching menu",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
    
    // Set up real-time updates for menu items
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mess_menu'
        },
        () => {
          fetchMenuItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredMenuItems = menuItems.filter(item => 
    item.day_of_week.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.meal_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddDialog = () => {
    form.reset({
      day_of_week: "Monday",
      meal_type: "Breakfast",
      items: "",
    });
    setIsEditing(false);
    setCurrentMenu(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (menu: any) => {
    setIsEditing(true);
    setCurrentMenu(menu);
    form.reset({
      day_of_week: menu.day_of_week,
      meal_type: menu.meal_type,
      items: menu.items.join(', '),
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof menuFormSchema>) => {
    try {
      if (isEditing && currentMenu) {
        // Update existing menu
        const { error } = await supabase
          .from("mess_menu")
          .update({
            day_of_week: values.day_of_week,
            meal_type: values.meal_type,
            items: values.items,
          })
          .eq("id", currentMenu.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Menu updated successfully",
        });
      } else {
        // Create new menu
        const { error } = await supabase
          .from("mess_menu")
          .insert({
            day_of_week: values.day_of_week,
            meal_type: values.meal_type,
            items: values.items,
          });

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Menu created successfully",
        });
      }
      
      setIsDialogOpen(false);
      fetchMenuItems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteMenu = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    
    try {
      const { error } = await supabase
        .from("mess_menu")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Menu deleted successfully",
      });
      
      fetchMenuItems();
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
        <CardTitle>Mess Menu Management</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search menu..."
              className="pl-9 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            onClick={() => fetchMenuItems()} 
            variant="outline" 
            size="icon"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={openAddDialog} className="flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add Menu
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>
            {isLoading ? "Loading menu items..." : `A list of all mess menu items (${filteredMenuItems.length})`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Day</TableHead>
              <TableHead>Meal Type</TableHead>
              <TableHead>Menu Items</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : filteredMenuItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">No menu items found</TableCell>
              </TableRow>
            ) : (
              filteredMenuItems.map((menu) => (
                <TableRow key={menu.id}>
                  <TableCell className="font-medium">{menu.day_of_week}</TableCell>
                  <TableCell>{menu.meal_type}</TableCell>
                  <TableCell>
                    <div className="max-w-md">
                      <ul className="list-disc pl-5">
                        {menu.items.slice(0, 3).map((item: string, index: number) => (
                          <li key={index}>{item}</li>
                        ))}
                        {menu.items.length > 3 && (
                          <li className="text-muted-foreground">
                            +{menu.items.length - 3} more items
                          </li>
                        )}
                      </ul>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openEditDialog(menu)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteMenu(menu.id)}
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
            <DialogTitle>{isEditing ? "Edit Menu" : "Add New Menu"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update mess menu information." 
                : "Fill in the details to add a new mess menu item."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="day_of_week"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Week</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Monday">Monday</SelectItem>
                        <SelectItem value="Tuesday">Tuesday</SelectItem>
                        <SelectItem value="Wednesday">Wednesday</SelectItem>
                        <SelectItem value="Thursday">Thursday</SelectItem>
                        <SelectItem value="Friday">Friday</SelectItem>
                        <SelectItem value="Saturday">Saturday</SelectItem>
                        <SelectItem value="Sunday">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="meal_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meal Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select meal type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Breakfast">Breakfast</SelectItem>
                        <SelectItem value="Lunch">Lunch</SelectItem>
                        <SelectItem value="Dinner">Dinner</SelectItem>
                        <SelectItem value="Snacks">Snacks</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="items"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Menu Items</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter menu items separated by commas" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? "Update Menu" : "Add Menu"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
