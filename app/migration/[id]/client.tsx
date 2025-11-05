"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Clock,
  Search,
  BarChart2,
  ExternalLink,
  Bell,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useAPI } from "@/hooks/use-api";
import { formatDuration } from "@/utils/format-time";
import { StatusSkeleton } from "./components/status-skeleton";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface Project {
  id: string;
  name: string;
  source_project_name: string;
  destination_project_name: string;
  source_project_url: string;
  destination_project_url: string;
  status: string;
}

interface MigrationData {
  migration_id: string;
  status: string;
  source_workspace_name: string;
  destination_workspace_name: string;
  source_workspace_url?: string;
  destination_workspace_url?: string;
  owner: string;
  migration_start_datetime: string;
  source_platform_id: string;
  source_platform: string;
  destination_platform_id: string;
  destination_platform: string;
  projects: Project[];
}

function getProgress(migrationStatus: MigrationData | null) {
  if (!migrationStatus) return "0 / 0";
  const totalProjects = migrationStatus.projects.length;
  const completedProjects = migrationStatus.projects.filter(
    (project) => project.status === "completed"
  ).length;
  return `${completedProjects} / ${totalProjects}`;
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<
    string,
    { className: string; icon?: React.ReactNode }
  > = {
    completed: {
      className: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    },
    "in-progress": {
      className: "bg-[#0A0D14] text-white",
      icon: <Loader2 className="h-3 w-3 animate-spin mr-1.5" />,
    },
    pending: {
      className: "bg-blue-50 text-blue-600 border border-blue-100",
    },
    failed: {
      className: "bg-red-50 text-red-600 border border-red-100",
    },
  };

  const { className, icon } = variants[status] || variants.pending;

  const displayStatus =
    {
      completed: "Completed",
      "in-progress": "In Progress",
      pending: "Pending",
      failed: "Failed",
    }[status] || status;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${className}`}
    >
      {icon}
      {displayStatus}
    </span>
  );
}

function firstCharToUpper(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function StatusPage({ id }: { id: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const { callAPI } = useAPI();
  const [migrationStatus, setMigrationStatus] = useState<MigrationData | null>(
    null
  );

  const fetchMigrationStatus = useCallback(
    async (id: string) => {
      if (!id) return; // Guard against undefined id
      const data = await callAPI(`/migration-status?migration_id=${id}`, {
        requiresAuth: true,
      });
      console.log("data", data);
      setMigrationStatus(data as MigrationData);
    },
    [callAPI]
  );

  useEffect(() => {
    fetchMigrationStatus(id);
    const interval = setInterval(() => fetchMigrationStatus(id), 5000); // Pass id explicitly
    return () => clearInterval(interval);
  }, [fetchMigrationStatus, id]);

  const filteredProjects =
    migrationStatus?.projects.filter(
      (project) =>
        project.source_project_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        project.destination_project_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    ) || [];

  if (!migrationStatus) {
    return <StatusSkeleton />;
  }

  return (
    <div suppressHydrationWarning>
      <CardHeader>
        <CardTitle className="text-2xl">
          <span className="flex items-center space-x-2">
            <span className="font-medium">
              {firstCharToUpper(migrationStatus.source_platform)}
            </span>
            <ArrowRight className="h-4 w-4" />
            <span className="font-medium">
              {firstCharToUpper(migrationStatus.destination_platform)}
            </span>
            <span className="font-medium">Migration</span>
          </span>
        </CardTitle>
        <CardDescription>
          <span className="flex flex-col space-y-2 mt-4">
            <span className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Migration ID:
              </span>
              <span className="text-sm font-medium">
                {migrationStatus.migration_id}
              </span>
            </span>
            <span className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Source Workspace:
              </span>
              {migrationStatus.source_workspace_url ? (
                <Link
                  href={migrationStatus.source_workspace_url}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  {migrationStatus.source_workspace_name}
                </Link>
              ) : (
                <span className="text-sm font-medium">
                  {migrationStatus.source_workspace_name}
                </span>
              )}
            </span>
            <span className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Target Workspace:
              </span>
              {migrationStatus.destination_workspace_url ? (
                <Link
                  href={migrationStatus.destination_workspace_url}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  {migrationStatus.destination_workspace_name}
                </Link>
              ) : (
                <span className="text-sm font-medium">
                  {migrationStatus.destination_workspace_name}
                </span>
              )}
            </span>
            <span className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <StatusBadge status={migrationStatus.status} />
            </span>
            <span className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Duration:</span>
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                {formatDuration(migrationStatus.migration_start_datetime)}
              </span>
            </span>
            <span className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Progress:</span>
              <BarChart2 className="h-4 w-4" />
              <span className="text-sm font-medium">
                {getProgress(migrationStatus)} Projects Migrated
              </span>
            </span>
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 p-4 rounded-md">
          <Bell className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-blue-700">
            You can leave the page and we&apos;ll notify you when the migration
            is complete.
          </span>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Migration Details</h3>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="mt-4">
            <div className="grid grid-cols-4 gap-4 mb-2 text-sm font-medium text-muted-foreground">
              <div>Source</div>
              <div>Destination</div>
              <div>Status</div>
            </div>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 gap-4 py-2 border-t text-sm"
                >
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={project.source_project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {project.source_project_name}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={project.destination_project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {project.destination_project_name}
                    </a>
                  </div>
                  <div>
                    <StatusBadge status={project.status} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No projects found matching your search.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </div>
  );
}
