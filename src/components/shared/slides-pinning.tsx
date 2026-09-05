"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface SlidesPinningProps {
  children: React.ReactNode;
}

export default function SlidesPinning({ children }: SlidesPinningProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let ctx: gsap.Context | null = null;

    const setupPinning = () => {
      if (ctx) ctx.revert();

      ctx = gsap.context(() => {
        const panels = gsap.utils.toArray<HTMLElement>(".slide-panel", container);
        if (!panels || panels.length <= 1) return;

        // The final panel is left unpinned so footer and end-of-page content scroll naturally
        const pinnablePanels = panels.slice(0, -1);

        pinnablePanels.forEach((panel) => {
          const innerPanel = panel.querySelector<HTMLElement>(".slide-inner");
          if (!innerPanel) return;

          const visibleHeight = panel.offsetHeight || window.innerHeight - 64;
          const contentHeight = innerPanel.offsetHeight;
          const difference = contentHeight - visibleHeight;

          // Fraction of the animation dedicated to internal overscroll
          const fakeScrollRatio =
            difference > 0 ? difference / (difference + visibleHeight) : 0;

          // Margin bottom creates the exact scroll space needed for internal overscroll
          if (fakeScrollRatio > 0) {
            panel.style.marginBottom = `${difference}px`;
          } else {
            panel.style.marginBottom = "0px";
          }

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: panel,
              start: "bottom bottom",
              end: () =>
                fakeScrollRatio > 0 ? `+=${contentHeight}` : "bottom top",
              pinSpacing: false,
              pin: true,
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          });

          // 1. Internal fake-scroll for taller sections
          if (fakeScrollRatio > 0) {
            tl.to(innerPanel, {
              yPercent: -100,
              y: visibleHeight,
              duration: 1 / (1 - fakeScrollRatio) - 1,
              ease: "none",
            });
          }

          // 2. Scale & fade transition as next slide ascends over the pinned slide
          tl.fromTo(
            panel,
            { scale: 1, opacity: 1 },
            {
              scale: 0.94,
              opacity: 0.3,
              duration: 0.9,
              ease: "power1.inOut",
            }
          ).to(panel, {
            opacity: 0,
            duration: 0.1,
            ease: "power1.in",
          });
        });

        ScrollTrigger.refresh();
      }, container);
    };

    // Small delay for font loading and initial render
    const timer = setTimeout(() => {
      setupPinning();

      // Recalculate if images finish loading later
      const images = container.querySelectorAll("img");
      images.forEach((img) => {
        if (!img.complete) {
          img.addEventListener("load", () => {
            setupPinning();
          }, { once: true });
        }
      });
    }, 100);

    const handleResize = () => {
      setupPinning();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="slides-wrapper relative w-full"
      style={{ overscrollBehavior: "none" }}
    >
      {children}
    </div>
  );
}
