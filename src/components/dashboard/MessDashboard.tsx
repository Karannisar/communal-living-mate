
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  UtensilsCrossed,
  CalendarClock,
  Clock,
  Plus,
  Edit,
  Save,
  Trash,
  Coffee,
  ChefHat
} from "lucide-react";

export function MessDashboard() {
  const [editMode, setEditMode] = useState(false);
  
  // Sample menu data
  const mealTypes = ["breakfast", "lunch", "dinner"];
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  // Sample inventory data
  const inventoryItems = [
    { name: "Rice", quantity: "25 kg", status: "adequate" },
    { name: "Wheat Flour", quantity: "15 kg", status: "adequate" },
    { name: "Vegetables", quantity: "8 kg", status: "low" },
    { name: "Milk", quantity: "10 litres", status: "low" },
    { name: "Cooking Oil", quantity: "5 litres", status: "adequate" }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Mess Management Dashboard</h2>
      
      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Meal Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <div className="flex items-center mt-1">
              <UtensilsCrossed className="h-4 w-4 text-muted-foreground mr-1" />
              <span className="text-xs text-muted-foreground">Expected Students</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Special Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <div className="flex items-center mt-1">
              <Coffee className="h-4 w-4 text-mess-dark mr-1" />
              <span className="text-xs text-muted-foreground">For today's meals</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Next Meal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Dinner</div>
            <div className="flex items-center mt-1">
              <Clock className="h-4 w-4 text-muted-foreground mr-1" />
              <span className="text-xs text-muted-foreground">Starts in 3:20 hrs</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inventory Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <div className="flex items-center mt-1">
              <ChefHat className="h-4 w-4 text-yellow-600 mr-1" />
              <span className="text-xs text-yellow-600">Items running low</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Today's Menu Card */}
      <Card className="hover-scale">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Today's Menu</CardTitle>
            <CardDescription>Currently active meal plan</CardDescription>
          </div>
          <Button 
            variant={editMode ? "default" : "outline"} 
            size="sm" 
            className="hover-scale"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Menu
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="breakfast" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
              <TabsTrigger value="lunch">Lunch</TabsTrigger>
              <TabsTrigger value="dinner">Dinner</TabsTrigger>
            </TabsList>
            
            <TabsContent value="breakfast" className="space-y-4 animate-fade-in">
              <div className="mt-4">
                {editMode ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="bread" defaultChecked />
                      <Input defaultValue="Bread and Butter" id="bread" className="flex-1" />
                      <Button variant="ghost" size="icon" className="hover:text-destructive">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="eggs" defaultChecked />
                      <Input defaultValue="Eggs (Boiled/Omelette)" id="eggs" className="flex-1" />
                      <Button variant="ghost" size="icon" className="hover:text-destructive">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="cereal" defaultChecked />
                      <Input defaultValue="Cereal with Milk" id="cereal" className="flex-1" />
                      <Button variant="ghost" size="icon" className="hover:text-destructive">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="fruits" defaultChecked />
                      <Input defaultValue="Fresh Fruits" id="fruits" className="flex-1" />
                      <Button variant="ghost" size="icon" className="hover:text-destructive">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button variant="outline" className="w-full mt-2 hover-scale">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {["Bread and Butter", "Eggs (Boiled/Omelette)", "Cereal with Milk", "Fresh Fruits"].map((item, i) => (
                      <div 
                        key={i} 
                        className="bg-accent/50 p-3 rounded-md text-center animate-scale-in hover-scale"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        <p className="font-medium">{item}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Serving Time</h4>
                  <p className="text-sm text-muted-foreground">7:30 AM - 9:30 AM</p>
                </div>
                {!editMode && (
                  <Badge className="bg-green-100 text-green-800">Active Now</Badge>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="lunch" className="space-y-4 animate-fade-in">
              <div className="mt-4">
                {editMode ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="rice" defaultChecked />
                      <Input defaultValue="Steamed Rice" id="rice" className="flex-1" />
                      <Button variant="ghost" size="icon" className="hover:text-destructive">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="dal" defaultChecked />
                      <Input defaultValue="Dal (Lentils)" id="dal" className="flex-1" />
                      <Button variant="ghost" size="icon" className="hover:text-destructive">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="curry" defaultChecked />
                      <Input defaultValue="Mixed Vegetable Curry" id="curry" className="flex-1" />
                      <Button variant="ghost" size="icon" className="hover:text-destructive">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="chapati" defaultChecked />
                      <Input defaultValue="Chapati" id="chapati" className="flex-1" />
                      <Button variant="ghost" size="icon" className="hover:text-destructive">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="salad" defaultChecked />
                      <Input defaultValue="Fresh Salad" id="salad" className="flex-1" />
                      <Button variant="ghost" size="icon" className="hover:text-destructive">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button variant="outline" className="w-full mt-2 hover-scale">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    {["Steamed Rice", "Dal (Lentils)", "Mixed Vegetable Curry", "Chapati", "Fresh Salad"].map((item, i) => (
                      <div 
                        key={i} 
                        className="bg-accent/50 p-3 rounded-md text-center animate-scale-in hover-scale"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        <p className="font-medium">{item}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Serving Time</h4>
                  <p className="text-sm text-muted-foreground">12:30 PM - 2:30 PM</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Coming Up</Badge>
              </div>
            </TabsContent>
            
            <TabsContent value="dinner" className="space-y-4 animate-fade-in">
              <div className="mt-4">
                {editMode ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="noodles" defaultChecked />
                      <Input defaultValue="Vegetable Noodles" id="noodles" className="flex-1" />
                      <Button variant="ghost" size="icon" className="hover:text-destructive">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="soup" defaultChecked />
                      <Input defaultValue="Mixed Vegetable Soup" id="soup" className="flex-1" />
                      <Button variant="ghost" size="icon" className="hover:text-destructive">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="vegetables" defaultChecked />
                      <Input defaultValue="Grilled Vegetables" id="vegetables" className="flex-1" />
                      <Button variant="ghost" size="icon" className="hover:text-destructive">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="icecream" defaultChecked />
                      <Input defaultValue="Ice Cream" id="icecream" className="flex-1" />
                      <Button variant="ghost" size="icon" className="hover:text-destructive">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button variant="outline" className="w-full mt-2 hover-scale">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {["Vegetable Noodles", "Mixed Vegetable Soup", "Grilled Vegetables", "Ice Cream"].map((item, i) => (
                      <div 
                        key={i} 
                        className="bg-accent/50 p-3 rounded-md text-center animate-scale-in hover-scale"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        <p className="font-medium">{item}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Serving Time</h4>
                  <p className="text-sm text-muted-foreground">7:00 PM - 9:00 PM</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Coming Up</Badge>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        {editMode && (
          <CardFooter>
            <div className="space-y-2 w-full">
              <h4 className="font-medium">Special Notes</h4>
              <Textarea 
                placeholder="Add any special instructions or notes for the kitchen staff..."
                className="w-full"
                defaultValue="Vegetarian options available for all meals. Gluten-free bread available upon request."
              />
            </div>
          </CardFooter>
        )}
      </Card>
      
      {/* Weekly Plan and Inventory */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle>Weekly Meal Planner</CardTitle>
            <CardDescription>Plan meals for the upcoming week</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] overflow-auto">
            <div className="space-y-4">
              {daysOfWeek.map((day, i) => (
                <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <h4 className="font-medium mb-2">{day}</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {mealTypes.map((meal, j) => (
                      <Button 
                        key={j} 
                        variant="outline" 
                        className="justify-start text-left h-auto py-2 hover-scale"
                      >
                        <div>
                          <p className="font-medium capitalize">{meal}</p>
                          <p className="text-xs text-muted-foreground">Click to edit</p>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full hover-scale">
              <Save className="h-4 w-4 mr-2" />
              Save Weekly Plan
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
            <CardDescription>Current stock levels</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] overflow-auto">
            <div className="space-y-2">
              {inventoryItems.map((item, i) => (
                <div 
                  key={i} 
                  className={`flex items-center justify-between p-3 rounded-md animate-fade-in ${
                    item.status === "low" ? "bg-yellow-50 border border-yellow-200" : "bg-green-50 border border-green-200"
                  }`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">In stock: {item.quantity}</p>
                  </div>
                  <Badge className={item.status === "low" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                    {item.status === "low" ? "Low Stock" : "Adequate"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full hover-scale">
              <Plus className="h-4 w-4 mr-2" />
              Update Inventory
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
