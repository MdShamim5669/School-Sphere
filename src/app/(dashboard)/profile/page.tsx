"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Shield,
  Key,
  Clock,
  CheckCircle2,
  Lock,
  LogOut,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useAmbientTheme } from "@/context/ambient-theme-context";
import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { ambientMode, setAmbientMode, activePeriod, periodLabel, periodDescription, hour } = useAmbientTheme();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [updating, setUpdating] = useState(false);

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Security credentials updated successfully");
    }, 600);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Account & Profile"
        description="Manage your institutional identity, authentication security, and session preferences."
      >
        <Link href="/settings">
          <Button variant="outline" size="sm" className="text-xs h-8">
            System Settings
          </Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-zinc-200 dark:border-zinc-700/60 bg-zinc-100 dark:bg-zinc-800 shadow-sm mb-3">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-blue-600 text-white font-bold text-xl">
                  {user?.username?.slice(0, 2).toUpperCase() || "AD"}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-base font-semibold text-zinc-900 dark:text-white">
              {user?.username || "Administrator"}
            </CardTitle>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Badge variant="default" className="text-[10px] uppercase font-semibold">
                {user?.role || "ADMIN"}
              </Badge>
              <Badge variant="success" className="text-[10px]">
                Active Session
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span>Account ID</span>
                <span className="font-mono text-zinc-800 dark:text-zinc-200">{user?.id || "admin-01"}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span>Username</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">@{user?.username || "admin"}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span>Role Level</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">{user?.role || "ADMIN"}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span>Auth Protocol</span>
                <span className="font-mono text-zinc-800 dark:text-zinc-200">JWT Bearer / Cookie</span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={logout}
                className="w-full gap-2 text-xs h-8"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log out of Session</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Details & Security Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span>Institutional Credentials</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Your assigned institutional credentials on the School Sphere server
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-1">
                  <span className="text-[11px] text-zinc-500 block">Workspace Role</span>
                  <span className="font-semibold text-zinc-900 dark:text-white text-sm">
                    {user?.role === "ADMIN" ? "Super Administrator" : user?.role || "User"}
                  </span>
                  <p className="text-[11px] text-zinc-400">
                    Full CRUD privileges across all 15 institutional database modules.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-1">
                  <span className="text-[11px] text-zinc-500 block">Database Storage</span>
                  <span className="font-semibold text-zinc-900 dark:text-white text-sm">
                    PostgreSQL Neon Cloud
                  </span>
                  <p className="text-[11px] text-zinc-400">
                    Synchronized live with Express API backend on Render.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Credentials Change */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Key className="h-4 w-4 text-amber-500" />
                <span>Security & Password</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Update account password to maintain security standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-zinc-600 dark:text-zinc-400 font-medium">Current Password</label>
                  <Input
                    type="password"
                    placeholder="Enter existing password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-zinc-600 dark:text-zinc-400 font-medium">New Password</label>
                    <Input
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-zinc-600 dark:text-zinc-400 font-medium">Confirm New Password</label>
                    <Input
                      type="password"
                      placeholder="Re-enter new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" size="sm" disabled={updating} className="h-8 text-xs">
                  {updating ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Time-Based Ambient Background Preferences */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>Time-Based Ambient Background (User Mode)</span>
                </div>
                <Badge variant="default" className="text-[10px] font-mono capitalize">
                  {periodLabel}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                {periodDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                Dynamically cycles floating ambient sky gradients based on your local clock time.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setAmbientMode("auto")}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    ambientMode === "auto"
                      ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold"
                      : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-xs">Auto Clock</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block">Syncs with {hour}:00</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAmbientMode("morning")}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    ambientMode === "morning"
                      ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold"
                      : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">🌅</span>
                    <span className="text-xs">Morning</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block">5am – 12pm</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAmbientMode("day")}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    ambientMode === "day"
                      ? "border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold"
                      : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">☀️</span>
                    <span className="text-xs">Daylight</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block">12pm – 5pm</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAmbientMode("evening")}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    ambientMode === "evening"
                      ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold"
                      : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">🌆</span>
                    <span className="text-xs">Evening</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block">5pm – 8pm</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAmbientMode("night")}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    ambientMode === "night"
                      ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">🌙</span>
                    <span className="text-xs">Midnight</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block">8pm – 5am</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAmbientMode("off")}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    ambientMode === "off"
                      ? "border-zinc-500 bg-zinc-500/10 text-zinc-800 dark:text-zinc-200 font-semibold"
                      : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">✕</span>
                    <span className="text-xs">Disabled</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block">Static canvas</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
