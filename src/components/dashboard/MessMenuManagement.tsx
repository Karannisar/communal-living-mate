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

// Define schema for menu form
const menuFormSchema = z.object({
  day_of_week: z.string().min(1, { message: "Day of week is required." }),
  meal_type: z.string().min(1, { message: "Meal type is required." }),
  items: z.array(z.string()).min(1, { message: "At least one item is required." }),
});

export function MessMenuManagement() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemInput, setItemInput] = useState("");
  const [menuItemsList, setMenuItemsList] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof menuFormSchema>>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: {
      day_of_week: "",
      meal_type: "",
      items: [],
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
        title: "Error fetching menu items",
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

  const filteredMenuItems = menuItems.filter((menu) => 
    menu.day_of_week.toLowerCase().includes(searchQuery.toLowerCase()) || 
    menu.meal_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddDialog = () => {
    form.reset({
      day_of_week: "",
      meal_type: "",
      items: [],
    });
    setMenuItemsList([]);
    setItemInput("");
    setIsEditing(false);
    setCurrentMenu(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (menu: any) => {
    setIsEditing(true);
    setCurrentMenu(menu);
    
    // Ensure items is an array
    const itemsArray = Array.isArray(menu.items) ? menu.items : [];
    
    setMenuItemsList(itemsArray);
    form.reset({
      day_of_week: menu.day_of_week,
      meal_type: menu.meal_type,
      items: itemsArray,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof menuFormSchema>) => {
    try {
      console.log("Submitting menu values:", values);
      
      // Make sure items is a valid array
      const itemsArray = Array.isArray(values.items) ? values.items : [];
      
      if (isEditing && currentMenu) {
        // Update existing menu
        const { error } = await supabase
          .from("mess_menu")
          .update({
            day_of_week: values.day_of_week,
            meal_type: values.meal_type,
            items: itemsArray,
          })
          .eq("id", currentMenu.id);

        if (error) {
          console.error("Error updating menu:", error);
          throw error;
        }
        
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
            items: itemsArray,
          });

        if (error) {
          console.error("Error creating menu:", error);
          throw error;
        }
        
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

  const addItemToList = () => {
    if (itemInput.trim() === "") return;
    
    const newItems = [...menuItemsList, itemInput.trim()];
    setMenuItemsList(newItems);
    form.setValue("items", newItems);
    setItemInput("");
  };

  const removeItemFromList = (index: number) => {
    const newItems = menuItemsList.filter((_, i) => i !== index);
    setMenuItemsList(newItems);
    form.setValue("items", newItems);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItemToList();
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
            <Plus className="h-4 w-4" /> Add Menu Item
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
              <TableHead>Day of Week</TableHead>
              <TableHead>Meal Type</TableHead>
              <TableHead>Items</TableHead>
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
                    <div className="flex flex-wrap gap-1">
                      {menu.items && menu.items.length > 0 ? (
                        menu.items.slice(0, 3).map((item: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {item}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-xs">None</span>
                      )}
                      {menu.items && menu.items.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{menu.items.length - 3}
                        </Badge>
                      )}
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
            <DialogTitle>{isEditing ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update mess menu information in the system." 
                : "Fill in the details to add a new mess menu item to the system."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                            <SelectValue placeholder="Select a day" />
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
              </div>
              
              <FormField
                control={form.control}
                name="items"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Menu Items</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="Add an item..."
                          value={itemInput}
                          onChange={(e) => setItemInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                        />
                      </FormControl>
                      <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={addItemToList}
                      >
                        Add
                      </Button>
                    </div>
                    
                    {menuItemsList.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {menuItemsList.map((item, index) => (
                          <Badge key={index} className="flex items-center gap-1">
                            {item}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => removeItemFromList(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2">
                        No items added yet. Add at least one item.
                      </p>
                    )}
                    
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
