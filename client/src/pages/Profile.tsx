import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/lib/AuthContext";
import { EmployeeProfile } from "@/components/employees/EmployeeProfile";

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect to login if no user is found
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // If ID matches logged-in user's ID, show profile
  if (user && user.id.toString() === id) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Employee Profile</h1>
        <EmployeeProfile employeeId={user.id} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="text-center text-muted-foreground">
        Profile not found or you don't have permission to view it.
      </div>
    </div>
  );
}