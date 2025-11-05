"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Clock, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

// Platform data
const platforms = {
  asana: {
    id: "asana",
    name: "Asana",
    icon: "https://res.cloudinary.com/dergt2trh/image/upload/v1725129733/412cb9-asana-icon_yhbgmh.svg",
    isReady: true,
    accessTokenDocumentation: "https://developers.asana.com/docs/personal-access-token",
    mapping: {
      project: { id: "project", name: "Project", isPremium: false },
      task: { id: "task", name: "Task", isPremium: false },
      customField: { id: "custom_field", name: "Custom Field", isPremium: true },
      attachment: { id: "attachment", name: "Attachment", isPremium: true },
      comment: { id: "comment", name: "Comment", isPremium: true },
      subtask: { id: "subtask", name: "Subtask", isPremium: true },
      section: { id: "section", name: "Section", isPremium: true }
    }
  },
  monday: {
    id: "monday",
    name: "Monday.com",
    icon: "https://res.cloudinary.com/dergt2trh/image/upload/v1725130280/monday_x8fdtd.svg",
    isReady: true,
    accessTokenDocumentation: "https://developer.monday.com/api-reference/docs/authentication",
    mapping: {
      project: { id: "board", name: "Board", isPremium: false },
      task: { id: "item", name: "Item", isPremium: false },
      customField: { id: "column", name: "Column", isPremium: true },
      attachment: { id: "file", name: "File", isPremium: true },
      comment: { id: "update", name: "Update", isPremium: true },
      subtask: { id: "subitem", name: "Subitem", isPremium: true },
      section: { id: "group", name: "Group", isPremium: true }
    }
  },
  wrike: {
    id: "wrike",
    name: "Wrike",
    icon: "https://res.cloudinary.com/dergt2trh/image/upload/v1725129825/wrike-logo-8C98A8EDEF-seeklogo.com__v4x53v.png",
    isReady: true,
    accessTokenDocumentation: "https://developers.wrike.com/oauth-20-authorization/",
    mapping: {
      project: { id: "folder", name: "Folder", isPremium: false },
      task: { id: "task", name: "Task", isPremium: false },
      customField: { id: "custom_field", name: "Custom Field", isPremium: true },
      attachment: { id: "attachment", name: "Attachment", isPremium: true },
      comment: { id: "comment", name: "Comment", isPremium: true },
      subtask: { id: "subtask", name: "Subtask", isPremium: true },
      section: { id: "section", name: "Section", isPremium: true }
    }
  },
  smartsheet: {
    id: "smartsheet",
    name: "Smartsheet",
    icon: "https://res.cloudinary.com/dergt2trh/image/upload/v1734803929/smartsheet_oisdx3.jpg",
    isReady: true,
    accessTokenDocumentation: "https://help.smartsheet.com/articles/2482389-generate-API-key",
    mapping: {
      project: { id: "sheet", name: "Sheet", isPremium: false },
      task: { id: "row", name: "Row", isPremium: false },
      customField: { id: "column", name: "Column", isPremium: true },
      attachment: { id: "attachment", name: "Attachment", isPremium: true },
      comment: { id: "comment", name: "Comment", isPremium: true },
      subtask: null as unknown,
      section: { id: "section", name: "Section", isPremium: true }
    }
  },
  airtable: {
    id: "airtable",
    name: "Airtable",
    icon: "https://res.cloudinary.com/dergt2trh/image/upload/v1734836885/airtable-logo-216B9AF035-seeklogo.com_rr5nko.png",
    isReady: true,
    accessTokenDocumentation: "https://support.airtable.com/docs/creating-personal-access-tokens",
    mapping: {
      project: { id: "base", name: "Base", isPremium: false },
      task: { id: "record", name: "Record", isPremium: false },
      customField: { id: "field", name: "Field", isPremium: true },
      attachment: { id: "attachment", name: "Attachment", isPremium: true },
      comment: { id: "comment", name: "Comment", isPremium: true },
      subtask: null as unknown,
      section: { id: "view", name: "View", isPremium: true }
    }
  },
  clickup: {
    id: "clickup",
    name: "ClickUp",
    icon: "https://res.cloudinary.com/dergt2trh/image/upload/v1734803929/clickup_qts4g3.jpg",
    isReady: false,
    accessTokenDocumentation: "https://developer.clickup.com/docs/authentication",
    mapping: {
      project: { id: "space", name: "Space", isPremium: false },
      task: { id: "task", name: "Task", isPremium: false },
      customField: { id: "custom_field", name: "Custom Field", isPremium: true },
      attachment: { id: "attachment", name: "Attachment", isPremium: true },
      comment: { id: "comment", name: "Comment", isPremium: true },
      subtask: { id: "subtask", name: "Subtask", isPremium: true },
      section: { id: "list", name: "List", isPremium: true }
    }
  },
  jira: {
    id: "jira",
    name: "Jira",
    icon: "https://res.cloudinary.com/dergt2trh/image/upload/v1734803929/jira_gfbqzk.svg",
    isReady: false,
    accessTokenDocumentation: "https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/",
    mapping: {
      project: { id: "project", name: "Project", isPremium: false },
      task: { id: "issue", name: "Issue", isPremium: false },
      customField: { id: "custom_field", name: "Custom Field", isPremium: true },
      attachment: { id: "attachment", name: "Attachment", isPremium: true },
      comment: { id: "comment", name: "Comment", isPremium: true },
      subtask: { id: "subtask", name: "Subtask", isPremium: true },
      section: { id: "board", name: "Board", isPremium: true }
    }
  },
  teamwork: {
    id: "teamwork",
    name: "Teamwork",
    icon: "https://res.cloudinary.com/dergt2trh/image/upload/v1734803929/teamwork_im4ubh.png",
    isReady: false,
    accessTokenDocumentation: "https://support.teamwork.com/projects/using-teamwork/locating-your-api-key",
    mapping: {
      project: { id: "project", name: "Project", isPremium: false },
      task: { id: "task", name: "Task", isPremium: false },
      customField: { id: "custom_field", name: "Custom Field", isPremium: true },
      attachment: { id: "attachment", name: "Attachment", isPremium: true },
      comment: { id: "comment", name: "Comment", isPremium: true },
      subtask: { id: "subtask", name: "Subtask", isPremium: true },
      section: { id: "task_list", name: "Task List", isPremium: true }
    }
  }
};

// Get source platforms (all except Asana)
const sourcePlatforms = Object.values(platforms).filter(p => p.id !== 'asana');
const targetPlatform = platforms.asana;

export default function WorkflowsPage() {
  const router = useRouter();

  const handleStartMigration = (sourceId: string) => {
    router.push(`/migration?source=${sourceId}&target=asana`);
  };

  const getMappingComparison = (source: typeof platforms[keyof typeof platforms]) => {
    const entities = ['project', 'task', 'customField', 'attachment', 'comment', 'subtask', 'section'];
    const mappedEntities = entities.map(entity => {
      const sourceMapping = source.mapping[entity as keyof typeof source.mapping];
      const targetMapping = targetPlatform.mapping[entity as keyof typeof targetPlatform.mapping];
      
      if (!sourceMapping || !targetMapping) return null;
      
      return {
        entity,
        sourceName: (sourceMapping as { name: string }).name,
        targetName: (targetMapping as { name: string }).name,
        isPremium: (sourceMapping as { isPremium: boolean }).isPremium || (targetMapping as { isPremium: boolean }).isPremium
      };
    }).filter(Boolean);

    return mappedEntities;
  };

  return (
    <div className="space-y-6">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src={targetPlatform.icon} 
                  alt={targetPlatform.name}
                  className="w-12 h-12 object-contain"
                />
                {/* Target indicator */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-2.5 h-2.5 text-white" />
                </div>
                {/* Arrow pointing to Asana */}
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                  <ArrowRight className="w-1.5 h-1.5 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl">Migration Workflows</CardTitle>
                <CardDescription>
                  Choose a platform to migrate your projects and tasks to <span className="font-semibold text-blue-600 dark:text-blue-400">{targetPlatform.name}</span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>


        {/* Workflow Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sourcePlatforms.map((source) => {
            const mappings = getMappingComparison(source);
            const freeFeatures = mappings.filter(m => !m?.isPremium).length;
            const premiumFeatures = mappings.filter(m => m?.isPremium).length;

            return (
              <Card 
                key={source.id}
                className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
                  !source.isReady ? 'opacity-60' : 'hover:scale-[1.02]'
                }`}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {source.isReady ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      Coming Soon
                    </Badge>
                  )}
                </div>

                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img 
                        src={source.icon} 
                        alt={source.name}
                        className="w-16 h-16 object-contain rounded-lg bg-white p-2 shadow-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{source.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        Migrate to Asana
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Migration Flow Visual with platform logos */}
                  <div className="flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <img 
                        src={source.icon} 
                        alt={source.name}
                        className="w-6 h-6 object-contain"
                      />
                      <span className="text-sm font-medium">{source.name}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <div className="flex items-center gap-2">
                      <img 
                        src={targetPlatform.icon} 
                        alt={targetPlatform.name}
                        className="w-6 h-6 object-contain"
                      />
                      <span className="text-sm font-medium">{targetPlatform.name}</span>
                    </div>
                  </div>

                  {/* Entity Mappings with visual flow */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Data Mapping
                    </p>
                    <div className="space-y-2">
                      {mappings.slice(0, 3).map((mapping) => mapping && (
                        <div key={mapping.entity} className="flex items-center justify-between text-xs py-2 px-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <span className="text-muted-foreground font-medium">
                            {mapping.sourceName}
                          </span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <span className="font-medium">
                            {mapping.targetName}
                          </span>
                          {mapping.isPremium && (
                            <Sparkles className="w-3 h-3 text-orange-500 ml-1" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feature Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span>{freeFeatures} Free features</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-orange-600" />
                      <span>{premiumFeatures} Premium features</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full"
                    onClick={() => handleStartMigration(source.id)}
                    disabled={!source.isReady}
                  >
                    {source.isReady ? (
                      <>
                        Start Migration
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      'Coming Soon'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-8 p-6 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-2">About Migrations</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• All migrations are securely processed and your data remains private</li>
            <li>• Free features include basic project and task migration</li>
            <li>• Premium features include custom fields, attachments, comments, and more</li>
            <li>• Migration time depends on the amount of data being transferred</li>
          </ul>
        </div>
      </div>
  );
}
