"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/auth-context";
import { useAPI } from "@/hooks/use-api";
import {
    Activity,
    AlertCircle,
    ArrowRightLeft,
    CheckCircle,
    Clock,
    FileText,
    HelpCircle,
    Plus,
    TrendingUp,
    Users
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface DashboardMetrics {
  total_migrations: number;
  total_active_projects: number;
  total_users_migrated: number;
  success_rate: number;
  recent_migrations: Array<{
    title: string;
    status: string;
    migration_start_datetime: number;
  }>;
}

export default function Page() {
  const { user, loading, checkAuth } = useAuth();
  const router = useRouter();
  const { callAPI } = useAPI();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      if (!user) return;
      
      setMetricsLoading(true);
      try {
        const data = await callAPI<DashboardMetrics>("/dashboard-migration-metrics", {
          method: "GET",
          requiresAuth: true
        });
        if (data) {
          setMetrics(data);
        }
      } catch (error) {
        console.error("Error fetching dashboard metrics:", error);
      } finally {
        setMetricsLoading(false);
      }
    };

    if (user) {
      fetchDashboardMetrics();
    }
  }, [user, callAPI]);

  if (loading || metricsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Format the recent migrations data
  const recentMigrations = metrics?.recent_migrations?.map((migration, index) => ({
    id: index + 1,
    name: migration.title,
    status: migration.status.toLowerCase(),
    date: migration.migration_start_datetime === 0 
      ? "Today" 
      : migration.migration_start_datetime === 1 
      ? "1 day ago" 
      : `${migration.migration_start_datetime} days ago`
  })) || [];

  // Format the stats data
  const stats = [
    { 
      label: "Total Migrations", 
      value: metrics?.total_migrations?.toString() || "0", 
      icon: ArrowRightLeft, 
      trend: "All time" 
    },
    { 
      label: "Active Projects", 
      value: metrics?.total_active_projects?.toString() || "0", 
      icon: Activity, 
      trend: "Currently active" 
    },
    { 
      label: "Users Migrated", 
      value: metrics?.total_users_migrated?.toString() || "0", 
      icon: Users, 
      trend: "Total migrated" 
    },
    { 
      label: "Success Rate", 
      value: metrics?.success_rate 
        ? `${Math.round(metrics.success_rate * 100)}%` 
        : "N/A", 
      icon: TrendingUp, 
      trend: metrics?.success_rate && metrics.success_rate >= 0.9 
        ? "Excellent performance" 
        : metrics?.success_rate && metrics.success_rate >= 0.7
        ? "Good performance"
        : "Needs improvement" 
    },
  ];

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case "completed":
      case "created":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in-progress":
      case "in_progress":
      case "running":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "pending":
      case "waiting":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "failed":
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case "completed":
      case "created":
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case "in-progress":
      case "in_progress":
      case "running":
        return <Badge variant="default" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "pending":
      case "waiting":
        return <Badge variant="secondary">Pending</Badge>;
      case "failed":
      case "error":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <TooltipProvider>
    <div className="space-y-6 animate-fade-in">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6 border hover-lift">
        <div className="flex items-center justify-between">
          <div className="animate-slide-up">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, <span className="text-gradient">{user.username}</span>! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Here&apos;s what&apos;s happening with your migrations today
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-3 animate-slide-up">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild className="animate-scale-in">
                  <Link href="/dashboard/migrations">
                    <Plus className="h-4 w-4 mr-2" />
                    New Migration
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Start a new migration (⌘+N)</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" asChild className="animate-scale-in">
                  <Link href="/dashboard/migrations">
                    View All
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View all migrations (⌘+2)</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="animate-scale-in">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-2">
                  <p className="font-semibold">Keyboard Shortcuts:</p>
                  <div className="text-xs space-y-1">
                    <p>⌘+K - Search</p>
                    <p>⌘+1 - Dashboard</p>
                    <p>⌘+2 - Migrations</p>
                    <p>⌘+N - New Migration</p>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover-lift animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gradient">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.trend}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Migrations */}
        <Card className="lg:col-span-2 hover-lift animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Migrations
            </CardTitle>
            <CardDescription>
              Your latest migration activities and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMigrations.map((migration, index) => (
                <div key={migration.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 hover:shadow-sm animate-slide-up" style={{ animationDelay: `${0.5 + index * 0.1}s` }}>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(migration.status)}
                    <div>
                      <h4 className="font-medium">{migration.name}</h4>
                      <p className="text-sm text-gray-500">{migration.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(migration.status)}
                    <Button variant="ghost" size="sm" className="animate-scale-in">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full animate-scale-in" asChild>
                <Link href="/dashboard/migrations">
                  View All Migrations
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="hover-lift animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with common tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="w-full justify-start animate-scale-in" asChild>
                  <Link href="/dashboard/migrations">
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    Start New Migration
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create a new data migration</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="w-full justify-start animate-scale-in" style={{ animationDelay: '0.1s' }}>
                  <FileText className="h-4 w-4 mr-2" />
                  View Templates
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Browse migration templates</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="w-full justify-start animate-scale-in" style={{ animationDelay: '0.2s' }}>
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manage user accounts and permissions</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="w-full justify-start animate-scale-in" style={{ animationDelay: '0.3s' }}>
                  <Activity className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View migration analytics and reports</p>
              </TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Quick Actions */}
      <div className="md:hidden">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button asChild>
              <Link href="/dashboard/migrations">
                <Plus className="h-4 w-4 mr-2" />
                New Migration
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/migrations">
                View All
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
    </TooltipProvider>
  );
}
