"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UserCheck,
  Calendar,
  BookOpen,
  Layers,
  Users,
  Clock,
  ChevronRight,
  MoreHorizontal,
  Mail,
  Phone,
  Droplet,
  CalendarDays,
  Building2,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useTeachers } from "@/hooks/use-teachers";
import { useLessons } from "@/hooks/use-lessons";
import { useClasses } from "@/hooks/use-academic";
import { useStudents } from "@/hooks/use-students";
import { useAnnouncements } from "@/hooks/use-notices";
import { formatDate } from "@/lib/utils";
import { buildScheduleMatrix, TIME_SLOTS, DAYS } from "@/lib/schedule-utils";

// ─── Lesson Colors ───
const LESSON_COLORS: Record<string, { bg: string; darkBg: string; text: string; darkText: string }> = {
  Physics: { bg: "bg-[#FAE27C]", darkBg: "dark:bg-amber-950/60", text: "text-amber-950", darkText: "dark:text-amber-200" },
  Chemistry: { bg: "bg-[#C3EBFA]", darkBg: "dark:bg-sky-950/60", text: "text-sky-900", darkText: "dark:text-sky-200" },
  Biology: { bg: "bg-[#CFCEFF]", darkBg: "dark:bg-violet-950/60", text: "text-violet-950", darkText: "dark:text-violet-200" },
};

function getScheduleColor(name: string) {
  if (name.includes("Physics")) {
    return { bg: "bg-[#FAE27C]", darkBg: "dark:bg-amber-950/60", text: "text-amber-950", darkText: "dark:text-amber-200" };
  }
  if (name.includes("Chemistry")) {
    return { bg: "bg-[#C3EBFA]", darkBg: "dark:bg-sky-950/60", text: "text-sky-900", darkText: "dark:text-sky-200" };
  }
  return { bg: "bg-[#CFCEFF]", darkBg: "dark:bg-violet-950/60", text: "text-violet-950", darkText: "dark:text-violet-200" };
}

// Reference teacher schedule mapping
const DEFAULT_TEACHER_SCHEDULE: Record<string, Record<string, { name: string; time: string } | null>> = {
  "8:00 AM": {
    MON: { name: "4A - Physics", time: "8:00 AM - 8:45 AM" },
    TUE: null,
    WED: { name: "1A - Chemistry", time: "8:00 AM - 8:45 AM" },
    THU: null,
    FRI: { name: "4A - Chemistry", time: "8:00 AM - 8:45 AM" },
  },
  "9:00 AM": {
    MON: { name: "3B - Physics", time: "9:00 AM - 9:45 AM" },
    TUE: { name: "2B - Physics", time: "9:00 AM - 9:45 AM" },
    WED: null,
    THU: { name: "6A - Physics", time: "9:00 AM - 9:45 AM" },
    FRI: { name: "3B - Physics", time: "9:00 AM - 9:45 AM" },
  },
  "10:00 AM": {
    MON: { name: "2B", time: "10:00 AM - 10:45 AM" },
    TUE: { name: "3A - Physics", time: "10:00 AM - 10:45 AM" },
    WED: { name: "2B - Physics", time: "10:00 AM - 10:45 AM" },
    THU: { name: "6B - Chemistry", time: "10:00 AM - 10:45 AM" },
    FRI: null,
  },
  "11:00 AM": {
    MON: { name: "5A - Physics", time: "11:00 AM - 11:45 AM" },
    TUE: { name: "5B - Physics", time: "11:00 AM - 11:45 AM" },
    WED: null,
    THU: { name: "5C - Physics", time: "11:00 AM - 11:45 AM" },
    FRI: { name: "6A - Physics", time: "11:00 AM - 11:45 AM" },
  },
  "12:00 PM": {
    MON: null,
    TUE: null,
    WED: null,
    THU: null,
    FRI: null,
  },
  "1:00 PM": {
    MON: { name: "6C", time: "1:00 PM - 1:45 PM" },
    TUE: null,
    WED: { name: "3C - Chemistry", time: "1:00 PM - 1:45 PM" },
    THU: null,
    FRI: { name: "6A - Chemistry", time: "1:00 PM - 1:45 PM" },
  },
  "2:00 PM": {
    MON: { name: "2B - Physics", time: "2:00 PM - 2:45 PM" },
    TUE: { name: "1A - Physics", time: "2:00 PM - 2:45 PM" },
    WED: null,
    THU: { name: "4A - Chemistry", time: "2:00 PM - 2:45 PM" },
    FRI: { name: "6B - Chemistry", time: "2:00 PM - 2:45 PM" },
  },
  "3:00 PM": {
    MON: null,
    TUE: null,
    WED: null,
    THU: null,
    FRI: null,
  },
  "4:00 PM": {
    MON: null,
    TUE: null,
    WED: null,
    THU: null,
    FRI: null,
  },
};

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const { data: teachersData, isLoading: isTeachersLoading } = useTeachers({ limit: 50 });
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [viewMode, setViewMode] = useState<"workWeek" | "day">("workWeek");

  const teachers = teachersData?.data || [];
  const activeTeacher =
    (selectedTeacherId ? teachers.find((t) => t.id === selectedTeacherId) : null) ||
    teachers.find((t) => t.username === user?.username || t.id === user?.id) ||
    teachers[0];

  const { data: lessonsData, isLoading: isLessonsLoading } = useLessons({
    teacherId: activeTeacher?.id,
    limit: 100,
  });
  const { data: classesData } = useClasses({ limit: 100 });
  const { data: announcementsData } = useAnnouncements({ limit: 4 });

  const scheduleMatrix = buildScheduleMatrix(lessonsData?.data, DEFAULT_TEACHER_SCHEDULE);
  const teacherName = activeTeacher ? `${activeTeacher.name} ${activeTeacher.surname}` : "Faculty Instructor";
  const teacherEmail = activeTeacher?.email || "instructor@schoolsphere.edu";
  const teacherPhone = activeTeacher?.phone || "No phone registered";
  const announcements = announcementsData?.data?.slice(0, 3) || [];

  const totalLessons = lessonsData?.meta?.total ?? lessonsData?.data?.length ?? 0;
  const totalClasses = activeTeacher?.supervisedClasses?.length || classesData?.data?.length || 0;
  const totalSubjects = activeTeacher?.subjects?.length || 1;
  const bloodType = activeTeacher?.bloodType ? activeTeacher.bloodType.replace("_", " ") : "O+";
  const joinDate = activeTeacher?.createdAt ? formatDate(activeTeacher.createdAt) : "Active Faculty";

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-8rem)]">
      {/* ────────────────── LEFT COLUMN: Profile & Schedule ────────────────── */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Top Section: Teacher Profile Card + 4 Mini Stat Badges */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* Teacher Profile Card */}
          <div className="xl:col-span-7 rounded-2xl bg-[#C3EBFA] dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/40 p-5 md:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar Headshot */}
            <div className="relative shrink-0">
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden border-2 border-white dark:border-zinc-800 shadow-md bg-white flex items-center justify-center font-bold text-xl text-sky-800">
                {activeTeacher?.img ? (
                  <img
                    src={activeTeacher.img}
                    alt={teacherName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{activeTeacher?.name?.[0] || "T"}{activeTeacher?.surname?.[0] || ""}</span>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white font-heading truncate">
                    {teacherName}
                  </h2>
                  <span className="text-[10px] text-sky-800 dark:text-sky-300 font-medium">
                    @{activeTeacher?.username || "faculty"} • Verified Instructor
                  </span>
                </div>
                {/* Teacher Switcher */}
                {teachers.length > 0 && (
                  <div className="relative">
                    <select
                      value={activeTeacher?.id || ""}
                      onChange={(e) => setSelectedTeacherId(e.target.value)}
                      className="h-7 pl-2 pr-6 rounded-md border border-sky-300/60 dark:border-sky-700 bg-white/80 dark:bg-zinc-900 text-[11px] font-medium text-zinc-800 dark:text-zinc-200 appearance-none cursor-pointer focus:outline-none"
                    >
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} {t.surname}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500 pointer-events-none" />
                  </div>
                )}
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                {activeTeacher?.address ? `Based at: ${activeTeacher.address}. ` : ""}
                Assigned faculty instructing active department courses and lab sections.
              </p>

              {/* Meta Chips */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-zinc-700 dark:text-zinc-300">
                <div className="flex items-center gap-1.5 truncate">
                  <Droplet className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  <span className="font-semibold">{bloodType}</span>
                  <span className="text-zinc-500">Blood</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <CalendarDays className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                  <span>{joinDate}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                  <span className="truncate">{teacherEmail}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Phone className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                  <span>{teacherPhone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Mini Stat Badges (2x2 grid) */}
          <div className="xl:col-span-5 grid grid-cols-2 gap-3.5">
            {/* 95% Attendance */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-4 shadow-sm flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C3EBFA]/50 text-sky-700 dark:text-sky-300">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-zinc-900 dark:text-white tabular-nums">95%</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Attendance</div>
              </div>
            </div>

            {/* Branches / Subjects */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-4 shadow-sm flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#CFCEFF]/50 text-violet-700 dark:text-violet-300">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-zinc-900 dark:text-white tabular-nums">{totalSubjects}</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Subject{totalSubjects !== 1 ? "s" : ""}</div>
              </div>
            </div>

            {/* Total Lessons */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-4 shadow-sm flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAE27C]/50 text-amber-800 dark:text-amber-300">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-zinc-900 dark:text-white tabular-nums">{totalLessons}</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Lessons</div>
              </div>
            </div>

            {/* Classes */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-4 shadow-sm flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#CFCEFF]/50 text-violet-700 dark:text-violet-300">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-zinc-900 dark:text-white tabular-nums">{totalClasses}</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Class{totalClasses !== 1 ? "es" : ""}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher's Schedule Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111114] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-heading">
              Teacher&apos;s Schedule
            </h2>

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

          {/* Timetable Grid */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-4 shadow-sm overflow-x-auto">
            <div className="min-w-[640px]">
              {/* Day Headers */}
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
                  const row = scheduleMatrix[time];
                  return (
                    <div key={time} className="grid grid-cols-6 items-stretch gap-2 min-h-[64px] border-b border-zinc-100 dark:border-zinc-900/60 pb-1.5">
                      <div className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 pt-2 pl-2">
                        {time}
                      </div>

                      {DAYS.map((day) => {
                        const lesson = row ? row[day] : null;
                        if (!lesson) {
                          return <div key={day} className="rounded-xl bg-transparent" />;
                        }

                        const colors = getScheduleColor(lesson.name);
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
      </div>

      {/* ────────────────── RIGHT COLUMN: Shortcuts, Performance, Announcements ────────────────── */}
      <div className="w-full lg:w-80 shrink-0 space-y-6">
        {/* Shortcuts Section */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-5 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">Shortcuts</h3>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/classes"
              className="px-3 py-1.5 rounded-lg bg-[#C3EBFA] dark:bg-sky-950/60 text-sky-900 dark:text-sky-200 text-xs font-semibold hover:opacity-80 transition-opacity"
            >
              Teacher&apos;s Classes
            </Link>
            <Link
              href="/students"
              className="px-3 py-1.5 rounded-lg bg-[#CFCEFF] dark:bg-violet-950/60 text-violet-950 dark:text-violet-200 text-xs font-semibold hover:opacity-80 transition-opacity"
            >
              Teacher&apos;s Students
            </Link>
            <Link
              href="/lessons"
              className="px-3 py-1.5 rounded-lg bg-[#FAE27C] dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 text-xs font-semibold hover:opacity-80 transition-opacity"
            >
              Teacher&apos;s Lessons
            </Link>
            <Link
              href="/exams"
              className="px-3 py-1.5 rounded-lg bg-[#FDD2D8] dark:bg-rose-950/60 text-rose-950 dark:text-rose-200 text-xs font-semibold hover:opacity-80 transition-opacity"
            >
              Teacher&apos;s Exams
            </Link>
            <Link
              href="/assignments"
              className="px-3 py-1.5 rounded-lg bg-[#C3EBFA] dark:bg-sky-950/60 text-sky-900 dark:text-sky-200 text-xs font-semibold hover:opacity-80 transition-opacity"
            >
              Teacher&apos;s Assignments
            </Link>
          </div>
        </div>

        {/* Performance Gauge Section */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Performance</h3>
            <button type="button" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center py-2">
            {/* Half-donut Arc SVG */}
            <div className="relative w-44 h-24 flex items-end justify-center">
              <svg viewBox="0 0 100 50" className="w-full h-full">
                {/* Background arc */}
                <path
                  d="M 10,50 A 40,40 0 0,1 90,50"
                  fill="none"
                  stroke="#e4e4e7"
                  strokeWidth="12"
                  strokeLinecap="round"
                  className="dark:stroke-zinc-800"
                />
                {/* Gauge fill arc (92%) */}
                <path
                  d="M 10,50 A 40,40 0 0,1 84,28"
                  fill="none"
                  stroke="#C3EBFA"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                <path
                  d="M 84,28 A 40,40 0 0,1 88,42"
                  fill="none"
                  stroke="#FAE27C"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute bottom-0 text-center">
                <div className="text-2xl font-bold text-zinc-900 dark:text-white leading-none">
                  9.2
                </div>
                <div className="text-[10px] text-zinc-400 font-medium mt-0.5">
                  of 10 max LTS
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300 text-center">
              1st Semester – 2nd Semester
            </p>
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
                <div className="rounded-xl bg-[#FAE27C] dark:bg-amber-950/40 p-3.5 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Sports Day Update</h4>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">2025-01-08</span>
                  </div>
                  <p className="text-[11px] text-zinc-700/90 dark:text-zinc-300/80 leading-relaxed">
                    The Sports Day event originally set for 8th January has been cancelled. Stay tuned for updates on the rescheduled date.
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
