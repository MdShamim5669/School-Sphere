"use client";

import React, { useState } from "react";
import {
  Calendar,
  Plus,
  Clock,
  UserCheck,
  BookOpen,
  Layers,
  MoreHorizontal,
  Edit2,
  Trash2,
} from "lucide-react";
import {
  useLessons,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
} from "@/hooks/use-lessons";
import { useSubjects, useClasses } from "@/hooks/use-academic";
import { useTeachers } from "@/hooks/use-teachers";
import PageHeader from "@/components/shared/page-header";
import EmptyState from "@/components/shared/empty-state";
import ConfirmDialog from "@/components/shared/confirm-dialog";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Lesson, DayOfWeek } from "@/types";
import { formatTime } from "@/lib/utils";

const DAYS: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const STANDARD_TIME_SLOTS = [
  { label: "Period 1", start: "08:00", end: "09:00" },
  { label: "Period 2", start: "09:00", end: "10:00" },
  { label: "Period 3", start: "10:15", end: "11:15" },
  { label: "Period 4", start: "11:15", end: "12:15" },
  { label: "Period 5", start: "13:00", end: "14:00" },
  { label: "Period 6", start: "14:00", end: "15:00" },
  { label: "Period 7", start: "15:00", end: "16:00" },
  { label: "Period 8", start: "16:00", end: "17:00" },
];

const timeToISO = (timeStr: string) => {
  if (!timeStr) return "2026-09-02T08:00:00.000Z";
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date("2026-09-02T00:00:00.000Z");
  d.setUTCHours(h || 0, m || 0, 0, 0);
  return d.toISOString();
};

const isoToTime = (isoStr: string) => {
  if (!isoStr) return "08:00";
  try {
    const d = new Date(isoStr);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  } catch {
    return "08:00";
  }
};

export default function LessonsPage() {
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  const { data: lessonsData, isLoading } = useLessons({
    day: selectedDay || undefined,
    classId: selectedClassId || undefined,
    limit: 100,
  });

  const { data: subjectsData } = useSubjects({ limit: 100 });
  const { data: classesData } = useClasses({ limit: 100 });
  const { data: teachersData } = useTeachers({ limit: 100 });

  const createMutation = useCreateLesson();
  const updateMutation = useUpdateLesson();
  const deleteMutation = useDeleteLesson();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editLesson, setEditLesson] = useState<Lesson | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    day: "MONDAY" as DayOfWeek,
    startTime: "2026-09-02T08:00:00.000Z",
    endTime: "2026-09-02T09:00:00.000Z",
    subjectId: "",
    classId: "",
    teacherId: "",
  });

  const openCreate = () => {
    setFormData({
      name: "",
      day: "MONDAY",
      startTime: "2026-09-02T08:00:00.000Z",
      endTime: "2026-09-02T09:00:00.000Z",
      subjectId: subjectsData?.data?.[0]?.id || "",
      classId: classesData?.data?.[0]?.id || "",
      teacherId: teachersData?.data?.[0]?.id || "",
    });
    setIsCreateOpen(true);
  };

  const openEdit = (lesson: Lesson) => {
    setEditLesson(lesson);
    setFormData({
      name: lesson.name,
      day: lesson.day,
      startTime: lesson.startTime,
      endTime: lesson.endTime,
      subjectId: lesson.subjectId,
      classId: lesson.classId,
      teacherId: lesson.teacherId,
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(formData);
    setIsCreateOpen(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLesson) return;
    await updateMutation.mutateAsync({
      id: editLesson.id,
      data: formData,
    });
    setEditLesson(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const lessons = lessonsData?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timetable & Lesson Schedules"
        description="Schedule weekly class periods, assign subject teachers, and avoid room conflicts."
      >
        <Button onClick={openCreate} variant="gradient" className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Schedule Lesson</span>
        </Button>
      </PageHeader>

      {/* Day Selector & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Day Pills */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-gray-900/80 border border-zinc-200 dark:border-zinc-800 w-full sm:w-auto">
          <button
            onClick={() => setSelectedDay("")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              selectedDay === ""
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            All Days
          </button>
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize cursor-pointer ${
                selectedDay === day
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>

        {/* Class Filter */}
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-gray-200"
        >
          <option value="">All Classes</option>
          {classesData?.data?.map((c) => (
            <option key={c.id} value={c.id}>
              Class {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Lessons Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      ) : lessons.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No lessons scheduled"
          description="There are no classes scheduled for this period. Click below to add a lesson."
          actionLabel="Schedule Lesson"
          onAction={openCreate}
        />
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 overflow-hidden shadow-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lesson & Subject</TableHead>
                <TableHead>Day of Week</TableHead>
                <TableHead>Time Slot</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Assigned Teacher</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lessons.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{lesson.name}</div>
                        <div className="text-xs text-indigo-400">
                          {lesson.subject?.name || "Subject"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="indigo" className="font-mono">
                      {lesson.day}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-mono">
                      <Clock className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-500" />
                      <span>
                        {formatTime(lesson.startTime)} - {formatTime(lesson.endTime)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">Class {lesson.class?.name || "—"}</Badge>
                  </TableCell>
                  <TableCell>
                    {lesson.teacher ? (
                      <div className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                        <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                        <span>
                          {lesson.teacher.name} {lesson.teacher.surname}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-500 dark:text-zinc-500">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => openEdit(lesson)}
                          className="gap-2"
                        >
                          <Edit2 className="h-4 w-4 text-emerald-400" />
                          <span>Edit Lesson</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(lesson.id)}
                          className="gap-2 text-red-400 focus:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Schedule Lesson Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule New Lesson</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Lesson Name</label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Morning Algebra"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">Day of Week</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-gray-100"
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value as DayOfWeek })}
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">Subject</label>
                <select
                  required
                  className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-gray-100"
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                >
                  <option value="">Select Subject</option>
                  {subjectsData?.data?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">Class</label>
                <select
                  required
                  className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-gray-100"
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                >
                  <option value="">Select Class</option>
                  {classesData?.data?.map((c) => (
                    <option key={c.id} value={c.id}>
                      Class {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">Teacher</label>
                <select
                  required
                  className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-gray-100"
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                >
                  <option value="">Select Teacher</option>
                  {teachersData?.data?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.surname}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Standard Academic Time Slots */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  Standard Class Time Slots
                </label>
                <span className="text-[11px] text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                  {isoToTime(formData.startTime)} – {isoToTime(formData.endTime)}
                </span>
              </div>

              {/* 1-Click Preset Periods */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STANDARD_TIME_SLOTS.map((slot) => {
                  const isSelected =
                    isoToTime(formData.startTime) === slot.start &&
                    isoToTime(formData.endTime) === slot.end;

                  return (
                    <button
                      key={slot.label}
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          startTime: timeToISO(slot.start),
                          endTime: timeToISO(slot.end),
                        });
                      }}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-blue-500 bg-blue-500/20 text-blue-400 font-semibold shadow-xs scale-102"
                          : "border-zinc-200 dark:border-zinc-800 bg-gray-900/70 text-zinc-700 dark:text-zinc-300 hover:border-white/20 hover:bg-gray-800/70"
                      }`}
                    >
                      <div className="text-[10px] text-gray-400 font-medium">{slot.label}</div>
                      <div className="text-xs font-mono font-semibold">{slot.start} - {slot.end}</div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Time Pickers */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-600 dark:text-zinc-400">Custom Start Time</label>
                  <Input
                    type="time"
                    required
                    value={isoToTime(formData.startTime)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        startTime: timeToISO(e.target.value),
                      })
                    }
                    className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-600 dark:text-zinc-400">Custom End Time</label>
                  <Input
                    type="time"
                    required
                    value={isoToTime(formData.endTime)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        endTime: timeToISO(e.target.value),
                      })
                    }
                    className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Scheduling..." : "Schedule Lesson"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Lesson Modal */}
      <Dialog open={Boolean(editLesson)} onOpenChange={() => setEditLesson(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Lesson Schedule</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Lesson Name</label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">Day</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-gray-100"
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value as DayOfWeek })}
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">Teacher</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-gray-100"
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                >
                  {teachersData?.data?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.surname}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Standard Academic Time Slots for Edit */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  Standard Class Time Slots
                </label>
                <span className="text-[11px] text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                  {isoToTime(formData.startTime)} – {isoToTime(formData.endTime)}
                </span>
              </div>

              {/* 1-Click Preset Periods */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STANDARD_TIME_SLOTS.map((slot) => {
                  const isSelected =
                    isoToTime(formData.startTime) === slot.start &&
                    isoToTime(formData.endTime) === slot.end;

                  return (
                    <button
                      key={slot.label}
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          startTime: timeToISO(slot.start),
                          endTime: timeToISO(slot.end),
                        });
                      }}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-blue-500 bg-blue-500/20 text-blue-400 font-semibold shadow-xs scale-102"
                          : "border-zinc-200 dark:border-zinc-800 bg-gray-900/70 text-zinc-700 dark:text-zinc-300 hover:border-white/20 hover:bg-gray-800/70"
                      }`}
                    >
                      <div className="text-[10px] text-gray-400 font-medium">{slot.label}</div>
                      <div className="text-xs font-mono font-semibold">{slot.start} - {slot.end}</div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Time Pickers */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-600 dark:text-zinc-400">Custom Start Time</label>
                  <Input
                    type="time"
                    required
                    value={isoToTime(formData.startTime)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        startTime: timeToISO(e.target.value),
                      })
                    }
                    className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-600 dark:text-zinc-400">Custom End Time</label>
                  <Input
                    type="time"
                    required
                    value={isoToTime(formData.endTime)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        endTime: timeToISO(e.target.value),
                      })
                    }
                    className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditLesson(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={() => setDeleteId(null)}
        title="Cancel Lesson"
        description="Are you sure you want to remove this scheduled lesson from the timetable?"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
