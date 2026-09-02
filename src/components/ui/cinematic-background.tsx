"use client";

import React, { useEffect, useRef } from "react";

const TOTAL_FRAMES = 300;

export default function CinematicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesCacheRef = useRef<(HTMLImageElement | null)[]>(
    new Array(TOTAL_FRAMES + 1).fill(null)
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let currentFrameFloat = 1;
    let targetFrame = 1;

    // Helper to get frame path
    const getFrameUrl = (index: number) => {
      const padded = String(index).padStart(4, "0");
      return `/frames/frame_${padded}.jpg`;
    };

    // Preload a single frame
    const preloadFrame = (index: number): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        if (imagesCacheRef.current[index]) {
          resolve(imagesCacheRef.current[index]!);
          return;
        }
        const img = new Image();
        img.src = getFrameUrl(index);
        img.onload = () => {
          imagesCacheRef.current[index] = img;
          resolve(img);
        };
        img.onerror = () => {
          resolve(img);
        };
      });
    };

    // 1. Preload initial priority batch (1 to 30) for instant interactivity
    for (let i = 1; i <= 30; i++) {
      preloadFrame(i);
    }

    // 2. Lazily preload remaining frames in background idle batches
    let nextLazyFrame = 31;
    const preloadRestInBatches = () => {
      if (nextLazyFrame > TOTAL_FRAMES) return;
      const batchSize = 10;
      const end = Math.min(TOTAL_FRAMES, nextLazyFrame + batchSize);
      const promises = [];
      for (let i = nextLazyFrame; i < end; i++) {
        promises.push(preloadFrame(i));
      }
      nextLazyFrame = end;
      Promise.all(promises).then(() => {
        if (nextLazyFrame <= TOTAL_FRAMES) {
          setTimeout(preloadRestInBatches, 20);
        }
      });
    };

    // Start lazy loading after initial render
    const idleTimeout = setTimeout(preloadRestInBatches, 200);

    // Canvas Resizing with high DPI support
    const handleResize = () => {
      if (!canvas) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });

    // Scroll calculation helper
    const updateScrollProgress = () => {
      let progress = 0;

      // Check if inside a scrollable main container (e.g. dashboard main panel)
      const mainEl = document.querySelector("main");
      if (mainEl && mainEl.scrollHeight > mainEl.clientHeight + 10) {
        const scrollTop = mainEl.scrollTop;
        const maxScroll = mainEl.scrollHeight - mainEl.clientHeight;
        progress = Math.min(1, Math.max(0, scrollTop / maxScroll));
      } else {
        // Fallback to window scroll (e.g. /public or full page scroll)
        const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
        const maxScroll =
          (document.documentElement.scrollHeight || document.body.scrollHeight) -
          window.innerHeight;
        progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
      }

      targetFrame = Math.min(TOTAL_FRAMES, Math.max(1, Math.floor(progress * (TOTAL_FRAMES - 1)) + 1));
    };

    // Listen to scroll events on both window and scrollable containers
    window.addEventListener("scroll", updateScrollProgress, { passive: true });

    const mainEl = document.querySelector("main");
    if (mainEl) {
      mainEl.addEventListener("scroll", updateScrollProgress, { passive: true });
    }

    // Find closest available loaded frame if target hasn't loaded yet
    const getBestAvailableFrame = (preferred: number): HTMLImageElement | null => {
      if (imagesCacheRef.current[preferred]) {
        return imagesCacheRef.current[preferred];
      }
      // Look nearby backward first, then forward
      for (let delta = 1; delta <= 30; delta++) {
        if (preferred - delta >= 1 && imagesCacheRef.current[preferred - delta]) {
          return imagesCacheRef.current[preferred - delta];
        }
        if (preferred + delta <= TOTAL_FRAMES && imagesCacheRef.current[preferred + delta]) {
          return imagesCacheRef.current[preferred + delta];
        }
      }
      return imagesCacheRef.current[1] || null;
    };

    // Render loop using lerp for silky 60 FPS smoothness
    const render = () => {
      updateScrollProgress();

      // Smooth interpolation
      currentFrameFloat += (targetFrame - currentFrameFloat) * 0.15;
      const frameToDraw = Math.round(currentFrameFloat);

      const img = getBestAvailableFrame(frameToDraw);

      if (img && img.complete && img.naturalWidth > 0) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const imgW = img.naturalWidth;
        const imgH = img.naturalHeight;

        // Object-fit: cover mathematics
        const canvasAspect = vw / vh;
        const imgAspect = imgW / imgH;

        let drawW = vw;
        let drawH = vh;
        let x = 0;
        let y = 0;

        if (canvasAspect > imgAspect) {
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
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(idleTimeout);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", updateScrollProgress);
      if (mainEl) {
        mainEl.removeEventListener("scroll", updateScrollProgress);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-50] overflow-hidden select-none">
      {/* 1. HTML5 Canvas rendering cinematic 300 frame sequence */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full object-cover z-[-50]"
      />

      {/* 2. Subtle dark cinematic atmospheric depth overlay & vignette */}
      <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-[-40] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.7)_100%)] z-[-39] pointer-events-none" />
    </div>
  );
}
