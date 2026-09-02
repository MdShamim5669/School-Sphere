"use client";

import React, { useState } from "react";
import {
  ClipboardList,
  Plus,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  Calendar,
} from "lucide-react";
import {
  useAssignments,
  useCreateAssignment,
  useUpdateAssignment,
  useDeleteAssignment,
} from "@/hooks/use-assessments";
import { useLessons } from "@/hooks/use-lessons";
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
import { AssignmentItem } from "@/types";
import { formatDate } from "@/lib/utils";

export default function AssignmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: assignmentsData, isLoading } = useAssignments({ searchTerm });
  const { data: lessonsData } = useLessons({ limit: 100 });

  const createMutation = useCreateAssignment();
  const updateMutation = useUpdateAssignment();
  const deleteMutation = useDeleteAssignment();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editAssignment, setEditAssignment] = useState<AssignmentItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    startDate: "2026-09-05T00:00:00.000Z",
    dueDate: "2026-09-12T23:59:59.000Z",
    lessonId: "",
  });

  const openCreate = () => {
    setFormData({
      title: "",
      startDate: "2026-09-05T00:00:00.000Z",
      dueDate: "2026-09-12T23:59:59.000Z",
      lessonId: lessonsData?.data?.[0]?.id || "",
    });
    setIsCreateOpen(true);
  };

  const openEdit = (assignment: AssignmentItem) => {
    setEditAssignment(assignment);
    setFormData({
      title: assignment.title,
      startDate: assignment.startDate,
      dueDate: assignment.dueDate,
      lessonId: assignment.lessonId,
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(formData);
    setIsCreateOpen(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAssignment) return;
    await updateMutation.mutateAsync({
      id: editAssignment.id,
      data: formData,
    });
    setEditAssignment(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const assignments = assignmentsData?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coursework & Assignments"
        description="Track homework, coursework projects, submission deadlines, and student deliverables."
      >
        <Button onClick={openCreate} variant="gradient" className="gap-2">
          <Plus className="h-4 w-4" />
          <span>New Assignment</span>
        </Button>
      </PageHeader>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 dark:text-zinc-500" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search assignments..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Assignments Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assignments created"
          description="Create your first assignment task for students."
          actionLabel="Create Assignment"
          onAction={openCreate}
        />
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 overflow-hidden shadow-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assignment</TableHead>
                <TableHead>Lesson Link</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((asg) => (
                <TableRow key={asg.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400">
                        <ClipboardList className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-white">{asg.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{asg.lesson?.name || "Lesson"}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-600 dark:text-zinc-400">
                    {formatDate(asg.startDate)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="warning">{formatDate(asg.dueDate)}</Badge>
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
                          onClick={() => openEdit(asg)}
                          className="gap-2"
                        >
                          <Edit2 className="h-4 w-4 text-emerald-400" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(asg.id)}
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

      {/* Create Assignment Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Post New Assignment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Title</label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Chapter 4 Problem Set"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Associated Lesson</label>
              <select
                required
                className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-gray-100"
                value={formData.lessonId}
                onChange={(e) => setFormData({ ...formData, lessonId: e.target.value })}
              >
                <option value="">Select Lesson</option>
                {lessonsData?.data?.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">Start Date (ISO)</label>
                <Input
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">Due Date (ISO)</label>
                <Input
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Post Assignment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Assignment Modal */}
      <Dialog open={Boolean(editAssignment)} onOpenChange={() => setEditAssignment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Title</label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditAssignment(null)}>
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
        title="Delete Assignment"
        description="Are you sure you want to remove this assignment?"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
