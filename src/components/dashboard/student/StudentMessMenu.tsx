import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Utensils } from "lucide-react";
import { useEffect, useState } from "react";

interface MenuItem {
  id: string;
  day_of_week: string;
  meal_type: string;
  items: string[];
}

export function StudentMessMenu() {
  const [todayMenu, setTodayMenu] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMessMenu = async () => {
      try {
        // Get the current day name in lowercase
        const dayOfWeek = new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
        console.log("Fetching menu for day:", dayOfWeek);

        const { data, error } = await supabase
          .from("mess_menu")
          .select("*")
          .eq("day_of_week", dayOfWeek);

        console.log("Menu data:", data);
        console.log("Menu error:", error);

        if (error) throw error;
        setTodayMenu(data || []);
      } catch (error) {
        console.error("Error fetching mess menu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessMenu();

    // Set up real-time updates for menu changes
    const channel = supabase
      .channel('mess-menu-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'mess_menu'
      }, (payload) => {
        console.log("Menu update received:", payload);
        fetchMessMenu();
      })
      .subscribe(status => {
        console.log("Menu subscription status:", status);
      });

    return () => {
      console.log("Cleaning up menu subscription");
      supabase.removeChannel(channel);
    };
  }, []);

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const getMealTypeOrder = (mealType: string): number => {
    const order = {
      'breakfast': 1,
      'lunch': 2,
      'dinner': 3
    };
    return order[mealType.toLowerCase()] || 4;
  };

  // Sort menu items by meal type
  const sortedMenu = [...todayMenu].sort((a, b) => 
    getMealTypeOrder(a.meal_type) - getMealTypeOrder(b.meal_type)
  );

  return (
    <Card className="md:col-span-3 h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5" /> Today's Mess Menu
        </CardTitle>
        <CardDescription>{today}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : sortedMenu.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {sortedMenu.map((meal) => (
              <Card key={meal.id} className="overflow-hidden">
                <CardHeader className="p-4 bg-muted">
                  <CardTitle className="text-base capitalize">{meal.meal_type}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ScrollArea className="h-[100px]">
                    <ul className="space-y-1">
                      {Array.isArray(meal.items) && meal.items.map((item: string, i: number) => (
                        <li key={i} className="text-sm">• {item}</li>
                      ))}
                    </ul>
                  </ScrollArea>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Utensils className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-muted-foreground">No menu items available for today.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
