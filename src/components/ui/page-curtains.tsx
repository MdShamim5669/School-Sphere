"use client";

import React, { createContext, useContext, useState, useCallback, useId } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";

export type CurtainEffect = "doors" | "wipe" | "blinds" | "iris" | "fade";
export type CurtainDirection = "left" | "right" | "up" | "down";

export interface CurtainOptions {
  effect?: CurtainEffect;
  direction?: CurtainDirection;
  duration?: number;
  color?: string;
  title?: string;
  angle?: number;
}

interface CurtainsContextValue {
  isTransitioning: boolean;
  triggerTransition: (action: () => void | Promise<void>, options?: CurtainOptions) => Promise<void>;
}

const CurtainsContext = createContext<CurtainsContextValue | null>(null);

export function useCurtains() {
  const ctx = useContext(CurtainsContext);
  if (!ctx) {
    return {
      isTransitioning: false,
      triggerTransition: async (action: () => void | Promise<void>) => {
        await action();
      },
    };
  }
  return ctx;
}

const defaultTransition: Transition = {
  duration: 0.55,
  ease: [0.76, 0, 0.24, 1],
};

interface PageCurtainsProviderProps {
  children: React.ReactNode;
  defaultEffect?: CurtainEffect;
  color?: string;
}

export function PageCurtainsProvider({
  children,
  defaultEffect = "doors",
  color = "var(--primary, #991b2e)",
}: PageCurtainsProviderProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [phase, setPhase] = useState<"idle" | "covering" | "revealing">("idle");
  const [options, setOptions] = useState<CurtainOptions>({
    effect: defaultEffect,
    direction: "left",
    duration: 0.55,
    color,
  });

  const triggerTransition = useCallback(
    async (action: () => void | Promise<void>, opts?: CurtainOptions) => {
      const mergedOpts: CurtainOptions = {
        effect: opts?.effect || defaultEffect,
        direction: opts?.direction || "left",
        duration: opts?.duration || 0.55,
        color: opts?.color || color,
        title: opts?.title,
        angle: opts?.angle || 0,
      };
      setOptions(mergedOpts);
      setIsTransitioning(true);
      setPhase("covering");

      // Wait for cover animation to finish
      await new Promise((res) => setTimeout(res, (mergedOpts.duration || 0.55) * 1000 * 0.95));

      // Execute navigation or state change callback
      try {
        await action();
      } catch (err) {
        console.error("Error during curtain transition action:", err);
      }

      // Reveal new page content
      setPhase("revealing");
      await new Promise((res) => setTimeout(res, (mergedOpts.duration || 0.55) * 1000));

      setPhase("idle");
      setIsTransitioning(false);
    },
    [defaultEffect, color]
  );

  return (
    <CurtainsContext.Provider value={{ isTransitioning, triggerTransition }}>
      {children}
      <PageCurtainsOverlay
        isActive={isTransitioning}
        phase={phase}
        options={options}
      />
    </CurtainsContext.Provider>
  );
}

interface PageCurtainsOverlayProps {
  isActive: boolean;
  phase: "idle" | "covering" | "revealing";
  options: CurtainOptions;
}

export function PageCurtainsOverlay({
  isActive,
  phase,
  options,
}: PageCurtainsOverlayProps) {
  const { effect = "doors", color = "var(--primary, #991b2e)", duration = 0.55, title, angle = 0 } = options;

  if (!isActive && phase === "idle") return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden select-none"
      aria-hidden="true"
    >
      <AnimatePresence mode="wait">
        {effect === "doors" && (
          <DoorsCurtain key="doors" phase={phase} color={color} duration={duration} title={title} />
        )}
        {effect === "wipe" && (
          <WipeCurtain key="wipe" phase={phase} color={color} duration={duration} angle={angle} title={title} />
        )}
        {effect === "blinds" && (
          <BlindsCurtain key="blinds" phase={phase} color={color} duration={duration} title={title} />
        )}
        {effect === "iris" && (
          <IrisCurtain key="iris" phase={phase} color={color} duration={duration} title={title} />
        )}
        {effect === "fade" && (
          <FadeCurtain key="fade" phase={phase} color={color} duration={duration} title={title} />
        )}
      </AnimatePresence>
    </div>
  );
}

// 1. Doors Effect: Two theater curtain panels closing and opening from edges
function DoorsCurtain({
  phase,
  color,
  duration,
  title,
}: {
  phase: "idle" | "covering" | "revealing";
  color: string;
  duration: number;
  title?: string;
}) {
  const isCovered = phase === "covering";

  return (
    <div className="absolute inset-0 flex">
      {/* Left panel */}
      <motion.div
        className="h-full w-1/2"
        style={{ backgroundColor: color }}
        initial={{ x: "-100%" }}
        animate={{ x: isCovered ? "0%" : "-100%" }}
        transition={{ ...defaultTransition, duration }}
      />
      {/* Right panel */}
      <motion.div
        className="h-full w-1/2"
        style={{ backgroundColor: color }}
        initial={{ x: "100%" }}
        animate={{ x: isCovered ? "0%" : "100%" }}
        transition={{ ...defaultTransition, duration }}
      />
      {title && isCovered && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none px-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-heading text-center">
            {title}
          </h2>
        </motion.div>
      )}
    </div>
  );
}

// 2. Wipe Effect: Angled single curtain traversing the screen
function WipeCurtain({
  phase,
  color,
  duration,
  angle = 0,
  title,
}: {
  phase: "idle" | "covering" | "revealing";
  color: string;
  duration: number;
  angle?: number;
  title?: string;
}) {
  const isCovered = phase === "covering";

  return (
    <motion.div
      className="absolute inset-0 w-full h-full flex items-center justify-center"
      style={{
        backgroundColor: color,
        transformOrigin: "center center",
      }}
      initial={{ x: "-100%", skewX: `${angle}deg` }}
      animate={{
        x: isCovered ? "0%" : "100%",
        skewX: `${angle}deg`,
      }}
      transition={{ ...defaultTransition, duration }}
    >
      {title && isCovered && (
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-heading text-center px-6">
          {title}
        </h2>
      )}
    </motion.div>
  );
}

// 3. Blinds Effect: 6 staggered horizontal/vertical slats
function BlindsCurtain({
  phase,
  color,
  duration,
  title,
}: {
  phase: "idle" | "covering" | "revealing";
  color: string;
  duration: number;
  title?: string;
}) {
  const count = 6;
  const isCovered = phase === "covering";

  return (
    <div className="absolute inset-0 flex flex-col">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="w-full flex-1"
          style={{ backgroundColor: color }}
          initial={{ scaleY: 0, transformOrigin: "top" }}
          animate={{
            scaleY: isCovered ? 1 : 0,
            transformOrigin: isCovered ? "top" : "bottom",
          }}
          transition={{
            duration: duration * 0.7,
            delay: i * 0.04,
            ease: [0.76, 0, 0.24, 1],
          }}
        />
      ))}
      {title && isCovered && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center px-6 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-heading text-center">
            {title}
          </h2>
        </motion.div>
      )}
    </div>
  );
}

// 4. Iris Effect: Circular expanding/shrinking camera iris
function IrisCurtain({
  phase,
  color,
  duration,
  title,
}: {
  phase: "idle" | "covering" | "revealing";
  color: string;
  duration: number;
  title?: string;
}) {
  const isCovered = phase === "covering";

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{ backgroundColor: color }}
      initial={{ clipPath: "circle(0% at 50% 50%)" }}
      animate={{
        clipPath: isCovered
          ? "circle(150% at 50% 50%)"
          : "circle(0% at 50% 50%)",
      }}
      transition={{ ...defaultTransition, duration }}
    >
      {title && isCovered && (
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-heading text-center px-6">
          {title}
        </h2>
      )}
    </motion.div>
  );
}

// 5. Fade Effect: High contrast backdrop fade
function FadeCurtain({
  phase,
  color,
  duration,
  title,
}: {
  phase: "idle" | "covering" | "revealing";
  color: string;
  duration: number;
  title?: string;
}) {
  const isCovered = phase === "covering";

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{ backgroundColor: color }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isCovered ? 1 : 0 }}
      transition={{ duration: duration * 0.75, ease: "easeInOut" }}
    >
      {title && isCovered && (
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-heading text-center px-6">
          {title}
        </h2>
      )}
    </motion.div>
  );
}

export default PageCurtainsProvider;
