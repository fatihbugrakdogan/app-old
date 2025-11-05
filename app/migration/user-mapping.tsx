"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAPI } from "@/hooks/use-api";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { AlertCircle, ArrowRight, Check, CheckCircle2, ChevronLeft, ChevronRight, Download, RefreshCw, Upload, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FC } from "react";
import {
    sourceAccessTokenAtom,
    sourceProviderAtom,
    sourceWorkspaceAtom,
    targetAccessTokenAtom,
    targetProviderAtom,
    targetWorkspaceAtom,
    userMappingRuleAtom,
    userMappingsAtom
} from "./atom";
import { StepFooter } from "./components/step-footer";

// --- TYPES ---
type Rule = "same" | "different" | "custom";

type UserRow = {
  id: string;
  sourceEmail: string;
  targetEmail: string;
  existsInTarget: boolean;
  isMigrating: boolean;
};

type DomainMapping = {
  source: string;
  target: string;
  isSaved: boolean;
};

type CsvMappingData = {
  source_email: string;
  target_email: string;
  "exists in target": string;
  migrating: string;
};

type ApiResponse = {
  csv_data: CsvMappingData[];
};

// --- SUB-COMPONENTS ---

const RuleSelector: FC<{ selectedRule: Rule | null; onRuleChange: (rule: Rule) => void; }> = ({ selectedRule, onRuleChange }) => {
  const rules = [
    { id: 'same', label: 'Same Domain' },
    { id: 'different', label: 'Different Domain' },
    { id: 'custom', label: 'Custom Mapping' },
  ];

  return (
    <div role="radiogroup" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {rules.map((rule) => {
        const isSelected = selectedRule === rule.id;
        return (
          <div
            key={rule.id}
            role="radio"
            aria-checked={isSelected}
            onClick={() => onRuleChange(rule.id as Rule)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onRuleChange(rule.id as Rule)}
            tabIndex={0}
            className={cn(
              "flex items-center space-x-3 rounded-lg border bg-white p-3 cursor-pointer transition-all",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
              isSelected ? "border-slate-900 shadow-sm" : "border-gray-200 text-gray-600"
            )}
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full border">
              {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-slate-900" />}
            </div>
            <span className="font-medium text-sm">{rule.label}</span>
          </div>
        );
      })}
    </div>
  );
};

const MappingTable: FC<{ users: UserRow[]; isLoading: boolean; onUserToggle: (id: string) => void; emptyMessage?: string }> = ({ users, isLoading, onUserToggle, emptyMessage }) => {
  if (isLoading) {
    return (
      <div className="space-y-2 mt-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-2">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-8 w-1/6" />
            <Skeleton className="h-8 w-1/6" />
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8 border-2 border-dashed rounded-lg mt-4">
        <p>{emptyMessage || "No users to display."}</p>
        <p className="text-sm">Perform a search or upload a file to begin.</p>
      </div>
    )
  }

  return (
    <div className="border rounded-md mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Source Email</TableHead>
            <TableHead>Target Email</TableHead>
            <TableHead className="text-center">Existing User</TableHead>
            <TableHead className="text-center">Migrate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.sourceEmail}</TableCell>
              <TableCell>{user.targetEmail}</TableCell>
              <TableCell className="text-center">
                {user.existsInTarget ? <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /> : <XCircle className="w-5 h-5 text-red-500 mx-auto" />}
              </TableCell>
              <TableCell className="text-center">
                <Checkbox
                  checked={user.isMigrating}
                  onCheckedChange={() => onUserToggle(user.id)}
                  aria-label={`Toggle migration for ${user.sourceEmail}`}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const CsvHelpers: FC<{ onUpload: (file: File) => void; isUploading: boolean; error: string | null; onDownloadTemplate: () => void; canDownload: boolean }> = ({ onUpload, isUploading, error, onDownloadTemplate, canDownload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex gap-4">
        <Button variant="outline" onClick={onDownloadTemplate} disabled={!canDownload}>
          <Download className="mr-2 h-4 w-4" /> Download Template
        </Button>
        <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
          {isUploading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          Upload Mapping
        </Button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv" />
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Upload Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

const PaginationControls: FC<{
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

// --- MAIN COMPONENT ---
export default function UserMappingStep({
  onNext,
  onPrev,
}: {
  onNext: () => void;
  onPrev: () => void;
}) {
  const [sourceProvider] = useAtom(sourceProviderAtom);
  const [targetProvider] = useAtom(targetProviderAtom);
  const [{ accessToken: sourceAccessToken }] = useAtom(sourceAccessTokenAtom);
  const [{ accessToken: targetAccessToken }] = useAtom(targetAccessTokenAtom);
  const [{ id: sourceWorkspaceId }] = useAtom(sourceWorkspaceAtom);
  const [{ id: targetWorkspaceId }] = useAtom(targetWorkspaceAtom);
  const [userMappingRule, setUserMappingRule] = useAtom(userMappingRuleAtom);
  const [, setUserMappings] = useAtom(userMappingsAtom);

  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [domainMapping, setDomainMapping] = useState<DomainMapping>({ source: '', target: '', isSaved: false });
  const [csvError, setCsvError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ITEMS_PER_PAGE = 10;

  // Map Jotai userMappingRule to local rule state
  const rule: Rule | null = useMemo(() => {
    if (!userMappingRule.type) return null;
    if (userMappingRule.type === 'domain_same') return 'same';
    if (userMappingRule.type === 'domain_changed') {
      // Check if it's custom mapping using the isCustom flag
      if (userMappingRule.isCustom) {
        return 'custom';
      }
      return 'different';
    }
    return null;
  }, [userMappingRule.type, userMappingRule.isCustom]);

  // Sync domain mapping with Jotai atom
  useEffect(() => {
    if (userMappingRule.source_domain && userMappingRule.target_domain) {
      setDomainMapping({
        source: userMappingRule.source_domain,
        target: userMappingRule.target_domain,
        isSaved: true
      });
    }
  }, [userMappingRule.source_domain, userMappingRule.target_domain]);

  const { callAPI } = useAPI();

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    return users.filter(user => 
      user.sourceEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.targetEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredUsers.length]);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('userMappingState');
    if (savedState) {
      const { users, consentChecked, domainMapping } = JSON.parse(savedState);
      setUsers(users);
      setConsentChecked(consentChecked);
      setDomainMapping(domainMapping);
    }
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    if (rule) { // Only save if a rule has been selected
      const stateToSave = JSON.stringify({ rule, users, consentChecked, domainMapping });
      localStorage.setItem('userMappingState', stateToSave);
    }
  }, [rule, users, consentChecked, domainMapping]);

  // Sync users with userMappings atom
  useEffect(() => {
    if (users.length > 0) {
      const mappings = users.map(user => ({
        source_email: user.sourceEmail,
        target_email: user.targetEmail,
        "exists in target": user.existsInTarget ? "yes" : "no",
        migrating: user.isMigrating ? "yes" : "no"
      }));
      setUserMappings(mappings);
    } else {
      setUserMappings([]);
    }
  }, [users, setUserMappings]);

  const handleRuleChange = (newRule: Rule) => {
    // Update Jotai atom based on rule type
    if (newRule === 'same') {
      setUserMappingRule({
        type: 'domain_same',
        source_domain: '',
        target_domain: '',
        isCustom: false
      });
    } else if (newRule === 'different') {
      setUserMappingRule({
        type: 'domain_changed',
        source_domain: '',
        target_domain: '',
        isCustom: false
      });
      // Reset domain mapping for different domain rule
      setDomainMapping({ source: '', target: '', isSaved: false });
    } else if (newRule === 'custom') {
      setUserMappingRule({
        type: 'domain_changed', // Use domain_changed for custom mapping
        source_domain: '',
        target_domain: '',
        isCustom: true
      });
    }
    
    setUsers([]);
    setConsentChecked(false);
    setCsvError(null);
    setSearchQuery('');
  };

  const handleSearch = useCallback(async () => {
    if (!rule) return;
    setIsLoading(true);
    
    try {
      const ruleConfig = {
        type: rule === 'same' ? 'domain_same' : 'domain_changed',
        ...(rule === 'different' && {
          source_domain: domainMapping.source,
          target_domain: domainMapping.target,
        }),
      };

      const response = await callAPI<ApiResponse>("/migration-user-mapping-csv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          source_token: sourceAccessToken,
          source_provider: sourceProvider.id,
          source_workspace_id: sourceWorkspaceId,
          target_token: targetAccessToken,
          target_provider: targetProvider,
          target_workspace_id: targetWorkspaceId,
          rule: ruleConfig,
        },
        requiresAuth: true,
      });

      if (response && response.csv_data) {
        const convertedUsers = response.csv_data.map((mapping: CsvMappingData, index: number) => ({
          id: index.toString(),
          sourceEmail: mapping.source_email,
          targetEmail: mapping.target_email,
          existsInTarget: mapping["exists in target"] === "yes" || mapping["exists in target"] === "Yes",
          isMigrating: mapping.migrating === "yes" || mapping.migrating === "Yes",
        }));
        setUsers(convertedUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setCsvError("Failed to fetch users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [rule, domainMapping, callAPI, sourceAccessToken, sourceProvider.id, sourceWorkspaceId, targetAccessToken, targetProvider, targetWorkspaceId]);

  // Automatically fetch users when 'Same Domain' or 'Different Domain' (with both domains) is selected
  useEffect(() => {
    if (rule === 'same' || (rule === 'different' && domainMapping.source && domainMapping.target && domainMapping.isSaved)) {
      handleSearch();
    }
  }, [rule, domainMapping.source, domainMapping.target, domainMapping.isSaved, handleSearch]);

  const handleDomainSave = async () => {
    setIsSaving(true);
    await new Promise(res => setTimeout(res, 1000)); // Simulate save
    
    // Update both local state and Jotai atom
    setDomainMapping(prev => ({ ...prev, isSaved: true }));
    setUserMappingRule({
      type: 'domain_changed',
      source_domain: domainMapping.source,
      target_domain: domainMapping.target,
      isCustom: false
    });
    
    setIsSaving(false);
  };

  const handleCsvUpload = async (file: File) => {
    setIsLoading(true);
    setCsvError(null);
    
    try {
      const text = await file.text();
      const lines = text.split("\n");
      const headers = lines[0].split(",").map(h => h.replace(/"/g, "").trim());
      
      const expectedColumns = ["source_email", "target_email", "exists in target", "migrating"];
      if (!expectedColumns.every(col => headers.includes(col))) {
        setCsvError("CSV format is incorrect. Please download the template and try again.");
        setUsers([]);
        return;
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

      const response = await callAPI<ApiResponse>("/migration-user-mapping-csv-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          csv_data: csvData,
          columns: expectedColumns
        },
        requiresAuth: true,
      });

      if (response && response.csv_data) {
        const convertedUsers = response.csv_data.map((mapping: CsvMappingData, index: number) => ({
          id: index.toString(),
          sourceEmail: mapping.source_email,
          targetEmail: mapping.target_email,
          existsInTarget: mapping["exists in target"] === "yes" || mapping["exists in target"] === "Yes",
          isMigrating: mapping.migrating === "yes" || mapping.migrating === "Yes",
        }));
        setUsers(convertedUsers);
      }
    } catch (error) {
      console.error("Error uploading CSV:", error);
      setCsvError("Error processing CSV file. Please check the format and try again.");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserToggle = (id: string) => {
    setUsers(currentUsers =>
      currentUsers.map(user =>
        user.id === id ? { ...user, isMigrating: !user.isMigrating } : user
      )
    );
  };

  const handleGenericCsvUpload = (file: File) => {
    if (rule !== 'custom') {
      setUserMappingRule({
        type: 'domain_changed',
        source_domain: '',
        target_domain: '',
        isCustom: true
      });
    }
    handleCsvUpload(file);
  };

  const downloadTemplate = () => {
    // Create CSV content based on current users data
    const headers = '"source_email","target_email","exists in target","migrating"';
    const rows = users.map(user => 
      `"${user.sourceEmail}","${user.targetEmail}","${user.existsInTarget ? 'yes' : 'no'}","${user.isMigrating ? 'yes' : 'no'}"`
    ).join('\n');
    
    const content = headers + '\n' + rows;
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_mapping_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleGenericCsvUpload(e.target.files[0]);
    }
  };

  const migratingUserCount = useMemo(() => users.filter(u => u.isMigrating).length, [users]);

  const isNextDisabled = useMemo(() => {
    if (!rule) return true;
    if (users.length > 0 && (!consentChecked || migratingUserCount === 0)) return true;
    if (rule === 'different' && (!domainMapping.isSaved)) return true;
    if (rule === 'custom' && (users.length === 0 || csvError)) return true;
    return false;
  }, [rule, consentChecked, migratingUserCount, domainMapping.isSaved, users.length, csvError]);

  return (
    <>
      <CardHeader>
        <CardTitle>User Mapping</CardTitle>
        <CardDescription>
          Configure how users from your source workspace will be mapped to your target workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="font-semibold text-foreground">Email Domain Rule</p>
          <RuleSelector selectedRule={rule} onRuleChange={handleRuleChange} />
        </div>

        {rule && (
          <div className="pt-6 border-t animate-in fade-in-50 duration-500 space-y-4">
            {rule === 'same' && (
              <div className="space-y-2">
                <p className="font-semibold text-foreground">Mapping</p>
                {users.length > 0 && !isLoading ? (
                  <>
                    <div className="mt-2 space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <Input
                          placeholder="Search by source or target email..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="max-w-sm"
                        />
                        <div className="flex gap-4">
                          <Button variant="outline" onClick={downloadTemplate} disabled={users.length === 0}>
                            <Download className="mr-2 h-4 w-4" /> Download Template
                          </Button>
                          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                            {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                            Upload Mapping
                          </Button>
                          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv" />
                        </div>
                      </div>
                    </div>
                    <MappingTable users={paginatedUsers} isLoading={isLoading} onUserToggle={handleUserToggle} />
                    {totalPages > 1 && <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
                  </>
                ) : (
                   <MappingTable users={[]} isLoading={isLoading} onUserToggle={handleUserToggle} emptyMessage="No users found. Please check your search criteria or try a different query." />
                )}
              </div>
            )}

            {rule === 'different' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="font-semibold text-foreground">Domain</p>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={domainMapping.source} 
                      onChange={(e) => setDomainMapping({...domainMapping, source: e.target.value, isSaved: false})}
                      className="w-48"
                      placeholder="Enter source domain"
                      disabled={domainMapping.isSaved}
                    />
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                    <Input 
                      value={domainMapping.target} 
                      onChange={(e) => setDomainMapping({...domainMapping, target: e.target.value, isSaved: false})}
                      className="w-48"
                      placeholder="Enter target domain"
                      disabled={domainMapping.isSaved}
                    />
                    {!domainMapping.isSaved ? (
                      <Button 
                        onClick={handleDomainSave} 
                        disabled={!domainMapping.source || !domainMapping.target || isSaving} 
                        className="active:scale-95 transition-transform"
                      >
                        {isSaving && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-green-600 border-green-500 bg-green-50 px-3 py-2">
                        <Check className="mr-2 h-4 w-4" /> Saved
                      </Badge>
                    )}
                  </div>
                </div>
                {domainMapping.isSaved && (
                  <div className="animate-in fade-in-50 duration-500 space-y-2">
                    <p className="font-semibold text-foreground">Mapping</p>
                    {users.length > 0 && !isLoading ? (
                      <>
                        <div className="mt-2 space-y-4">
                          <div className="flex justify-between items-center gap-4">
                            <Input
                              placeholder="Search by source or target email..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="max-w-sm"
                            />
                            <CsvHelpers onUpload={handleGenericCsvUpload} isUploading={isLoading} error={csvError} onDownloadTemplate={downloadTemplate} canDownload={users.length > 0} />
                          </div>
                        </div>
                        <MappingTable users={paginatedUsers} isLoading={isLoading} onUserToggle={handleUserToggle} />
                        {totalPages > 1 && <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
                      </>
                    ) : (
                      <MappingTable users={[]} isLoading={isLoading} onUserToggle={handleUserToggle} emptyMessage="No users found. Please check your search criteria or try a different query." />
                    )}
                  </div>
                )}
              </div>
            )}

            {rule === 'custom' && (
              <div className="space-y-2">
                <p className="font-semibold text-foreground">Mapping</p>
                <CsvHelpers onUpload={handleCsvUpload} isUploading={isLoading} error={csvError} onDownloadTemplate={downloadTemplate} canDownload={users.length > 0} />
                {users.length > 0 && !csvError ? (
                  <>
                    <div className="mt-2 space-y-4">
                       <Input
                        placeholder="Search by source or target email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <MappingTable users={paginatedUsers} isLoading={isLoading} onUserToggle={handleUserToggle} emptyMessage="No users uploaded yet. Please upload a CSV file to begin mapping." />
                    {totalPages > 1 && <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
                  </>
                ) : (
                   <MappingTable users={[]} isLoading={false} onUserToggle={handleUserToggle} emptyMessage="No users uploaded yet. Please upload a CSV file to begin mapping." />
                )}
              </div>
            )}

            {users.length > 0 && !isLoading && (
              <div className="flex items-center space-x-2 pt-6 border-t">
                <Checkbox id="consent" checked={consentChecked} onCheckedChange={(checked) => setConsentChecked(checked as boolean)} />
                <Label htmlFor="consent" className="text-sm text-gray-600 leading-snug">
                  {`I acknowledge that ${migratingUserCount} users will not be created in the target workspace and therefore cannot be assigned as assignees, collaborators, or team members.`}
                </Label>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <StepFooter onNext={onNext} onPrev={onPrev} disableNext={isNextDisabled} />
    </>
  );
}