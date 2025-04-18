
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Utensils } from "lucide-react";

export function StudentMessMenu() {
  const [todayMenu, setTodayMenu] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMessMenu = async () => {
      try {
        const dayOfWeek = new Date().toLocaleString('en-US', { weekday: 'long' });
        const { data, error } = await supabase
          .from("mess_menu")
          .select("*")
          .eq("day_of_week", dayOfWeek);

        if (error) throw error;
        setTodayMenu(data || []);
      } catch (error) {
        console.error("Error fetching mess menu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessMenu();
  }, []);

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

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
        ) : todayMenu.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {todayMenu.map((meal) => (
              <Card key={meal.id} className="overflow-hidden">
                <CardHeader className="p-4 bg-muted">
                  <CardTitle className="text-base">{meal.meal_type}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ScrollArea className="h-[100px]">
                    <ul className="space-y-1">
                      {meal.items && meal.items.map((item: string, i: number) => (
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
            <p className="text-muted-foreground">No menu items available for today.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
