
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Search,
  RefreshCw,
  UserCheck,
  UserX,
  Clock,
  AlertCircle,
  Bell,
} from "lucide-react";
import { format } from "date-fns";

export function AttendanceMonitoring() {
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("today");
  const [notifications, setNotifications] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchAttendance = async (period: string = "today") => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("attendance")
        .select(`
          *,
          users:user_id (id, full_name, email, role)
        `)
        .order("date", { ascending: false });
      
      // Filter based on selected period
      const today = new Date().toISOString().split('T')[0];
      
      if (period === "today") {
        query = query.eq("date", today);
      } else if (period === "week") {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        query = query.gte("date", lastWeek.toISOString().split('T')[0]);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      setAttendanceRecords(data || []);
      
      // Check for students who checked out in the last hour to generate notifications
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      
      const recentCheckouts = data?.filter((record) => {
        return record.check_out && new Date(record.check_out) >= oneHourAgo;
      }) || [];
      
      if (recentCheckouts.length > 0) {
        setNotifications(recentCheckouts.map(checkout => ({
          id: checkout.id,
          student: checkout.users?.full_name,
          time: format(new Date(checkout.check_out), 'h:mm a'),
          type: 'checkout'
        })));
      }
    } catch (error: any) {
      toast({
        title: "Error fetching attendance records",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(activeTab);
    
    // Set up real-time updates for attendance
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance'
        },
        (payload) => {
          fetchAttendance(activeTab);
          
          // If this is a checkout, create a notification
          if (payload.eventType === 'UPDATE' && payload.new.check_out && !payload.old.check_out) {
            // Fetch student name
            supabase
              .from('users')
              .select('full_name')
              .eq('id', payload.new.user_id)
              .single()
              .then(({ data }) => {
                if (data) {
                  const newNotification = {
                    id: payload.new.id,
                    student: data.full_name,
                    time: format(new Date(payload.new.check_out), 'h:mm a'),
                    type: 'checkout'
                  };
                  
                  setNotifications(prev => [newNotification, ...prev]);
                  
                  toast({
                    title: "Student Checked Out",
                    description: `${data.full_name} has checked out at ${format(new Date(payload.new.check_out), 'h:mm a')}`,
                  });
                }
              });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab]);

  const filteredRecords = attendanceRecords.filter((record) => {
    const studentName = record.users?.full_name || "";
    const studentEmail = record.users?.email || "";
    
    return (
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.date.includes(searchQuery)
    );
  });

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendanceRecords.filter(record => record.date === today);
    
    const checkedInCount = todayRecords.filter(record => record.check_in).length;
    const checkedOutCount = todayRecords.filter(record => record.check_out).length;
    const currentlyOut = checkedInCount - checkedOutCount;
    
    return {
      checkedIn: checkedInCount,
      checkedOut: checkedOutCount,
      currentlyOut: currentlyOut > 0 ? currentlyOut : 0
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <h2 className="text-2xl font-bold">Attendance Monitoring</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="relative"
          onClick={() => {/* Toggle notifications panel */}}
        >
          <Bell className="h-4 w-4 mr-1" />
          Notifications
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {notifications.length}
            </span>
          )}
        </Button>
      </div>
      
      {notifications.length > 0 && (
        <Card className="border-l-4 border-l-blue-500 animate-pulse">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-500" />
                Recent Activity Notifications
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setNotifications([])}
              >
                Clear All
              </Button>
            </div>
            <div className="mt-2 space-y-2">
              {notifications.slice(0, 3).map((notification) => (
                <div 
                  key={notification.id} 
                  className="flex justify-between items-center p-2 bg-muted/50 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <UserX className="h-4 w-4 text-blue-500" />
                    <span>
                      <span className="font-medium">{notification.student}</span>
                      {' '}checked out at {notification.time}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => dismissNotification(notification.id)}
                  >
                    Dismiss
                  </Button>
                </div>
              ))}
              {notifications.length > 3 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{notifications.length - 3} more notifications
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.checkedIn}</div>
            <div className="flex items-center mt-1">
              <UserCheck className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-xs text-green-600">Checked in today</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Check-outs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.checkedOut}</div>
            <div className="flex items-center mt-1">
              <UserX className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-xs text-blue-600">Checked out today</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Currently Outside</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentlyOut}</div>
            <div className="flex items-center mt-1">
              <Clock className="h-4 w-4 text-orange-600 mr-1" />
              <span className="text-xs text-orange-600">Not returned yet</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>
              Track student check-ins and check-outs
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search records..."
                className="pl-9 w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              onClick={() => fetchAttendance(activeTab)} 
              variant="outline" 
              size="icon"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="today" onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="all">All Records</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-4">
              <Table>
                <TableCaption>
                  {isLoading 
                    ? "Loading attendance records..." 
                    : `Attendance records for ${activeTab === "today" 
                      ? "today" 
                      : activeTab === "week" 
                        ? "this week" 
                        : "all time"} (${filteredRecords.length})`
                  }
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No attendance records found</TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => {
                      // Calculate duration if both check-in and check-out exist
                      let duration = "N/A";
                      if (record.check_in && record.check_out) {
                        const checkInTime = new Date(record.check_in).getTime();
                        const checkOutTime = new Date(record.check_out).getTime();
                        const durationMs = checkOutTime - checkInTime;
                        
                        // Convert to hours and minutes
                        const hours = Math.floor(durationMs / (1000 * 60 * 60));
                        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                        
                        duration = `${hours}h ${minutes}m`;
                      }
                      
                      return (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{record.users?.full_name || 'N/A'}</p>
                              <p className="text-xs text-muted-foreground">{record.users?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(record.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {record.check_in 
                              ? format(new Date(record.check_in), 'h:mm a') 
                              : 'Not checked in'
                            }
                          </TableCell>
                          <TableCell>
                            {record.check_out 
                              ? format(new Date(record.check_out), 'h:mm a') 
                              : 'Not checked out'
                            }
                          </TableCell>
                          <TableCell>{duration}</TableCell>
                          <TableCell>
                            {!record.check_in ? (
                              <Badge variant="outline" className="text-muted-foreground">
                                Not Started
                              </Badge>
                            ) : !record.check_out ? (
                              <Badge variant="warning">
                                Checked In
                              </Badge>
                            ) : (
                              <Badge variant="success">
                                Completed
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
