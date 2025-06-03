import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User, 
  Briefcase, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Star,
  Heart
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/AuthContext";

interface Employee {
  id: number;
  email: string;
  displayName?: string;
  phone?: string;
  address?: string;
  startDate: string;
  status: string;
  position?: {
    id: number;
    name: string;
  };
  department?: {
    id: number;
    name: string;
  };
  benefits?: Array<{
    id: number;
    name: string;
  }>;
}

interface EmployeeProfileProps {
  employeeId: number;
}

export function EmployeeProfile({ employeeId }: EmployeeProfileProps) {
  const { user } = useAuth();

  const { data: profile, isLoading, error } = useQuery<Employee>({
    queryKey: [`/api/employees/${employeeId}`],
    enabled: Boolean(employeeId) && Boolean(user),
    initialData: user ? {
      id: employeeId,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'Anonymous User',
      startDate: new Date().toISOString(),
      status: 'Active',
    } as Employee : undefined,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[200px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-[300px]" />
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center text-muted-foreground">
            Error loading employee profile. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center text-muted-foreground">
            Employee not found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{profile.displayName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>{profile.email}</span>
            </div>
            {profile.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{profile.phone}</span>
              </div>
            )}
            {profile.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{profile.address}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Employment Status */}
      <Card>
        <CardHeader>
          <CardTitle>Employment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Joined: {new Date(profile.startDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>Status: {profile.status}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Position & Department */}
      {profile.position && (
        <Card>
          <CardHeader>
            <CardTitle>Position Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>{profile.position.name}</span>
              </div>
              {profile.department && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Department:</span>
                  <span>{profile.department.name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      {profile.benefits && profile.benefits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {profile.benefits.map((benefit) => (
                <div key={benefit.id} className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span>{benefit.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}