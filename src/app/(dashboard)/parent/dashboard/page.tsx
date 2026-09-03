"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HeartHandshake,
  Users,
  Award,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  UserCheck,
  Mail,
  Phone,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useParents } from "@/hooks/use-parents";
import { useStudents } from "@/hooks/use-students";
import { useAttendance } from "@/hooks/use-attendance";
import { useResults } from "@/hooks/use-assessments";
import { useAnnouncements } from "@/hooks/use-notices";
import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

export default function ParentDashboardPage() {
  const { user } = useAuth();
  const { data: parentsData, isLoading: isParentsLoading } = useParents({ limit: 50 });
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [selectedChildIndex, setSelectedChildIndex] = useState<number>(0);

  const parents = parentsData?.data || [];
  const activeParent =
    (selectedParentId ? parents.find((p) => p.id === selectedParentId) : null) ||
    parents.find((p) => p.username === user?.username || p.id === user?.id) ||
    parents[0];

  // Fetch students for this parent
  const { data: studentsData } = useStudents({
    parentId: activeParent?.id,
    limit: 10,
  });

  const children = studentsData?.data || activeParent?.students || [];
  const activeChild = children[selectedChildIndex] || children[0];

  // Fetch active child's attendance
  const { data: attendanceData } = useAttendance({
    studentId: activeChild?.id,
    limit: 50,
  });

  // Fetch active child's assessment results
  const { data: resultsData } = useResults({
    studentId: activeChild?.id,
    limit: 50,
  });

  const { data: announcementsData } = useAnnouncements({ limit: 4 });

  const attendanceLogs = attendanceData?.data || [];
  const presentCount = attendanceLogs.filter((l) => l.present).length;
  const absenceCount = attendanceLogs.filter((l) => !l.present).length;
  const attendanceRate =
    attendanceLogs.length > 0
      ? Math.round((presentCount / attendanceLogs.length) * 100)
      : 97;

  const results = resultsData?.data || [];

  return (
    <div className="space-y-8">
      {/* Page Header & Parent Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-1.5">
            <HeartHandshake className="h-3.5 w-3.5" />
            <span>Family & Guardian Portal</span>
          </div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-white">
            Parent Overview & Child Progress
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Monitor classroom presence, term marks, and instructor contact details for your children.
          </p>
        </div>

        {/* Parent Selector */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-zinc-500 shrink-0">Guardian:</span>
          <select
            value={activeParent?.id || ""}
            onChange={(e) => {
              setSelectedParentId(e.target.value);
              setSelectedChildIndex(0);
            }}
            className="h-8 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white focus:outline-none focus:border-zinc-700"
          >
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.surname} ({p.phone})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Children Tabs / Switcher */}
      {children.length > 0 ? (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-medium text-zinc-400 mr-1.5">Children:</span>
          {children.map((child, idx) => (
            <button
              key={child.id}
              onClick={() => setSelectedChildIndex(idx)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                idx === selectedChildIndex
                  ? "bg-zinc-800 border-zinc-700/80 text-white shadow-sm"
                  : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Avatar className="h-5 w-5 border border-zinc-700/60">
                <AvatarFallback className="text-[9px] bg-zinc-850">
                  {child.name[0]}
                  {child.surname[0]}
                </AvatarFallback>
              </Avatar>
              <span>{child.name} {child.surname}</span>
              <Badge variant="outline" className="text-[9px] py-0 px-1 ml-0.5">
                Class {child.class?.name || "Cohort"}
              </Badge>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-5 rounded-xl border border-zinc-800/80 bg-[#111114] text-center text-xs text-zinc-500">
          No children linked to this parent account.
        </div>
      )}

      {/* Selected Child Banner */}
      {activeChild && (
        <div className="rounded-xl border border-zinc-800/80 bg-[#111114] p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <Avatar className="h-12 w-12 border border-zinc-700/60 shadow-sm">
                <AvatarFallback className="bg-zinc-800 text-sm text-zinc-200 font-semibold">
                  {activeChild.name[0]}
                  {activeChild.surname[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-white">
                    {activeChild.name} {activeChild.surname}
                  </h2>
                  <Badge variant="secondary" className="text-[10px]">
                    Class {activeChild.class?.name || "A"}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    Grade {activeChild.grade?.level || "1"}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                  <span>Student ID: @{activeChild.username}</span>
                  <span>&bull;</span>
                  <span>DOB: {formatDate(activeChild.birthday)}</span>
                  <span>&bull;</span>
                  <span>Blood: {activeChild.bloodType.replace("_", " ")}</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[11px] text-zinc-500 block">Attendance</span>
                <span className="text-xl font-semibold text-emerald-400 tabular-nums">
                  {attendanceRate}%
                </span>
              </div>
              <div className="h-8 w-px bg-zinc-800" />
              <div className="text-right">
                <span className="text-[11px] text-zinc-500 block">Absences</span>
                <span className={`text-xl font-semibold tabular-nums ${absenceCount > 0 ? "text-amber-400" : "text-zinc-300"}`}>
                  {absenceCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Grades & Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Academic Marks */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-400" />
                  <span>Recent Assessment Scores & Grades</span>
                </CardTitle>
                <CardDescription>
                  Scores evaluated by subject teachers for {activeChild?.name}
                </CardDescription>
              </div>
              <Badge variant="indigo">{results.length} Scores</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500 dark:text-zinc-500">
                No evaluation marks published for this student yet.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {results.map((res) => {
                  const isExam = Boolean(res.examId || res.exam);
                  const title = res.exam?.title || res.assignment?.title || "Assessment";
                  return (
                    <div
                      key={res.id}
                      className="py-3 flex items-center justify-between gap-4 transition-colors hover:bg-white/[0.02] px-2 rounded-lg"
                    >
                      <div>
                        <h4 className="font-semibold text-sm text-white">{title}</h4>
                        <div className="text-xs text-zinc-500 dark:text-zinc-500">
                          {isExam ? "Term Examination" : "Homework Task"} &bull; {formatDate(res.createdAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-bold text-base ${
                            res.score >= 80
                              ? "text-emerald-400"
                              : res.score >= 50
                              ? "text-amber-400"
                              : "text-red-400"
                          }`}
                        >
                          {res.score}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Log Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Attendance History</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Daily lecture hall roll call records
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {attendanceLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500 dark:text-zinc-500">
                No attendance entries logged yet.
              </div>
            ) : (
              attendanceLogs.slice(0, 6).map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl border border-white/5 bg-gray-900/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-medium text-gray-200 block">
                      {log.lesson?.name || "Daily Lesson"}
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-500">
                      {formatDate(log.date)}
                    </span>
                  </div>
                  {log.present ? (
                    <Badge variant="success" className="text-[10px] gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Present
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-[10px] gap-1">
                      <XCircle className="h-3 w-3" />
                      Absent
                    </Badge>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Classroom Supervisor Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-emerald-400" />
            <span>Classroom Supervisor Contact</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Direct communication link with your child's assigned head teacher
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-zinc-200 dark:border-zinc-800">
                <AvatarFallback>TC</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-sm text-white">
                  Class {activeChild?.class?.name || "Cohort"} Supervisor
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  Direct inquiries regarding curriculum, assignments, and behavior
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a href="mailto:faculty@schoolsphere.edu">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Mail className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Send Email</span>
                </Button>
              </a>
              <Link href="/announcements">
                <Button variant="gradient" size="sm" className="gap-1.5 text-xs">
                  <span>View Notices</span>
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
