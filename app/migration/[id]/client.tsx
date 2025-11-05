"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAPI } from "@/hooks/use-api";
import { ArrowRight, ExternalLink, Loader2, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { StatusSkeleton } from "./components/status-skeleton";

interface Metric {
  title: string;
  total: number;
  status: string;
  pending: number;
  created: number;
  skipped: number;
  failed: number;
  progress: number;
}

interface MigrationData {
  migration_id: string;
  migration_name: string;
  overall_status: string;
  source_platform: string;
  destination_platform: string;
  migration_start_datetime: string;
  time_ago: string;
  migration_id_display: string;
  metrics: Metric[];
  issues_count: number;
}

interface Run {
  run_id: string;
  status: string;
  start_time: string;
  end_time: string;
  duration: string;
  entities_processed: number;
  errors_count: number;
  created_at: string;
}

interface RunsData {
  runs: Run[];
  total_runs: number;
}

interface Project {
  project_id: string;
  name: string;
  status: string;
  progress?: number | string; // Backend sends status here, might be string or number
  issues_count?: number;
  last_updated?: string;
  source_url: string;
  destination_url: string;
}

interface ProjectsData {
  projects: Project[];
  total_projects: number;
}

interface Issue {
  issue_id: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  error_message: string;
  created_at: string;
  updated_at: string;
  assigned_to: string;
}

interface IssuesData {
  issues: Issue[];
  total_issues: number;
}

type TabType = "metrics" | "runs" | "projects" | "issues";

function StatusBadge({ status }: { status: string }) {
  const statusLower = status.toLowerCase();
  const variants: Record<
    string,
    { className: string; icon?: React.ReactNode }
  > = {
    completed: {
      className: "bg-black text-white",
    },
    "in progress": {
      className: "bg-black text-white",
      icon: <Loader2 className="h-3 w-3 animate-spin mr-1" />,
    },
    reconciliating: {
      className: "bg-black text-white",
      icon: <Loader2 className="h-3 w-3 animate-spin mr-1" />,
    },
    pending: {
      className: "bg-gray-100 text-gray-600",
    },
    failed: {
      className: "bg-red-50 text-red-700 border border-red-200",
    },
    open: {
      className: "bg-blue-50 text-blue-700 border border-blue-200",
    },
  };

  const { className, icon } = variants[statusLower] || variants.pending;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${className}`}
    >
      {icon}
      {status}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const variants: Record<string, string> = {
    High: "bg-red-50 text-red-700 border border-red-200",
    Medium: "bg-amber-50 text-amber-700 border border-amber-200",
    Low: "bg-gray-50 text-gray-700 border border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        variants[severity] || variants.Low
      }`}
    >
      {severity}
    </span>
  );
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

function firstCharToUpper(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function StatusPage({ id }: { id: string }) {
  const [activeTab, setActiveTab] = useState<TabType>("metrics");
  const [searchTerm, setSearchTerm] = useState("");
  const { callAPI } = useAPI();
  const [migrationStatus, setMigrationStatus] = useState<MigrationData | null>(
    null
  );
  const [runsData, setRunsData] = useState<RunsData | null>(null);
  const [projectsData, setProjectsData] = useState<ProjectsData | null>(null);
  const [issuesData, setIssuesData] = useState<IssuesData | null>(null);

  const fetchMigrationStatus = useCallback(
    async (id: string) => {
      if (!id) return;
      const data = await callAPI(`/migration-status?migration_id=${id}`, {
        requiresAuth: true,
      });
      setMigrationStatus(data as MigrationData);
    },
    [callAPI]
  );

  const fetchRuns = useCallback(
    async (id: string) => {
      if (!id) return;
      const data = await callAPI(`/migration-runs?migration_id=${id}`, {
        requiresAuth: true,
      });
      setRunsData(data as RunsData);
    },
    [callAPI]
  );

  const fetchProjects = useCallback(
    async (id: string) => {
      if (!id) return;
      const data = await callAPI(`/migration-projects?migration_id=${id}`, {
        requiresAuth: true,
      });
      setProjectsData(data as ProjectsData);
    },
    [callAPI]
  );

  const fetchIssues = useCallback(
    async (id: string) => {
      if (!id) return;
      const data = await callAPI(`/migration-issues?migration_id=${id}`, {
        requiresAuth: true,
      });
      setIssuesData(data as IssuesData);
    },
    [callAPI]
  );

  useEffect(() => {
    fetchMigrationStatus(id);
    const interval = setInterval(() => fetchMigrationStatus(id), 5000);
    return () => clearInterval(interval);
  }, [fetchMigrationStatus, id]);

  useEffect(() => {
    if (activeTab === "runs" && !runsData) {
      fetchRuns(id);
    } else if (activeTab === "projects" && !projectsData) {
      fetchProjects(id);
    } else if (activeTab === "issues" && !issuesData) {
      fetchIssues(id);
    }
  }, [activeTab, id, runsData, projectsData, issuesData, fetchRuns, fetchProjects, fetchIssues]);

  if (!migrationStatus) {
    return <StatusSkeleton />;
  }

  const filteredProjects =
    projectsData?.projects.filter((project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const filteredIssues =
    issuesData?.issues.filter(
      (issue) =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.entity_name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div suppressHydrationWarning className="w-full">
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-gray-500">
        <span className="hover:text-gray-700 cursor-pointer">All Migrations</span>
        <span className="mx-1">/</span>
        <span className="text-gray-900">Migration #{migrationStatus.migration_id_display}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-3xl font-bold text-gray-900">
            {migrationStatus.migration_name}
          </h1>
          <StatusBadge status={migrationStatus.overall_status} />
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
            <span className="font-medium text-gray-900">
              {firstCharToUpper(migrationStatus.source_platform)}
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
            <span className="font-medium text-gray-900">
              {firstCharToUpper(migrationStatus.destination_platform)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Started {migrationStatus.time_ago}</span>
          <span className="text-gray-300">•</span>
          <span>
            Migration ID: {migrationStatus.migration_id_display}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("metrics")}
            className={`pb-4 px-1 text-sm font-medium transition-colors relative ${
              activeTab === "metrics"
                ? "text-blue-600 border-b-2 border-blue-600 -mb-[2px]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Metrics
          </button>
          <button
            onClick={() => setActiveTab("runs")}
            className={`pb-4 px-1 text-sm font-medium transition-colors relative ${
              activeTab === "runs"
                ? "text-blue-600 border-b-2 border-blue-600 -mb-[2px]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Runs
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`pb-4 px-1 text-sm font-medium transition-colors relative ${
              activeTab === "projects"
                ? "text-blue-600 border-b-2 border-blue-600 -mb-[2px]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab("issues")}
            className={`pb-4 px-1 text-sm font-medium transition-colors relative inline-flex items-center ${
              activeTab === "issues"
                ? "text-blue-600 border-b-2 border-blue-600 -mb-[2px]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Issues
            {migrationStatus.issues_count > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 bg-red-50 text-red-700 border-red-200 text-xs"
              >
                {migrationStatus.issues_count}
              </Badge>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "metrics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {migrationStatus.metrics.map((metric, index) => (
            <Card key={index} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {metric.title}
                  </h3>
                  <StatusBadge status={metric.status} />
                </div>
                <div className="mb-6">
                  <div className="text-4xl font-bold text-gray-900">
                    {formatNumber(metric.total)}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 mb-5">
                  <div>
                    <div className="text-gray-500 text-xs mb-1">Pending</div>
                    <div className="font-semibold text-gray-900">
                      {formatNumber(metric.pending)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">Created</div>
                    <div className="font-semibold text-gray-900">
                      {formatNumber(metric.created)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">Skipped</div>
                    <div className="font-semibold text-gray-900">
                      {formatNumber(metric.skipped)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">Failed</div>
                    <div className={`font-semibold ${metric.failed > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatNumber(metric.failed)}
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Progress</span>
                    <span className="text-sm font-bold text-gray-900">
                      {metric.progress.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={metric.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "runs" && (
        <div>
          {runsData && runsData.runs.length > 0 ? (
            <div className="space-y-3">
              {runsData.runs.map((run) => (
                <Card key={run.run_id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-gray-900">
                            Run {run.run_id.slice(0, 8)}
                          </h3>
                          <StatusBadge status={run.status} />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500 text-xs">Duration</div>
                            <div className="font-medium text-gray-900">
                              {run.duration}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs">
                              Entities Processed
                            </div>
                            <div className="font-medium text-gray-900">
                              {formatNumber(run.entities_processed)}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs">Errors</div>
                            <div className="font-medium text-gray-900">
                              {run.errors_count}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs">Started</div>
                            <div className="font-medium text-gray-900">
                              {new Date(run.start_time).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              No runs data available
            </div>
          )}
        </div>
      )}

      {activeTab === "projects" && (
        <div>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          {projectsData && filteredProjects.length > 0 ? (
            <div className="space-y-3">
              {filteredProjects.map((project) => {
                const progressValue = typeof project.progress === 'number' ? project.progress : 0;
                return (
                  <Card key={project.project_id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-gray-900">
                              {project.name}
                            </h3>
                            <StatusBadge status={project.status} />
                            {project.issues_count && project.issues_count > 0 && (
                              <Badge
                                variant="secondary"
                                className="bg-red-50 text-red-700 border-red-200 text-xs"
                              >
                                {project.issues_count} issues
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            {project.source_url && (
                              <a
                                href={project.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Source
                              </a>
                            )}
                            {project.destination_url && (
                              <>
                                {project.source_url && <span className="text-gray-300">•</span>}
                                <a
                                  href={project.destination_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Destination
                                </a>
                              </>
                            )}
                            {project.last_updated && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span>
                                  Updated{" "}
                                  {new Date(project.last_updated).toLocaleString()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        {typeof project.progress === 'number' && (
                          <div className="ml-4 text-right min-w-[100px]">
                            <div className="text-sm font-semibold text-gray-900 mb-1">
                              {progressValue.toFixed(0)}%
                            </div>
                            <Progress
                              value={progressValue}
                              className="h-1.5 w-24"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              {searchTerm
                ? "No projects found matching your search"
                : "No projects data available"}
            </div>
          )}
        </div>
      )}

      {activeTab === "issues" && (
        <div>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          {issuesData && filteredIssues.length > 0 ? (
            <div className="space-y-3">
              {filteredIssues.map((issue) => (
                <Card key={issue.issue_id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-gray-900">
                            {issue.title}
                          </h3>
                          <StatusBadge status={issue.status} />
                          <SeverityBadge severity={issue.severity} />
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {issue.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>
                            {issue.entity_type}: {issue.entity_name}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span>
                            Created {new Date(issue.created_at).toLocaleString()}
                          </span>
                          {issue.assigned_to && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span>Assigned to {issue.assigned_to}</span>
                            </>
                          )}
                        </div>
                        {issue.error_message && (
                          <div className="mt-3 p-2 bg-gray-50 rounded text-xs font-mono text-gray-700">
                            {issue.error_message}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              {searchTerm
                ? "No issues found matching your search"
                : "No issues found"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
