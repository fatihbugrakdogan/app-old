"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAPI } from "@/hooks/use-api";
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Play,
  RefreshCw,
  Settings,
  XCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Migration status types
const MIGRATION_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress", 
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled"
} as const;

// Migration interface
interface Migration {
  migration_id: string;
  name?: string;
  source_platform: string;
  target_platform: string;
  status: string;
  started_at?: string;
  completed_at?: string;
  source_workspace_name: string;
  target_workspace_name: string;
  projects_to_migrate_count?: number;
  progress?: number;
}

// Empty migrations array - will be populated from API
const mockMigrations: Migration[] = [];

const platformIcons = {
  monday: "https://res.cloudinary.com/dergt2trh/image/upload/v1725130280/monday_x8fdtd.svg",
  wrike: "https://res.cloudinary.com/dergt2trh/image/upload/v1725129825/wrike-logo-8C98A8EDEF-seeklogo.com__v4x53v.png",
  asana: "https://res.cloudinary.com/dergt2trh/image/upload/v1725129733/412cb9-asana-icon_yhbgmh.svg",
  smartsheet: "https://res.cloudinary.com/dergt2trh/image/upload/v1734803929/smartsheet_oisdx3.jpg",
  airtable: "https://res.cloudinary.com/dergt2trh/image/upload/v1734836885/airtable-logo-216B9AF035-seeklogo.com_rr5nko.png"
};

export default function MigrationsPage() {
  const router = useRouter();
  const { callAPI } = useAPI();
  const [migrations, setMigrations] = useState(mockMigrations);
  const [loading, setLoading] = useState(false);

  // Fetch migrations on component mount
  useEffect(() => {
    fetchMigrations();
  }, [callAPI]);

  const fetchMigrations = async () => {
    setLoading(true);
    try {
      // Try different possible endpoints
      let response;
      try {
        response = await callAPI('/get-migrations', {
          method: 'GET',
          requiresAuth: true
        });
      } catch {
        console.log('Trying alternative endpoint...');
        try {
          response = await callAPI('/migrations', {
            method: 'GET',
            requiresAuth: true
          });
        } catch {
          console.log('Both endpoints failed, using mock data');
          setMigrations(mockMigrations);
          return;
        }
      }
      
      if (response) {
        // Handle different response formats
        if (Array.isArray(response)) {
          setMigrations(response as Migration[]);
        } else if ((response as Record<string, unknown>).migrations && Array.isArray((response as Record<string, unknown>).migrations)) {
          setMigrations((response as Record<string, unknown>).migrations as Migration[]);
        } else {
          console.log('Unexpected response format:', response);
          setMigrations(mockMigrations);
        }
      } else {
        setMigrations(mockMigrations);
      }
    } catch {
      console.error('Failed to fetch migrations');
      setMigrations(mockMigrations);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case MIGRATION_STATUS.COMPLETED: return <CheckCircle className="w-4 h-4 text-green-600" />;
      case MIGRATION_STATUS.IN_PROGRESS: return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case MIGRATION_STATUS.FAILED: return <XCircle className="w-4 h-4 text-red-600" />;
      case MIGRATION_STATUS.PENDING: return <Clock className="w-4 h-4 text-yellow-600" />;
      case MIGRATION_STATUS.CANCELLED: return <XCircle className="w-4 h-4 text-gray-600" />;
      default: return <Settings className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case MIGRATION_STATUS.COMPLETED: return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case MIGRATION_STATUS.IN_PROGRESS: return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case MIGRATION_STATUS.FAILED: return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case MIGRATION_STATUS.PENDING: return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case MIGRATION_STATUS.CANCELLED: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewMigration = (migrationId: string) => {
    router.push(`/migration/${migrationId}`);
  };


  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold">Migration History</CardTitle>
              <CardDescription className="text-muted-foreground">
                View and manage your previous migrations
              </CardDescription>
            </div>
            <Button onClick={() => router.push('/migration')}>
              <Play className="w-4 h-4 mr-2" />
              Start New Migration
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Migrations Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {migrations.map((migration) => (
          <Card key={migration.migration_id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              {/* Migration Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <img 
                      src={platformIcons[migration.source_platform as keyof typeof platformIcons]} 
                      alt={migration.source_platform}
                      className="w-5 h-5"
                    />
                    <span className="text-sm font-medium capitalize">{migration.source_platform}</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  <div className="flex items-center gap-2">
                    <img 
                      src={platformIcons[migration.target_platform as keyof typeof platformIcons]} 
                      alt={migration.target_platform}
                      className="w-5 h-5"
                    />
                    <span className="text-sm font-medium capitalize">{migration.target_platform}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(migration.status)}
                  <Badge className={`text-xs ${getStatusColor(migration.status)}`}>
                    {migration.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {/* Migration Info */}
              <div className="mb-3">
                <h3 className="font-semibold text-sm mb-1">{migration.name || `${migration.source_platform} to ${migration.target_platform} Migration`}</h3>
                <p className="text-xs text-muted-foreground">
                  {migration.source_workspace_name} → {migration.target_workspace_name}
                </p>
              </div>

              {/* Progress */}
              {migration.status === MIGRATION_STATUS.IN_PROGRESS && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{migration.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${migration.progress || 0}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {migration.projects_to_migrate_count || 0} projects to migrate
                  </div>
                </div>
              )}

              {/* Migration Stats */}
              {migration.status === MIGRATION_STATUS.COMPLETED && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 text-xs text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    <span>Completed: {migration.projects_to_migrate_count || 0} projects migrated</span>
                  </div>
                </div>
              )}

              {/* Date Info */}
              <div className="space-y-1 text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>Started: {migration.started_at ? formatDate(migration.started_at) : 'Unknown'}</span>
                </div>
                {migration.completed_at && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    <span>Completed: {formatDate(migration.completed_at)}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleViewMigration(migration.migration_id)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Status
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {migrations.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Migrations Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start your first migration to see it here
            </p>
            <Button onClick={() => router.push('/migration')}>
              <Play className="w-4 h-4 mr-2" />
              Start Migration
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2">Loading migrations...</span>
          </CardContent>
        </Card>
      )}
    </div>
  );
}