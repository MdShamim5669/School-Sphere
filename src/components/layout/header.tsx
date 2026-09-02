"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  Shield,
  LayoutGrid,
  Users,
  UserCheck,
  HeartHandshake,
  Globe,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import api from "@/lib/api";

export default function Header() {
  const router = useRouter();
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  useEffect(() => {
    // Health check ping
    const checkServer = async () => {
      try {
        await api.get("/");
        setServerOnline(true);
      } catch {
        setServerOnline(false);
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 bg-white/95 dark:bg-[#0c0c0e]/95 px-6 backdrop-blur-md transition-colors">
      {/* Search Input with Keyboard Badge */}
      <div className="flex items-center gap-3 w-72 md:w-80">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search records, pupils, lessons..."
            className="h-8 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/60 pl-8 pr-12 text-xs text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 px-1.5 py-0.5 text-[9px] font-mono text-zinc-400">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {/* Backend Status Dot */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 text-[11px]">
          {serverOnline === true ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">API Ready</span>
            </>
          ) : serverOnline === false ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span className="text-zinc-500 dark:text-zinc-400">Reconnecting</span>
            </>
          ) : (
            <span className="text-zinc-400 dark:text-zinc-500">Checking...</span>
          )}
        </div>

        {/* Portal Switcher Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer outline-none shadow-sm">
            <LayoutGrid className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
            <span className="hidden sm:inline">Role View</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 bg-white dark:bg-[#121215] border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-lg">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Switch Workspace View
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
            <DropdownMenuItem onClick={() => router.push("/dashboard")} className="cursor-pointer gap-2 text-xs">
              <Shield className="h-4 w-4 text-blue-500" />
              <span>Admin Hub</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/teacher/dashboard")} className="cursor-pointer gap-2 text-xs">
              <UserCheck className="h-4 w-4 text-emerald-500" />
              <span>Teacher Portal</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/student/dashboard")} className="cursor-pointer gap-2 text-xs">
              <Users className="h-4 w-4 text-sky-500" />
              <span>Student Portal</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/parent/dashboard")} className="cursor-pointer gap-2 text-xs">
              <HeartHandshake className="h-4 w-4 text-amber-500" />
              <span>Parent Portal</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
            <DropdownMenuItem onClick={() => router.push("/public")} className="cursor-pointer gap-2 text-xs text-zinc-600 dark:text-zinc-300">
              <Globe className="h-4 w-4 text-zinc-400" />
              <span>Public Campus Page</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle (Light / Dark Mode) */}
        <ThemeToggle />

        {/* Notifications Icon */}
        <button
          className="relative h-8 w-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="h-3.5 w-3.5" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-blue-500" />
        </button>
      </div>
    </header>
  );
}
