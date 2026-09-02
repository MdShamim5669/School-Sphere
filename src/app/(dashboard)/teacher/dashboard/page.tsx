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
  Plus,
  CheckCircle,
  FileSpreadsheet,
  ClipboardList,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useTeachers } from "@/hooks/use-teachers";
import { useLessons } from "@/hooks/use-lessons";
import { useClasses } from "@/hooks/use-academic";
import { useStudents } from "@/hooks/use-students";
import { useExams, useAssignments } from "@/hooks/use-assessments";
import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatTime, formatDate } from "@/lib/utils";

export default function TeacherDashboardPage() {
  const { data: teachersData, isLoading: loadingTeachers } = useTeachers({ limit: 50 });
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");

  const teachers = teachersData?.data || [];
  const activeTeacher =
    teachers.find((t) => t.id === selectedTeacherId) || teachers[0];

  // Fetch lessons assigned to this teacher
  const { data: lessonsData } = useLessons({
    teacherId: activeTeacher?.id,
    limit: 100,
  });

  // Fetch supervised class or all classes
  const { data: classesData } = useClasses({ limit: 100 });
  const supervisedClasses = classesData?.data?.filter(
    (c) => c.supervisorId === activeTeacher?.id
  ) || [];

  // Fetch students in this teacher's classes
  const targetClassId = supervisedClasses[0]?.id || classesData?.data?.[0]?.id;
  const { data: studentsData } = useStudents({
    classId: targetClassId,
    limit: 20,
  });

  const { data: examsData } = useExams({ limit: 10 });
  const { data: assignmentsData } = useAssignments({ limit: 10 });

  const teacherLessons = lessonsData?.data || [];

  return (
    <div className="space-y-8">
      {/* Page Header with Teacher Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-1.5">
            <UserCheck className="h-3.5 w-3.5" />
            <span>Faculty Educator Workspace</span>
          </div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-white">
            Teacher Classroom Hub
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Instructional timetable, classroom management, roll call, and grade assessment tools.
          </p>
        </div>

        {/* Teacher Switcher dropdown */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-zinc-500 shrink-0">Faculty:</span>
          <select
            value={activeTeacher?.id || ""}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="h-8 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white focus:outline-none focus:border-zinc-700"
          >
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {t.surname} (@{t.username})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Teacher Profile Summary Banner */}
      {activeTeacher && (
        <div className="rounded-xl border border-zinc-800/80 bg-[#111114] p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <Avatar className="h-12 w-12 border border-zinc-700/60 shadow-sm">
                <AvatarFallback className="bg-zinc-800 text-sm text-zinc-200 font-semibold">
                  {activeTeacher.name[0]}
                  {activeTeacher.surname[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-white">
                    {activeTeacher.name} {activeTeacher.surname}
                  </h2>
                  <Badge variant="secondary" className="text-[10px]">
                    Faculty
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                  <span>@{activeTeacher.username}</span>
                  <span>&bull;</span>
                  <span>{activeTeacher.email || "faculty@schoolsphere.edu"}</span>
                  <span>&bull;</span>
                  <span>{activeTeacher.phone || "+1 (555) 019-2834"}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link href="/attendance">
                <Button size="sm" className="gap-1.5 text-xs h-8">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Take Attendance</span>
                </Button>
              </Link>
              <Link href="/exams">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                  <FileSpreadsheet className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Create Exam</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-zinc-800/80 text-xs">
            <div>
              <span className="text-zinc-500 block text-[11px]">Assigned Lessons</span>
              <span className="text-sm font-semibold text-white tabular-nums">{teacherLessons.length}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[11px]">Curriculum Subjects</span>
              <span className="text-sm font-semibold text-white tabular-nums">
                {activeTeacher.subjects?.length ?? 1}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[11px]">Supervised Class</span>
              <span className="text-sm font-semibold text-white">
                {supervisedClasses.length > 0 ? `Class ${supervisedClasses[0].name}` : "None"}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[11px]">Demographics</span>
              <span className="text-sm font-semibold text-white">
                {activeTeacher.sex} &bull; {activeTeacher.bloodType.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Teaching Schedule & Class Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Teaching Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-emerald-400" />
                  <span>Teaching Timetable & Periods</span>
                </CardTitle>
                <CardDescription>
                  Your scheduled lecture hours and classroom assignments
                </CardDescription>
              </div>
              <Link href="/lessons">
                <Button variant="ghost" size="sm" className="text-xs">
                  Full Timetable &rarr;
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {teacherLessons.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500 dark:text-zinc-500">
                No lessons assigned to this instructor currently. Schedule lessons in Timetable.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {teacherLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="py-3 flex items-center justify-between gap-4 transition-colors hover:bg-white/[0.02] px-2 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 font-bold text-xs">
                        {lesson.day.slice(0, 3)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-white">{lesson.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                          <span className="text-indigo-400">{lesson.subject?.name || "Subject"}</span>
                          <span>&bull;</span>
                          <span>Class {lesson.class?.name || "Cohort"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                        <Clock className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-500" />
                        <span>
                          {formatTime(lesson.startTime)} - {formatTime(lesson.endTime)}
                        </span>
                      </div>
                      <Link href="/attendance">
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          Roll Call
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Supervised Class Student Roster */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-400" />
                  <span>Student Roster</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  {supervisedClasses[0] ? `Class ${supervisedClasses[0].name}` : "Enrolled Pupils"}
                </CardDescription>
              </div>
              <Link href="/students">
                <Button variant="ghost" size="sm" className="text-xs">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {studentsData?.data && studentsData.data.length > 0 ? (
              studentsData.data.slice(0, 6).map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8 border border-zinc-200 dark:border-zinc-800">
                      <AvatarFallback className="text-[11px]">
                        {st.name[0]}
                        {st.surname[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-xs text-white">
                        {st.name} {st.surname}
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-500 font-mono">
                        @{st.username}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    Class {st.class?.name}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-zinc-500 dark:text-zinc-500">
                No students enrolled in this class yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Grading & Assessment Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Exams to Grade */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-indigo-400" />
                <span>Scheduled Examinations</span>
              </CardTitle>
              <Link href="/exams">
                <Button variant="ghost" size="sm" className="text-xs">
                  Manage &rarr;
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {examsData?.data && examsData.data.length > 0 ? (
              examsData.data.slice(0, 3).map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-gray-900/40 text-xs"
                >
                  <div>
                    <span className="font-semibold text-gray-200">{ex.title}</span>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-500 font-mono">
                      {formatDate(ex.startTime)}
                    </div>
                  </div>
                  <Link href="/results">
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Enter Scores
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-xs text-zinc-500 dark:text-zinc-500 py-4 text-center">
                No examinations pending grade entry.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assignments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-violet-400" />
                <span>Coursework Assignments</span>
              </CardTitle>
              <Link href="/assignments">
                <Button variant="ghost" size="sm" className="text-xs">
                  Manage &rarr;
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
                    <div className="text-[11px] text-amber-400 font-mono">
                      Due {formatDate(asg.dueDate)}
                    </div>
                  </div>
                  <Link href="/results">
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Grade Submissions
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-xs text-zinc-500 dark:text-zinc-500 py-4 text-center">
                No assignments active.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
