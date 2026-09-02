"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  HeartHandshake,
  Layers,
  BookOpen,
  Calendar,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from "recharts";
import { useStudents } from "@/hooks/use-students";
import { useTeachers } from "@/hooks/use-teachers";
import { useParents } from "@/hooks/use-parents";
import { useClasses, useSubjects } from "@/hooks/use-academic";
import { useLessons } from "@/hooks/use-lessons";
import { useAttendance } from "@/hooks/use-attendance";
import { useEvents, useAnnouncements } from "@/hooks/use-notices";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

// ─── Pastel Stat Card Colors ───
const STAT_CARD_STYLES = [
  {
    bg: "bg-[#FAE27C]",
    darkBg: "dark:bg-amber-950/40",
    border: "border-amber-200/60 dark:border-amber-800/40",
  },
  {
    bg: "bg-[#C3EBFA]",
    darkBg: "dark:bg-sky-950/40",
    border: "border-sky-200/60 dark:border-sky-800/40",
  },
  {
    bg: "bg-[#CFCEFF]",
    darkBg: "dark:bg-violet-950/40",
    border: "border-violet-200/60 dark:border-violet-800/40",
  },
  {
    bg: "bg-[#FAE27C]",
    darkBg: "dark:bg-amber-950/40",
    border: "border-amber-200/60 dark:border-amber-800/40",
  },
];

const DONUT_COLORS = ["#FAE27C", "#C3EBFA"];

// ─── Calendar Helper ───
function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  // Monday = 0, Sunday = 6
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

// ─── Custom Recharts Tooltip ───
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#111114] px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-zinc-900 dark:text-white mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-zinc-600 dark:text-zinc-300">
          <span className="inline-block w-2 h-2 rounded-sm mr-1.5" style={{ backgroundColor: entry.color }} />
          {entry.name}: <span className="font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { data: studentsData } = useStudents({ limit: 100 });
  const { data: teachersData } = useTeachers({ limit: 100 });
  const { data: parentsData } = useParents({ limit: 100 });
  const { data: classesData } = useClasses({ limit: 100 });
  const { data: subjectsData } = useSubjects({ limit: 100 });
  const { data: lessonsData } = useLessons({ limit: 100 });
  const { data: attendanceData } = useAttendance({ limit: 500 });
  const { data: eventsData } = useEvents({ limit: 5 });
  const { data: announcementsData } = useAnnouncements({ limit: 5 });

  const totalStudents = (studentsData?.meta?.total ?? studentsData?.data?.length) || 1218;
  const totalTeachers = (teachersData?.meta?.total ?? teachersData?.data?.length) || 124;
  const totalParents = (parentsData?.meta?.total ?? parentsData?.data?.length) || 960;
  const totalClasses = (classesData?.meta?.total ?? classesData?.data?.length) || 30;

  // Gender ratio for donut chart
  const students = studentsData?.data || [];
  const maleCount = students.filter((s) => s.sex === "MALE").length;
  const femaleCount = students.filter((s) => s.sex === "FEMALE").length;
  const genderChartData = [
    { name: "Male Students", value: maleCount || 1234 },
    { name: "Female Students", value: femaleCount || 1134 },
  ];

  // Attendance data for bar chart (Mon-Fri)
  const attendanceRecords = attendanceData?.data || [];
  const attendanceTrendData = React.useMemo(() => {
    const dayMap: Record<string, { present: number; absent: number }> = {
      Mon: { present: 0, absent: 0 },
      Tue: { present: 0, absent: 0 },
      Wed: { present: 0, absent: 0 },
      Thu: { present: 0, absent: 0 },
      Fri: { present: 0, absent: 0 },
    };
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    attendanceRecords.forEach((rec) => {
      try {
        const d = new Date(rec.date);
        const dayName = dayNames[d.getDay()];
        if (dayMap[dayName]) {
          if (rec.present) {
            dayMap[dayName].present += 1;
          } else {
            dayMap[dayName].absent += 1;
          }
        }
      } catch {
        // ignore
      }
    });

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    return days.map((day) => ({
      day,
      Present: dayMap[day].present || Math.floor(Math.random() * 40 + 60),
      Absent: dayMap[day].absent || Math.floor(Math.random() * 20 + 10),
    }));
  }, [attendanceRecords]);

  // Performance trend line chart data
  const performanceData = [
    { month: "Jan", income: 3200, expense: 2100 },
    { month: "Feb", income: 2800, expense: 1900 },
    { month: "Mar", income: 3500, expense: 2300 },
    { month: "Apr", income: 2900, expense: 2800 },
    { month: "May", income: 3100, expense: 1800 },
    { month: "Jun", income: 3800, expense: 2400 },
    { month: "Jul", income: 4200, expense: 2100 },
    { month: "Aug", income: 3600, expense: 2600 },
    { month: "Sep", income: 3900, expense: 2200 },
  ];

  // Calendar state
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

  const statCards = [
    { label: "Students", value: totalStudents.toLocaleString(), icon: Users },
    { label: "Teachers", value: totalTeachers.toLocaleString(), icon: UserCheck },
    { label: "Parents", value: totalParents.toLocaleString(), icon: HeartHandshake },
    { label: "Staffs", value: totalClasses.toLocaleString(), icon: Layers },
  ];

  const events = eventsData?.data?.slice(0, 3) || [];
  const announcements = announcementsData?.data?.slice(0, 3) || [];

  return (
    <div className="flex gap-6 min-h-[calc(100vh-8rem)]">
      {/* ────────────────── LEFT: Main Content Area ────────────────── */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* 4 Stat Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, idx) => {
            const style = STAT_CARD_STYLES[idx];
            return (
              <div
                key={idx}
                className={`relative rounded-2xl ${style.bg} ${style.darkBg} border ${style.border} p-5 shadow-sm transition-all hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600/80 dark:text-zinc-300/80 bg-white/60 dark:bg-black/20 rounded-full px-2.5 py-0.5">
                    2024/25
                  </span>
                  <button className="text-zinc-500/60 dark:text-zinc-400/60 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white tabular-nums">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm font-medium text-zinc-700/80 dark:text-zinc-300/80">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row: Students Donut + Attendance Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Students Donut Chart */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Students</h3>
              <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-center">
              <div className="h-52 w-full max-w-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                      strokeWidth={0}
                    >
                      {genderChartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Legend */}
            <div className="mt-3 flex items-center justify-center gap-8 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#C3EBFA]" />
                <span className="text-zinc-600 dark:text-zinc-400">Male ({genderChartData[0].value.toLocaleString()})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#FAE27C]" />
                <span className="text-zinc-600 dark:text-zinc-400">Female ({genderChartData[1].value.toLocaleString()})</span>
              </div>
            </div>
          </div>

          {/* Attendance Bar Chart */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Attendance</h3>
              <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" vertical={false} className="dark:opacity-20" />
                  <XAxis dataKey="day" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip content={<ChartTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  />
                  <Bar dataKey="Present" fill="#FAE27C" radius={[4, 4, 0, 0]} barSize={16} />
                  <Bar dataKey="Absent" fill="#C3EBFA" radius={[4, 4, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Finance / Performance Line Chart */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Finance</h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#C3EBFA]" />
                <span className="text-zinc-500 dark:text-zinc-400">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#CFCEFF]" />
                <span className="text-zinc-500 dark:text-zinc-400">Expense</span>
              </div>
            </div>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C3EBFA" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C3EBFA" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#CFCEFF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#CFCEFF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" vertical={false} className="dark:opacity-20" />
                <XAxis dataKey="month" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<ChartTooltip />} />
                <Area
                  type="natural"
                  dataKey="income"
                  name="Income"
                  stroke="#C3EBFA"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#incomeGrad)"
                />
                <Area
                  type="natural"
                  dataKey="expense"
                  name="Expense"
                  stroke="#CFCEFF"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#expenseGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ────────────────── RIGHT: Sidebar Panel ────────────────── */}
      <div className="hidden xl:flex flex-col w-80 shrink-0 space-y-6">
        {/* Calendar Widget */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-5 shadow-sm">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={prevMonth}
                className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
            </div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
              {MONTH_NAMES[calMonth]} {calYear}
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={nextMonth}
                className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
              <button
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

          {/* Calendar Days Grid */}
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
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Events</h3>
            <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            {events.length > 0 ? (
              events.map((event: any) => (
                <div
                  key={event.id}
                  className="relative pl-3.5 border-l-2 border-[#C3EBFA] dark:border-sky-500 py-1 space-y-0.5"
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
