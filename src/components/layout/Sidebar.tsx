
import { useState, useEffect } from "react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Building,
  Building2,
  Home,
  Users,
  BedDouble,
  Calendar,
  ClipboardList,
  Settings,
  Menu,
  X,
  LogOut,
  UserCheck,
  Landmark,
  CreditCard,
  MessageSquare,
  BarChart3,
} from "lucide-react";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon: Icon, label, active, onClick }: NavItemProps) => (
  <Button
    variant={active ? "secondary" : "ghost"}
    className={cn(
      "w-full justify-start gap-3 hover-scale",
      active ? "bg-secondary/60" : "hover:bg-accent/50"
    )}
    onClick={onClick}
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
  </Button>
);

interface SidebarProps {
  role: string;
  onNavigate?: (item: string) => void;
  activeItem?: string;
}

export function Sidebar({ role, onNavigate, activeItem = "dashboard" }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [currentActiveItem, setCurrentActiveItem] = useState(activeItem);
  
  // Update local active item when prop changes
  useEffect(() => {
    setCurrentActiveItem(activeItem);
  }, [activeItem]);
  
  const getRoleIcon = () => {
    switch (role) {
      case "admin":
        return Building2;
      case "student":
        return BedDouble;
      case "hostel":
        return Landmark;
      default:
        return Building2;
    }
  };
  
  const adminNavItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "students", label: "Students", icon: Users },
    { id: "rooms", label: "Rooms", icon: BedDouble },
    { id: "room-assignments", label: "Room Assignments", icon: UserCheck },
    { id: "attendance", label: "Attendance", icon: Calendar },
    { id: "mess-menu", label: "Mess Menu", icon: ClipboardList },
    { id: "settings", label: "Settings", icon: Settings },
  ];
  
  const studentNavItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "profile", label: "My Profile", icon: UserCheck },
    { id: "bookings", label: "My Bookings", icon: BedDouble },
    { id: "hostels", label: "Browse Hostels", icon: Building },
  ];
  
  const hostelNavItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "rooms", label: "Rooms", icon: BedDouble },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "students", label: "Students", icon: Users },
    { id: "finances", label: "Finances", icon: CreditCard },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings },
  ];
  
  let navItems;
  
  switch (role) {
    case "admin":
      navItems = adminNavItems;
      break;
    case "student":
      navItems = studentNavItems;
      break;
    case "hostel":
      navItems = hostelNavItems;
      break;
    default:
      navItems = adminNavItems;
  }

  const handleItemClick = (itemId: string) => {
    setCurrentActiveItem(itemId);
    if (onNavigate) {
      onNavigate(itemId);
    }
  };

  return (
    <div
      className={cn(
        "border-r bg-card relative transition-all duration-300 ease-in-out animate-slide-right",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {!collapsed && (
            <span className="text-xl font-bold animate-fade-in">DormMate</span>
          )}
          {getRoleIcon() && (
            <div className={cn("h-8 w-8", collapsed && "mx-auto")}>
              {React.createElement(getRoleIcon())}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="hover-scale"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <Menu /> : <X />}
        </Button>
      </div>
      <Separator />
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="space-y-1 p-2">
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={collapsed ? "" : item.label}
              active={currentActiveItem === item.id}
              onClick={() => handleItemClick(item.id)}
            />
          ))}
        </div>
      </ScrollArea>
      <div className="p-2 absolute bottom-0 w-full">
        <Separator className="my-2" />
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive",
          )}
          onClick={() => window.location.href = "/auth"}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
}
