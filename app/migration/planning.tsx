import ProjectSelectionCard from "@/app/migration/components/projects";
import {
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useAPI } from "@/hooks/use-api";
import { useAtom } from "jotai";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
    sourceAccessTokenAtom,
    sourceProviderAtom,
    sourcesAtom,
    sourceWorkspaceAtom,
    targetAccessTokenAtom,
    targetProviderAtom,
    targetWorkspaceAtom,
    userMappingsAtom,
} from "./atom";
import { StepFooter } from "./components/step-footer";
import { Project } from "./types";

interface CSVData {
  csv_data: Project[];
  columns: string[];
}

interface MigrationResponse {
  id: string;
}

export default function PlanningStep({
  onPrev,
}: {
  onNext: () => void;
  onPrev: () => void;
}) {
  const router = useRouter();
  const [sourceProvider] = useAtom(sourceProviderAtom);
  const [targetProvider] = useAtom(targetProviderAtom);
  const [sources] = useAtom(sourcesAtom);
  const [{ accessToken: targetAccessToken }] = useAtom(targetAccessTokenAtom);
  const [{ accessToken: sourceAccessToken }] = useAtom(sourceAccessTokenAtom);
  const [{ id: sourceWorkspaceId }] = useAtom(sourceWorkspaceAtom);
  const [{ id: targetWorkspaceId }] = useAtom(targetWorkspaceAtom);
  const [userMappings] = useAtom(userMappingsAtom);
  const { callAPI } = useAPI();
  const [selectedItems] = useState<string[]>([
    "task",
    "subtask",
  ]);
  const [selectedProjects, setSelectedProjects] = useState<Project[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(false);

  const sourcePlatform = sources.find((p) => p.id === sourceProvider.id);

  const fetchProjects = useCallback(async () => {
    setIsLoadingProjects(true);
    try {
      const queryParams = new URLSearchParams({
        token: sourceAccessToken,
        source_provider: sourceProvider.id,
        workspace_id: sourceWorkspaceId,
      });

      const response = await callAPI<CSVData>(
        `/migration-projects-csv?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          requiresAuth: true,
        }
      );
      if (response && response.csv_data && Array.isArray(response.csv_data)) {
        setProjects(response.csv_data);
        // Only select projects that are marked for migration
        const migratingProjects = response.csv_data.filter((p: Project) => 
          p.migrating === "yes" || p.migrating === "Yes"
        );
        setSelectedProjects(migratingProjects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoadingProjects(false);
    }
  }, [callAPI, sourceAccessToken, sourceProvider.id, sourceWorkspaceId]);

  useEffect(() => {
    console.log("fetching projects");
    fetchProjects();
  }, [fetchProjects]);



  const handleStartMigration = async () => {
    setIsStarting(true);

    console.log("targetWorkspaceId", targetWorkspaceId);
    try {
      // Get only the users that are set to migrate
      const migratingUsers = userMappings.filter(mapping => 
        mapping.migrating === "yes" || mapping.migrating === "Yes"
      );

      // Transform user mappings to list of dict format: [{ source_email: "...", target_email: "..." }]
      const userMappingsList = migratingUsers.map(mapping => ({
        source_email: mapping.source_email,
        target_email: mapping.target_email
      }));

      const payload = {
        source: {
          access_token: sourceAccessToken,
          workspace_id: sourceWorkspaceId,
          platform_id: sourceProvider.id,
        },
        target: {
          access_token: targetAccessToken,
          workspace_id: targetWorkspaceId,
          platform_id: targetProvider,
        },
        entities: selectedItems,
        project_ids: selectedProjects.map((p) => p.gid),
        user_mappings: userMappingsList,
      };

      console.log("payload", payload);

      const response = await callAPI<MigrationResponse>("/migration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: payload,
        requiresAuth: true,
      });

      console.log("response", response);

      if (response?.id) {
        router.push(`/migration/${response.id}`);
      }
    } catch (error) {
      console.error("Failed to start migration:", error);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Plan your migration</CardTitle>
        <CardDescription>
          Select the projects you want to migrate.
          <Link
            href="#"
            className="inline-flex items-center hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-3 w-3 ml-1" />
            <span className="sr-only">Open external link</span>
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ProjectSelectionCard
          sourcePlatform={sourcePlatform}
          projects={projects}
          selectedProjects={selectedProjects}
          setSelectedProjects={setSelectedProjects}
          isLoadingProjects={isLoadingProjects}
        />
      </CardContent>
      <StepFooter
        onNext={handleStartMigration}
        onPrev={onPrev}
        isLastStep
        isStarting={isStarting}
        disableNext={selectedProjects.length === 0}
      />
    </>
  );
}
