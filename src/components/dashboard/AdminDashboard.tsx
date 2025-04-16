
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, Home, CalendarCheck, AlertCircle, 
  BedDouble, BarChart2, PieChart, TrendingUp 
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart as RechartsPieChart, 
  Pie, Cell, LineChart, Line 
} from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Sample data for charts
const occupancyData = [
  { month: 'Jan', occupied: 85, vacant: 15 },
  { month: 'Feb', occupied: 88, vacant: 12 },
  { month: 'Mar', occupied: 90, vacant: 10 },
  { month: 'Apr', occupied: 92, vacant: 8 },
  { month: 'May', occupied: 95, vacant: 5 },
  { month: 'Jun', occupied: 85, vacant: 15 },
];

const bookingsByFloorData = [
  { name: 'Floor 1', value: 35 },
  { name: 'Floor 2', value: 40 },
  { name: 'Floor 3', value: 25 },
];

const attendanceData = [
  { day: 'Mon', rate: 88 },
  { day: 'Tue', rate: 92 },
  { day: 'Wed', rate: 94 },
  { day: 'Thu', rate: 91 },
  { day: 'Fri', rate: 86 },
  { day: 'Sat', rate: 76 },
  { day: 'Sun', rate: 72 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function AdminDashboard() {
  const [rooms, setRooms] = useState({ total: 0, occupied: 0 });
  const [students, setStudents] = useState({ total: 0, newThisMonth: 0 });
  const [complaints, setComplaints] = useState({ open: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch rooms data
        const { data: roomsData, error: roomsError } = await supabase
          .from('rooms')
          .select('is_available');
        
        if (roomsError) throw roomsError;
        
        // Fetch students count
        const { count: studentsCount, error: studentsError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'student');
        
        if (studentsError) throw studentsError;
        
        // Fetch new students this month
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        const { count: newStudents, error: newStudentsError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'student')
          .gte('created_at', firstDayOfMonth.toISOString());
        
        if (newStudentsError) throw newStudentsError;
        
        // Fetch complaints data
        const { data: complaintsData, error: complaintsError } = await supabase
          .from('complaints')
          .select('status');
        
        if (complaintsError) throw complaintsError;
        
        // Update states with fetched data
        if (roomsData) {
          const totalRooms = roomsData.length;
          const occupiedRooms = roomsData.filter(room => !room.is_available).length;
          
          setRooms({
            total: totalRooms,
            occupied: occupiedRooms
          });
        }
        
        setStudents({
          total: studentsCount || 0,
          newThisMonth: newStudents || 0
        });
        
        if (complaintsData) {
          const openComplaints = complaintsData.filter(
            c => c.status === 'open' || c.status === 'in_progress'
          ).length;
          
          const resolvedComplaints = complaintsData.filter(
            c => c.status === 'resolved' || c.status === 'closed'
          ).length;
          
          setComplaints({
            open: openComplaints,
            resolved: resolvedComplaints
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

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
            <div className="text-2xl font-bold">{students.total}</div>
            <p className="text-xs text-muted-foreground">
              +{students.newThisMonth} new this month
            </p>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rooms Occupied</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms.occupied}/{rooms.total}</div>
            <div className="mt-2 h-2 w-full rounded-full bg-secondary">
              <div 
                className="h-full rounded-full bg-primary animate-pulse" 
                style={{ width: `${rooms.total ? (rooms.occupied / rooms.total) * 100 : 0}%` }}
              />
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
            <div className="text-2xl font-bold">{complaints.open}</div>
            <p className="text-xs text-muted-foreground">
              {complaints.resolved} resolved
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-[400px]">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="rooms">Room Status</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5" />
                  Occupancy Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ChartContainer
                    config={{
                      occupied: { color: '#0088FE' },
                      vacant: { color: '#00C49F' },
                    }}
                  >
                    <BarChart
                      data={occupancyData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent />
                        }
                      />
                      <Legend />
                      <Bar dataKey="occupied" fill="var(--color-occupied)" />
                      <Bar dataKey="vacant" fill="var(--color-vacant)" />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Bookings by Floor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ChartContainer
                    config={{
                      floor1: { color: '#0088FE' },
                      floor2: { color: '#00C49F' },
                      floor3: { color: '#FFBB28' },
                    }}
                  >
                    <RechartsPieChart margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                      <Pie
                        data={bookingsByFloorData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {bookingsByFloorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent />
                        }
                      />
                    </RechartsPieChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Weekly Attendance Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ChartContainer
                    config={{
                      rate: { color: '#0088FE' },
                    }}
                  >
                    <LineChart
                      data={attendanceData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis domain={[60, 100]} />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent />
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="var(--color-rate)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
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
