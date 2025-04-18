
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Edit, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function MessMenuManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form state
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [mealType, setMealType] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks"];

  useEffect(() => {
    fetchMenuItems();

    // Set up real-time subscription
    const channel = supabase
      .channel('mess-menu-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'mess_menu' 
      }, (payload) => {
        fetchMenuItems();
        
        if (payload.eventType === 'INSERT') {
          toast.success('New menu item added');
        } else if (payload.eventType === 'UPDATE') {
          toast.success('Menu item updated');
        } else if (payload.eventType === 'DELETE') {
          toast.success('Menu item deleted');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMenuItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('mess_menu')
        .select('*')
        .order('day_of_week', { ascending: true });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = () => {
    if (newItem.trim()) {
      setItems([...items, newItem.trim()]);
      setNewItem("");
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setDayOfWeek("");
    setMealType("");
    setItems([]);
    setNewItem("");
    setCurrentId(null);
    setIsEditing(false);
  };

  const handleOpenDialog = (menuItem = null) => {
    resetForm();
    
    if (menuItem) {
      setCurrentId(menuItem.id);
      setDayOfWeek(menuItem.day_of_week);
      setMealType(menuItem.meal_type);
      setItems(menuItem.items || []);
      setIsEditing(true);
    }
    
    setIsDialogOpen(true);
  };

  const handleSaveMenu = async () => {
    if (!dayOfWeek || !mealType || items.length === 0) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (isEditing && currentId) {
        // Update existing menu item
        const { error } = await supabase
          .from('mess_menu')
          .update({
            day_of_week: dayOfWeek,
            meal_type: mealType,
            items: items,
            updated_at: new Date()
          })
          .eq('id', currentId);

        if (error) throw error;
      } else {
        // Create new menu item
        const { error } = await supabase
          .from('mess_menu')
          .insert({
            day_of_week: dayOfWeek,
            meal_type: mealType,
            items: items
          });

        if (error) throw error;
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error('Failed to save menu item');
    }
  };

  const handleDeleteMenu = async (id: string) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      try {
        const { error } = await supabase
          .from('mess_menu')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        toast.success('Menu item deleted successfully');
      } catch (error) {
        console.error('Error deleting menu item:', error);
        toast.error('Failed to delete menu item');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mess Menu Management</h2>
        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
          <Plus size={16} />
          Add Menu Item
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item: any) => (
            <Card key={item.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{item.day_of_week}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {item.meal_type}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(item)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteMenu(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {item.items && item.items.map((food: string, index: number) => (
                    <li key={index} className="text-sm">
                      {food}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
          
          {menuItems.length === 0 && (
            <div className="col-span-full text-center p-8">
              <p className="text-muted-foreground">No menu items found. Click "Add Menu Item" to create one.</p>
            </div>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Menu Item" : "Add New Menu Item"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="day">Day of Week</Label>
                <Select
                  value={dayOfWeek}
                  onValueChange={setDayOfWeek}
                >
                  <SelectTrigger id="day">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="meal">Meal Type</Label>
                <Select
                  value={mealType}
                  onValueChange={setMealType}
                >
                  <SelectTrigger id="meal">
                    <SelectValue placeholder="Select meal" />
                  </SelectTrigger>
                  <SelectContent>
                    {mealTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Menu Items</Label>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Add food item"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddItem();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddItem} size="sm">
                  Add
                </Button>
              </div>
              
              <div className="mt-2">
                {items.map((item, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="m-1 py-1"
                  >
                    {item}
                    <button
                      className="ml-1 text-xs hover:text-destructive"
                      onClick={() => handleRemoveItem(index)}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                
                {items.length === 0 && (
                  <p className="text-xs text-muted-foreground py-1">
                    No items added yet. Add at least one item.
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMenu}>
              {isEditing ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
