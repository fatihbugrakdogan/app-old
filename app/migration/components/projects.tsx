import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAPI } from "@/hooks/use-api";
import { useAtom } from "jotai";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Info,
  RefreshCw,
  Search,
  Upload,
  User
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { sourceAccessTokenAtom } from "../atom";
import { Platform, Project } from "../types";

// pagination controls

const PaginationControls: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-end space-x-4 pt-4">
      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
           <span className="sr-only">Next page</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const ProjectTable: React.FC<{ 
  projects: Project[]; 
  isLoading: boolean; 
  onProjectToggle: (id: string) => void;
  selectedProjects: Project[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSelectAllPage: () => void;
  onClearAll: () => void;
  onRefresh: () => void;
  selectedCount: number;
  lastUpdated?: string;
}> = ({ 
  projects, 
  isLoading, 
  onProjectToggle, 
  selectedProjects, 
  searchQuery, 
  onSearchChange, 
  currentPage, 
  totalPages, 
  onPageChange,
  onSelectAllPage,
  onClearAll,
  onRefresh,
  selectedCount,
  lastUpdated
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 border-gray-200 focus:border-gray-300 focus:ring-0"
              aria-label="Search projects"
            />
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <Button variant="outline" size="sm" className="border-gray-300">
              Select All (page)
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300">
              Clear All
            </Button>
            <Button variant="outline" size="icon" className="border-gray-300">
              <RefreshCw className="h-4 w-4 animate-spin" />
            </Button>
            <div className="flex items-center gap-3 pl-1">
              <span className="text-xs text-gray-600">
                Selected: <span className="font-medium text-gray-900">0</span>
              </span>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>
                  <Skeleton className="h-4 w-40" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(10)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-64" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-5" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 border-gray-200 focus:border-gray-300 focus:ring-0"
              aria-label="Search projects"
            />
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <Button variant="outline" size="sm" className="border-gray-300">
              Select All (page)
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300">
              Clear All
            </Button>
            <Button variant="outline" size="icon" className="border-gray-300">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3 pl-1">
              <span className="text-xs text-gray-600">
                Selected: <span className="font-medium text-gray-900">0</span>
              </span>
            </div>
          </div>
        </div>
        <Alert>
          <AlertTitle className="flex items-center gap-2">
            <Info className="h-4 w-4" aria-hidden />
            No results found
          </AlertTitle>
          <AlertDescription className="mt-1">
            No projects match your search criteria. Try adjusting your search terms or check if you have access to the projects you&apos;re looking for.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 border-gray-200 focus:border-gray-300 focus:ring-0"
            aria-label="Search projects"
          />
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAllPage}
            className="border-gray-300"
            title="Select all on this page"
          >
            Select All (page)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="border-gray-300"
            title="Clear all selections"
          >
            Clear All
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            className="border-gray-300"
            aria-label="Refetch projects"
            title="Refetch projects"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3 pl-1">
            <span className="text-xs text-gray-600">
              Selected: <span className="font-medium text-gray-900">{selectedCount}</span>
            </span>
            {lastUpdated && (
              <span className="text-xs text-gray-500" aria-live="polite">
                {lastUpdated}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Project</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="w-[110px]">Migrate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => {
              const isSelected = selectedProjects.some(p => p.gid === project.gid);
              return (
              <TableRow key={project.gid}>
                <TableCell className="align-middle">
                  <a
                    href={project.permalink_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {project.name}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                </TableCell>
                <TableCell className="align-middle">
                  <span className="inline-flex items-center gap-2 text-gray-700">
                    <User className="h-4 w-4 text-gray-400" aria-hidden />
                    <span>{project.owner ? JSON.stringify(project.owner).split('"').join('') : 'Unknown'}</span>
                  </span>
                </TableCell>
                <TableCell className="align-middle">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      if (checked !== undefined) {
                        onProjectToggle(project.gid);
                      }
                    }}
                    aria-label={`Toggle migrate for ${project.name}`}
                  />
                </TableCell>
              </TableRow>
            );
            })}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />}
    </div>
  );
};

export default function ProjectSelectionCard({
  sourcePlatform,
  projects,
  selectedProjects,
  setSelectedProjects,
  isLoadingProjects = false,
}: {
  sourcePlatform?: Platform;
  projects: Project[];
  selectedProjects: Project[];
  setSelectedProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  isLoadingProjects?: boolean;
}) {
  const [isProjectsExpanded] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const { callAPI } = useAPI();
  const [sourceAccessToken] = useAtom(sourceAccessTokenAtom);

  const ITEMS_PER_PAGE = 10;

  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects;
    return projects.filter(project => 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.owner && JSON.stringify(project.owner).toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [projects, searchQuery]);

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);

  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredProjects.length]);

  const handleProjectToggle = (projectId: string) => {
    const project = paginatedProjects.find(p => p.gid === projectId);
    if (!project) return;

    setSelectedProjects(prev => {
      const isSelected = prev.some(p => p.gid === projectId);
      if (isSelected) {
        return prev.filter(p => p.gid !== projectId);
      } else {
        return [...prev, project];
      }
    });
  };

  const handleSelectAllPage = () => {
    const currentSelectedIds = new Set(selectedProjects.map(p => p.gid));
    
    const newSelectedProjects = [...selectedProjects];
    paginatedProjects.forEach(project => {
      if (!currentSelectedIds.has(project.gid)) {
        newSelectedProjects.push(project);
      }
    });
    
    setSelectedProjects(newSelectedProjects);
  };

  const handleClearAll = () => {
    setSelectedProjects([]);
  };

  const handleRefresh = useCallback(() => {
    setLastUpdated(new Date().toLocaleString());
    // This would typically trigger a refetch of projects
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    if (!sourcePlatform || !sourceAccessToken.accessToken) return;
    
    setIsLoadingUser(true);
    try {
      const response = await callAPI<string>(`/get-current-user?source_provider=${sourcePlatform.name.toLowerCase()}&token=${sourceAccessToken.accessToken}`, {
        method: 'GET'
      });
      setCurrentUserEmail(response);
    } catch (error) {
      console.error('Error fetching current user:', error);
      setCurrentUserEmail(null);
    } finally {
      setIsLoadingUser(false);
    }
  }, [callAPI, sourcePlatform, sourceAccessToken.accessToken]);

  // Fetch current user on component mount
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const handleDownloadCSV = () => {
    if (projects.length === 0) {
      alert("No projects available to download");
      return;
    }

    const csvContent = [
      ["projectId", "name", "owner", "migrate"],
      ...projects.map(project => [
        project.gid, 
        project.name, 
        project.owner ? JSON.stringify(project.owner) : 'Unknown', 
        selectedProjects.some(p => p.gid === project.gid) ? "yes" : "no"
      ])
    ];
    
    const csvString = csvContent.map(row => 
      row.map(field => `"${field}"`).join(",")
    ).join("\n");
    
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", "migration-projects.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const text = await file.text();
      const lines = text.trim().split("\n").filter(line => line.trim());
      
      if (lines.length < 2) {
        alert("CSV file must contain headers and at least one data row");
        return;
      }
      
      const headers = lines[0].split(",").map(h => h.replace(/"/g, "").trim());
      
      if (!headers.includes("projectId")) {
        alert("CSV must contain 'projectId' column");
        return;
      }
      
      const csvData = lines.slice(1)
        .map(line => {
          // Handle CSV parsing more robustly
          const values = [];
          let current = "";
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim());
              current = "";
            } else {
              current += char;
            }
          }
          values.push(current.trim()); // Add the last value
          
          return {
            projectId: values[headers.indexOf("projectId")]?.replace(/"/g, "") || "",
            migrate: values[headers.indexOf("migrate")]?.replace(/"/g, "") || ""
          };
        })
        .filter(row => row.projectId); // Filter out empty rows

      if (csvData.length === 0) {
        alert("No valid data found in CSV file");
        return;
      }

      // Update selected projects based on CSV
      const newSelectedProjects: Project[] = [];
      csvData.forEach(row => {
        const project = projects.find(p => p.gid === row.projectId);
        if (project) {
          const shouldMigrate = row.migrate.toLowerCase() === "yes" || 
                               row.migrate.toLowerCase() === "true" || 
                               row.migrate.toLowerCase() === "1";
          if (shouldMigrate) {
            newSelectedProjects.push(project);
          }
        }
      });

      setSelectedProjects(newSelectedProjects);
      alert("CSV uploaded successfully!");
    } catch (error) {
      console.error("Error uploading CSV:", error);
      alert("Error processing CSV file. Please check the format and try again.");
    } finally {
      setIsUploading(false);
      // Clear the input
      event.target.value = "";
    }
  };

  const canDownload = !isLoadingProjects && projects.length > 0;

  return (
    <div>
      
      {/* Current User Information */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Info className="h-4 w-4 text-gray-500" />
          <span>Viewing with: </span>
          {isLoadingUser ? (
            <span className="font-medium text-gray-900">Loading...</span>
          ) : currentUserEmail ? (
            <span className="font-medium text-gray-900">{currentUserEmail}</span>
          ) : (
            <span className="font-medium text-gray-900">Unknown</span>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-1">
          If you cannot find the project you want to migrate, it may be because this person does not have access to that project. Please email all the colleagues to invite that account into all project.
        </p>
      </div>
      
      {isProjectsExpanded && (
        <div className="px-6 py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-5 border border-gray-200 rounded-lg bg-gray-50">
                <Download className="h-5 w-5 text-gray-400" aria-hidden />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Download Projects List</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Download to share with colleagues, update the &quot;migrate&quot; column, and upload back.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadCSV}
                  disabled={!canDownload}
                  className="border-gray-300"
                  title="Download all filtered projects with their migration status"
                >
                  Download
                </Button>
              </div>

              <div className="flex items-center gap-4 p-5 border border-gray-200 rounded-lg bg-gray-50">
                <Upload className="h-5 w-5 text-gray-400" aria-hidden />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Upload Projects List</p>
                  <p className="text-xs text-gray-600 mt-0.5">Upload the updated list with the &quot;migrate&quot; column.</p>
                </div>
                <div>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="hidden"
                    id="csv-file-upload"
                    aria-label="Upload CSV file"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild 
                    className="border-gray-300"
                    disabled={isUploading}
                  >
                    <label htmlFor="csv-file-upload" className="cursor-pointer">
                      {isUploading ? "Uploading..." : "Choose File"}
                    </label>
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              {isLoadingProjects ? (
                "Loading projects..."
              ) : selectedProjects.length > 0 ? (
                `${selectedProjects.length} ${sourcePlatform?.mapping.project.name.toLowerCase()}${
                  selectedProjects.length > 1 ? "s" : ""
                } selected for migration`
              ) : (
                `No ${sourcePlatform?.mapping.project.name.toLowerCase()}s selected for migration`
              )}
            </div>

            <ProjectTable 
              projects={paginatedProjects}
              isLoading={isLoadingProjects}
              onProjectToggle={handleProjectToggle}
              selectedProjects={selectedProjects}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onSelectAllPage={handleSelectAllPage}
              onClearAll={handleClearAll}
              onRefresh={handleRefresh}
              selectedCount={selectedProjects.length}
              lastUpdated={lastUpdated || undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}
