"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Key,
  Database,
  Activity,
  Menu,
  X,
  Bell,
  User,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "API Management", href: "/dashboard/api", icon: Key },
  {
    name: "OSINT Intelligence",
    href: "/dashboard/admin/osint",
    icon: Database,
  },
  { name: "Forensic Logs", href: "/dashboard/logs", icon: Activity },
  { name: "Global Map", href: "/map", icon: Shield },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="bg-primary/20 p-1 rounded-lg border border-primary/30 group-hover:border-primary/60 transition-colors w-10 h-10 flex items-center justify-center">
                <Image
                  src="/logo-icon.png"
                  alt="ScamSentry"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
              </div>
              <span className="font-bold text-lg tracking-tight text-foreground">
                Scam<span className="text-primary">Sentry</span>
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-muted/30 hover:text-foreground border border-transparent",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-primary transition-colors",
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-muted/30 border border-border">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-primary">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-medium text-foreground truncate">
                  Developer Account
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  Enterprise v2.0
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-foreground"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-sm font-semibold text-muted-foreground tracking-wide">
              Intelligence Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-card"></span>
            </button>
            <div className="h-4 w-px bg-border mx-1"></div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-medium text-muted-foreground">
                Engine Live
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
