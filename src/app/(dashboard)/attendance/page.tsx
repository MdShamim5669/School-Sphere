"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Calendar,
  BookOpen,
  Users,
} from "lucide-react";
import {
  useAttendance,
  useMarkAttendance,
  useUpdateAttendance,
} from "@/hooks/use-attendance";
import { useLessons } from "@/hooks/use-lessons";
import { useStudents } from "@/hooks/use-students";
import PageHeader from "@/components/shared/page-header";
import EmptyState from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [selectedLessonId, setSelectedLessonId] = useState("");

  const { data: attendanceData, isLoading } = useAttendance({
    date: selectedDate ? new Date(selectedDate).toISOString() : undefined,
    lessonId: selectedLessonId || undefined,
    limit: 100,
  });

  const { data: lessonsData } = useLessons({ limit: 100 });
  const { data: studentsData } = useStudents({ limit: 100 });

  const markMutation = useMarkAttendance();
  const updateMutation = useUpdateAttendance();

  const [isMarkOpen, setIsMarkOpen] = useState(false);
  const [markForm, setMarkForm] = useState({
    date: new Date().toISOString(),
    present: true,
    studentId: "",
    lessonId: "",
  });

  const openMark = () => {
    setMarkForm({
      date: new Date(selectedDate).toISOString(),
      present: true,
      studentId: studentsData?.data?.[0]?.id || "",
      lessonId: lessonsData?.data?.[0]?.id || "",
    });
    setIsMarkOpen(true);
  };

  const handleMarkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await markMutation.mutateAsync(markForm);
    setIsMarkOpen(false);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await updateMutation.mutateAsync({
      id,
      present: !currentStatus,
    });
  };

  const records = attendanceData?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Register"
        description="Track and record student presence and absence across daily scheduled lessons."
      >
        <Button onClick={openMark} variant="gradient" className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Mark Attendance</span>
        </Button>
      </PageHeader>

      {/* Date and Lesson Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
          </div>

          <select
            value={selectedLessonId}
            onChange={(e) => setSelectedLessonId(e.target.value)}
            className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-gray-200"
          >
            <option value="">All Lessons</option>
            {lessonsData?.data?.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.day})
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-zinc-600 dark:text-zinc-400">
          Showing {records.length} records
        </div>
      </div>

      {/* Attendance Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No attendance entries"
          description="No attendance logs found for this date. Click below to take roll call."
          actionLabel="Mark Attendance"
          onAction={openMark}
        />
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 overflow-hidden shadow-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Lesson</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((rec) => (
                <TableRow key={rec.id}>
                  <TableCell>
                    <span className="font-semibold text-white">
                      {rec.student ? `${rec.student.name} ${rec.student.surname}` : "Student"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="indigo">{rec.lesson?.name || "Lesson"}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-700 dark:text-zinc-300 font-mono">
                    {formatDate(rec.date)}
                  </TableCell>
                  <TableCell>
                    {rec.present ? (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Present
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        Absent
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatus(rec.id, rec.present)}
                      className="text-xs h-7"
                    >
                      Toggle {rec.present ? "Absent" : "Present"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Mark Attendance Modal */}
      <Dialog open={isMarkOpen} onOpenChange={setIsMarkOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Student Attendance</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMarkSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Student</label>
              <select
                required
                className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-gray-100"
                value={markForm.studentId}
                onChange={(e) => setMarkForm({ ...markForm, studentId: e.target.value })}
              >
                <option value="">Select Student</option>
                {studentsData?.data?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.surname}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Lesson</label>
              <select
                required
                className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-gray-100"
                value={markForm.lessonId}
                onChange={(e) => setMarkForm({ ...markForm, lessonId: e.target.value })}
              >
                <option value="">Select Lesson</option>
                {lessonsData?.data?.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Attendance Status</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMarkForm({ ...markForm, present: true })}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    markForm.present
                      ? "bg-emerald-600/30 border-emerald-500 text-emerald-300"
                      : "border-zinc-200 dark:border-zinc-800 text-gray-400 hover:bg-white/5"
                  }`}
                >
                  Present
                </button>
                <button
                  type="button"
                  onClick={() => setMarkForm({ ...markForm, present: false })}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    !markForm.present
                      ? "bg-red-600/30 border-red-500 text-red-300"
                      : "border-zinc-200 dark:border-zinc-800 text-gray-400 hover:bg-white/5"
                  }`}
                >
                  Absent
                </button>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsMarkOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={markMutation.isPending}>
                {markMutation.isPending ? "Recording..." : "Save Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
