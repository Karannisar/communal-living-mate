
import { useState } from "react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Building2,
  BedDouble,
  ShieldAlert,
  UtensilsCrossed,
  Home,
  Users,
  BookOpen,
  CalendarClock,
  ClipboardList,
  MessageSquare,
  Settings,
  Menu,
  X,
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
}

export function Sidebar({ role }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");
  
  const getRoleIcon = () => {
    switch (role) {
      case "admin":
        return Building2;
      case "student":
        return BedDouble;
      case "security":
        return ShieldAlert;
      case "mess":
        return UtensilsCrossed;
      default:
        return Building2;
    }
  };
  
  const getRoleNavItems = () => {
    const commonItems = [
      { id: "dashboard", label: "Dashboard", icon: Home },
      { id: "settings", label: "Settings", icon: Settings },
    ];
    
    const roleSpecificItems = {
      admin: [
        { id: "students", label: "Students", icon: Users },
        { id: "rooms", label: "Rooms", icon: BedDouble },
        { id: "attendance", label: "Attendance", icon: CalendarClock },
        { id: "mess-menu", label: "Mess Menu", icon: ClipboardList },
      ],
      student: [
        { id: "room", label: "My Room", icon: BedDouble },
        { id: "mess-menu", label: "Mess Menu", icon: BookOpen },
        { id: "complaints", label: "Complaints", icon: MessageSquare },
      ],
      security: [
        { id: "check-in", label: "Check In/Out", icon: CalendarClock },
        { id: "logs", label: "Attendance Logs", icon: ClipboardList },
        { id: "students", label: "Students", icon: Users },
      ],
      mess: [
        { id: "daily-menu", label: "Daily Menu", icon: BookOpen },
        { id: "weekly-plan", label: "Weekly Plan", icon: CalendarClock },
        { id: "inventory", label: "Inventory", icon: ClipboardList },
      ],
    };
    
    return [...commonItems, ...(roleSpecificItems[role as keyof typeof roleSpecificItems] || [])];
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
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="space-y-1 p-2">
          {getRoleNavItems().map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={collapsed ? "" : item.label}
              active={activeItem === item.id}
              onClick={() => setActiveItem(item.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
