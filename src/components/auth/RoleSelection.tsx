
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Building2, 
  BedDouble, 
  ShieldAlert
} from "lucide-react";

const roles = [
  {
    id: "admin",
    title: "Admin",
    description: "Full system control",
    icon: Building2,
    theme: "theme-admin",
    color: "bg-admin/10 text-admin-dark border-admin hover:bg-admin/20"
  },
  {
    id: "student",
    title: "Student",
    description: "Access your room & mess details",
    icon: BedDouble,
    theme: "theme-student",
    color: "bg-student/10 text-student-dark border-student hover:bg-student/20"
  },
  {
    id: "security",
    title: "Security",
    description: "Manage attendance & logs",
    icon: ShieldAlert,
    theme: "theme-security",
    color: "bg-security/10 text-security-dark border-security hover:bg-security/20"
  }
];

interface RoleSelectionProps {
  onRoleSelect: (role: string, theme: string) => void;
  hideStaffRoles?: boolean;
}

export function RoleSelection({ onRoleSelect, hideStaffRoles = false }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const displayRoles = hideStaffRoles 
    ? roles.filter(role => role.id === "student")
    : roles;

  const handleRoleSelect = (roleId: string, theme: string) => {
    setSelectedRole(roleId);
    onRoleSelect(roleId, theme);
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">Select Your Role</CardTitle>
        <CardDescription>
          Choose your role to access the appropriate dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayRoles.map((role) => (
            <div
              key={role.id}
              className={`
                relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-300
                ${role.color}
                ${selectedRole === role.id ? "border-ring ring-2 ring-ring ring-offset-2" : ""}
              `}
              onClick={() => handleRoleSelect(role.id, role.theme)}
            >
              <div className="flex items-start space-x-4">
                <div className="bg-white/90 p-3 rounded-full">
                  <role.icon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">{role.title}</h3>
                  <p className="text-sm opacity-80">{role.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </div>
  );
}
