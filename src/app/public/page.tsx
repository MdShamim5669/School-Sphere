"use client";

import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  UserCheck,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  Shield,
  HeartHandshake,
  Sparkles,
  Clock,
  Megaphone,
  CheckCircle2,
  Award,
  Compass,
  FileText,
  School,
} from "lucide-react";
import { useStudents } from "@/hooks/use-students";
import { useTeachers } from "@/hooks/use-teachers";
import { useClasses, useSubjects } from "@/hooks/use-academic";
import { useEvents, useAnnouncements } from "@/hooks/use-notices";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import DashboardFooter from "@/components/layout/dashboard-footer";
import FAQSection from "@/components/shared/faq-section";
import EventsShowcase from "@/components/shared/events-showcase";
import { formatDate, formatDateTime } from "@/lib/utils";

export default function PublicPortalPage() {
  const { data: studentsData } = useStudents({ limit: 1 });
  const { data: teachersData } = useTeachers({ limit: 1 });
  const { data: classesData } = useClasses({ limit: 6 });
  const { data: subjectsData } = useSubjects({ limit: 12 });
  const { data: eventsData } = useEvents({ limit: 4 });
  const { data: announcementsData } = useAnnouncements({ limit: 4 });

  const totalStudents = studentsData?.meta?.total || 142;
  const totalTeachers = teachersData?.meta?.total || 24;
  const totalClasses = classesData?.meta?.total || 12;
  const totalSubjects = subjectsData?.meta?.total || 16;

  const fallbackEvents = [
    {
      id: "ev-1",
      title: "Annual STEM & Robotics Innovation Fair",
      description: "Interactive demonstrations of learner science exhibits, robotics competition, and computer programming projects.",
      startTime: "2026-09-15T09:00:00Z",
      class: { name: "All School" },
    },
    {
      id: "ev-2",
      title: "Mid-Term Parent-Teacher Academic Conference",
      description: "Direct consultative meetings between guardians and subject faculties regarding student grade trajectories.",
      startTime: "2026-09-22T13:30:00Z",
      class: { name: "Grades 1-12" },
    },
    {
      id: "ev-3",
      title: "Inter-Campus Athletics & Track Championship",
      description: "Outdoor sporting competitions, relay finals, and sportsmanship awards at the central campus stadium.",
      startTime: "2026-10-05T08:00:00Z",
      class: { name: "Secondary" },
    },
  ];

  const fallbackAnnouncements = [
    {
      id: "an-1",
      title: "Autumn Semester Academic Timetable Finalized",
      description: "The complete term schedule, teacher assignments, and classroom room allocations are now live across all student dashboards.",
      date: "2026-09-01",
    },
    {
      id: "an-2",
      title: "Digital Library Resource Expansion",
      description: "Access over 12,000 new digital academic journals, textbooks, and interactive multimedia learning modules.",
      date: "2026-08-28",
    },
    {
      id: "an-3",
      title: "Open Admissions Window for Upcoming Cohort",
      description: "Prospective learners and families may schedule campus guided tours and register for diagnostic evaluation sessions.",
      date: "2026-08-20",
    },
  ];

  const displayedEvents =
    eventsData?.data && eventsData.data.length > 0
      ? eventsData.data
      : fallbackEvents;

  const displayedAnnouncements =
    announcementsData?.data && announcementsData.data.length > 0
      ? announcementsData.data
      : fallbackAnnouncements;

  const portalCards = [
    {
      title: "Student Portal",
      description: "Inspect daily timetable periods, submit homework deliverables, and review term report cards.",
      icon: Users,
      link: "/student/dashboard",
      badge: "Learners",
      role: "Student",
    },
    {
      title: "Teacher Portal",
      description: "Manage classroom roll call, schedule subject lessons, and record examination marks.",
      icon: UserCheck,
      link: "/teacher/dashboard",
      badge: "Faculty",
      role: "Teacher",
    },
    {
      title: "Parent Portal",
      description: "Monitor child attendance streaks, inspect exam grades, and message supervisor instructors.",
      icon: HeartHandshake,
      link: "/parent/dashboard",
      badge: "Guardians",
      role: "Parent",
    },
    {
      title: "Administrative Hub",
      description: "Full institutional governance, faculty hiring, master student directory, and academic scheduling.",
      icon: Shield,
      link: "/dashboard",
      badge: "Administration",
      role: "Admin",
    },
  ];

  const academicDepartments = [
    {
      name: "STEM & Computing",
      desc: "Computer Science, Robotics, Laboratory Physics & Chemistry",
      icon: Compass,
      code: "DEPT-01",
    },
    {
      name: "Mathematics & Analytics",
      desc: "Advanced Calculus, Statistics, Algebra & Discrete Math",
      icon: Layers,
      code: "DEPT-02",
    },
    {
      name: "Humanities & Social Sciences",
      desc: "World History, Institutional Civics, Geography & Economics",
      icon: BookOpen,
      code: "DEPT-03",
    },
    {
      name: "Languages & Literature",
      desc: "English Rhetoric, World Languages & Academic Composition",
      icon: FileText,
      code: "DEPT-04",
    },
  ];

  return (
    <div className="min-h-screen bg-transparent text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors select-none scroll-smooth">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-md px-6 md:px-12 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 shadow-sm text-blue-600 dark:text-blue-400">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white leading-tight">
              School Sphere
            </span>
            <span className="text-[10px] text-zinc-500 font-mono tracking-tight">
              Digital Campus Gateway
            </span>
          </div>
        </div>

        {/* Navigation links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          <a href="#overview" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            Overview
          </a>
          <a href="#portals" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            Portals
          </a>
          <a href="#departments" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            Departments
          </a>
          <a href="#bulletin" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            Bulletin & Events
          </a>
          <a href="#faq" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            FAQs
          </a>
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Theme Toggle (Light / Dark / Time-Based BG) */}
          <ThemeToggle />

          <Link href="/login">
            <Button variant="outline" size="sm" className="text-xs h-8">
              Sign In
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="gap-1.5 text-xs h-8">
              <span>Admin Hub</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section id="overview" className="relative py-20 px-6 md:px-12 text-center max-w-4xl mx-auto space-y-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 px-3 py-1 text-xs text-zinc-600 dark:text-zinc-400 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span>Unified Enterprise Academic Administration</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight">
          Modern Institutional Campus for Educators, Learners & Families
        </h1>

        <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          School Sphere coordinates classroom scheduling, real-time roll call attendance, evaluation report cards, and parent communications on a single secure platform.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/login">
            <Button size="lg" className="gap-2 h-9 text-xs">
              <span>Enter Workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <a href="#portals">
            <Button variant="outline" size="lg" className="h-9 text-xs">
              Explore Role Portals
            </Button>
          </a>
        </div>

        {/* Live Academic Metric Tiles */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Enrolled Scholars", value: totalStudents, icon: Users },
            { label: "Faculty Educators", value: totalTeachers, icon: UserCheck },
            { label: "Classroom Cohorts", value: totalClasses, icon: Layers },
            { label: "Curriculum Subjects", value: totalSubjects, icon: BookOpen },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] text-center shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
              >
                <div className="flex justify-center mb-1 text-zinc-400">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight tabular-nums">
                  {stat.value}
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Role Portal Gateways */}
      <section id="portals" className="py-12 px-6 md:px-12 max-w-5xl mx-auto w-full">
        <div className="text-center space-y-1 mb-8">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Access Portals
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Dedicated functional hubs tailored for each member of the campus community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portalCards.map((portal, idx) => {
            const Icon = portal.icon;
            return (
              <Link key={idx} href={portal.link}>
                <Card className="hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-[#141418] transition-all group cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-white transition-colors">
                        <Icon className="h-4 w-4" />
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {portal.badge}
                      </Badge>
                    </div>
                    <CardTitle className="mt-3 text-sm font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {portal.title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {portal.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                      <span>Launch portal view</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Academic Departments Showcase */}
      <section id="departments" className="py-12 px-6 md:px-12 max-w-5xl mx-auto w-full">
        <div className="text-center space-y-1 mb-8">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Academic Curriculums
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Comprehensive learning departments structured from elementary through high school
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {academicDepartments.map((dept, idx) => {
            const Icon = dept.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="h-8 w-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">{dept.code}</span>
                </div>
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-white">{dept.name}</h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed">{dept.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* University Events & Programs Showcase matching reference design */}
      <EventsShowcase />

      {/* Campus Bulletin Notices */}
      <section id="bulletin" className="py-12 px-6 md:px-12 max-w-5xl mx-auto w-full">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400">
                <Megaphone className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight font-heading">
                  Official Campus Bulletins & Announcements
                </h3>
                <p className="text-xs text-zinc-500">Live institutional updates and schedule notices</p>
              </div>
            </div>
            <Link href="/announcements" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              View All Bulletins &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displayedAnnouncements.map((an: any) => (
              <div
                key={an.id}
                className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] space-y-2 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-xs text-zinc-900 dark:text-white line-clamp-1">{an.title}</span>
                  <span className="text-[10px] text-zinc-400 font-mono shrink-0">{formatDate(an.date)}</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">{an.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ & Knowledge Section ready for RAG system */}
      <FAQSection />

      {/* Footer matching user reference design */}
      <div className="max-w-5xl mx-auto w-full px-6 md:px-12 mt-8">
        <DashboardFooter />
      </div>
    </div>
  );
}
