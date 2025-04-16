import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OpenRouterChatbot } from "@/components/ai/OpenRouterChatbot";
import {
  BedDouble,
  CalendarClock,
  MessageSquare,
  Users,
  User,
  Coffee,
  UtensilsCrossed
} from "lucide-react";

export function StudentDashboard() {
  // Sample data
  const roomDetails = {
    roomNumber: "B-204",
    building: "Block B",
    floor: "2nd Floor",
    roommates: [
      { name: "Alex Johnson", id: "SID18745" },
      { name: "Ray Chen", id: "SID19021" }
    ]
  };

  // Today's mess menu
  const todayMenu = {
    breakfast: ["Bread and Butter", "Eggs", "Cereal", "Milk", "Fruits"],
    lunch: ["Rice", "Dal", "Vegetable Curry", "Chapati", "Salad"],
    dinner: ["Noodles", "Soup", "Grilled Vegetables", "Ice Cream"]
  };

  return (
    <div className="space-y-6">
      <OpenRouterChatbot />
      <h2 className="text-3xl font-bold tracking-tight">Welcome, Student</h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        {/* Room Information Card */}
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Your Room</CardTitle>
              <CardDescription>Current accommodation details</CardDescription>
            </div>
            <BedDouble className="h-6 w-6 text-student-dark" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Room Number</p>
              <Badge variant="outline" className="text-md font-bold animate-fade-in">
                {roomDetails.roomNumber}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm text-muted-foreground">Building</p>
                <p>{roomDetails.building}</p>
              </div>
              <div className="flex flex-col space-y-1">
                <p className="text-sm text-muted-foreground">Floor</p>
                <p>{roomDetails.floor}</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Roommates</p>
              <div className="space-y-2">
                {roomDetails.roommates.map((roommate, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-md bg-accent/50 animate-fade-in">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{roommate.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{roommate.id}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Attendance Card */}
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle>Attendance</CardTitle>
            <CardDescription>Your monthly attendance status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CalendarClock className="h-5 w-5 text-student-dark" />
                <span className="font-medium">This Month</span>
              </div>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">93% Present</Badge>
            </div>
            
            <div className="w-full bg-secondary rounded-full h-2.5">
              <div className="bg-student-dark h-2.5 rounded-full animate-pulse" style={{ width: "93%" }}></div>
            </div>
            
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Days Present: 28</span>
              <span>Absences: 2</span>
            </div>
            
            <Separator />
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Today's Status</p>
              <Badge className="bg-green-500 text-white">Checked In</Badge>
              <p className="text-xs text-muted-foreground mt-2">Last checked in at 08:30 AM</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Mess Menu Tabs */}
      <Card className="hover-scale">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <UtensilsCrossed className="h-5 w-5 text-student-dark" />
            <CardTitle>Today's Mess Menu</CardTitle>
          </div>
          <CardDescription>What's cooking today</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="breakfast" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="breakfast" className="flex items-center gap-2">
                <Coffee className="h-4 w-4" />
                Breakfast
              </TabsTrigger>
              <TabsTrigger value="lunch">Lunch</TabsTrigger>
              <TabsTrigger value="dinner">Dinner</TabsTrigger>
            </TabsList>
            {Object.entries(todayMenu).map(([meal, items]) => (
              <TabsContent key={meal} value={meal} className="animate-fade-in">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-2">
                  {items.map((item, i) => (
                    <div
                      key={i}
                      className="bg-accent/50 p-3 rounded-md text-center animate-scale-in"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <p className="font-medium">{item}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Button className="hover-scale flex items-center gap-2 h-12">
          <MessageSquare className="h-5 w-5" />
          Report an Issue
        </Button>
        <Button variant="outline" className="hover-scale flex items-center gap-2 h-12">
          <Users className="h-5 w-5" />
          Request Room Change
        </Button>
        <Button variant="secondary" className="hover-scale flex items-center gap-2 h-12">
          <CalendarClock className="h-5 w-5" />
          View Full Mess Schedule
        </Button>
      </div>
    </div>
  );
}
