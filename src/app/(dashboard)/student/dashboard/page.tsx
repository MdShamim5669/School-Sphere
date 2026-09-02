"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import { useStudents } from "@/hooks/use-students";
import { useLessons } from "@/hooks/use-lessons";
import { useEvents, useAnnouncements } from "@/hooks/use-notices";
import { formatDate } from "@/lib/utils";

// ─── Pastel Block Colors for Schedule ───
const LESSON_COLORS: Record<string, { bg: string; darkBg: string; text: string; darkText: string }> = {
  Math: { bg: "bg-[#C3EBFA]", darkBg: "dark:bg-sky-950/60", text: "text-sky-900", darkText: "dark:text-sky-200" },
  English: { bg: "bg-[#FAE27C]", darkBg: "dark:bg-amber-950/60", text: "text-amber-950", darkText: "dark:text-amber-200" },
  Biology: { bg: "bg-[#CFCEFF]", darkBg: "dark:bg-violet-950/60", text: "text-violet-950", darkText: "dark:text-violet-200" },
  Physics: { bg: "bg-[#FDD2D8]", darkBg: "dark:bg-rose-950/60", text: "text-rose-950", darkText: "dark:text-rose-200" },
  History: { bg: "bg-[#CFCEFF]", darkBg: "dark:bg-violet-950/60", text: "text-violet-950", darkText: "dark:text-violet-200" },
  Music: { bg: "bg-[#FAE27C]", darkBg: "dark:bg-amber-950/60", text: "text-amber-950", darkText: "dark:text-amber-200" },
  Chemistry: { bg: "bg-[#C3EBFA]", darkBg: "dark:bg-sky-950/60", text: "text-sky-900", darkText: "dark:text-sky-200" },
  Geography: { bg: "bg-[#FAE27C]", darkBg: "dark:bg-amber-950/60", text: "text-amber-950", darkText: "dark:text-amber-200" },
};

function getLessonColor(subjectName: string) {
  for (const [key, val] of Object.entries(LESSON_COLORS)) {
    if (subjectName.toLowerCase().includes(key.toLowerCase())) {
      return val;
    }
  }
  return { bg: "bg-[#C3EBFA]", darkBg: "dark:bg-sky-950/60", text: "text-sky-900", darkText: "dark:text-sky-200" };
}

// ─── Schedule Grid Structure ───
const TIME_SLOTS = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
];

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];

// ─── Calendar Helper ───
function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const days: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_HEADERS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function StudentDashboardPage() {
  const { data: studentsData } = useStudents({ limit: 50 });
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [viewMode, setViewMode] = useState<"workWeek" | "day">("workWeek");

  const students = studentsData?.data || [];
  const activeStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  const { data: lessonsData } = useLessons({
    classId: activeStudent?.classId,
    limit: 50,
  });
  const { data: eventsData } = useEvents({ limit: 4 });
  const { data: announcementsData } = useAnnouncements({ limit: 4 });

  // Calendar State
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const calendarDays = getCalendarDays(calYear, calMonth);
  const isCurrentMonth = calYear === today.getFullYear() && calMonth === today.getMonth();

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  };

  // Schedule matrix
  // If backend lessons exist, map them; otherwise fall back to the reference schedule
  const defaultSchedule: Record<string, Record<string, { name: string; time: string } | null>> = {
    "8:00 AM": {
      MON: { name: "Math", time: "8:00 AM - 8:45 AM" },
      TUE: null,
      WED: { name: "Math", time: "8:00 AM - 8:45 AM" },
      THU: null,
      FRI: { name: "Math", time: "8:00 AM - 8:45 AM" },
    },
    "9:00 AM": {
      MON: { name: "English", time: "9:00 AM - 9:45 AM" },
      TUE: { name: "English", time: "9:00 AM - 9:45 AM" },
      WED: null,
      THU: { name: "English", time: "9:00 AM - 9:45 AM" },
      FRI: { name: "English", time: "9:00 AM - 9:45 AM" },
    },
    "10:00 AM": {
      MON: { name: "Biology", time: "10:00 AM - 10:45 AM" },
      TUE: { name: "English", time: "10:00 AM - 10:45 AM" },
      WED: { name: "Music", time: "10:00 AM - 10:45 AM" },
      THU: { name: "Biology", time: "10:00 AM - 10:45 AM" },
      FRI: null,
    },
    "11:00 AM": {
      MON: { name: "Physics", time: "11:00 AM - 11:45 AM" },
      TUE: { name: "History", time: "11:00 AM - 11:45 AM" },
      WED: null,
      THU: { name: "Physics", time: "11:00 AM - 11:45 AM" },
      FRI: { name: "Music", time: "11:00 AM - 11:45 AM" },
    },
    "12:00 PM": {
      MON: null,
      TUE: null,
      WED: null,
      THU: null,
      FRI: null,
    },
    "1:00 PM": {
      MON: { name: "Chemistry", time: "1:00 PM - 1:45 PM" },
      TUE: null,
      WED: { name: "Chemistry", time: "1:00 PM - 1:45 PM" },
      THU: null,
      FRI: { name: "Chemistry", time: "1:00 PM - 1:45 PM" },
    },
    "2:00 PM": {
      MON: { name: "History", time: "2:00 PM - 2:45 PM" },
      TUE: { name: "Geography", time: "2:00 PM - 2:45 PM" },
      WED: { name: "Physics", time: "2:00 PM - 2:45 PM" },
      THU: { name: "History", time: "2:00 PM - 2:45 PM" },
      FRI: null,
    },
    "3:00 PM": {
      MON: null,
      TUE: { name: "Geography", time: "3:00 PM - 3:45 PM" },
      WED: null,
      THU: null,
      FRI: null,
    },
  };

  const className = activeStudent?.class?.name || "4A";
  const events = eventsData?.data?.slice(0, 3) || [];
  const announcements = announcementsData?.data?.slice(0, 3) || [];

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-8rem)]">
      {/* ────────────────── LEFT: Schedule Section ────────────────── */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Schedule Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111114] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
          <div className="flex items-center gap-3">
            <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white font-heading">
              Schedule ({className})
            </h2>
            {/* Student selector dropdown */}
            {students.length > 0 && (
              <div className="relative">
                <select
                  value={activeStudent?.id || ""}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="h-8 pl-2.5 pr-8 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium text-zinc-800 dark:text-zinc-200 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.surname} ({s.class?.name || "4A"})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              August 19 – 23
            </span>
            <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-700 p-0.5 bg-zinc-50 dark:bg-zinc-900 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("workWeek")}
                className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  viewMode === "workWeek"
                    ? "bg-[#CFCEFF] text-violet-950 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                Work Week
              </button>
              <button
                type="button"
                onClick={() => setViewMode("day")}
                className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  viewMode === "day"
                    ? "bg-[#CFCEFF] text-violet-950 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                Day
              </button>
            </div>
          </div>
        </div>

        {/* Timetable Calendar Grid */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-4 shadow-sm overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Day Headers Row */}
            <div className="grid grid-cols-6 border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-2">
              <div className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 pl-2">Time</div>
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs font-bold text-zinc-700 dark:text-zinc-300 tracking-wider">
                  {d}
                </div>
              ))}
            </div>

            {/* Time Slot Rows */}
            <div className="space-y-1.5">
              {TIME_SLOTS.map((time) => {
                const row = defaultSchedule[time];
                return (
                  <div key={time} className="grid grid-cols-6 items-stretch gap-2 min-h-[64px] border-b border-zinc-100 dark:border-zinc-900/60 pb-1.5">
                    {/* Time Label */}
                    <div className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 pt-2 pl-2">
                      {time}
                    </div>

                    {/* 5 Day Cells */}
                    {DAYS.map((day) => {
                      const lesson = row ? row[day] : null;
                      if (!lesson) {
                        return <div key={day} className="rounded-xl bg-transparent" />;
                      }

                      const colors = getLessonColor(lesson.name);
                      return (
                        <div
                          key={day}
                          className={`rounded-xl ${colors.bg} ${colors.darkBg} p-2.5 flex flex-col justify-center transition-all hover:scale-[1.02] hover:shadow-sm cursor-pointer`}
                        >
                          <span className="text-[10px] font-mono text-zinc-600/90 dark:text-zinc-400/90 leading-tight">
                            {lesson.time}
                          </span>
                          <span className={`text-xs font-bold ${colors.text} ${colors.darkText} leading-snug mt-0.5 truncate`}>
                            {lesson.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────── RIGHT: Sidebar Panel ────────────────── */}
      <div className="w-full lg:w-80 shrink-0 space-y-6">
        {/* Calendar Widget */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-5 shadow-sm">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={prevMonth}
                className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
            </div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              {MONTH_NAMES[calMonth]} {calYear}
            </h4>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={nextMonth}
                className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-0 mb-1">
            {DAY_HEADERS.map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-0">
            {calendarDays.map((day, i) => {
              const isToday = isCurrentMonth && day === today.getDate();
              const isWeekend = i % 7 >= 5;
              return (
                <div
                  key={i}
                  className={`text-center py-1.5 text-xs font-medium rounded-lg transition-colors cursor-default ${
                    day === null
                      ? ""
                      : isToday
                        ? "bg-[#C3EBFA] dark:bg-sky-600 text-zinc-900 dark:text-white font-bold"
                        : isWeekend
                          ? "text-zinc-400 dark:text-zinc-500"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {day ?? ""}
                </div>
              );
            })}
          </div>
        </div>

        {/* Events Section */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Events</h3>
            <button type="button" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            {events.length > 0 ? (
              events.map((event: any) => (
                <div
                  key={event.id}
                  className="relative pl-3.5 border-l-2 border-[#C3EBFA] dark:border-sky-500 py-1 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1">
                      {event.title}
                    </h4>
                    <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                      12:00 PM – 3:00 PM
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                    {event.description}
                  </p>
                </div>
              ))
            ) : (
              <div className="space-y-3">
                <div className="relative pl-3.5 border-l-2 border-[#C3EBFA] py-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Summer Camp Trip</h4>
                    <span className="text-[10px] text-zinc-400 font-mono">12:00 PM – 3:00 PM</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Outdoor activities and games for all students.</p>
                </div>
                <div className="relative pl-3.5 border-l-2 border-[#CFCEFF] py-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Music Concert</h4>
                    <span className="text-[10px] text-zinc-400 font-mono">12:00 PM – 3:00 PM</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Classic music concert for all students and teachers.</p>
                </div>
                <div className="relative pl-3.5 border-l-2 border-[#FAE27C] py-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Science Fair</h4>
                    <span className="text-[10px] text-zinc-400 font-mono">2:00 PM – 4:00 PM</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Traditional science festival for all students.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Announcements Section */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Announcements</h3>
            <Link href="/announcements" className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {announcements.length > 0 ? (
              announcements.map((ann: any, idx: number) => {
                const colors = ["bg-[#C3EBFA]", "bg-[#CFCEFF]", "bg-[#FAE27C]"];
                return (
                  <div
                    key={ann.id}
                    className={`rounded-xl ${colors[idx % colors.length]} dark:bg-zinc-800/60 p-3.5 space-y-1`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1">
                        {ann.title}
                      </h4>
                      <span className="text-[10px] text-zinc-500/80 dark:text-zinc-400 font-mono shrink-0">
                        {formatDate(ann.date)}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-700/80 dark:text-zinc-300/80 line-clamp-2 leading-relaxed">
                      {ann.description}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl bg-[#C3EBFA] dark:bg-sky-950/40 p-3.5 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white">About 4A Math Test</h4>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">2025-01-02</span>
                  </div>
                  <p className="text-[11px] text-zinc-700/90 dark:text-zinc-300/80 leading-relaxed">
                    The Math test scheduled for 2nd January has been cancelled. A new date will be announced soon.
                  </p>
                </div>
                <div className="rounded-xl bg-[#CFCEFF] dark:bg-violet-950/40 p-3.5 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Field Trip Rescheduled</h4>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">2025-01-05</span>
                  </div>
                  <p className="text-[11px] text-zinc-700/90 dark:text-zinc-300/80 leading-relaxed">
                    The field trip to London has been rescheduled. Please check back for the new date and further instructions.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
