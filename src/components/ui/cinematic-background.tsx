"use client";

import React, { useEffect, useRef, useCallback } from "react";

const TOTAL_FRAMES = 300;
const LERP_SPEED = 0.08;

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

    // Helper: find closest available loaded frame
    const getBestFrame = (preferred: number): HTMLImageElement | null => {
      if (imagesCacheRef.current[preferred]) {
        return imagesCacheRef.current[preferred];
      }
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

    // Helper: draw frame on canvas
    const drawFrame = (frameNum: number) => {
      const img = getBestFrame(frameNum);
      if (!img || !img.complete || img.naturalWidth <= 0) return;

      const vw = stateRef.current.viewW;
      const vh = stateRef.current.viewH;
      if (vw <= 0 || vh <= 0) return;

      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;

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

      ctx.clearRect(0, 0, vw, vh);
      ctx.drawImage(img, x, y, drawW, drawH);
      stateRef.current.lastDrawnFrame = frameNum;
    };

    // Preload a single frame
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
          if (index === 1 && stateRef.current.lastDrawnFrame <= 0) {
            drawFrame(1);
          }
          resolve(img);
        };
        img.onerror = () => resolve(null);
      });
    };

    // Initialize dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    stateRef.current.dpr = dpr;
    stateRef.current.viewW = width;
    stateRef.current.viewH = height;

    // Preload first 30 frames immediately
    const initialPromises: Promise<HTMLImageElement | null>[] = [];
    for (let i = 1; i <= Math.min(30, TOTAL_FRAMES); i++) {
      initialPromises.push(preloadFrame(i));
    }

    // Lazy load remaining frames
    let nextBatchStart = 31;
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
          if ("requestIdleCallback" in window) {
            (window as any).requestIdleCallback(preloadNextBatch, { timeout: 100 });
          } else {
            setTimeout(preloadNextBatch, 30);
          }
        }
      });
    };

    Promise.all(initialPromises).then(() => {
      if (!destroyed) {
        drawFrame(1);
        setTimeout(preloadNextBatch, 100);
      }
    });

    // Resize handler
    const handleResize = () => {
      if (!canvas || destroyed) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const currentDpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = w * currentDpr;
      canvas.height = h * currentDpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.setTransform(currentDpr, 0, 0, currentDpr, 0, 0);

      stateRef.current.dpr = currentDpr;
      stateRef.current.viewW = w;
      stateRef.current.viewH = h;

      drawFrame(stateRef.current.lastDrawnFrame > 0 ? stateRef.current.lastDrawnFrame : 1);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // Scroll calculation
    const updateScrollProgress = () => {
      let progress = 0;

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

    window.addEventListener("scroll", updateScrollProgress, { passive: true });

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

    // Render loop (rAF)
    const render = () => {
      if (destroyed) return;

      const state = stateRef.current;
      const diff = state.targetFrame - state.currentFrameFloat;
      state.currentFrameFloat += diff * LERP_SPEED;

      if (Math.abs(diff) < 0.01) {
        state.currentFrameFloat = state.targetFrame;
      }

      const frameToDraw = Math.round(state.currentFrameFloat);

      if (frameToDraw !== state.lastDrawnFrame) {
        drawFrame(frameToDraw);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

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
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* 1. HTML5 Canvas rendering cinematic 300 frame sequence */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      />

      {/* 2. Subtle dark cinematic atmospheric depth overlay & vignette */}
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/55 pointer-events-none"
        style={{ zIndex: 1 }}
      />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background:
            "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 35%, rgba(0,0,0,0.65) 100%)",
        }}
      />
    </div>
  );
}
