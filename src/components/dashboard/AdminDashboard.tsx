
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Home, CalendarCheck, AlertCircle, BedDouble } from "lucide-react";

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">
              +12 from last month
            </p>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rooms Occupied</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156/200</div>
            <div className="mt-2 h-2 w-full rounded-full bg-secondary">
              <div className="h-full w-[78%] rounded-full bg-primary animate-pulse" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">
              +3% from last week
            </p>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Complaints</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              -3 from yesterday
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="rooms" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-[400px]">
          <TabsTrigger value="rooms">Room Status</TabsTrigger>
          <TabsTrigger value="students">Recent Students</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
        </TabsList>
        <TabsContent value="rooms" className="space-y-4">
          <h3 className="text-xl font-medium">Room Allocation Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((_, i) => (
              <Card key={i} className="hover-scale">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">Floor {i + 1}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-4 gap-2">
                  {Array.from({length: 12}).map((_, roomIndex) => {
                    const isOccupied = Math.random() > 0.3;
                    return (
                      <div 
                        key={roomIndex} 
                        className={`flex items-center justify-center h-12 w-12 rounded-md animate-fade-in ${
                          isOccupied ? "bg-primary/80 text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isOccupied && <BedDouble className="h-6 w-6" />}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Recently Added Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {["John Smith", "Maria Johnson", "Ahmed Khan", "Sasha Lee", "Carlos Rodriguez"].map((name, i) => (
                  <div key={i} className="flex items-center justify-between p-2 border rounded hover:bg-accent hover-scale">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        {name.split(" ").map(n => n[0]).join("").toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{name}</p>
                        <p className="text-sm text-muted-foreground">Room {Math.floor(Math.random() * 500) + 100}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Added {i + 1} day{i > 0 ? 's' : ''} ago</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="complaints">
          <Card>
            <CardHeader>
              <CardTitle>Recent Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  "Water leakage in bathroom",
                  "Door lock is broken",
                  "Light fixture not working",
                  "AC not cooling properly",
                  "Window won't close properly"
                ].map((complaint, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded hover:bg-accent hover-scale">
                    <div>
                      <p className="font-medium">{complaint}</p>
                      <p className="text-sm text-muted-foreground">Room {Math.floor(Math.random() * 500) + 100}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      i < 2 ? "bg-destructive/20 text-destructive" : 
                      i < 4 ? "bg-yellow-100 text-yellow-800" : 
                      "bg-green-100 text-green-800"
                    }`}>
                      {i < 2 ? "Urgent" : i < 4 ? "In Progress" : "Resolved"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
