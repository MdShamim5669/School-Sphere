"use client";

import * as React from "react";
import {
  Moon,
  Sun,
  Laptop,
  Clock,
  Sunrise,
  Sunset,
  Check,
  Sparkles,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAmbientTheme } from "@/context/ambient-theme-context";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const { ambientMode, setAmbientMode, activePeriod, periodLabel } = useAmbientTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-8 w-8 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60" />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative h-8 px-2 flex items-center justify-center gap-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer outline-none"
          title="Color Theme & Time-Based Ambient Background"
          aria-label="Theme & Ambient Settings"
        >
          <div className="relative h-3.5 w-3.5 flex items-center justify-center">
            <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
            <Moon className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
          </div>
          {ambientMode !== "off" && (
            <span className="hidden lg:flex items-center gap-1 text-[10px] font-medium text-blue-600 dark:text-blue-400 font-mono">
              <Sparkles className="h-2.5 w-2.5" />
              <span>{activePeriod}</span>
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-white dark:bg-[#121215] border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-xl"
      >
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Color Theme
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="cursor-pointer gap-2 text-xs font-medium justify-between"
        >
          <div className="flex items-center gap-2">
            <Sun className="h-3.5 w-3.5 text-amber-500" />
            <span>Light ("White") Mode</span>
          </div>
          {theme === "light" && <Check className="h-3.5 w-3.5 text-blue-500" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="cursor-pointer gap-2 text-xs font-medium justify-between"
        >
          <div className="flex items-center gap-2">
            <Moon className="h-3.5 w-3.5 text-blue-400" />
            <span>Dark Mode</span>
          </div>
          {theme === "dark" && <Check className="h-3.5 w-3.5 text-blue-500" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="cursor-pointer gap-2 text-xs font-medium justify-between"
        >
          <div className="flex items-center gap-2">
            <Laptop className="h-3.5 w-3.5 text-zinc-400" />
            <span>System Default</span>
          </div>
          {theme === "system" && <Check className="h-3.5 w-3.5 text-blue-500" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />

        {/* Time-Based Animated BG Section */}
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
          <span>Time-Based Ambient BG</span>
          <span className="text-blue-500 text-[9px] lowercase font-normal">{periodLabel}</span>
        </DropdownMenuLabel>

        <DropdownMenuItem
          onClick={() => setAmbientMode("auto")}
          className="cursor-pointer gap-2 text-xs font-medium justify-between"
        >
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-blue-500" />
            <span>Auto Clock Sync</span>
          </div>
          {ambientMode === "auto" && <Check className="h-3.5 w-3.5 text-blue-500" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setAmbientMode("morning")}
          className="cursor-pointer gap-2 text-xs font-medium justify-between"
        >
          <div className="flex items-center gap-2">
            <Sunrise className="h-3.5 w-3.5 text-amber-500" />
            <span>Morning Dawn</span>
          </div>
          {ambientMode === "morning" && <Check className="h-3.5 w-3.5 text-blue-500" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setAmbientMode("day")}
          className="cursor-pointer gap-2 text-xs font-medium justify-between"
        >
          <div className="flex items-center gap-2">
            <Sun className="h-3.5 w-3.5 text-sky-500" />
            <span>Daylight Peak</span>
          </div>
          {ambientMode === "day" && <Check className="h-3.5 w-3.5 text-blue-500" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setAmbientMode("evening")}
          className="cursor-pointer gap-2 text-xs font-medium justify-between"
        >
          <div className="flex items-center gap-2">
            <Sunset className="h-3.5 w-3.5 text-orange-500" />
            <span>Evening Sunset</span>
          </div>
          {ambientMode === "evening" && <Check className="h-3.5 w-3.5 text-blue-500" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setAmbientMode("night")}
          className="cursor-pointer gap-2 text-xs font-medium justify-between"
        >
          <div className="flex items-center gap-2">
            <Moon className="h-3.5 w-3.5 text-indigo-400" />
            <span>Midnight Study</span>
          </div>
          {ambientMode === "night" && <Check className="h-3.5 w-3.5 text-blue-500" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />

        <DropdownMenuItem
          onClick={() => setAmbientMode("off")}
          className="cursor-pointer gap-2 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 justify-between"
        >
          <span>Disable Ambient Animation</span>
          {ambientMode === "off" && <Check className="h-3.5 w-3.5 text-zinc-500" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
