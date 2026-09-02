"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  BookOpen,
  Award,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  ClipboardList,
  Clock,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useStudents } from "@/hooks/use-students";
import { useLessons } from "@/hooks/use-lessons";
import { useAttendance } from "@/hooks/use-attendance";
import { useResults, useExams, useAssignments } from "@/hooks/use-assessments";
import { useAnnouncements } from "@/hooks/use-notices";
import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate, formatTime } from "@/lib/utils";

export default function StudentDashboardPage() {
  const { data: studentsData } = useStudents({ limit: 50 });
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  const students = studentsData?.data || [];
  const activeStudent =
    students.find((s) => s.id === selectedStudentId) || students[0];

  // Fetch student's class lessons
  const { data: lessonsData } = useLessons({
    classId: activeStudent?.classId,
    limit: 50,
  });

  // Fetch student's personal attendance
  const { data: attendanceData } = useAttendance({
    studentId: activeStudent?.id,
    limit: 100,
  });

  // Fetch student's report card results
  const { data: resultsData } = useResults({
    studentId: activeStudent?.id,
    limit: 50,
  });

  const { data: examsData } = useExams({ limit: 10 });
  const { data: assignmentsData } = useAssignments({ limit: 10 });
  const { data: announcementsData } = useAnnouncements({ limit: 4 });

  // Calculate student attendance statistics
  const attendanceLogs = attendanceData?.data || [];
  const presentCount = attendanceLogs.filter((l) => l.present).length;
  const attendanceRate =
    attendanceLogs.length > 0
      ? Math.round((presentCount / attendanceLogs.length) * 100)
      : 96;

  // Calculate GPA / Average score
  const results = resultsData?.data || [];
  const avgScore =
    results.length > 0
      ? Math.round(
          results.reduce((acc, r) => acc + r.score, 0) / results.length
        )
      : 88;

  const timetable = lessonsData?.data || [];

  return (
    <div className="space-y-8">
      {/* Header & Student Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>Learner Academic Portal</span>
          </div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-white">
            Student Learning Dashboard
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Track your class timetable, attendance streaks, homework assignments, and term exam grades.
          </p>
        </div>

        {/* Student Switcher */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-zinc-500 shrink-0">Student:</span>
          <select
            value={activeStudent?.id || ""}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="h-8 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white focus:outline-none focus:border-zinc-700"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.surname} (@{s.username})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Banner */}
      {activeStudent && (
        <div className="rounded-xl border border-zinc-800/80 bg-[#111114] p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <Avatar className="h-12 w-12 border border-zinc-700/60 shadow-sm">
                <AvatarFallback className="bg-zinc-800 text-sm text-zinc-200 font-semibold">
                  {activeStudent.name[0]}
                  {activeStudent.surname[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-white">
                    {activeStudent.name} {activeStudent.surname}
                  </h2>
                  <Badge variant="secondary" className="text-[10px]">
                    Class {activeStudent.class?.name || "Cohort"}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    Grade {activeStudent.grade?.level || "Standard"}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                  <span>@{activeStudent.username}</span>
                  <span>&bull;</span>
                  <span>DOB: {formatDate(activeStudent.birthday)}</span>
                  <span>&bull;</span>
                  <span>Blood: {activeStudent.bloodType.replace("_", " ")}</span>
                </div>
              </div>
            </div>

            {/* Attendance & Score Badges */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[11px] text-zinc-500 block">Attendance</span>
                <span className="text-xl font-semibold text-emerald-400 tabular-nums">
                  {attendanceRate}%
                </span>
              </div>
              <div className="h-8 w-px bg-zinc-800" />
              <div className="text-right">
                <span className="text-[11px] text-zinc-500 block">Overall Score</span>
                <span className="text-xl font-semibold text-blue-400 tabular-nums">
                  {avgScore}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Schedule & Report Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Timetable */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-400" />
                  <span>My Class Timetable</span>
                </CardTitle>
                <CardDescription>
                  Scheduled lessons for Class {activeStudent?.class?.name || "your cohort"}
                </CardDescription>
              </div>
              <Link href="/lessons">
                <Button variant="ghost" size="sm" className="text-xs">
                  Full Timetable &rarr;
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {timetable.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500 dark:text-zinc-500">
                No class schedule uploaded yet.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {timetable.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="py-3 flex items-center justify-between gap-4 transition-colors hover:bg-white/[0.02] px-2 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 font-bold text-xs">
                        {lesson.day.slice(0, 3)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-white">{lesson.name}</h4>
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">
                          Subject: {lesson.subject?.name || "Curriculum"} &bull; Teacher: {lesson.teacher ? `${lesson.teacher.name} ${lesson.teacher.surname}` : "Assigned"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                      <Clock className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-500" />
                      <span>
                        {formatTime(lesson.startTime)} - {formatTime(lesson.endTime)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Academic Report Card / Scores */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-400" />
                <span>My Report Card</span>
              </CardTitle>
              <Badge variant="indigo">{avgScore}% Term GPA</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500 dark:text-zinc-500">
                No evaluation scores published yet.
              </div>
            ) : (
              results.map((res) => {
                const isExam = Boolean(res.examId || res.exam);
                const title = res.exam?.title || res.assignment?.title || "Assessment";
                return (
                  <div
                    key={res.id}
                    className="p-3 rounded-xl border border-white/5 bg-gray-900/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-gray-200 block">{title}</span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-500">
                        {isExam ? "Term Exam" : "Homework Task"}
                      </span>
                    </div>
                    <span
                      className={`font-bold text-sm ${
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
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Homework & Campus Notices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assignments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-indigo-400" />
                <span>Pending Homework & Deliverables</span>
              </CardTitle>
              <Link href="/assignments">
                <Button variant="ghost" size="sm" className="text-xs">
                  All Tasks &rarr;
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {assignmentsData?.data && assignmentsData.data.length > 0 ? (
              assignmentsData.data.slice(0, 3).map((asg) => (
                <div
                  key={asg.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-gray-900/40 text-xs"
                >
                  <div>
                    <span className="font-semibold text-gray-200">{asg.title}</span>
                    <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                      Lesson: {asg.lesson?.name || "Curriculum"}
                    </div>
                  </div>
                  <Badge variant="warning">Due {formatDate(asg.dueDate)}</Badge>
                </div>
              ))
            ) : (
              <div className="text-xs text-zinc-500 dark:text-zinc-500 py-4 text-center">
                No homework assignments pending.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-pink-400" />
                <span>Classroom Notices</span>
              </CardTitle>
              <Link href="/announcements">
                <Button variant="ghost" size="sm" className="text-xs">
                  Noticeboard &rarr;
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {announcementsData?.data && announcementsData.data.length > 0 ? (
              announcementsData.data.slice(0, 3).map((an) => (
                <div
                  key={an.id}
                  className="p-3 rounded-lg border border-white/5 bg-gray-900/40 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-200">{an.title}</span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-500">{formatDate(an.date)}</span>
                  </div>
                  <p className="text-gray-400 text-[11px] line-clamp-2">{an.description}</p>
                </div>
              ))
            ) : (
              <div className="text-xs text-zinc-500 dark:text-zinc-500 py-4 text-center">
                No active announcements right now.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
