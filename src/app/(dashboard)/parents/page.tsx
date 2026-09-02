"use client";

import React, { useState } from "react";
import {
  HeartHandshake,
  Plus,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Users,
  X,
  GraduationCap,
} from "lucide-react";
import {
  useParents,
  useCreateParent,
  useUpdateParent,
  useDeleteParent,
} from "@/hooks/use-parents";
import { useStudents } from "@/hooks/use-students";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import PageHeader from "@/components/shared/page-header";
import EmptyState from "@/components/shared/empty-state";
import ConfirmDialog from "@/components/shared/confirm-dialog";
import Pagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Parent } from "@/types";
import { formatDate } from "@/lib/utils";

export default function ParentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data: parentsData, isLoading } = useParents({
    searchTerm: searchTerm.trim() || undefined,
    page,
    limit,
    sortBy,
    sortOrder,
  });

  const { data: allStudentsData } = useStudents({ limit: 100 });
  const queryClient = useQueryClient();

  const createMutation = useCreateParent();
  const updateMutation = useUpdateParent();
  const deleteMutation = useDeleteParent();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewParent, setViewParent] = useState<Parent | null>(null);
  const [editParent, setEditParent] = useState<Parent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    surname: "",
    email: "",
    phone: "",
    address: "",
    studentIds: [] as string[],
  });

  const openCreate = () => {
    setFormData({
      username: "",
      password: "",
      name: "",
      surname: "",
      email: "",
      phone: "",
      address: "",
      studentIds: [],
    });
    setIsCreateOpen(true);
  };

  const openEdit = (parent: Parent) => {
    setEditParent(parent);
    setFormData({
      username: parent.username,
      password: "",
      name: parent.name,
      surname: parent.surname,
      email: parent.email || "",
      phone: parent.phone,
      address: parent.address,
      studentIds: parent.students?.map((s) => s.id) || [],
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { studentIds, ...rawPayload } = formData;
    const cleanParentData: Record<string, any> = {
      username: rawPayload.username.trim(),
      password: rawPayload.password,
      name: rawPayload.name.trim(),
      surname: rawPayload.surname.trim(),
      phone: rawPayload.phone.trim(),
      address: rawPayload.address.trim(),
    };
    if (rawPayload.email?.trim()) {
      cleanParentData.email = rawPayload.email.trim();
    }

    const createdRes = await createMutation.mutateAsync(cleanParentData);
    const newParentId = createdRes?.data?.id;

    if (newParentId && studentIds && studentIds.length > 0) {
      await Promise.all(
        studentIds.map((sid) =>
          api.patch(`/students/${sid}`, { parentId: newParentId })
        )
      );
      queryClient.invalidateQueries({ queryKey: ["parents"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    }

    setIsCreateOpen(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editParent) return;
    const { password, username, studentIds, ...rawPayload } = formData;

    // 1. Update parent details (clean payload without studentIds to avoid Prisma validation error)
    const cleanParentData: Record<string, any> = {
      name: rawPayload.name.trim(),
      surname: rawPayload.surname.trim(),
      phone: rawPayload.phone.trim(),
      address: rawPayload.address.trim(),
    };
    if (rawPayload.email?.trim()) {
      cleanParentData.email = rawPayload.email.trim();
    }

    await updateMutation.mutateAsync({
      id: editParent.id,
      data: cleanParentData,
    });

    // 2. Link each selected student to this parent
    if (studentIds && studentIds.length > 0) {
      await Promise.all(
        studentIds.map((sid) =>
          api.patch(`/students/${sid}`, { parentId: editParent.id })
        )
      );
      queryClient.invalidateQueries({ queryKey: ["parents"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    }

    setEditParent(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const parents = parentsData?.data || [];
  const meta = parentsData?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parents & Guardians"
        description="Manage family contact records, emergency numbers, and student guardianships."
      >
        <Button onClick={openCreate} variant="gradient" className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Add Parent</span>
        </Button>
      </PageHeader>

      {/* Filter and Search Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name, phone, email..."
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
              <option value="createdAt-desc">Sort: Newest First</option>
              <option value="createdAt-asc">Sort: Oldest First</option>
              <option value="name-asc">Sort: Name (A to Z)</option>
              <option value="name-desc">Sort: Name (Z to A)</option>
            </select>

            {/* Reset Button */}
            {(searchTerm || sortBy !== "createdAt" || sortOrder !== "desc") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSortBy("createdAt");
                  setSortOrder("desc");
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
            Total: <span className="font-semibold text-zinc-900 dark:text-white">{meta?.total ?? parents.length}</span> parents
          </div>
        </div>
      </div>

      {/* Parents Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      ) : parents.length === 0 ? (
        <EmptyState
          icon={HeartHandshake}
          title="No parents found"
          description="No parent records match your criteria. Add a parent to link with enrolled students."
          actionLabel="Add Parent"
          onAction={openCreate}
        />
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 overflow-hidden shadow-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parent / Guardian</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Enrolled Children</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parents.map((parent) => (
                <TableRow key={parent.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-800">
                        <AvatarFallback className="bg-amber-600/30 text-amber-300">
                          {parent.name[0]}
                          {parent.surname[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-white">
                          {parent.name} {parent.surname}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-500">
                          @{parent.username}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                    {parent.phone}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-600 dark:text-zinc-400">
                    {parent.email || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="indigo">
                        <Users className="h-3 w-3 mr-1" />
                        {parent.students?.length ?? 0} Students
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-600 dark:text-zinc-400">
                    {formatDate(parent.createdAt)}
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
                          onClick={() => setViewParent(parent)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4 text-indigo-400" />
                          <span>View Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openEdit(parent)}
                          className="gap-2"
                        >
                          <Edit2 className="h-4 w-4 text-emerald-400" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(parent.id)}
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

          {/* Pagination Controls */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 px-4">
            <Pagination
              page={page}
              limit={limit}
              total={meta?.total ?? parents.length}
              onPageChange={setPage}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
            />
          </div>
        </div>
      )}

      {/* View Parent Modal */}
      <Dialog open={Boolean(viewParent)} onOpenChange={() => setViewParent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Parent Profile</DialogTitle>
          </DialogHeader>
          {viewParent && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border border-amber-500/30">
                  <AvatarFallback className="text-lg bg-amber-600/30 text-amber-300">
                    {viewParent.name[0]}
                    {viewParent.surname[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {viewParent.name} {viewParent.surname}
                  </h3>
                  <p className="text-xs text-amber-400 font-mono">@{viewParent.username}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-white/[0.02] p-4 rounded-xl border border-white/5">
                <div>
                  <span className="text-gray-500 block">Phone</span>
                  <span className="text-gray-200 font-mono">{viewParent.phone}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Email</span>
                  <span className="text-gray-200">{viewParent.email || "—"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 block">Residential Address</span>
                  <span className="text-gray-200">{viewParent.address}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-400 block mb-2">
                  Enrolled Children ({viewParent.students?.length ?? 0})
                </span>
                <div className="space-y-2">
                  {viewParent.students && viewParent.students.length > 0 ? (
                    viewParent.students.map((st) => (
                      <div
                        key={st.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-white/5 bg-gray-900/40 text-xs"
                      >
                        <span className="font-semibold text-gray-200">
                          {st.name} {st.surname}
                        </span>
                        <span className="text-zinc-600 dark:text-zinc-400">@{st.username}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-zinc-500 dark:text-zinc-500">No children linked yet</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Parent Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Register Parent Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">First Name</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">Last Name</label>
                <Input
                  required
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">Username</label>
                <Input
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">Password (min 6 chars)</label>
                <Input
                  required
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">Email Address</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">Phone Number (Required)</label>
                <Input
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Home Address</label>
              <Input
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            {/* Assigned Children / Students (Son / Daughter) */}
            <div className="space-y-2 pt-1 border-t border-zinc-200 dark:border-zinc-800">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-blue-500" />
                  Assigned Children / Students (Son / Daughter)
                </span>
                <span className="text-[11px] text-blue-400 font-mono">
                  {formData.studentIds.length} Linked
                </span>
              </label>

              {/* Badges of currently selected children */}
              <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 items-center">
                {formData.studentIds.length === 0 ? (
                  <span className="text-xs text-zinc-500 dark:text-zinc-500 italic">
                    No children assigned yet. Select from the dropdown below.
                  </span>
                ) : (
                  formData.studentIds.map((sid) => {
                    const student = allStudentsData?.data?.find((s) => s.id === sid);
                    const name = student
                      ? `${student.name} ${student.surname}`
                      : "Child";
                    const className = student?.class?.name ? `Class ${student.class.name}` : "";

                    return (
                      <span
                        key={sid}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/30"
                      >
                        🎓 {name} {className && `(${className})`}
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              studentIds: formData.studentIds.filter((id) => id !== sid),
                            })
                          }
                          className="hover:text-red-400 text-gray-400 transition-colors ml-0.5 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })
                )}
              </div>

              {/* Dropdown to assign another child */}
              <select
                className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-blue-500"
                value=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (val && !formData.studentIds.includes(val)) {
                    setFormData({
                      ...formData,
                      studentIds: [...formData.studentIds, val],
                    });
                  }
                }}
              >
                <option value="">+ Assign Son / Daughter (Select Student)...</option>
                {allStudentsData?.data
                  ?.filter((s) => !formData.studentIds.includes(s.id))
                  ?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.surname} {s.class?.name ? `(Class ${s.class.name})` : ""}
                    </option>
                  ))}
              </select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Registering..." : "Create Parent"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Parent Modal */}
      <Dialog open={Boolean(editParent)} onOpenChange={() => setEditParent(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Parent Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">First Name</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">Last Name</label>
                <Input
                  required
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">Phone</label>
                <Input
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Address</label>
              <Input
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            {/* Assigned Children / Students (Son / Daughter) */}
            <div className="space-y-2 pt-1 border-t border-zinc-200 dark:border-zinc-800">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-blue-500" />
                  Assigned Children / Students (Son / Daughter)
                </span>
                <span className="text-[11px] text-blue-400 font-mono">
                  {formData.studentIds.length} Linked
                </span>
              </label>

              {/* Badges of currently selected children */}
              <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 items-center">
                {formData.studentIds.length === 0 ? (
                  <span className="text-xs text-zinc-500 dark:text-zinc-500 italic">
                    No children assigned yet. Select from the dropdown below.
                  </span>
                ) : (
                  formData.studentIds.map((sid) => {
                    const student = allStudentsData?.data?.find((s) => s.id === sid);
                    const name = student
                      ? `${student.name} ${student.surname}`
                      : "Child";
                    const className = student?.class?.name ? `Class ${student.class.name}` : "";

                    return (
                      <span
                        key={sid}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/30"
                      >
                        🎓 {name} {className && `(${className})`}
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              studentIds: formData.studentIds.filter((id) => id !== sid),
                            })
                          }
                          className="hover:text-red-400 text-gray-400 transition-colors ml-0.5 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })
                )}
              </div>

              {/* Dropdown to assign another child */}
              <select
                className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-blue-500"
                value=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (val && !formData.studentIds.includes(val)) {
                    setFormData({
                      ...formData,
                      studentIds: [...formData.studentIds, val],
                    });
                  }
                }}
              >
                <option value="">+ Assign Son / Daughter (Select Student)...</option>
                {allStudentsData?.data
                  ?.filter((s) => !formData.studentIds.includes(s.id))
                  ?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.surname} {s.class?.name ? `(Class ${s.class.name})` : ""}
                    </option>
                  ))}
              </select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditParent(null)}>
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
        title="Delete Parent Record"
        description="Are you sure you want to remove this parent? Students assigned to this parent will require guardian reassignment."
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
