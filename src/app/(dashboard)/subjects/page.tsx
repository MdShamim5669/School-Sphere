"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Plus,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  UserCheck,
} from "lucide-react";
import {
  useSubjects,
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
} from "@/hooks/use-academic";
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
import { Subject } from "@/types";
import { formatDate } from "@/lib/utils";

export default function SubjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: subjectsData, isLoading } = useSubjects({ searchTerm });
  const { data: teachersData } = useTeachers({ limit: 100 });

  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();
  const deleteMutation = useDeleteSubject();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    teacherIds: [] as string[],
  });

  const openCreate = () => {
    setFormData({ name: "", teacherIds: [] });
    setIsCreateOpen(true);
  };

  const openEdit = (sub: Subject) => {
    setEditSubject(sub);
    setFormData({
      name: sub.name,
      teacherIds: sub.teachers?.map((t) => t.id) || [],
    });
  };

  const toggleTeacher = (teacherId: string) => {
    setFormData((prev) => ({
      ...prev,
      teacherIds: prev.teacherIds.includes(teacherId)
        ? prev.teacherIds.filter((id) => id !== teacherId)
        : [...prev.teacherIds, teacherId],
    }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      name: formData.name,
      teacherIds: formData.teacherIds,
    });
    setIsCreateOpen(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSubject) return;
    await updateMutation.mutateAsync({
      id: editSubject.id,
      data: {
        name: formData.name,
        teacherIds: formData.teacherIds,
      },
    });
    setEditSubject(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const subjects = subjectsData?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Curriculum Subjects"
        description="Define school subjects and assign specialized faculty members."
      >
        <Button onClick={openCreate} variant="gradient" className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Add Subject</span>
        </Button>
      </PageHeader>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 dark:text-zinc-500" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search subject (e.g. Mathematics, Physics)..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Subjects Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      ) : subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No subjects registered"
          description="Build your curriculum by adding subjects like Mathematics, English, Biology."
          actionLabel="Add Subject"
          onAction={openCreate}
        />
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 overflow-hidden shadow-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject Name</TableHead>
                <TableHead>Assigned Teachers</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-600/20 border border-pink-500/30 text-pink-400">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-white">{sub.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5 max-w-md">
                      {sub.teachers && sub.teachers.length > 0 ? (
                        sub.teachers.map((t) => (
                          <Badge key={t.id} variant="secondary" className="gap-1">
                            <UserCheck className="h-3 w-3 text-emerald-400" />
                            {t.name} {t.surname}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-zinc-500 dark:text-zinc-500">No teachers assigned</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-600 dark:text-zinc-400">
                    {formatDate(sub.createdAt)}
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
                          onClick={() => openEdit(sub)}
                          className="gap-2"
                        >
                          <Edit2 className="h-4 w-4 text-emerald-400" />
                          <span>Edit Subject</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(sub.id)}
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

      {/* Create Subject Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Curriculum Subject</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Subject Name (Unique)</label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Mathematics"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400 block">Assign Faculty Teachers</label>
              <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-gray-950/50">
                {teachersData?.data?.map((t) => {
                  const isChecked = formData.teacherIds.includes(t.id);
                  return (
                    <div
                      key={t.id}
                      onClick={() => toggleTeacher(t.id)}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                        isChecked
                          ? "bg-indigo-600/20 border-indigo-500/40 text-white"
                          : "border-transparent text-zinc-700 dark:text-zinc-300 hover:bg-white/5"
                      }`}
                    >
                      <span>
                        {t.name} {t.surname}
                      </span>
                      <Badge variant={isChecked ? "indigo" : "outline"} className="text-[10px]">
                        {isChecked ? "Selected" : "Select"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Save Subject"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Subject Modal */}
      <Dialog open={Boolean(editSubject)} onOpenChange={() => setEditSubject(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Subject Name</label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400 block">Assigned Teachers</label>
              <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-gray-950/50">
                {teachersData?.data?.map((t) => {
                  const isChecked = formData.teacherIds.includes(t.id);
                  return (
                    <div
                      key={t.id}
                      onClick={() => toggleTeacher(t.id)}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                        isChecked
                          ? "bg-indigo-600/20 border-indigo-500/40 text-white"
                          : "border-transparent text-zinc-700 dark:text-zinc-300 hover:bg-white/5"
                      }`}
                    >
                      <span>
                        {t.name} {t.surname}
                      </span>
                      <Badge variant={isChecked ? "indigo" : "outline"} className="text-[10px]">
                        {isChecked ? "Selected" : "Select"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditSubject(null)}>
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
        title="Delete Subject"
        description="Are you sure you want to delete this subject? Lessons referencing this subject will be affected."
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
