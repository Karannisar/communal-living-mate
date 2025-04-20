
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, CheckCircle, XCircle } from "lucide-react";

export function AdminHostelManagement() {
  const [hostels, setHostels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchHostels();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('admin-hostel-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'hostels' }, 
        () => {
          fetchHostels();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchHostels = async () => {
    try {
      const { data, error } = await supabase
        .from('hostels')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setHostels(data || []);
    } catch (error: any) {
      console.error('Error fetching hostels:', error);
      toast({
        title: 'Error',
        description: 'Failed to load hostels',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (hostelId: string, approve: boolean) => {
    try {
      const { error } = await supabase
        .from('hostels')
        .update({ is_approved: approve })
        .eq('id', hostelId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `Hostel ${approve ? 'approved' : 'rejected'} successfully`,
      });
    } catch (error: any) {
      console.error('Error updating hostel:', error);
      toast({
        title: 'Error',
        description: 'Failed to update hostel status',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hostel Management</CardTitle>
          <CardDescription>
            Review and manage hostel registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hostels.map((hostel) => (
              <Card key={hostel.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="font-semibold">{hostel.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Building2 className="h-4 w-4 mr-1" />
                      {hostel.address}, {hostel.city}
                    </p>
                    <Badge className={hostel.is_approved ? "bg-green-100" : "bg-yellow-100"}>
                      {hostel.is_approved ? "Approved" : "Pending"}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    {!hostel.is_approved && (
                      <Button 
                        variant="outline" 
                        className="text-green-600"
                        onClick={() => handleApproval(hostel.id, true)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    )}
                    {hostel.is_approved && (
                      <Button 
                        variant="outline" 
                        className="text-red-600"
                        onClick={() => handleApproval(hostel.id, false)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
