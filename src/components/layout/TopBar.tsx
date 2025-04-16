import { useState } from "react";
import { Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface TopBarProps {
  userName: string;
  role: string;
}

export function TopBar({ userName, role }: TopBarProps) {
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Format username for the avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };
  
  // Role color styles
  const getRoleColor = () => {
    switch (role) {
      case "admin":
        return "bg-admin text-admin-foreground";
      case "student":
        return "bg-student text-student-foreground";
      case "security":
        return "bg-security text-security-foreground";
      case "mess":
        return "bg-mess text-mess-foreground";
      default:
        return "bg-primary text-primary-foreground";
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Logged out successfully",
      });

      // Navigate to home page after logout
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-16 border-b px-6 flex items-center justify-between animate-slide-down">
      <h1 className="text-xl font-semibold">
        {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
      </h1>
      
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" className="relative hover-scale">
          <Bell className="h-5 w-5" />
          {unreadNotifications > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center transform translate-x-1/3 -translate-y-1/3 animate-pulse">
              {unreadNotifications}
            </span>
          )}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover-scale">
              <Avatar>
                <AvatarImage src="/placeholder.svg" alt={userName} />
                <AvatarFallback className={getRoleColor()}>
                  {getInitials(userName || role)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}