"use client";

import React, { useId } from "react";
import { GraduationCap, Star, Quote } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  cohort: string;
  content: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  rating: number;
}

const testimonialsRow1: Testimonial[] = [
  {
    id: "t-1",
    name: "Dr. Eleanor Vance",
    role: "Dean of Academic Affairs",
    cohort: "Faculty Administration",
    content:
      "School Sphere revolutionized our term reporting. Coordinating faculty rosters, grading audits, and lesson timetables across 12 departments now takes hours instead of weeks.",
    initials: "EV",
    avatarBg: "bg-indigo-100 dark:bg-indigo-950/60",
    avatarFg: "text-indigo-700 dark:text-indigo-400",
    rating: 5,
  },
  {
    id: "t-2",
    name: "Marcus Sterling",
    role: "Senior Scholar, Computer Science",
    cohort: "Class of 2026",
    content:
      "Having our live lecture timetables, assignment submissions, and diagnostic test results unified in one lightning-fast portal transformed my daily academic focus.",
    initials: "MS",
    avatarBg: "bg-rose-100 dark:bg-rose-950/60",
    avatarFg: "text-rose-700 dark:text-rose-400",
    rating: 5,
  },
  {
    id: "t-3",
    name: "Clara Hawthorne",
    role: "Parent Association Chair",
    cohort: "Guardian Community",
    content:
      "Instant attendance push notifications and verified term grade transcripts give parents complete transparency and genuine peace of mind throughout the semester.",
    initials: "CH",
    avatarBg: "bg-amber-100 dark:bg-amber-950/60",
    avatarFg: "text-amber-700 dark:text-amber-400",
    rating: 5,
  },
  {
    id: "t-4",
    name: "Prof. Arthur Pendelton",
    role: "Lead Physics Instructor",
    cohort: "STEM Faculty",
    content:
      "The attendance tracker and student performance analytics allow me to immediately identify learners who need extra academic mentorship before exams.",
    initials: "AP",
    avatarBg: "bg-emerald-100 dark:bg-emerald-950/60",
    avatarFg: "text-emerald-700 dark:text-emerald-400",
    rating: 5,
  },
];

const testimonialsRow2: Testimonial[] = [
  {
    id: "t-5",
    name: "Sofia Al-Mansoor",
    role: "Biotechnology Researcher",
    cohort: "Class of 2027",
    content:
      "The intuitive dashboard navigation, seamless mobile interface, and interactive course announcements keep our research cohorts in perfect synchronization.",
    initials: "SA",
    avatarBg: "bg-sky-100 dark:bg-sky-950/60",
    avatarFg: "text-sky-700 dark:text-sky-400",
    rating: 5,
  },
  {
    id: "t-6",
    name: "Julian Rivera",
    role: "Head of Student Admissions",
    cohort: "Enrollment Office",
    content:
      "Our matriculation pipeline and diagnostic placement testing have become completely paperless. School Sphere is truly enterprise-grade campus software.",
    initials: "JR",
    avatarBg: "bg-purple-100 dark:bg-purple-950/60",
    avatarFg: "text-purple-700 dark:text-purple-400",
    rating: 5,
  },
  {
    id: "t-7",
    name: "Hannah Lindqvist",
    role: "Secondary Mathematics Educator",
    cohort: "Curriculum Board",
    content:
      "Generating mid-term evaluation reports for 140+ students takes one click. The clean typography and responsive design make heavy grading sessions enjoyable.",
    initials: "HL",
    avatarBg: "bg-teal-100 dark:bg-teal-950/60",
    avatarFg: "text-teal-700 dark:text-teal-400",
    rating: 5,
  },
  {
    id: "t-8",
    name: "David K. Campbell",
    role: "Parent & Guardian",
    cohort: "Middle School Family",
    content:
      "Direct instructor messaging and transparent assignment grading have helped my daughter excel. The portal is clear, secure, and wonderfully organized.",
    initials: "DC",
    avatarBg: "bg-orange-100 dark:bg-orange-950/60",
    avatarFg: "text-orange-700 dark:text-orange-400",
    rating: 5,
  },
];

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <article
      className="flex flex-col justify-between w-[320px] sm:w-[360px] md:w-[390px] shrink-0 p-5 sm:p-6 rounded-2xl border border-[#E4E4E7] dark:border-white/10 bg-white/95 dark:bg-[#111114]/90 backdrop-blur-md shadow-[0_1px_2px_rgba(9,9,11,0.04)] hover:shadow-md hover:border-zinc-300 dark:hover:border-white/20 transition-all duration-300 select-none text-left"
    >
      {/* Top: Avatar, Name, Role & Star Rating */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Initial-based Avatar on colored disc (zero asset dependency) */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${item.avatarBg} ${item.avatarFg} font-semibold text-xs border border-current/10`}
            aria-hidden="true"
          >
            {item.initials}
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-xs sm:text-sm text-[#09090B] dark:text-zinc-100 truncate font-heading">
              {item.name}
            </h4>
            <p className="text-[11px] text-[#71717A] dark:text-zinc-400 truncate">
              {item.role}
            </p>
          </div>
        </div>

        {/* 5-star rating */}
        <div className="flex items-center gap-0.5 text-amber-500 shrink-0" aria-label="5 out of 5 stars">
          {Array.from({ length: item.rating }).map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
          ))}
        </div>
      </div>

      {/* Testimonial Quote Content */}
      <blockquote className="text-xs sm:text-[13px] text-[#09090B]/90 dark:text-zinc-300 leading-relaxed font-normal">
        &ldquo;{item.content}&rdquo;
      </blockquote>

      {/* Bottom: Cohort tag */}
      <div className="mt-4 pt-3 border-t border-[#E4E4E7]/60 dark:border-white/5 flex items-center justify-between text-[10px] text-[#71717A] font-mono uppercase tracking-wider">
        <span>{item.cohort}</span>
        <span className="text-[#4F46E5] dark:text-[#a5b4fc] font-sans lowercase">verified campus voice</span>
      </div>
    </article>
  );
}

export default function TestimonialsSection() {
  const sectionId = useId();

  return (
    <section
      id="testimonials"
      aria-labelledby={`${sectionId}-heading`}
      className="py-16 md:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto w-full select-none"
    >
      {/* Section Header */}
      <div className="text-center space-y-3 mb-12 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#4F46E5]/10 dark:bg-[#4F46E5]/20 px-3.5 py-1 text-[11px] font-semibold tracking-wider text-[#4F46E5] dark:text-[#a5b4fc] uppercase border border-[#4F46E5]/20 shadow-sm">
          <GraduationCap className="h-3.5 w-3.5" />
          <span>Voices of School Sphere</span>
        </div>

        <h2
          id={`${sectionId}-heading`}
          className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-[#09090B] dark:text-white leading-[1.15]"
        >
          Trusted by Scholars, <br className="hidden sm:inline" />
          Educators & Families
        </h2>

        <p className="text-sm md:text-base text-[#71717A] dark:text-zinc-400 font-normal leading-relaxed">
          Discover how our unified digital campus powers academic excellence, transparent governance, and student achievement every single day.
        </p>
      </div>

      {/* 
        Marquee Rails Container:
        CSS mask-image creates edge-fade over ANY background without hardcoded color gradients.
        Paused on hover with group-hover:[animation-play-state:paused].
      */}
      <div
        className="relative overflow-hidden group space-y-5"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        {/* Row 1: Leftward Scrolling Track */}
        <div className="flex gap-4 sm:gap-5 w-max animate-marquee-left group-hover:[animation-play-state:paused] motion-reduce:animate-none">
          {/* Original set */}
          {testimonialsRow1.map((item) => (
            <TestimonialCard key={item.id} item={item} />
          ))}
          {/* Seamless duplicate marked aria-hidden */}
          {testimonialsRow1.map((item) => (
            <div key={`dup1-${item.id}`} aria-hidden="true">
              <TestimonialCard item={item} />
            </div>
          ))}
        </div>

        {/* Row 2: Rightward Scrolling Track */}
        <div className="flex gap-4 sm:gap-5 w-max animate-marquee-right group-hover:[animation-play-state:paused] motion-reduce:animate-none">
          {/* Original set */}
          {testimonialsRow2.map((item) => (
            <TestimonialCard key={item.id} item={item} />
          ))}
          {/* Seamless duplicate marked aria-hidden */}
          {testimonialsRow2.map((item) => (
            <div key={`dup2-${item.id}`} aria-hidden="true">
              <TestimonialCard item={item} />
            </div>
          ))}
        </div>
      </div>

      {/* Reduced-Motion Accessible Fallback: Plain readable grid */}
      <div className="hidden motion-reduce:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
        {[...testimonialsRow1, ...testimonialsRow2.slice(0, 2)].map((item) => (
          <TestimonialCard key={`reduced-${item.id}`} item={item} />
        ))}
      </div>
    </section>
  );
}
