
import { AdminHostelManagement } from "./AdminHostelManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminDashboard({ activeSection = "dashboard" }) {
  const renderActiveSection = () => {
    switch (activeSection) {
      case "hostels":
        return <AdminHostelManagement />;
      case "dashboard":
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>
                Welcome to the admin dashboard. Use the navigation to manage different aspects of the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Select a section from the sidebar to get started.</p>
            </CardContent>
          </Card>
        );
    }
  };
  
  return (
    <div className="space-y-6">
      {renderActiveSection()}
    </div>
  );
}
