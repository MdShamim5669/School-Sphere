"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GraduationCap, ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";
import { useEvents } from "@/hooks/use-notices";
import { formatDate } from "@/lib/utils";

// Curated thematic fallbacks matching the user's reference image if backend event doesn't supply a picture
const fallbackEventImages = [
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80", // Digital Marketing / Tech Workshop
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80", // Health & Wellness Awareness Fair
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80", // Football Practice Match
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80", // Campus Seminar
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80", // Student Study Group
];

const fallbackEvents = [
  {
    id: "fe-1",
    title: "Digital Marketing & AI Workshop",
    description: "Learn digital marketing strategies and generative workflows for modern academic success.",
    startTime: "2026-04-05T14:00:00Z",
    endTime: "2026-04-05T17:00:00Z",
    image: fallbackEventImages[0],
  },
  {
    id: "fe-2",
    title: "Health & Wellness Awareness Fair",
    description: "Promoting healthy lifestyle habits through engaging student activities, nutrition talks, and wellness education.",
    startTime: "2026-07-18T14:00:00Z",
    endTime: "2026-07-18T17:00:00Z",
    image: fallbackEventImages[1],
  },
  {
    id: "fe-3",
    title: "Football Practice & Athletics Match",
    description: "Explore teamwork, tactical athletics, and competitive outdoor match fitness for top collegiate outcomes.",
    startTime: "2026-07-18T14:00:00Z",
    endTime: "2026-07-18T17:00:00Z",
    image: fallbackEventImages[2],
  },
];

export default function EventsShowcase() {
  const { data: eventsData, isLoading } = useEvents({ limit: 6 });
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use backend events if available, otherwise use reference fallback events
  const rawEvents = eventsData?.data && eventsData.data.length > 0 ? eventsData.data : fallbackEvents;

  // Ensure each event has an image from the backend or fallback
  const events = rawEvents.map((ev: any, idx: number) => ({
    ...ev,
    displayImage:
      ev.image ||
      ev.img ||
      ev.bannerUrl ||
      fallbackEventImages[idx % fallbackEventImages.length],
  }));

  const cardsPerPage = 3;
  const maxIndex = Math.max(0, events.length - cardsPerPage);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  };

  const visibleEvents = events.slice(currentIndex, currentIndex + cardsPerPage);

  const formatTimeRange = (startStr: string, endStr?: string) => {
    try {
      const start = new Date(startStr);
      const startTime = start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      if (!endStr) return startTime;
      const end = new Date(endStr);
      const endTime = end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      return `${startTime} – ${endTime}`;
    } catch {
      return "2:00 PM – 5:00 PM";
    }
  };

  return (
    <section id="events-showcase" className="py-16 md:py-24 px-6 md:px-12 max-w-6xl mx-auto w-full select-none">
      {/* Header with Title & Carousel Buttons matching reference */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-4 max-w-2xl">
          {/* Badge matching reference */}
          <div className="inline-flex items-center gap-2 rounded-md bg-[#092b21] dark:bg-[#0c3327] px-3.5 py-1.5 text-[11px] font-bold tracking-wider text-[#a3e635] uppercase border border-[#a3e635]/20 shadow-sm">
            <GraduationCap className="h-3.5 w-3.5 text-[#a3e635]" />
            <span>Our Events</span>
          </div>

          {/* Big Headline in Plus Jakarta Sans matching reference */}
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-zinc-900 dark:text-white leading-[1.15]">
            Discover Exciting University <br className="hidden sm:inline" />
            Events And Programs
          </h2>
        </div>

        {/* Carousel Arrow Controls matching reference image */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handlePrev}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b5f242] text-[#092b21] hover:bg-[#a3e635] transition-all cursor-pointer shadow-sm active:scale-95"
            title="Previous Events"
            aria-label="Previous events"
          >
            <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
          </button>
          <button
            onClick={handleNext}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b5f242] text-[#092b21] hover:bg-[#a3e635] transition-all cursor-pointer shadow-sm active:scale-95"
            title="Next Events"
            aria-label="Next events"
          >
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* 3 Events Cards Grid matching reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleEvents.map((ev) => (
          <div
            key={ev.id}
            className="group flex flex-col justify-between overflow-hidden rounded-2xl transition-all duration-300"
          >
            {/* Event Picture handled from backend */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800 shadow-sm">
              <img
                src={ev.displayImage}
                alt={ev.title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />
            </div>

            {/* Event Content */}
            <div className="flex flex-1 flex-col justify-between pt-4">
              <div>
                <h3 className="font-heading text-base sm:text-lg font-bold text-zinc-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {ev.title}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-normal line-clamp-2 leading-relaxed">
                  {ev.description}
                </p>
              </div>

              {/* Event Date & Time Metadata Footer */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 font-normal">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{formatDate(ev.startTime)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{formatTimeRange(ev.startTime, ev.endTime)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
