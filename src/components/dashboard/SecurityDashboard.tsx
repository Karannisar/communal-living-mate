
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  QrCode,
  UserCheck,
  UserX,
  Clock,
  CalendarClock,
  AlertCircle,
  CheckCircle2,
  Users
} from "lucide-react";

export function SecurityDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [scanMode, setScanMode] = useState<"checkin" | "checkout">("checkin");
  
  // Mock recent entries data
  const recentEntries = [
    { id: "SID19254", name: "Emma Wilson", time: "08:45 AM", status: "check-in" },
    { id: "SID18742", name: "Michael Brown", time: "08:30 AM", status: "check-in" },
    { id: "SID19861", name: "Sophia Lee", time: "07:55 AM", status: "check-in" },
    { id: "SID17503", name: "Daniel Kim", time: "11:20 PM", status: "check-out", date: "Yesterday" },
    { id: "SID18965", name: "Olivia Singh", time: "10:45 PM", status: "check-out", date: "Yesterday" }
  ];
  
  // Mock alerts
  const alerts = [
    { id: "SID17423", name: "Noah Johnson", message: "No entry record for 2 days", severity: "high" },
    { id: "SID18562", name: "Ava Martinez", message: "Multiple entries without checkout", severity: "medium" },
    { id: "SID19123", name: "James Wilson", message: "Late night entry (2:00 AM)", severity: "low" }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Security Dashboard</h2>
      
      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">187</div>
            <div className="flex items-center mt-1">
              <UserCheck className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-xs text-green-600">98% of residents</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Check-outs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">59</div>
            <div className="flex items-center mt-1">
              <UserX className="h-4 w-4 text-muted-foreground mr-1" />
              <span className="text-xs text-muted-foreground">31% of residents</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Outside</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <div className="flex items-center mt-1">
              <Clock className="h-4 w-4 text-muted-foreground mr-1" />
              <span className="text-xs text-muted-foreground">Since 6:00 AM</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <div className="flex items-center mt-1">
              <AlertCircle className="h-4 w-4 text-destructive mr-1" />
              <span className="text-xs text-destructive">Requires attention</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Scanner */}
      <Card className="hover-scale">
        <CardHeader>
          <CardTitle>Student Attendance Scanner</CardTitle>
          <CardDescription>Scan student ID for check-in/out</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search student by ID or name..."
                  className="pl-9 hover-lift"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Button className="flex items-center gap-2 hover-scale">
              <QrCode className="h-4 w-4" />
              Scan QR Code
            </Button>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Button
              variant={scanMode === "checkin" ? "default" : "outline"}
              onClick={() => setScanMode("checkin")}
              className="flex-1 hover-scale"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Check In
            </Button>
            <Button
              variant={scanMode === "checkout" ? "default" : "outline"}
              onClick={() => setScanMode("checkout")}
              className="flex-1 hover-scale"
            >
              <UserX className="h-4 w-4 mr-2" />
              Check Out
            </Button>
          </div>
          
          <div className="flex justify-center border-2 border-dashed rounded-lg p-6">
            <div className="text-center">
              <QrCode className="h-24 w-24 mx-auto text-muted-foreground animate-pulse" />
              <p className="mt-2 text-sm text-muted-foreground">
                Ready to scan student ID. Please align the QR code within the frame.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            <span className="text-sm text-muted-foreground">Scanner Status:</span>
            <Badge className="ml-2 bg-green-100 text-green-800">Ready</Badge>
          </div>
          <Button variant="secondary" size="sm" className="hover-scale">
            Manual Entry
          </Button>
        </CardFooter>
      </Card>
      
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            Recent Entries
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Alerts
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest student check-ins and check-outs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentEntries.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-md border hover:bg-accent hover-scale animate-fade-in">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        entry.status === "check-in" ? "bg-green-100" : "bg-blue-100"
                      }`}>
                        {entry.status === "check-in" ? (
                          <UserCheck className={`h-4 w-4 ${entry.status === "check-in" ? "text-green-600" : "text-blue-600"}`} />
                        ) : (
                          <UserX className={`h-4 w-4 ${entry.status === "check-in" ? "text-green-600" : "text-blue-600"}`} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{entry.name}</p>
                        <p className="text-xs text-muted-foreground">{entry.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{entry.time}</p>
                      {entry.date && <p className="text-xs text-muted-foreground">{entry.date}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full hover-scale">
                View All Records
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alerts & Notifications</CardTitle>
              <CardDescription>Issues requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 rounded-md border animate-fade-in ${
                    alert.severity === "high" ? "bg-red-50 border-red-200" :
                    alert.severity === "medium" ? "bg-yellow-50 border-yellow-200" :
                    "bg-blue-50 border-blue-200"
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        alert.severity === "high" ? "bg-red-100" :
                        alert.severity === "medium" ? "bg-yellow-100" :
                        "bg-blue-100"
                      }`}>
                        <AlertCircle className={`h-4 w-4 ${
                          alert.severity === "high" ? "text-red-600" :
                          alert.severity === "medium" ? "text-yellow-600" :
                          "text-blue-600"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{alert.name}</p>
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{alert.id}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" className="hover-scale">Ignore</Button>
                      <Button size="sm" className="hover-scale">Resolve</Button>
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
