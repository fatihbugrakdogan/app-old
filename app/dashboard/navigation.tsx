"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRightLeft } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();

  const pages = [
    //{ href: "/dashboard", label: "Dashboard", icon: Home },
    //{ href: "/templates", label: "Templates", icon: FileText },
    //{ href: "#", label: "Workflows", icon: GitBranch },
    { href: "/dashboard/migrations", label: "Migration", icon: ArrowRightLeft },
  ];

  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {pages.map((page) => {
        const Icon = page.icon;
        const isActive = pathname === page.href;
        return (
          <Link
            key={page.href}
            href={page.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
              isActive
                ? "bg-muted text-primary"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            <Icon className="h-4 w-4" />
            {page.label}
          </Link>
        );
      })}
    </nav>
  );
}
