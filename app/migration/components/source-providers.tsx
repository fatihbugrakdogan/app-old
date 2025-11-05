import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useAPI } from "@/hooks/use-api";
import { useAtom } from "jotai";
import Image from "next/image";
import { useEffect } from "react";
import {
  sourceAccessTokenAtom,
  sourceProviderAtom,
  sourceWorkspaceAtom,
  sourcesAtom,
} from "../atom";
// Interfaces
import { Platform } from "../atom";

interface SourceListProps {
  sources: Platform[];
  selectedSource: { id: string; accessTokenDocumentation?: string };
  onSourceChange: (sourceId: string) => void;
}

interface SourceItemProps {
  source: Platform;
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
      value={selectedSource.id}
      onValueChange={onSourceChange}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {sources.map((src) => (
        <SourceItem
          key={src.id}
          source={src}
          isSelected={selectedSource.id === src.id}
        />
      ))}
    </RadioGroup>
  );
}

function SourceItem({ source, isSelected }: SourceItemProps) {
  return (
    <Label
      htmlFor={source.id}
      className={`relative flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-input hover:bg-accent hover:text-accent-foreground"
      } ${!source.isReady ? "opacity-60" : ""}`}
    >
      <RadioGroupItem
        value={source.id}
        id={source.id}
        className="sr-only"
        disabled={!source.isReady}
      />
      <Image src={source.icon} alt={source.name} width={16} height={16} />
      <span className="font-medium flex items-center">{source.name}</span>
      {!source.isReady && (
        <span className="absolute top-0 right-0 -translate-y-1/2 px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-full">
          Coming Soon
        </span>
      )}
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
  const [sources, setSources] = useAtom(sourcesAtom);
  const [sourceProvider, setSourceProvider] = useAtom(sourceProviderAtom);
  const [, setWorkspace] = useAtom(sourceWorkspaceAtom);

  const [, setAccessToken] = useAtom(sourceAccessTokenAtom);
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
  }, [setSources, callAPI]);

  const handleSourceChange = (sourceProviderId: string) => {
    const { id, name, accessTokenDocumentation } = sources.find(
      (source) => source.id === sourceProviderId
    ) || { id: "", name: "", accessTokenDocumentation: undefined };

    setSourceProvider({ id, name, accessTokenDocumentation });
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
