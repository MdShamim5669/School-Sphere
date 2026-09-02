"use client";

import React, { useState } from "react";
import {
  Layers,
  Plus,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  Users,
  Award,
  UserCheck,
  X,
} from "lucide-react";
import {
  useClasses,
  useCreateClass,
  useUpdateClass,
  useDeleteClass,
  useGrades,
} from "@/hooks/use-academic";
import { useTeachers } from "@/hooks/use-teachers";
import PageHeader from "@/components/shared/page-header";
import EmptyState from "@/components/shared/empty-state";
import ConfirmDialog from "@/components/shared/confirm-dialog";
import Pagination from "@/components/shared/pagination";
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
import { ClassItem } from "@/types";
import { formatDate } from "@/lib/utils";

export default function ClassesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { data: classesData, isLoading } = useClasses({
    searchTerm: searchTerm.trim() || undefined,
    page,
    limit,
    gradeId: selectedGradeId || undefined,
    sortBy,
    sortOrder,
  });
  const { data: gradesData } = useGrades();
  const { data: teachersData } = useTeachers({ limit: 100 });

  const createMutation = useCreateClass();
  const updateMutation = useUpdateClass();
  const deleteMutation = useDeleteClass();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editClass, setEditClass] = useState<ClassItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    capacity: 30,
    gradeId: "",
    supervisorId: "",
  });

  const openCreate = () => {
    setFormData({
      name: "",
      capacity: 30,
      gradeId: gradesData?.data?.[0]?.id || "",
      supervisorId: "",
    });
    setIsCreateOpen(true);
  };

  const openEdit = (cls: ClassItem) => {
    setEditClass(cls);
    setFormData({
      name: cls.name,
      capacity: cls.capacity,
      gradeId: cls.gradeId,
      supervisorId: cls.supervisorId || "",
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      name: formData.name,
      capacity: Number(formData.capacity),
      gradeId: formData.gradeId,
      supervisorId: formData.supervisorId || undefined,
    });
    setIsCreateOpen(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editClass) return;
    await updateMutation.mutateAsync({
      id: editClass.id,
      data: {
        name: formData.name,
        capacity: Number(formData.capacity),
        gradeId: formData.gradeId,
        supervisorId: formData.supervisorId || undefined,
      },
    });
    setEditClass(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const classes = classesData?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classroom Management"
        description="Organize class cohorts, student capacity limits, grade levels, and supervisor teachers."
      >
        <Button onClick={openCreate} variant="gradient" className="gap-2">
          <Plus className="h-4 w-4" />
          <span>New Class</span>
        </Button>
      </PageHeader>

      {/* Filter and Search Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="Search class name (e.g. 1A, 2B)..."
                className="pl-8 pr-8 h-8 text-xs"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Grade Filter */}
            <select
              value={selectedGradeId}
              onChange={(e) => {
                setSelectedGradeId(e.target.value);
                setPage(1);
              }}
              className="h-8 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Grades</option>
              {gradesData?.data?.map((g) => (
                <option key={g.id} value={g.id}>
                  Grade {g.level}
                </option>
              ))}
            </select>

            {/* Sort Selector */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split("-");
                setSortBy(newSortBy);
                setSortOrder(newSortOrder as "asc" | "desc");
                setPage(1);
              }}
              className="h-8 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500"
            >
              <option value="name-asc">Sort: Name (A to Z)</option>
              <option value="name-desc">Sort: Name (Z to A)</option>
              <option value="capacity-desc">Sort: Capacity (High to Low)</option>
              <option value="capacity-asc">Sort: Capacity (Low to High)</option>
              <option value="createdAt-desc">Sort: Newest First</option>
            </select>

            {/* Reset Button */}
            {(searchTerm || selectedGradeId || sortBy !== "name" || sortOrder !== "asc") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedGradeId("");
                  setSortBy("name");
                  setSortOrder("asc");
                  setPage(1);
                }}
                className="h-8 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white gap-1"
              >
                <X className="h-3.5 w-3.5" />
                <span>Reset</span>
              </Button>
            )}
          </div>

          <div className="text-xs text-zinc-500 tabular-nums">
            Total: <span className="font-semibold text-zinc-900 dark:text-white">{classesData?.meta?.total ?? classes.length}</span> classes
          </div>
        </div>
      </div>

      {/* Classes Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      ) : classes.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No classes created"
          description="Create your first academic classroom to start assigning students and lessons."
          actionLabel="Add Class"
          onAction={openCreate}
        />
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 overflow-hidden shadow-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Grade Level</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Supervisor Teacher</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls) => {
                const enrolled = cls.students?.length ?? (cls._count?.students ?? 0);
                const percent = Math.round((enrolled / cls.capacity) * 100);

                return (
                  <TableRow key={cls.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400 font-bold text-sm">
                          {cls.name}
                        </div>
                        <span className="font-semibold text-white">Class {cls.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <Award className="h-3 w-3 text-indigo-400" />
                        Grade {cls.grade?.level || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 w-36">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-300 font-medium">
                            {enrolled} / {cls.capacity}
                          </span>
                          <span className="text-zinc-500 dark:text-zinc-500">{percent}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                          <div
                            className={`h-full rounded-full ${
                              percent >= 90
                                ? "bg-red-500"
                                : percent >= 75
                                ? "bg-amber-500"
                                : "bg-indigo-500"
                            }`}
                            style={{ width: `${Math.min(percent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {cls.supervisor ? (
                        <div className="flex items-center gap-2 text-xs">
                          <UserCheck className="h-4 w-4 text-emerald-400" />
                          <span className="text-gray-200">
                            {cls.supervisor.name} {cls.supervisor.surname}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-500 dark:text-zinc-500">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-zinc-600 dark:text-zinc-400">
                      {formatDate(cls.createdAt)}
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
                            onClick={() => openEdit(cls)}
                            className="gap-2"
                          >
                            <Edit2 className="h-4 w-4 text-emerald-400" />
                            <span>Edit Class</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteId(cls.id)}
                            className="gap-2 text-red-400 focus:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 px-4">
            <Pagination
              page={page}
              limit={limit}
              total={classesData?.meta?.total ?? classes.length}
              onPageChange={setPage}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
            />
          </div>
        </div>
      )}

      {/* Create Class Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Academic Class</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Class Name (Unique, e.g. 1A, 2B, 10C)</label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. 1A"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">Student Capacity</label>
                <Input
                  required
                  type="number"
                  min={1}
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">Grade Level</label>
                <select
                  required
                  className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-gray-100"
                  value={formData.gradeId}
                  onChange={(e) => setFormData({ ...formData, gradeId: e.target.value })}
                >
                  <option value="">Select Grade</option>
                  {gradesData?.data?.map((g) => (
                    <option key={g.id} value={g.id}>
                      Grade {g.level}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Supervisor Teacher (Optional)</label>
              <select
                className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-gray-100"
                value={formData.supervisorId}
                onChange={(e) => setFormData({ ...formData, supervisorId: e.target.value })}
              >
                <option value="">None (Unassigned)</option>
                {teachersData?.data?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {t.surname} (@{t.username})
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Save Class"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Class Modal */}
      <Dialog open={Boolean(editClass)} onOpenChange={() => setEditClass(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Class</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Class Name</label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">Capacity</label>
                <Input
                  required
                  type="number"
                  min={1}
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">Grade Level</label>
                <select
                  required
                  className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-gray-100"
                  value={formData.gradeId}
                  onChange={(e) => setFormData({ ...formData, gradeId: e.target.value })}
                >
                  {gradesData?.data?.map((g) => (
                    <option key={g.id} value={g.id}>
                      Grade {g.level}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Supervisor Teacher</label>
              <select
                className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-gray-100"
                value={formData.supervisorId}
                onChange={(e) => setFormData({ ...formData, supervisorId: e.target.value })}
              >
                <option value="">None (Unassigned)</option>
                {teachersData?.data?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {t.surname}
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditClass(null)}>
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
        title="Delete Class"
        description="Are you sure you want to delete this class? This will fail if there are enrolled students or active lessons assigned to it."
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
