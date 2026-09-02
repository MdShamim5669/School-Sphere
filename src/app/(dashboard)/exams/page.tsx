"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Plus,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  Calendar,
  Clock,
} from "lucide-react";
import {
  useExams,
  useCreateExam,
  useUpdateExam,
  useDeleteExam,
} from "@/hooks/use-assessments";
import { useLessons } from "@/hooks/use-lessons";
import VisualDateTimePicker from "@/components/ui/visual-datetime-picker";
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
import { ExamItem } from "@/types";
import { formatDateTime } from "@/lib/utils";

export default function ExamsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: examsData, isLoading } = useExams({ searchTerm });
  const { data: lessonsData } = useLessons({ limit: 100 });

  const createMutation = useCreateExam();
  const updateMutation = useUpdateExam();
  const deleteMutation = useDeleteExam();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editExam, setEditExam] = useState<ExamItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    startTime: "2026-09-15T09:00:00.000Z",
    endTime: "2026-09-15T11:00:00.000Z",
    lessonId: "",
  });

  const openCreate = () => {
    setFormData({
      title: "",
      startTime: "2026-09-15T09:00:00.000Z",
      endTime: "2026-09-15T11:00:00.000Z",
      lessonId: lessonsData?.data?.[0]?.id || "",
    });
    setIsCreateOpen(true);
  };

  const openEdit = (exam: ExamItem) => {
    setEditExam(exam);
    setFormData({
      title: exam.title,
      startTime: exam.startTime,
      endTime: exam.endTime,
      lessonId: exam.lessonId,
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(formData);
    setIsCreateOpen(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editExam) return;
    await updateMutation.mutateAsync({
      id: editExam.id,
      data: formData,
    });
    setEditExam(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const exams = examsData?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Examinations & Assessments"
        description="Schedule standardized terms, midterm tests, and assessment windows linked to lessons."
      >
        <Button onClick={openCreate} variant="gradient" className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Schedule Exam</span>
        </Button>
      </PageHeader>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 dark:text-zinc-500" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search exams by title..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Exams Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      ) : exams.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="No exams registered"
          description="Schedule an examination test period for your curriculum lessons."
          actionLabel="Schedule Exam"
          onAction={openCreate}
        />
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 overflow-hidden shadow-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam Title</TableHead>
                <TableHead>Course Lesson</TableHead>
                <TableHead>Start Window</TableHead>
                <TableHead>End Window</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                        <FileSpreadsheet className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-white">{exam.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {exam.lesson?.name || "Lesson"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-700 dark:text-zinc-300 font-mono">
                    {formatDateTime(exam.startTime)}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-700 dark:text-zinc-300 font-mono">
                    {formatDateTime(exam.endTime)}
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
                          onClick={() => openEdit(exam)}
                          className="gap-2"
                        >
                          <Edit2 className="h-4 w-4 text-emerald-400" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(exam.id)}
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

      {/* Create Exam Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-[#111114] border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="font-heading">Schedule Examination</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Exam Title</label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Midterm Physics Exam"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Course Lesson</label>
              <select
                required
                className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                value={formData.lessonId}
                onChange={(e) => setFormData({ ...formData, lessonId: e.target.value })}
              >
                <option value="">Select Lesson</option>
                {lessonsData?.data?.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.subject?.name || "Subject"} - Class {l.class?.name || "General"})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Start Window</label>
                <VisualDateTimePicker
                  value={formData.startTime}
                  onChange={(iso) => setFormData({ ...formData, startTime: iso })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">End Window</label>
                <VisualDateTimePicker
                  value={formData.endTime}
                  onChange={(iso) => setFormData({ ...formData, endTime: iso })}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Scheduling..." : "Save Exam"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Exam Modal */}
      <Dialog open={Boolean(editExam)} onOpenChange={() => setEditExam(null)}>
        <DialogContent className="max-w-md bg-white dark:bg-[#111114] border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="font-heading">Edit Exam Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Exam Title</label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Midterm Exam"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Course Lesson</label>
              <select
                required
                className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                value={formData.lessonId}
                onChange={(e) => setFormData({ ...formData, lessonId: e.target.value })}
              >
                <option value="">Select Lesson</option>
                {lessonsData?.data?.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.subject?.name || "Subject"} - Class {l.class?.name || "General"})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Start Window</label>
                <VisualDateTimePicker
                  value={formData.startTime}
                  onChange={(iso) => setFormData({ ...formData, startTime: iso })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">End Window</label>
                <VisualDateTimePicker
                  value={formData.endTime}
                  onChange={(iso) => setFormData({ ...formData, endTime: iso })}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditExam(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={updateMutation.isPending}>
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
        title="Delete Exam"
        description="Are you sure you want to delete this examination? Any entered student scores will be removed."
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
