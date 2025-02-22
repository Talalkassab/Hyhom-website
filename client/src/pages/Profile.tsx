import { useParams } from "wouter";
import { EmployeeProfile } from "@/components/employees/EmployeeProfile";

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const employeeId = parseInt(id);

  if (isNaN(employeeId)) {
    return <div>Invalid employee ID</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Employee Profile</h1>
      <EmployeeProfile employeeId={employeeId} />
    </div>
  );
}
