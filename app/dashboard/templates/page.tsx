"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAPI } from "@/hooks/use-api";
import {
  CheckCircle,
  Key,
  Play,
  Plus,
  Settings,
  Trash2,
  Upload,
  Users,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Template types
const TEMPLATE_TYPES = {
  TOKENS: "tokens",
  USER_MAPPING: "user_mapping"
} as const;

type TemplateType = typeof TEMPLATE_TYPES[keyof typeof TEMPLATE_TYPES];

// Template interface
interface Template {
  id: string;
  name: string;
  description: string;
  type: string;
  created_at: string;
  updated_at: string;
}

// Empty templates array - will be populated from API
const mockTemplates: Template[] = [];

export default function TemplatesPage() {
  const router = useRouter();
  const { callAPI } = useAPI();
  const [templates, setTemplates] = useState(mockTemplates);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTemplateType, setSelectedTemplateType] = useState<TemplateType | null>(null);
  
  // Template creation states
  const [templateData, setTemplateData] = useState({
    name: "",
    description: "",
    type: "" as TemplateType,
    
    // For tokens template
    sourcePlatform: "",
    sourceToken: "",
    targetToken: "",
    sourceWorkspace: "",
    targetWorkspace: "",
    
    // For user mapping template
    userMappingFile: null as File | null,
    userMappingData: [] as Record<string, unknown>[],
    
    // For projects template
    selectedProjects: [] as Record<string, unknown>[],
    projectMapping: {} as Record<string, string>
  });

  const [loading, setLoading] = useState({
    tokens: false,
    userMapping: false,
    fetching: false
  });

  // Fetch templates on component mount
  useEffect(() => {
    fetchTemplates();
  }, [callAPI]);

  // API Functions
  const saveTemplate = async (templateData: Template) => {
    setLoading(prev => ({ ...prev, [templateData.type as string]: true }));
    try {
      const response = await callAPI('/api/templates', {
        method: 'POST',
        body: templateData,
        requiresAuth: true
      });
      return response;
    } catch (error) {
      console.error('Failed to save template:', error);
      return { success: false, error: 'Failed to save template' };
    } finally {
      setLoading(prev => ({ ...prev, [templateData.type as string]: false }));
    }
  };

  const fetchTemplates = async () => {
    setLoading(prev => ({ ...prev, fetching: true }));
    try {
      const response = await callAPI('/api/templates', {
        method: 'GET',
        requiresAuth: true
      });
      if (response && (response as Record<string, unknown>).templates) {
        setTemplates((response as Record<string, unknown>).templates as Template[]);
      }
      return response;
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      return { success: false, error: 'Failed to fetch templates' };
    } finally {
      setLoading(prev => ({ ...prev, fetching: false }));
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const response = await callAPI(`/api/templates/${templateId}`, {
        method: 'DELETE',
        requiresAuth: true
      });
      if (response && (response as Record<string, unknown>).success) {
        setTemplates(templates.filter(t => t.id !== templateId));
      }
      return response;
    } catch (error) {
      console.error('Failed to delete template:', error);
      return { success: false, error: 'Failed to delete template' };
    }
  };

  const uploadUserMapping = async (file: File) => {
    setLoading(prev => ({ ...prev, userMapping: true }));
    try {
      // Read and parse CSV file like migration page does
      const text = await file.text();
      const lines = text.split("\n");
      const headers = lines[0].split(",").map(h => h.replace(/"/g, "").trim());
      
      const expectedColumns = ["source_email", "target_email", "exists in target", "migrating"];
      if (!expectedColumns.every(col => headers.includes(col))) {
        throw new Error("CSV format is incorrect. Please download the template and try again.");
      }
      
      const csvData = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(",").map(v => v.replace(/"/g, "").trim());
          return {
            source_email: values[headers.indexOf("source_email")],
            target_email: values[headers.indexOf("target_email")],
            "exists in target": values[headers.indexOf("exists in target")],
            migrating: values[headers.indexOf("migrating")]
          };
        });

      const response = await callAPI('/migration-user-mapping-csv-upload', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          csv_data: csvData,
          columns: expectedColumns
        },
        requiresAuth: true
      });
      
      if (response && (response as Record<string, unknown>).csv_data) {
        const convertedUsers = ((response as Record<string, unknown>).csv_data as Record<string, unknown>[]).map((mapping: Record<string, unknown>, index: number) => ({
          id: index.toString(),
          sourceEmail: mapping.source_email,
          targetEmail: mapping.target_email,
          existsInTarget: mapping["exists in target"] === "yes" || mapping["exists in target"] === "Yes",
          isMigrating: mapping.migrating === "yes" || mapping.migrating === "Yes",
        }));
        setTemplateData(prev => ({ ...prev, userMappingData: convertedUsers }));
      }
      
      return response;
    } catch (error) {
      console.error('Failed to upload user mapping:', error);
      return { success: false, error: 'Failed to upload user mapping' };
    } finally {
      setLoading(prev => ({ ...prev, userMapping: false }));
    }
  };

  const handleUseTemplate = (template: Template) => {
    if (template.type === "migration") {
      router.push(`/migration?template=${template.id}`);
    } else if (template.type === "user_mapping") {
      router.push(`/migration?template=${template.id}&step=user-mapping`);
    } else if (template.type === "tokens") {
      router.push(`/migration?template=${template.id}&step=source`);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      await deleteTemplate(templateId);
    }
  };

  // const _handleCreateTemplate = () => {
  //   if (newTemplate.name && newTemplate.sourcePlatform) {
  //     const template = {
  //       ...newTemplate,
  //       id: Date.now().toString(),
  //       createdAt: new Date().toISOString().split('T')[0],
  //       lastUsed: null,
  //       status: "active"
  //     };
  //     setTemplates([template, ...templates]);
  //     setNewTemplate({
  //       name: "",
  //       description: "",
  //       type: "migration",
  //       sourcePlatform: "",
  //       targetPlatform: "asana"
  //     });
  //     setShowCreateForm(false);
  //   }
  // };

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case "tokens": return <Key className="w-5 h-5" />;
      case "user_mapping": return <Users className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };

  const getTemplateColor = (type: string) => {
    switch (type) {
      case "tokens": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "user_mapping": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Migration Templates</CardTitle>
              <CardDescription>
                Save and reuse your migration configurations, tokens, and user mappings
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      <div className="flex justify-center">
        <Card className="hover:shadow-md transition-shadow cursor-pointer w-full max-w-md" onClick={() => setShowCreateForm(true)}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold">Create Template</h3>
                <p className="text-sm text-muted-foreground">Save current configuration</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Type Selection */}
      {showCreateForm && !selectedTemplateType && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Create Template</CardTitle>
                <CardDescription>Choose the type of template you want to create</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Tokens Template */}
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedTemplateType(TEMPLATE_TYPES.TOKENS)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <Key className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Token Configuration</h3>
                      <p className="text-sm text-muted-foreground">Save API tokens for platforms</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Mapping Template */}
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedTemplateType(TEMPLATE_TYPES.USER_MAPPING)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">User Mapping</h3>
                      <p className="text-sm text-muted-foreground">Save user mapping CSV data</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Creation Forms */}
      {showCreateForm && selectedTemplateType && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Create {selectedTemplateType === 'tokens' ? 'Token' : selectedTemplateType === 'user_mapping' ? 'User Mapping' : 'Project'} Template</CardTitle>
                <CardDescription>Configure your template settings</CardDescription>
              </div>
              <Button variant="outline" onClick={() => {
                setSelectedTemplateType(null);
                setTemplateData({
                  name: "",
                  description: "",
                  type: "" as TemplateType,
                  sourcePlatform: "",
                  sourceToken: "",
                  targetToken: "",
                  sourceWorkspace: "",
                  targetWorkspace: "",
                  userMappingFile: null,
                  userMappingData: [],
                  selectedProjects: [],
                  projectMapping: {}
                });
              }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={templateData.name}
                  onChange={(e) => setTemplateData({...templateData, name: e.target.value})}
                  placeholder="e.g., Monday.com Tokens"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-description">Description</Label>
                <Input
                  id="template-description"
                  type="text"
                  value={templateData.description}
                  onChange={(e) => setTemplateData({...templateData, description: e.target.value})}
                  placeholder="Brief description of this template"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Tokens Template Form */}
            {selectedTemplateType === TEMPLATE_TYPES.TOKENS && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Token Configuration</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="source-platform">Source Platform</Label>
                    <select
                      id="source-platform"
                      value={templateData.sourcePlatform}
                      onChange={(e) => setTemplateData({...templateData, sourcePlatform: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-gray-900"
                    >
                      <option value="">Select platform</option>
                      <option value="monday">Monday.com</option>
                      <option value="wrike">Wrike</option>
                      <option value="smartsheet">Smartsheet</option>
                      <option value="airtable">Airtable</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="source-token">Source Token</Label>
                    <Input
                      id="source-token"
                      type="password"
                      value={templateData.sourceToken}
                      onChange={(e) => setTemplateData({...templateData, sourceToken: e.target.value})}
                      placeholder="Enter source platform token"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target-token">Asana Token</Label>
                    <Input
                      id="target-token"
                      type="password"
                      value={templateData.targetToken}
                      onChange={(e) => setTemplateData({...templateData, targetToken: e.target.value})}
                      placeholder="Enter Asana token"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* User Mapping Template Form */}
            {selectedTemplateType === TEMPLATE_TYPES.USER_MAPPING && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">User Mapping Configuration</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-mapping-file">Upload User Mapping CSV</Label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id="user-mapping-file"
                        accept=".csv"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setTemplateData({...templateData, userMappingFile: file});
                            uploadUserMapping(file);
                          }
                        }}
                        className="hidden"
                      />
                      <label htmlFor="user-mapping-file" className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Click to upload or drag and drop your CSV file
                        </p>
                      </label>
                    </div>
                  </div>
                  {templateData.userMappingFile && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-400">
                        {templateData.userMappingFile.name} uploaded successfully
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}


            {/* Save Button */}
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedTemplateType(null);
                  setTemplateData({
                    name: "",
                    description: "",
                    type: "" as TemplateType,
                    sourcePlatform: "",
                    sourceToken: "",
                    targetToken: "",
                    sourceWorkspace: "",
                    targetWorkspace: "",
                    userMappingFile: null,
                    userMappingData: [],
                    selectedProjects: [],
                    projectMapping: {}
                  });
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={async () => {
                  const template: Template = {
                    id: Date.now().toString(),
                    name: templateData.name as string,
                    description: templateData.description as string,
                    type: selectedTemplateType || 'tokens',
                    created_at: new Date().toISOString().split('T')[0],
                    updated_at: new Date().toISOString().split('T')[0]
                  };
                  const result = await saveTemplate(template);
                    if ((result as Record<string, unknown>).success) {
                    setTemplates([template, ...templates]);
                    setShowCreateForm(false);
                    setSelectedTemplateType(null);
                    setTemplateData({
                      name: "",
                      description: "",
                      type: "" as TemplateType,
                      sourcePlatform: "",
                      sourceToken: "",
                      targetToken: "",
                      sourceWorkspace: "",
                      targetWorkspace: "",
                      userMappingFile: null,
                      userMappingData: [],
                      selectedProjects: [],
                      projectMapping: {}
                    });
                  }
                }}
                disabled={
                  !templateData.name || 
                  !templateData.description ||
                  (selectedTemplateType === TEMPLATE_TYPES.TOKENS && (!templateData.sourcePlatform || !templateData.sourceToken || !templateData.targetToken)) ||
                  (selectedTemplateType === TEMPLATE_TYPES.USER_MAPPING && !templateData.userMappingFile)
                }
              >
                  {loading[selectedTemplateType === 'user_mapping' ? 'userMapping' : 'tokens'] ? "Saving..." : "Save Template"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              {/* Template Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTemplateColor(template.type)}`}>
                    {getTemplateIcon(template.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {template.type.replace('_', ' ')}
                </Badge>
              </div>


              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleUseTemplate(template)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Use
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDeleteTemplate(template.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {templates.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Templates Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first template to save time on future migrations
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
