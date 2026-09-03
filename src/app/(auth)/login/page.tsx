"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Users,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("Password123!");
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<"admin" | "teacher" | "student" | "parent">("admin");
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ username, password }, activeRole);
      toast.success("Successfully authenticated");
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = (role: "admin" | "teacher" | "student" | "parent") => {
    setActiveRole(role);
    if (role === "admin") {
      setUsername("admin");
      setPassword("Password123!");
    } else if (role === "teacher") {
      setUsername("teacher");
      setPassword("Password123!");
    } else if (role === "student") {
      setUsername("student");
      setPassword("Password123!");
    } else if (role === "parent") {
      setUsername("parent");
      setPassword("Password123!");
    }
    toast.info(`${role.charAt(0).toUpperCase() + role.slice(1)} demo credentials selected`);
  };

  const roleIcons = {
    admin: ShieldCheck,
    teacher: UserCheck,
    student: Users,
    parent: HeartHandshake,
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-950 dark:bg-[#09090b] p-4 bg-grid-subtle select-none overflow-hidden font-sans">
      {/* Ambient background glowing light blobs */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#be123c]/20 blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#881337]/20 blur-[128px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#991b2e]/10 blur-[160px] pointer-events-none" />

      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-radial from-transparent via-zinc-950/60 to-zinc-950 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md rounded-2xl border border-white/10 dark:border-zinc-800/80 bg-zinc-900/90 dark:bg-[#111114]/90 p-8 md:p-9 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.1)] z-10"
      >
        {/* Top Accent Gradient Bar */}
        <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#be123c] to-transparent opacity-80" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 3 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#be123c] via-[#991b2e] to-[#70102b] text-white shadow-lg shadow-[#991b2e]/30 ring-4 ring-[#be123c]/10 mb-4 cursor-pointer"
          >
            <GraduationCap className="h-7 w-7" />
          </motion.div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-heading">
            School Sphere Platform
          </h1>
          <p className="mt-1.5 text-xs text-zinc-400 font-normal leading-relaxed">
            Sign in to access your institutional academic workspace
          </p>
        </div>

        {/* Segmented Role Preset Selector */}
        <div className="mt-7 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-[#f43f5e]" />
              <span>Select Role Preset</span>
            </label>
            <span className="text-[10px] text-zinc-500 font-mono">Quick Demo</span>
          </div>

          <div className="grid grid-cols-4 gap-1 p-1 rounded-xl border border-white/10 bg-zinc-950/60 backdrop-blur-md">
            {(["admin", "teacher", "student", "parent"] as const).map((r) => {
              const RoleIcon = roleIcons[r];
              const isActive = activeRole === r;

              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleSelectRole(r)}
                  className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-medium capitalize transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "text-white font-semibold"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeRoleBg"
                      className="absolute inset-0 rounded-lg bg-gradient-to-b from-[#be123c] to-[#991b2e] shadow-md shadow-[#991b2e]/30 border border-rose-400/30"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1">
                    <RoleIcon className={`h-3 w-3 ${isActive ? "text-white" : "text-zinc-400"}`} />
                    <span>{r}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 transition-colors" />
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="pl-10 h-10 bg-zinc-950/70 border-white/10 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/30 text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 transition-colors" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="pl-10 h-10 bg-zinc-950/70 border-white/10 text-white placeholder:text-zinc-500 focus:border-[#be123c] focus:ring-[#be123c]/30 text-xs"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-xs font-semibold mt-3 bg-gradient-to-r from-[#be123c] via-[#991b2e] to-[#881337] hover:from-[#991b2e] hover:to-[#70102b] text-white shadow-lg shadow-[#991b2e]/30 border border-rose-400/30 transition-all duration-200 active:scale-[0.99]"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Verifying credentials...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>Sign in to Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </Button>
        </form>

        {/* Footer info */}
        <div className="mt-7 pt-5 border-t border-white/10 flex flex-col items-center gap-2 text-center text-xs">
          <Link
            href="/public"
            className="text-zinc-400 hover:text-[#f43f5e] transition-colors flex items-center gap-1.5 font-medium group"
          >
            <span>Explore Public Campus Portal</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <span className="text-[11px] text-zinc-500 font-mono">
            Powered by Neon PostgreSQL &bull; Production API
          </span>
        </div>
      </motion.div>
    </div>
  );
}
