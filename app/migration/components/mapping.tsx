import { Card, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Platform } from "../atom";

interface MigrationItemCardProps {
  item: {
    id: string;
    name: string;
    isPro: boolean;
  };
  sourcePlatform?: Platform;
  targetPlatform?: Platform;
  selectedItems: string[];
  handleItemToggle: (itemId: string) => void;
}

export default function MigrationItemCard({
  item,
  sourcePlatform,
  targetPlatform,
  selectedItems,
  handleItemToggle,
}: MigrationItemCardProps) {
  return (
    <Card key={item.id} className="relative">
      <div className="flex items-center p-4">
        <div className="flex items-center justify-center w-6">
          <Checkbox
            id={`checkbox-${item.id}`}
            checked={selectedItems.includes(item.id)}
            onCheckedChange={() => handleItemToggle(item.id)}
          />
        </div>
        <div className="ml-4 flex-grow">
          <div className="flex justify-between items-center mb-2">
            <CardTitle className="text-lg font-semibold">{item.name}</CardTitle>
            {item.isPro && (
              <Badge variant="secondary" className="text-xs">
                Pro
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Image
              src={sourcePlatform?.icon || ""}
              alt="Source platform logo"
              width={16}
              height={20}
            />
            <span>
              {
                sourcePlatform?.mapping[
                  item.id as keyof typeof sourcePlatform.mapping
                ]?.name
              }
            </span>
            <ArrowRight className="h-4 w-4" />
            <Image
              src={targetPlatform?.icon || ""}
              alt="Destination platform logo"
              width={16}
              height={16}
            />
            <span>
              {
                targetPlatform?.mapping[
                  item.id as keyof typeof targetPlatform.mapping
                ]?.name
              }
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
