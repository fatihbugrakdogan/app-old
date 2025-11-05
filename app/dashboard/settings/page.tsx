"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAPI } from "@/hooks/use-api";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { callAPI } = useAPI();
  const [loading, setLoading] = useState({
    profile: false,
    password: false,
    company: false
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Profile settings
  const [profile, setProfile] = useState({
    email: "",
    username: ""
  });
  
  // Password settings
  const [password, setPassword] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });
  
  // Company settings
  const [company, setCompany] = useState({
    company_name: "",
    company_size: "",
    role: ""
  });

  useEffect(() => {
    fetchSettings();
  }, [callAPI]);

  const fetchSettings = async () => {
    try {
      const response = await callAPI<Record<string, unknown>>('/user/settings', {
        method: 'GET',
      });
      
      if (response) {
        setProfile({
          email: (response.email as string) || "",
          username: (response.username as string) || ""
        });
        setCompany({
          company_name: (response.company_name as string) || "",
          company_size: (response.company_size as string) || "",
          role: (response.role as string) || ""
        });
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      setMessage({
        type: 'error',
        text: "Failed to load settings. Please refresh the page."
      });
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(prev => ({ ...prev, profile: true }));
    setMessage(null);
    try {
      const response = await callAPI('/user/settings/profile', {
        method: 'PUT',
        body: profile,
      });

      if (response) {
        setMessage({
          type: 'success',
          text: "Profile updated successfully."
        });
      }
    } catch (error: unknown) {
      setMessage({
        type: 'error',
        text: (error as Error).message || "Failed to update profile. Please try again."
      });
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const handleUpdatePassword = async () => {
    // Validate passwords match
    if (password.new_password !== password.confirm_password) {
      setMessage({
        type: 'error',
        text: "New passwords do not match."
      });
      return;
    }

    // Validate password length
    if (password.new_password.length < 8) {
      setMessage({
        type: 'error',
        text: "Password must be at least 8 characters long."
      });
      return;
    }

    setLoading(prev => ({ ...prev, password: true }));
    setMessage(null);
    try {
      const response = await callAPI('/user/settings/password', {
        method: 'PUT',
        body: {
          current_password: password.current_password,
          new_password: password.new_password
        },
      });

      if (response) {
        setMessage({
          type: 'success',
          text: "Password changed successfully."
        });
        // Clear password fields
        setPassword({
          current_password: "",
          new_password: "",
          confirm_password: ""
        });
      }
    } catch (error: unknown) {
      setMessage({
        type: 'error',
        text: (error as Error).message || "Failed to change password. Please check your current password."
      });
    } finally {
      setLoading(prev => ({ ...prev, password: false }));
    }
  };

  const handleUpdateCompany = async () => {
    setLoading(prev => ({ ...prev, company: true }));
    setMessage(null);
    try {
      const response = await callAPI('/user/settings/company', {
        method: 'PUT',
        body: company,
      });

      if (response) {
        setMessage({
          type: 'success',
          text: "Company information updated successfully."
        });
      }
    } catch (error: unknown) {
      setMessage({
        type: 'error',
        text: (error as Error).message || "Failed to update company information. Please try again."
      });
    } finally {
      setLoading(prev => ({ ...prev, company: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <Separator />

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your email address and username
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={profile.username}
                onChange={(e) =>
                  setProfile({ ...profile, username: e.target.value })
                }
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                placeholder="Enter your email"
              />
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={handleUpdateProfile} 
                disabled={loading.profile}
              >
                {loading.profile ? "Updating..." : "Update Profile"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_password">Current Password</Label>
              <Input
                id="current_password"
                type="password"
                value={password.current_password}
                onChange={(e) =>
                  setPassword({ ...password, current_password: e.target.value })
                }
                placeholder="Enter your current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type="password"
                value={password.new_password}
                onChange={(e) =>
                  setPassword({ ...password, new_password: e.target.value })
                }
                placeholder="Enter new password (min. 8 characters)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm New Password</Label>
              <Input
                id="confirm_password"
                type="password"
                value={password.confirm_password}
                onChange={(e) =>
                  setPassword({ ...password, confirm_password: e.target.value })
                }
                placeholder="Confirm your new password"
              />
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={handleUpdatePassword} 
                disabled={loading.password || !password.current_password || !password.new_password || !password.confirm_password}
              >
                {loading.password ? "Updating..." : "Change Password"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Update your organization details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={company.company_name}
                onChange={(e) =>
                  setCompany({ ...company, company_name: e.target.value })
                }
                placeholder="Enter your company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_size">Company Size</Label>
              <Select 
                value={company.company_size}
                onValueChange={(value) => setCompany({ ...company, company_size: value })}
              >
                <SelectTrigger id="company_size">
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="501-1000">501-1000 employees</SelectItem>
                  <SelectItem value="1000+">1000+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Your Role</Label>
              <Input
                id="role"
                value={company.role}
                onChange={(e) =>
                  setCompany({ ...company, role: e.target.value })
                }
                placeholder="e.g., Project Manager, Developer, CEO"
              />
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={handleUpdateCompany} 
                disabled={loading.company}
              >
                {loading.company ? "Updating..." : "Update Company Info"}
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
