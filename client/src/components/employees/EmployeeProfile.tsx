import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Briefcase, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  DollarSign,
  Star,
  Heart
} from "lucide-react";

interface EmployeeProfileProps {
  employeeId: number;
}

export function EmployeeProfile({ employeeId }: EmployeeProfileProps) {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: [`/api/employees/${employeeId}`],
  });

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <div>Error loading profile</div>;
  }

  if (!profile) {
    return <div>Employee not found</div>;
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
              <span>{profile.firstName} {profile.lastName}</span>
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

      {/* Employee Status */}
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

      {/* Benefits */}
      {profile.benefits?.length > 0 && (
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