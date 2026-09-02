"use client";

import React, { useEffect, useRef, useCallback } from "react";

const TOTAL_FRAMES = 300;
const LERP_SPEED = 0.08; // Smoother, more cinematic interpolation

export default function CinematicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesCacheRef = useRef<(HTMLImageElement | null)[]>(
    new Array(TOTAL_FRAMES + 1).fill(null)
  );
  const stateRef = useRef({
    currentFrameFloat: 1,
    targetFrame: 1,
    lastDrawnFrame: -1,
    dpr: 1,
    viewW: 0,
    viewH: 0,
  });

  // Stable frame URL generator
  const getFrameUrl = useCallback((index: number) => {
    return `/frames/frame_${String(index).padStart(4, "0")}.jpg`;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId = 0;
    let destroyed = false;

    // ── Preloading System ──────────────────────────────────
    const preloadFrame = (index: number): Promise<HTMLImageElement | null> => {
      return new Promise((resolve) => {
        if (imagesCacheRef.current[index]) {
          resolve(imagesCacheRef.current[index]);
          return;
        }
        const img = new Image();
        img.decoding = "async";
        img.src = getFrameUrl(index);
        img.onload = () => {
          imagesCacheRef.current[index] = img;
          resolve(img);
        };
        img.onerror = () => resolve(null);
      });
    };

    // Priority: preload first 40 frames immediately for instant scroll response
    const initialPromises: Promise<HTMLImageElement | null>[] = [];
    for (let i = 1; i <= Math.min(40, TOTAL_FRAMES); i++) {
      initialPromises.push(preloadFrame(i));
    }

    // After initial batch, progressively load remaining frames in idle batches
    let nextBatchStart = 41;
    const preloadNextBatch = () => {
      if (destroyed || nextBatchStart > TOTAL_FRAMES) return;
      const batchEnd = Math.min(nextBatchStart + 15, TOTAL_FRAMES + 1);
      const batch: Promise<HTMLImageElement | null>[] = [];
      for (let i = nextBatchStart; i < batchEnd; i++) {
        batch.push(preloadFrame(i));
      }
      nextBatchStart = batchEnd;
      Promise.all(batch).then(() => {
        if (!destroyed && nextBatchStart <= TOTAL_FRAMES) {
          // Use requestIdleCallback if available, fallback to setTimeout
          if ("requestIdleCallback" in window) {
            (window as any).requestIdleCallback(preloadNextBatch, { timeout: 100 });
          } else {
            setTimeout(preloadNextBatch, 30);
          }
        }
      });
    };

    // Start background preloading after initial priority batch
    Promise.all(initialPromises).then(() => {
      if (!destroyed) {
        setTimeout(preloadNextBatch, 100);
      }
    });

    // ── Canvas Sizing (DPI-aware) ──────────────────────────
    const handleResize = () => {
      if (!canvas || destroyed) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Reset transform before applying new scale (fixes accumulation bug)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      stateRef.current.dpr = dpr;
      stateRef.current.viewW = width;
      stateRef.current.viewH = height;
      stateRef.current.lastDrawnFrame = -1; // Force redraw
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });

    // ── Scroll Progress Calculation ────────────────────────
    const updateScrollProgress = () => {
      let progress = 0;

      // Dynamically find scrollable <main> (handles late-mount after auth redirect)
      const mainEl = document.querySelector("main");
      if (mainEl && mainEl.scrollHeight > mainEl.clientHeight + 10) {
        const scrollTop = mainEl.scrollTop;
        const maxScroll = mainEl.scrollHeight - mainEl.clientHeight;
        progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
      } else {
        const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
        const maxScroll =
          (document.documentElement.scrollHeight || document.body.scrollHeight) -
          window.innerHeight;
        progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
      }

      stateRef.current.targetFrame = Math.min(
        TOTAL_FRAMES,
        Math.max(1, Math.floor(progress * (TOTAL_FRAMES - 1)) + 1)
      );
    };

    // Attach scroll listeners — using capture phase for reliability
    window.addEventListener("scroll", updateScrollProgress, { passive: true });

    // Use a MutationObserver to detect when <main> appears (after auth redirect)
    // and attach scroll listener to it
    let mainScrollCleanup: (() => void) | null = null;

    const attachMainScroll = () => {
      const mainEl = document.querySelector("main");
      if (mainEl) {
        mainEl.addEventListener("scroll", updateScrollProgress, { passive: true });
        mainScrollCleanup = () => {
          mainEl.removeEventListener("scroll", updateScrollProgress);
        };
      }
    };

    attachMainScroll();

    const observer = new MutationObserver(() => {
      if (mainScrollCleanup) mainScrollCleanup();
      attachMainScroll();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // ── Frame Lookup (nearest available) ───────────────────
    const getBestFrame = (preferred: number): HTMLImageElement | null => {
      if (imagesCacheRef.current[preferred]) {
        return imagesCacheRef.current[preferred];
      }
      // Spiral outward from preferred frame
      for (let delta = 1; delta <= 40; delta++) {
        const before = preferred - delta;
        const after = preferred + delta;
        if (before >= 1 && imagesCacheRef.current[before]) {
          return imagesCacheRef.current[before];
        }
        if (after <= TOTAL_FRAMES && imagesCacheRef.current[after]) {
          return imagesCacheRef.current[after];
        }
      }
      return imagesCacheRef.current[1] || null;
    };

    // ── Render Loop (rAF with smooth cinematic lerp) ───────
    const render = () => {
      if (destroyed) return;

      const state = stateRef.current;

      // Cinematic smooth interpolation
      const diff = state.targetFrame - state.currentFrameFloat;
      state.currentFrameFloat += diff * LERP_SPEED;

      // Snap if extremely close to prevent infinite micro-movements
      if (Math.abs(diff) < 0.01) {
        state.currentFrameFloat = state.targetFrame;
      }

      const frameToDraw = Math.round(state.currentFrameFloat);

      // Only redraw when frame actually changes (huge perf win)
      if (frameToDraw !== state.lastDrawnFrame) {
        const img = getBestFrame(frameToDraw);

        if (img && img.complete && img.naturalWidth > 0) {
          const vw = state.viewW;
          const vh = state.viewH;
          const imgW = img.naturalWidth;
          const imgH = img.naturalHeight;

          // Object-fit: cover calculation
          const viewAspect = vw / vh;
          const imgAspect = imgW / imgH;

          let drawW: number, drawH: number, x: number, y: number;

          if (viewAspect > imgAspect) {
            drawW = vw;
            drawH = vw / imgAspect;
            x = 0;
            y = (vh - drawH) / 2;
          } else {
            drawH = vh;
            drawW = vh * imgAspect;
            x = (vw - drawW) / 2;
            y = 0;
          }

          // Clear and draw using logical coordinates (DPI scaling handled by setTransform)
          ctx.clearRect(0, 0, vw, vh);
          ctx.drawImage(img, x, y, drawW, drawH);

          state.lastDrawnFrame = frameToDraw;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // ── Cleanup ────────────────────────────────────────────
    return () => {
      destroyed = true;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", updateScrollProgress);
      if (mainScrollCleanup) mainScrollCleanup();
      observer.disconnect();
    };
  }, [getFrameUrl]);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden select-none"
      style={{ zIndex: -50 }}
      aria-hidden="true"
    >
      {/* Canvas layer: scroll-driven frame sequence */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{ zIndex: -50 }}
      />

      {/* Cinematic atmospheric depth: subtle dark overlay + vignette */}
      <div
        className="fixed inset-0 bg-black/35 dark:bg-black/55 pointer-events-none"
        style={{ zIndex: -40 }}
      />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: -39,
          background:
            "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}
