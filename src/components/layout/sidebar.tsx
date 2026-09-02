"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  UserCheck,
  HeartHandshake,
  Layers,
  BookOpen,
  Calendar,
  FileSpreadsheet,
  ClipboardList,
  CheckCircle2,
  Megaphone,
  CalendarDays,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Award,
  Globe,
  User,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Portals & Views",
    items: [
      { title: "Teacher Portal", href: "/teacher/dashboard", icon: UserCheck },
      { title: "Student Portal", href: "/student/dashboard", icon: Users },
      { title: "Parent Portal", href: "/parent/dashboard", icon: HeartHandshake },
      { title: "Public Campus", href: "/public", icon: Globe },
    ],
  },
  {
    title: "Community",
    items: [
      { title: "Teachers", href: "/teachers", icon: UserCheck },
      { title: "Students", href: "/students", icon: Users },
      { title: "Parents", href: "/parents", icon: HeartHandshake },
    ],
  },
  {
    title: "Academic Structure",
    items: [
      { title: "Classes", href: "/classes", icon: Layers },
      { title: "Subjects", href: "/subjects", icon: BookOpen },
      { title: "Grades", href: "/grades", icon: Award },
      { title: "Timetable / Lessons", href: "/lessons", icon: Calendar },
    ],
  },
  {
    title: "Assessments",
    items: [
      { title: "Exams", href: "/exams", icon: FileSpreadsheet },
      { title: "Assignments", href: "/assignments", icon: ClipboardList },
      { title: "Results", href: "/results", icon: CheckCircle2 },
    ],
  },
  {
    title: "Administration",
    items: [
      { title: "Attendance", href: "/attendance", icon: ShieldCheck },
      { title: "Events", href: "/events", icon: CalendarDays },
      { title: "Announcements", href: "/announcements", icon: Megaphone },
    ],
  },
  {
    title: "Account & Preferences",
    items: [
      { title: "My Profile", href: "/profile", icon: User },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0e] text-zinc-900 dark:text-zinc-100 transition-all duration-300 select-none z-30 shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 shadow-sm text-blue-600 dark:text-blue-400">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold tracking-tight text-zinc-900 dark:text-white leading-tight">
                School Sphere
              </span>
              <span className="text-[10px] text-zinc-500 font-mono tracking-tight">
                Enterprise v1.0
              </span>
            </div>
          </Link>
        )}

        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 text-blue-600 dark:text-blue-400">
            <GraduationCap className="h-4 w-4" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer",
            collapsed && "absolute -right-3 top-5 z-40 bg-white dark:bg-zinc-900 shadow-md"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Navigation items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <h4 className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {section.title}
              </h4>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150 relative",
                      isActive
                        ? "bg-zinc-100 dark:bg-zinc-800/90 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700/50"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/40 hover:text-zinc-900 dark:hover:text-zinc-200",
                      collapsed && "justify-center px-0 py-2"
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3.5 bg-blue-600 dark:bg-blue-500 rounded-r" />
                    )}
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200"
                      )}
                    />
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Profile & Settings Card */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/80 space-y-2">
        {!collapsed && (
          <div className="flex items-center justify-between p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <Link
              href="/profile"
              className="flex items-center gap-2.5 overflow-hidden hover:opacity-80 transition-opacity"
              title="View My Profile"
            >
              <Avatar className="h-8 w-8 border border-zinc-300 dark:border-zinc-700/60 shrink-0">
                <AvatarFallback className="bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold">
                  {user?.username?.slice(0, 2).toUpperCase() || "AD"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                  {user?.username || "Admin"}
                </span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                  {user?.role || "ADMIN"}
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-1">
              <Link
                href="/settings"
                className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                title="System Settings"
              >
                <Settings className="h-3.5 w-3.5" />
              </Link>
              <button
                onClick={handleLogout}
                className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition-colors cursor-pointer"
                title="Log out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="flex flex-col items-center gap-2">
            <Link href="/profile" title="View Profile">
              <Avatar className="h-8 w-8 border border-zinc-300 dark:border-zinc-700/60 cursor-pointer hover:border-blue-500 transition-colors">
                <AvatarFallback className="bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold">
                  {user?.username?.slice(0, 2).toUpperCase() || "AD"}
                </AvatarFallback>
              </Avatar>
            </Link>
            <Link
              href="/settings"
              className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
              title="Settings"
            >
              <Settings className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* Live Backend Indicator */}
        {!collapsed && (
          <div className="px-2 py-0.5 flex items-center justify-between text-[11px] text-zinc-500">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Backend Connected</span>
            </div>
            <span className="font-mono text-[10px]">Render</span>
          </div>
        )}
      </div>
    </aside>
  );
}
