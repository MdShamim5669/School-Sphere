"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Shield,
  Server,
  Database,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import api, { getErrorMessage } from "@/lib/api";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useAuth();
  const [serverHealth, setServerHealth] = useState<{
    online: boolean;
    latency: number;
    message?: string;
  } | null>(null);
  const [checking, setChecking] = useState(false);

  // New admin state
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({ username: "", password: "" });
  const [adminLoading, setAdminLoading] = useState(false);

  const testHealth = async () => {
    setChecking(true);
    const start = Date.now();
    try {
      const res = await api.get("/");
      const latency = Date.now() - start;
      setServerHealth({
        online: true,
        latency,
        message: res.data?.message || "Running smoothly",
      });
    } catch {
      setServerHealth({
        online: false,
        latency: 0,
        message: "Failed to connect to backend server",
      });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    testHealth();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    try {
      await api.post("/admins", adminForm);
      toast.success(`Admin @${adminForm.username} created successfully!`);
      setIsAddAdminOpen(false);
      setAdminForm({ username: "", password: "" });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & System Diagnostics"
        description="Monitor system environment, backend connectivity, and manage administrative credentials."
      >
        <Button
          onClick={() => setIsAddAdminOpen(true)}
          variant="gradient"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Admin Account</span>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Admin Identity Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-400" />
              <CardTitle>Current Session</CardTitle>
            </div>
            <CardDescription>Authenticated credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-500">Username</span>
                <span className="font-mono text-gray-200 font-bold">
                  {user?.username || "admin"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-500">Authorized Role</span>
                <Badge variant="indigo">{user?.role || "ADMIN"}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-500">Security Standard</span>
                <span className="text-zinc-700 dark:text-zinc-300">JWT Bearer + HTTP-Only Cookie</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backend Connectivity Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-emerald-400" />
                <CardTitle>API Diagnostics</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={testHealth}
                disabled={checking}
                className="h-8 gap-1 text-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${checking ? "animate-spin" : ""}`} />
                <span>Test Ping</span>
              </Button>
            </div>
            <CardDescription>Real-time backend endpoint communication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-500">Backend Status</span>
                {serverHealth?.online ? (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Operational ({serverHealth.latency}ms)
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Offline
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-500">Target URL</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                  {process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-500">Database Engine</span>
                <span className="text-gray-300 flex items-center gap-1">
                  <Database className="h-3.5 w-3.5 text-indigo-400" />
                  PostgreSQL Neon
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backend API Endpoints Catalog */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mounted API Service Endpoints</CardTitle>
          <CardDescription>
            Express RESTful micro-routes integrated into this administrative dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
            {[
              "/auth",
              "/admins",
              "/teachers",
              "/students",
              "/parents",
              "/classes",
              "/grades",
              "/subjects",
              "/lessons",
              "/exams",
              "/assignments",
              "/results",
              "/attendances",
              "/events",
              "/announcements",
            ].map((route) => (
              <div
                key={route}
                className="p-2 rounded-lg border border-white/5 bg-white/[0.01] font-mono text-indigo-400"
              >
                {route}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Admin Account Modal */}
      <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Auxiliary Admin Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAdmin} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Username</label>
              <Input
                required
                value={adminForm.username}
                onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                placeholder="e.g. admin_sarah"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Password (min 6 chars)</label>
              <Input
                required
                type="password"
                value={adminForm.password}
                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                placeholder="••••••••••••"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddAdminOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={adminLoading}>
                {adminLoading ? "Creating..." : "Create Admin"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
