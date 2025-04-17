
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, Home, CalendarCheck, AlertCircle, BedDouble, 
  BarChart2, PieChart, TrendingUp, UserCheck, UserX, 
  Clock, Search, QrCode, Plus, Pencil, Trash2, Filter,
  RefreshCw
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart as RechartsPieChart, 
  Pie, Cell, LineChart, Line 
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [activeTab, setActiveTab] = useState("analytics");
  const [searchQuery, setSearchQuery] = useState("");
  const [scanMode, setScanMode] = useState<"checkin" | "checkout">("checkin");
  const [usersList, setUsersList] = useState<any[]>([]);
  const [roomsList, setRoomsList] = useState<any[]>([]);
  const [complaintsData, setComplaintsData] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [isEditRoomDialogOpen, setIsEditRoomDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Form states for editing
  const [editUserForm, setEditUserForm] = useState({
    full_name: "",
    email: "",
    role: "student"
  });

  const [editRoomForm, setEditRoomForm] = useState({
    room_number: "",
    floor: "",
    capacity: 2,
    price_per_month: 0,
    is_available: true,
    amenities: []
  });

  // Fetch all data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch rooms data
        const { data: roomsData, error: roomsError } = await supabase
          .from('rooms')
          .select('*');
        
        if (roomsError) throw roomsError;
        
        // Fetch students count
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*');
        
        if (usersError) throw usersError;
        
        // Fetch complaints data
        const { data: complaintsData, error: complaintsError } = await supabase
          .from('complaints')
          .select('*');
        
        if (complaintsError) throw complaintsError;
        
        // Fetch attendance data
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
          
        if (attendanceError) throw attendanceError;
        
        // Update states with fetched data
        if (roomsData) {
          const totalRooms = roomsData.length;
          const occupiedRooms = roomsData.filter(room => !room.is_available).length;
          
          setRooms({
            total: totalRooms,
            occupied: occupiedRooms
          });
          setRoomsList(roomsData);
        }
        
        if (usersData) {
          const studentsData = usersData.filter(user => user.role === 'student');
          const today = new Date();
          const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          const newStudents = studentsData.filter(student => {
            const createdDate = new Date(student.created_at);
            return createdDate >= firstDayOfMonth;
          });
          
          setStudents({
            total: studentsData.length,
            newThisMonth: newStudents.length
          });
          setUsersList(usersData);
        }
        
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
          setComplaintsData(complaintsData);
        }
        
        if (attendanceData) {
          setAttendanceRecords(attendanceData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [refreshTrigger, toast]);

  // CRUD Functions for Users
  const handleAddUser = async (userData: any) => {
    try {
      // This is just for in-app creation by admin, not auth
      const { error } = await supabase
        .from('users')
        .insert([userData]);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "User added successfully",
      });
      
      // Refresh data
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error("Error adding user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add user",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      
      // Refresh data
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const editUser = (user: any) => {
    setSelectedUser(user);
    setEditUserForm({
      full_name: user.full_name || "",
      email: user.email || "",
      role: user.role || "student"
    });
    setIsEditUserDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    try {
      if (!selectedUser) return;
      
      const { error } = await supabase
        .from('users')
        .update({
          full_name: editUserForm.full_name,
          email: editUserForm.email,
          role: editUserForm.role
        })
        .eq('id', selectedUser.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      
      setIsEditUserDialogOpen(false);
      // Refresh data
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive"
      });
    }
  };

  // CRUD Functions for Rooms
  const handleAddRoom = async (roomData: any) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .insert([roomData]);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Room added successfully",
      });
      
      // Refresh data
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error("Error adding room:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add room",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Room deleted successfully",
      });
      
      // Refresh data
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error("Error deleting room:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete room",
        variant: "destructive"
      });
    }
  };

  const editRoom = (room: any) => {
    setSelectedRoom(room);
    setEditRoomForm({
      room_number: room.room_number || "",
      floor: room.floor || "",
      capacity: room.capacity || 2,
      price_per_month: room.price_per_month || 0,
      is_available: room.is_available !== false,
      amenities: room.amenities || []
    });
    setIsEditRoomDialogOpen(true);
  };

  const handleUpdateRoom = async () => {
    try {
      if (!selectedRoom) return;
      
      const { error } = await supabase
        .from('rooms')
        .update({
          room_number: editRoomForm.room_number,
          floor: editRoomForm.floor,
          capacity: editRoomForm.capacity,
          price_per_month: editRoomForm.price_per_month,
          is_available: editRoomForm.is_available,
          amenities: editRoomForm.amenities
        })
        .eq('id', selectedRoom.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Room updated successfully",
      });
      
      setIsEditRoomDialogOpen(false);
      // Refresh data
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error("Error updating room:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update room",
        variant: "destructive"
      });
    }
  };

  // Handle complaint status update
  const updateComplaintStatus = async (complaintId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ status })
        .eq('id', complaintId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Complaint marked as ${status}`,
      });
      
      // Refresh data
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error("Error updating complaint:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update complaint",
        variant: "destructive"
      });
    }
  };

  // Handle attendance records
  const recordAttendance = async (userId: string, type: 'check_in' | 'check_out') => {
    const today = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString();
    
    try {
      // Check if an attendance record already exists for today
      const { data: existingRecord, error: fetchError } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();
        
      if (fetchError) throw fetchError;
      
      if (existingRecord) {
        // Update existing record
        const updateData = type === 'check_in' 
          ? { check_in: timestamp } 
          : { check_out: timestamp };
          
        const { error: updateError } = await supabase
          .from('attendance')
          .update(updateData)
          .eq('id', existingRecord.id);
          
        if (updateError) throw updateError;
      } else {
        // Create new record
        const newRecord = {
          user_id: userId,
          date: today,
          ...(type === 'check_in' ? { check_in: timestamp } : { check_out: timestamp })
        };
        
        const { error: insertError } = await supabase
          .from('attendance')
          .insert([newRecord]);
          
        if (insertError) throw insertError;
      }
      
      toast({
        title: "Success",
        description: `${type === 'check_in' ? 'Check-in' : 'Check-out'} recorded successfully`,
      });
      
      // Refresh data
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error("Error recording attendance:", error);
      toast({
        title: "Error",
        description: error.message || `Failed to record ${type}`,
        variant: "destructive"
      });
    }
  };

  // Filtered data based on search
  const filteredUsers = usersList.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRooms = roomsList.filter(room => 
    room.room_number?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    room.floor?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAttendance = attendanceRecords.filter(record => {
    const user = usersList.find(u => u.id === record.user_id);
    return user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
           user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
      
      <Tabs defaultValue="analytics" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 md:w-[600px]">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
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
        
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-medium">Users Management</h3>
              <Badge>{usersList.length} Total</Badge>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" onClick={() => setRefreshTrigger(prev => prev + 1)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>Create a new user account.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label htmlFor="fullName">Full Name</label>
                      <Input 
                        id="fullName" 
                        value={editUserForm.full_name} 
                        onChange={(e) => setEditUserForm({...editUserForm, full_name: e.target.value})} 
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="email">Email</label>
                      <Input 
                        id="email" 
                        type="email"
                        value={editUserForm.email} 
                        onChange={(e) => setEditUserForm({...editUserForm, email: e.target.value})} 
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="role">Role</label>
                      <select 
                        id="role"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                        value={editUserForm.role}
                        onChange={(e) => setEditUserForm({...editUserForm, role: e.target.value})}
                      >
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                        <option value="security">Security</option>
                        <option value="mess">Mess Staff</option>
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => handleAddUser(editUserForm)}>Add User</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search users by name or email..."
              className="pl-9 mb-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No users found. Try a different search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover-scale-sm">
                        <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge 
                            className={`${
                              user.role === 'admin' ? 'bg-admin text-admin-foreground' :
                              user.role === 'student' ? 'bg-student text-student-foreground' :
                              user.role === 'security' ? 'bg-blue-100 text-blue-800' :
                              'bg-mess text-mess-foreground'
                            }`}
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="icon" variant="ghost" onClick={() => editUser(user)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteUser(user.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rooms" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-medium">Rooms Management</h3>
              <Badge>{roomsList.length} Total</Badge>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" onClick={() => setRefreshTrigger(prev => prev + 1)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Room
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Room</DialogTitle>
                    <DialogDescription>Create a new room in the dormitory.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="roomNumber">Room Number</label>
                        <Input 
                          id="roomNumber" 
                          value={editRoomForm.room_number} 
                          onChange={(e) => setEditRoomForm({...editRoomForm, room_number: e.target.value})} 
                        />
                      </div>
                      <div>
                        <label htmlFor="floor">Floor</label>
                        <Input 
                          id="floor" 
                          value={editRoomForm.floor} 
                          onChange={(e) => setEditRoomForm({...editRoomForm, floor: e.target.value})} 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="capacity">Capacity</label>
                        <Input 
                          id="capacity"
                          type="number"
                          value={editRoomForm.capacity} 
                          onChange={(e) => setEditRoomForm({...editRoomForm, capacity: parseInt(e.target.value) || 1})} 
                        />
                      </div>
                      <div>
                        <label htmlFor="price">Price per Month</label>
                        <Input 
                          id="price"
                          type="number"
                          value={editRoomForm.price_per_month} 
                          onChange={(e) => setEditRoomForm({...editRoomForm, price_per_month: parseFloat(e.target.value) || 0})} 
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="availability">Availability</label>
                      <select 
                        id="availability"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                        value={editRoomForm.is_available ? "true" : "false"}
                        onChange={(e) => setEditRoomForm({...editRoomForm, is_available: e.target.value === "true"})}
                      >
                        <option value="true">Available</option>
                        <option value="false">Occupied</option>
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => handleAddRoom(editRoomForm)}>Add Room</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search rooms by number or floor..."
              className="pl-9 mb-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room Number</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Price/Month</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRooms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No rooms found. Try a different search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRooms.map((room) => (
                      <TableRow key={room.id} className="hover-scale-sm">
                        <TableCell className="font-medium">{room.room_number}</TableCell>
                        <TableCell>{room.floor}</TableCell>
                        <TableCell>{room.capacity}</TableCell>
                        <TableCell>₹{room.price_per_month}</TableCell>
                        <TableCell>
                          <Badge className={room.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {room.is_available ? "Available" : "Occupied"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="icon" variant="ghost" onClick={() => editRoom(room)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteRoom(room.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="complaints" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-medium">Complaints Management</h3>
              <Badge>{complaintsData.length} Total</Badge>
            </div>
            <Button size="sm" onClick={() => setRefreshTrigger(prev => prev + 1)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                {complaintsData.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No complaints found.</p>
                  </div>
                ) : (
                  complaintsData.map((complaint) => {
                    const complainant = usersList.find(user => user.id === complaint.user_id);
                    return (
                      <div key={complaint.id} className="p-4 border rounded-lg hover-scale-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{complaint.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              From: {complainant?.full_name || 'Unknown'} | 
                              Room: {complaint.room_id || 'Not specified'} | 
                              Reported: {new Date(complaint.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge 
                            className={
                              complaint.status === 'open' ? 'bg-destructive text-destructive-foreground' :
                              complaint.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }
                          >
                            {complaint.status}
                          </Badge>
                        </div>
                        <p className="mt-2">{complaint.description}</p>
                        <div className="mt-4 flex justify-end space-x-2">
                          {complaint.status === 'open' && (
                            <Button size="sm" variant="outline" onClick={() => updateComplaintStatus(complaint.id, 'in_progress')}>
                              Mark In Progress
                            </Button>
                          )}
                          {(complaint.status === 'open' || complaint.status === 'in_progress') && (
                            <Button size="sm" onClick={() => updateComplaintStatus(complaint.id, 'resolved')}>
                              Mark Resolved
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          {/* Security Dashboard - Integrated from the standalone Security Dashboard */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-medium">Security Dashboard</h3>
              <Button size="sm" onClick={() => setRefreshTrigger(prev => prev + 1)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            
            {/* Quick Stats */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
              <Card className="hover-scale">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {attendanceRecords.filter(r => r.check_in && new Date(r.check_in).toDateString() === new Date().toDateString()).length}
                  </div>
                  <div className="flex items-center mt-1">
                    <UserCheck className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">
                      {usersList.filter(u => u.role === 'student').length ? 
                        Math.round((attendanceRecords.filter(r => r.check_in && new Date(r.check_in).toDateString() === new Date().toDateString()).length / 
                        usersList.filter(u => u.role === 'student').length) * 100) : 0}% of residents
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover-scale">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Today's Check-outs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {attendanceRecords.filter(r => r.check_out && new Date(r.check_out).toDateString() === new Date().toDateString()).length}
                  </div>
                  <div className="flex items-center mt-1">
                    <UserX className="h-4 w-4 text-muted-foreground mr-1" />
                    <span className="text-xs text-muted-foreground">
                      {usersList.filter(u => u.role === 'student').length ? 
                        Math.round((attendanceRecords.filter(r => r.check_out && new Date(r.check_out).toDateString() === new Date().toDateString()).length / 
                        usersList.filter(u => u.role === 'student').length) * 100) : 0}% of residents
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover-scale">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Current Outside</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {attendanceRecords.filter(r => 
                      r.check_in && 
                      !r.check_out && 
                      new Date(r.check_in).toDateString() === new Date().toDateString()
                    ).length}
                  </div>
                  <div className="flex items-center mt-1">
                    <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                    <span className="text-xs text-muted-foreground">Since today</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover-scale">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Missing Check-ins</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {usersList.filter(u => u.role === 'student').length - 
                     attendanceRecords.filter(r => 
                       r.check_in && 
                       new Date(r.check_in).toDateString() === new Date().toDateString()
                     ).length}
                  </div>
                  <div className="flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 text-destructive mr-1" />
                    <span className="text-xs text-destructive">Not checked in today</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Scanner */}
            <Card className="hover-scale">
              <CardHeader>
                <CardTitle>Student Attendance Scanner</CardTitle>
                <CardDescription>Record student check-in/out</CardDescription>
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
                
                {filteredUsers.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-semibold">Search Results:</h4>
                    {filteredUsers.slice(0, 5).map(user => (
                      <div key={user.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-accent">
                        <div>
                          <p className="font-medium">{user.full_name || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => recordAttendance(user.id, 'check_in')}
                          >
                            Check In
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => recordAttendance(user.id, 'check_out')}
                          >
                            Check Out
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {searchQuery && filteredUsers.length === 0 && (
                  <div className="text-center p-4 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No matching students found</p>
                  </div>
                )}
                
                {!searchQuery && (
                  <div className="flex justify-center border-2 border-dashed rounded-lg p-6">
                    <div className="text-center">
                      <QrCode className="h-24 w-24 mx-auto text-muted-foreground animate-pulse" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Search for a student or scan QR code to record attendance
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Attendance Records</CardTitle>
                <CardDescription>Latest student check-ins and check-outs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredAttendance.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No attendance records found.</p>
                    </div>
                  ) : (
                    filteredAttendance.slice(0, 10).map((record) => {
                      const student = usersList.find(u => u.id === record.user_id);
                      return (
                        <div key={record.id} className="flex items-center justify-between p-3 rounded-md border hover:bg-accent hover-scale animate-fade-in">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-full bg-green-100">
                              {record.check_in && !record.check_out ? (
                                <UserCheck className="h-4 w-4 text-green-600" />
                              ) : record.check_out ? (
                                <UserX className="h-4 w-4 text-blue-600" />
                              ) : (
                                <Clock className="h-4 w-4 text-yellow-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{student?.full_name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">{student?.email || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {record.check_in && (
                              <p className="text-sm">
                                In: {new Date(record.check_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            )}
                            {record.check_out && (
                              <p className="text-sm">
                                Out: {new Date(record.check_out).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">{new Date(record.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full hover-scale">
                  View All Records
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-fullName">Full Name</label>
              <Input 
                id="edit-fullName" 
                value={editUserForm.full_name} 
                onChange={(e) => setEditUserForm({...editUserForm, full_name: e.target.value})} 
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-email">Email</label>
              <Input 
                id="edit-email" 
                type="email"
                value={editUserForm.email} 
                onChange={(e) => setEditUserForm({...editUserForm, email: e.target.value})} 
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-role">Role</label>
              <select 
                id="edit-role"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                value={editUserForm.role}
                onChange={(e) => setEditUserForm({...editUserForm, role: e.target.value})}
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
                <option value="security">Security</option>
                <option value="mess">Mess Staff</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateUser}>Update User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Room Dialog */}
      <Dialog open={isEditRoomDialogOpen} onOpenChange={setIsEditRoomDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
            <DialogDescription>Update room information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="edit-roomNumber">Room Number</label>
                <Input 
                  id="edit-roomNumber" 
                  value={editRoomForm.room_number} 
                  onChange={(e) => setEditRoomForm({...editRoomForm, room_number: e.target.value})} 
                />
              </div>
              <div>
                <label htmlFor="edit-floor">Floor</label>
                <Input 
                  id="edit-floor" 
                  value={editRoomForm.floor} 
                  onChange={(e) => setEditRoomForm({...editRoomForm, floor: e.target.value})} 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="edit-capacity">Capacity</label>
                <Input 
                  id="edit-capacity"
                  type="number"
                  value={editRoomForm.capacity} 
                  onChange={(e) => setEditRoomForm({...editRoomForm, capacity: parseInt(e.target.value) || 1})} 
                />
              </div>
              <div>
                <label htmlFor="edit-price">Price per Month</label>
                <Input 
                  id="edit-price"
                  type="number"
                  value={editRoomForm.price_per_month} 
                  onChange={(e) => setEditRoomForm({...editRoomForm, price_per_month: parseFloat(e.target.value) || 0})} 
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-availability">Availability</label>
              <select 
                id="edit-availability"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                value={editRoomForm.is_available ? "true" : "false"}
                onChange={(e) => setEditRoomForm({...editRoomForm, is_available: e.target.value === "true"})}
              >
                <option value="true">Available</option>
                <option value="false">Occupied</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRoomDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateRoom}>Update Room</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
