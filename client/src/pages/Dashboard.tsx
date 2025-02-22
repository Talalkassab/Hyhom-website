import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";
import {
  Users,
  Building2,
  TrendingUp,
  Star
} from "lucide-react";

export default function Dashboard() {
  const { t } = useLanguage();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const metrics = [
    {
      title: t('dashboard.metrics.totalEmployees'),
      value: stats?.employeeCount ?? 0,
      icon: <Users className="h-6 w-6 text-blue-600" />,
      description: t('dashboard.metrics.activeMembers')
    },
    {
      title: t('dashboard.metrics.departments'),
      value: stats?.departmentCount ?? 0,
      icon: <Building2 className="h-6 w-6 text-green-600" />,
      description: t('dashboard.metrics.activeDepartments')
    },
    {
      title: t('dashboard.metrics.growth'),
      value: stats?.growthRate ? `${stats.growthRate}%` : '0%',
      icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
      description: t('dashboard.metrics.yearlyGrowth')
    },
    {
      title: t('dashboard.metrics.performance'),
      value: stats?.averagePerformance?.toFixed(1) ?? '0.0',
      icon: <Star className="h-6 w-6 text-yellow-600" />,
      description: t('dashboard.metrics.averageRating')
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        {t('dashboard.welcome')}
      </h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              {metric.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* We'll add more dashboard widgets here later */}
    </div>
  );
}
