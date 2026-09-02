"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAmbientTheme, TimePeriod } from "@/context/ambient-theme-context";

interface PeriodThemeConfig {
  gradientDark: string;
  gradientLight: string;
  orbColorDark: string;
  orbColorLight: string;
  secondaryOrbDark: string;
  secondaryOrbLight: string;
  starsOpacity: number;
}

const periodConfigs: Record<TimePeriod, PeriodThemeConfig> = {
  morning: {
    // Warm golden dawn & soft peach glow
    gradientDark: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(245, 158, 11, 0.15), rgba(244, 63, 94, 0.08), transparent 70%)",
    gradientLight: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(251, 191, 36, 0.22), rgba(254, 205, 211, 0.25), transparent 70%)",
    orbColorDark: "rgba(245, 158, 11, 0.18)",
    orbColorLight: "rgba(251, 191, 36, 0.28)",
    secondaryOrbDark: "rgba(244, 63, 94, 0.12)",
    secondaryOrbLight: "rgba(244, 63, 94, 0.18)",
    starsOpacity: 0,
  },
  day: {
    // Crisp daylight azure & vibrant sky radiance
    gradientDark: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37, 99, 235, 0.15), rgba(14, 165, 233, 0.08), transparent 70%)",
    gradientLight: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(96, 165, 250, 0.25), rgba(186, 230, 253, 0.35), transparent 70%)",
    orbColorDark: "rgba(37, 99, 235, 0.2)",
    orbColorLight: "rgba(59, 130, 246, 0.25)",
    secondaryOrbDark: "rgba(6, 182, 212, 0.12)",
    secondaryOrbLight: "rgba(6, 182, 212, 0.2)",
    starsOpacity: 0,
  },
  evening: {
    // Dusky amber twilight & rich sunset violet
    gradientDark: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(234, 88, 12, 0.16), rgba(147, 51, 234, 0.10), transparent 70%)",
    gradientLight: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(253, 186, 116, 0.3), rgba(233, 213, 255, 0.3), transparent 70%)",
    orbColorDark: "rgba(234, 88, 12, 0.18)",
    orbColorLight: "rgba(249, 115, 22, 0.25)",
    secondaryOrbDark: "rgba(168, 85, 247, 0.15)",
    secondaryOrbLight: "rgba(192, 132, 252, 0.22)",
    starsOpacity: 0.15,
  },
  night: {
    // Deep obsidian cosmos & electric indigo / starlight aura
    gradientDark: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(79, 70, 229, 0.18), rgba(99, 102, 241, 0.08), transparent 70%)",
    gradientLight: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(199, 210, 254, 0.25), rgba(224, 231, 255, 0.3), transparent 70%)",
    orbColorDark: "rgba(99, 102, 241, 0.16)",
    orbColorLight: "rgba(129, 140, 248, 0.2)",
    secondaryOrbDark: "rgba(139, 92, 246, 0.12)",
    secondaryOrbLight: "rgba(167, 139, 250, 0.18)",
    starsOpacity: 0.6,
  },
};

export default function TimeBasedBackground() {
  const { ambientMode, activePeriod } = useAmbientTheme();

  if (ambientMode === "off") {
    return null;
  }

  const config = periodConfigs[activePeriod];

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none transition-opacity duration-1000"
      aria-hidden="true"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activePeriod}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 h-full w-full"
        >
          {/* Base Radiance Gradient (Light Mode) */}
          <div
            className="absolute inset-0 dark:hidden"
            style={{ backgroundImage: config.gradientLight }}
          />

          {/* Base Radiance Gradient (Dark Mode) */}
          <div
            className="absolute inset-0 hidden dark:block"
            style={{ backgroundImage: config.gradientDark }}
          />

          {/* Primary Floating Ambient Light Orb */}
          <motion.div
            animate={{
              x: [-20, 25, -15, -20],
              y: [-10, 20, -5, -10],
              scale: [1, 1.08, 0.96, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-32 left-1/2 h-[550px] w-[550px] -translate-x-1/2 rounded-full blur-[110px]"
            style={{
              backgroundColor: "var(--orb-primary)",
            }}
          >
            <div
              className="h-full w-full rounded-full dark:hidden"
              style={{ backgroundColor: config.orbColorLight }}
            />
            <div
              className="hidden h-full w-full rounded-full dark:block"
              style={{ backgroundColor: config.orbColorDark }}
            />
          </motion.div>

          {/* Secondary Drifting Horizon Light Orb */}
          <motion.div
            animate={{
              x: [30, -35, 20, 30],
              y: [15, -20, 10, 15],
              scale: [0.95, 1.05, 1, 0.95],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/4 right-[10%] h-[450px] w-[450px] rounded-full blur-[130px]"
          >
            <div
              className="h-full w-full rounded-full dark:hidden"
              style={{ backgroundColor: config.secondaryOrbLight }}
            />
            <div
              className="hidden h-full w-full rounded-full dark:block"
              style={{ backgroundColor: config.secondaryOrbDark }}
            />
          </motion.div>

          {/* Subtle Night Celestial Stars (Only visible in Evening / Night) */}
          {config.starsOpacity > 0 && (
            <div
              className="absolute inset-0 transition-opacity duration-1000 hidden dark:block"
              style={{ opacity: config.starsOpacity }}
            >
              <div className="absolute top-[8%] left-[20%] h-1 w-1 rounded-full bg-white/70 animate-pulse" />
              <div className="absolute top-[14%] left-[75%] h-1.5 w-1.5 rounded-full bg-indigo-200/60 animate-pulse" />
              <div className="absolute top-[25%] left-[45%] h-1 w-1 rounded-full bg-white/50" />
              <div className="absolute top-[35%] left-[85%] h-1 w-1 rounded-full bg-blue-200/60 animate-pulse" />
              <div className="absolute top-[18%] left-[10%] h-1 w-1 rounded-full bg-white/40" />
              <div className="absolute top-[5%] left-[60%] h-1 w-1 rounded-full bg-white/60 animate-pulse" />
            </div>
          )}

          {/* Subtle Architectural Grid Texture */}
          <div className="absolute inset-0 bg-grid-subtle opacity-60" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
