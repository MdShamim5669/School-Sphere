"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type TimePeriod = "morning" | "day" | "evening" | "night";
export type AmbientMode = "auto" | "morning" | "day" | "evening" | "night" | "off";

interface AmbientThemeContextType {
  ambientMode: AmbientMode;
  setAmbientMode: (mode: AmbientMode) => void;
  activePeriod: TimePeriod;
  periodLabel: string;
  periodDescription: string;
  hour: number;
}

const AmbientThemeContext = createContext<AmbientThemeContextType | undefined>(undefined);

function getPeriodForHour(hour: number): TimePeriod {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "evening";
  return "night";
}

export function AmbientThemeProvider({ children }: { children: React.ReactNode }) {
  const [ambientMode, setAmbientModeState] = useState<AmbientMode>("auto");
  const [currentHour, setCurrentHour] = useState<number>(() => new Date().getHours());

  useEffect(() => {
    const saved = localStorage.getItem("school_sphere_ambient_mode");
    if (saved) {
      setAmbientModeState(saved as AmbientMode);
    }

    const interval = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const setAmbientMode = (mode: AmbientMode) => {
    setAmbientModeState(mode);
    try {
      localStorage.setItem("school_sphere_ambient_mode", mode);
    } catch {}
  };

  const activePeriod: TimePeriod =
    ambientMode === "auto" || ambientMode === "off"
      ? getPeriodForHour(currentHour)
      : ambientMode;

  const descriptions: Record<TimePeriod, { label: string; desc: string }> = {
    morning: {
      label: "Morning Dawn",
      desc: "5:00 AM – 11:59 AM • Warm golden sunrise ambient radiance",
    },
    day: {
      label: "Daylight Peak",
      desc: "12:00 PM – 4:59 PM • Crisp azure sky & focused learning atmosphere",
    },
    evening: {
      label: "Evening Sunset",
      desc: "5:00 PM – 7:59 PM • Dusky amber twilight & calm review mood",
    },
    night: {
      label: "Midnight Study",
      desc: "8:00 PM – 4:59 AM • Deep obsidian cosmos & focus-enhancing dark glow",
    },
  };

  return (
    <AmbientThemeContext.Provider
      value={{
        ambientMode,
        setAmbientMode,
        activePeriod,
        periodLabel: descriptions[activePeriod].label,
        periodDescription: descriptions[activePeriod].desc,
        hour: currentHour,
      }}
    >
      {children}
    </AmbientThemeContext.Provider>
  );
}

export function useAmbientTheme() {
  const context = useContext(AmbientThemeContext);
  if (!context) {
    throw new Error("useAmbientTheme must be used within an AmbientThemeProvider");
  }
  return context;
}
