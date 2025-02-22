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

      {/* Compensation */}
      {profile.compensation && (
        <Card>
          <CardHeader>
            <CardTitle>Compensation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: profile.compensation.currency
                }).format(profile.compensation.baseSalary)}
              </span>
              <span className="text-sm text-muted-foreground">
                (Effective from {new Date(profile.compensation.effectiveDate).toLocaleDateString()})
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Reviews */}
      {profile.performanceReviews?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Performance Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.performanceReviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4" />
                    <span className="font-medium">Rating: {review.rating}/5</span>
                    <span className="text-sm text-muted-foreground">
                      ({new Date(review.reviewDate).toLocaleDateString()})
                    </span>
                  </div>
                  {review.comments && (
                    <p className="text-sm text-muted-foreground">{review.comments}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
