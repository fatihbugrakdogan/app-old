"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import {
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  FileText,
  GitBranch,
  Home,
  Moon,
  Settings
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Navigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const mainPages = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/migrations", label: "Migrations", icon: ArrowRightLeft },
  ];

  const contentPages = [
    { href: "/dashboard/templates", label: "Templates", icon: FileText },
    { href: "/dashboard/workflows", label: "Workflows", icon: GitBranch },
  ];

  const settingsPages = [
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`flex flex-col h-full ${isCollapsed ? 'w-16' : 'w-full'}`}>
      {/* Collapse Toggle */}
      <div className="flex justify-end p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className="h-8 w-8"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 px-2 text-sm font-medium lg:px-4 space-y-1">
        {/* Main Section */}
        <div className="space-y-1">
          {mainPages.map((page) => {
            const Icon = page.icon;
            const isActive = pathname === page.href;
            return (
              <Link
                key={page.href}
                href={page.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all group ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? page.label : undefined}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span>{page.label}</span>}
              </Link>
            );
          })}
        </div>

        <Separator className="my-4" />

        {/* Content Section */}
        <div className="space-y-1">
          <div className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider ${isCollapsed ? 'hidden' : 'px-3 py-2'}`}>
            Content
          </div>
          {contentPages.map((page) => {
            const Icon = page.icon;
            const isActive = pathname === page.href;
            return (
              <Link
                key={page.href}
                href={page.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all group ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? page.label : undefined}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span>{page.label}</span>}
              </Link>
            );
          })}
        </div>

        <Separator className="my-4" />

        {/* Settings Section */}
        <div className="space-y-1">
          <div className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider ${isCollapsed ? 'hidden' : 'px-3 py-2'}`}>
            Settings
          </div>
          {settingsPages.map((page) => {
            const Icon = page.icon;
            const isActive = pathname === page.href;
            return (
              <Link
                key={page.href}
                href={page.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all group ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? page.label : undefined}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span>{page.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="p-2 border-t">
        <div className={`flex items-center gap-3 p-3 rounded-lg bg-muted/50 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.username || 'User'}</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          )}
          {!isCollapsed && (
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Moon className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
