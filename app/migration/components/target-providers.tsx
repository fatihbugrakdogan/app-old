import { useState, useEffect } from "react";
import { useAPI } from "@/hooks/use-api";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup } from "@/components/ui/radio-group";
import { RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { useAtom } from "jotai";
import {
  targetProviderAtom,
  targetAccessTokenAtom,
  targetWorkspaceAtom,
} from "../atom";
import { Platform } from "../atom";
// Interfaces

interface Source {
  id: string;
  name: string;
  icon: string;
  hasExternalLink?: boolean;
}

interface SourceListProps {
  sources: Source[];
  selectedSource: string;
  onSourceChange: (sourceId: string) => void;
}

interface SourceItemProps {
  source: Source;
  isSelected: boolean;
}

// Components

function SourceList({
  sources,
  selectedSource,
  onSourceChange,
}: SourceListProps) {
  return (
    <RadioGroup
      value={selectedSource}
      onValueChange={onSourceChange}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {sources
        .filter((src) => src.id === "asana")
        .map((src) => (
          //filter other than asana
          <SourceItem
            key={src.id}
            source={src}
            isSelected={selectedSource === src.id}
          />
        ))}
    </RadioGroup>
  );
}

function SourceItem({ source, isSelected }: SourceItemProps) {
  return (
    <Label
      htmlFor={source.id}
      className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-input hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      <RadioGroupItem value={source.id} id={source.id} className="sr-only" />
      <Image src={source.icon} alt={source.name} width={16} height={16} />
      <span className="font-medium flex items-center">
        {source.name}
        {source.hasExternalLink && <ExternalLink className="ml-1 h-4 w-4" />}
      </span>
    </Label>
  );
}

function SourceSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, index) => (
        <Skeleton key={index} className="h-16 w-full" />
      ))}
    </div>
  );
}

// Main Component

export function SourceProviders() {
  const [sources, setSources] = useState<Source[]>([]);
  const [sourceProvider, setSourceProvider] = useAtom(targetProviderAtom);
  const [, setWorkspace] = useAtom(targetWorkspaceAtom);

  const [, setAccessToken] = useAtom(targetAccessTokenAtom);
  const { callAPI, loading } = useAPI();

  useEffect(() => {
    const fetchSources = async () => {
      const data = await callAPI("/migration-sources", {
        requiresAuth: true,
      });
      if (data) {
        setSources(data as Platform[]);
      }
    };

    fetchSources();
  }, [callAPI]);

  const handleSourceChange = (sourceProviderId: string) => {
    setSourceProvider(sourceProviderId);
    setAccessToken({ accessToken: "", isSaved: false, isDisabled: false });
    setWorkspace({ id: "", name: "" });
  };

  return (
    <div className="space-y-2">
      <Label>Source</Label>
      {loading ? (
        <SourceSkeleton />
      ) : (
        <SourceList
          sources={sources}
          selectedSource={sourceProvider}
          onSourceChange={handleSourceChange}
        />
      )}
    </div>
  );
}
