"use client";

import React, { useState } from "react";
import {
  UserCheck,
  Plus,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Calendar,
  Layers,
  X,
} from "lucide-react";
import {
  useTeachers,
  useCreateTeacher,
  useUpdateTeacher,
  useDeleteTeacher,
} from "@/hooks/use-teachers";
import { useSubjects, useCreateSubject } from "@/hooks/use-academic";
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
import { Teacher } from "@/types";
import { formatDate } from "@/lib/utils";

export default function TeachersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedSex, setSelectedSex] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data: teachersData, isLoading } = useTeachers({
    searchTerm: searchTerm.trim() || undefined,
    page,
    limit,
    subjectId: selectedSubjectId || undefined,
    sex: selectedSex || undefined,
    sortBy,
    sortOrder,
  });
  const { data: subjectsData } = useSubjects({ limit: 100 });

  const createMutation = useCreateTeacher();
  const updateMutation = useUpdateTeacher();
  const deleteMutation = useDeleteTeacher();
  const createSubjectMutation = useCreateSubject();

  // Quick Subject State
  const [quickSubjectName, setQuickSubjectName] = useState("");
  const POPULAR_SUBJECTS = ["Physics", "Chemistry", "Biology", "English", "Computer Science", "History", "Economics"];

  const handleQuickAddSubject = async (nameToAdd?: string) => {
    const name = (nameToAdd || quickSubjectName).trim();
    if (!name) return;

    // Check if it already exists
    const existing = subjectsData?.data?.find(
      (s) => s.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) {
      if (!formData.subjectIds.includes(existing.id)) {
        setFormData((prev) => ({
          ...prev,
          subjectIds: [...prev.subjectIds, existing.id],
        }));
      }
      if (!nameToAdd) setQuickSubjectName("");
      return;
    }

    try {
      const res = await createSubjectMutation.mutateAsync({ name });
      if (res?.data?.id) {
        setFormData((prev) => ({
          ...prev,
          subjectIds: [...prev.subjectIds, res.data.id],
        }));
      }
      if (!nameToAdd) setQuickSubjectName("");
    } catch (e) {
      // Handled by toast
    }
  };

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewTeacher, setViewTeacher] = useState<Teacher | null>(null);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    surname: "",
    email: "",
    phone: "",
    address: "",
    bloodType: "O_POSITIVE",
    sex: "MALE",
    birthday: "1990-01-01",
    subjectIds: [] as string[],
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
      bloodType: "O_POSITIVE",
      sex: "MALE",
      birthday: "1990-01-01",
      subjectIds: [],
    });
    setIsCreateOpen(true);
  };

  const openEdit = (teacher: Teacher) => {
    setEditTeacher(teacher);
    setFormData({
      username: teacher.username,
      password: "",
      name: teacher.name,
      surname: teacher.surname,
      email: teacher.email || "",
      phone: teacher.phone || "",
      address: teacher.address,
      bloodType: teacher.bloodType,
      sex: teacher.sex,
      birthday: teacher.birthday ? teacher.birthday.slice(0, 10) : "1990-01-01",
      subjectIds: teacher.subjects?.map((s) => s.id) || [],
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(formData);
    setIsCreateOpen(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTeacher) return;
    const { password, username, ...payload } = formData;
    await updateMutation.mutateAsync({
      id: editTeacher.id,
      data: payload,
    });
    setEditTeacher(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const teachers = teachersData?.data || [];
  const meta = teachersData?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Members"
        description="Manage school teachers, departmental subjects, and assigned classes."
      >
        <Button onClick={openCreate} variant="gradient" className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Add Teacher</span>
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
                placeholder="Search name, email, phone..."
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

            {/* Subject Filter */}
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setPage(1);
              }}
              className="h-8 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Subjects</option>
              {subjectsData?.data?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Gender Filter */}
            <select
              value={selectedSex}
              onChange={(e) => {
                setSelectedSex(e.target.value);
                setPage(1);
              }}
              className="h-8 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Genders</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
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
              <option value="createdAt-desc">Sort: Newest First</option>
              <option value="createdAt-asc">Sort: Oldest First</option>
              <option value="name-asc">Sort: Name (A to Z)</option>
              <option value="name-desc">Sort: Name (Z to A)</option>
            </select>

            {/* Reset Filters */}
            {(searchTerm || selectedSubjectId || selectedSex || sortBy !== "createdAt" || sortOrder !== "desc") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSubjectId("");
                  setSelectedSex("");
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
            Total: <span className="font-semibold text-zinc-900 dark:text-white">{meta?.total ?? teachers.length}</span> teachers
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      ) : teachers.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No teachers found"
          description="No teacher records match your criteria. Add your first faculty member."
          actionLabel="Add Teacher"
          onAction={openCreate}
        />
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 overflow-hidden shadow-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Blood & Gender</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-800">
                        <AvatarFallback>
                          {teacher.name[0]}
                          {teacher.surname[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-white">
                          {teacher.name} {teacher.surname}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-500">
                          @{teacher.username}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                      <div>{teacher.email || "No email"}</div>
                      <div className="text-zinc-500 dark:text-zinc-500">{teacher.phone || "No phone"}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects && teacher.subjects.length > 0 ? (
                        teacher.subjects.map((sub) => (
                          <Badge key={sub.id} variant="default">
                            {sub.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-zinc-500 dark:text-zinc-500">None assigned</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline">{teacher.bloodType.replace("_", " ")}</Badge>
                      <Badge variant="secondary">{teacher.sex}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-600 dark:text-zinc-400">
                    {formatDate(teacher.createdAt)}
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
                          onClick={() => setViewTeacher(teacher)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4 text-indigo-400" />
                          <span>View Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openEdit(teacher)}
                          className="gap-2"
                        >
                          <Edit2 className="h-4 w-4 text-emerald-400" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(teacher.id)}
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
              total={meta?.total ?? teachers.length}
              onPageChange={setPage}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
            />
          </div>
        </div>
      )}

      {/* View Teacher Details Modal */}
      <Dialog open={Boolean(viewTeacher)} onOpenChange={() => setViewTeacher(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Teacher Profile</DialogTitle>
          </DialogHeader>
          {viewTeacher && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border border-indigo-500/30">
                  <AvatarFallback className="text-lg">
                    {viewTeacher.name[0]}
                    {viewTeacher.surname[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {viewTeacher.name} {viewTeacher.surname}
                  </h3>
                  <p className="text-xs text-indigo-400 font-mono">@{viewTeacher.username}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-white/[0.02] p-4 rounded-xl border border-white/5">
                <div>
                  <span className="text-gray-500 block">Email</span>
                  <span className="text-gray-200">{viewTeacher.email || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Phone</span>
                  <span className="text-gray-200">{viewTeacher.phone || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Blood Type</span>
                  <span className="text-gray-200">{viewTeacher.bloodType}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Gender</span>
                  <span className="text-gray-200">{viewTeacher.sex}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Birthday</span>
                  <span className="text-gray-200">{formatDate(viewTeacher.birthday)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Address</span>
                  <span className="text-gray-200">{viewTeacher.address}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-400 block mb-2">
                  Assigned Subjects
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {viewTeacher.subjects?.map((s) => (
                    <Badge key={s.id} variant="default">
                      {s.name}
                    </Badge>
                  )) || <span className="text-xs text-zinc-500 dark:text-zinc-500">None assigned</span>}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Teacher Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Register New Teacher</DialogTitle>
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
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">Blood Type</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-gray-100"
                  value={formData.bloodType}
                  onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                >
                  <option value="A_POSITIVE">A+</option>
                  <option value="A_NEGATIVE">A-</option>
                  <option value="B_POSITIVE">B+</option>
                  <option value="B_NEGATIVE">B-</option>
                  <option value="AB_POSITIVE">AB+</option>
                  <option value="AB_NEGATIVE">AB-</option>
                  <option value="O_POSITIVE">O+</option>
                  <option value="O_NEGATIVE">O-</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">Gender</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-gray-100"
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">Birthday</label>
                <Input
                  type="date"
                  required
                  value={formData.birthday}
                  onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Residential Address</label>
              <Input
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            {/* Prepared / Teaching Subjects Selector */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Assigned / Prepared Subjects
                </label>
                <span className="text-[10px] text-zinc-400 font-normal">
                  {formData.subjectIds.length} selected
                </span>
              </div>

              {/* Existing Subjects Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 max-h-32 overflow-y-auto">
                {subjectsData?.data && subjectsData.data.length > 0 ? (
                  subjectsData.data.map((subject) => {
                    const isSelected = formData.subjectIds.includes(subject.id);
                    return (
                      <label
                        key={subject.id}
                        className={`flex items-center gap-2 p-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-medium"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              setFormData({
                                ...formData,
                                subjectIds: formData.subjectIds.filter((id) => id !== subject.id),
                              });
                            } else {
                              setFormData({
                                ...formData,
                                subjectIds: [...formData.subjectIds, subject.id],
                              });
                            }
                          }}
                          className="rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                        />
                        <span className="truncate">{subject.name}</span>
                      </label>
                    );
                  })
                ) : (
                  <p className="col-span-full text-[11px] text-zinc-400 text-center py-2">
                    No subjects in database yet. Add one below!
                  </p>
                )}
              </div>

              {/* Suggested Quick-Add Subjects */}
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400">Suggested Subjects (click to add & assign):</span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SUBJECTS.map((subName) => {
                    const existing = subjectsData?.data?.find(
                      (s) => s.name.toLowerCase() === subName.toLowerCase()
                    );
                    const isAssigned = existing && formData.subjectIds.includes(existing.id);
                    return (
                      <button
                        key={subName}
                        type="button"
                        onClick={() => handleQuickAddSubject(subName)}
                        disabled={isAssigned || createSubjectMutation.isPending}
                        className={`px-2 py-0.5 rounded-full text-[10px] border transition-all ${
                          isAssigned
                            ? "border-blue-500/30 bg-blue-500/10 text-blue-400 opacity-60 cursor-default"
                            : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:border-blue-500 hover:text-blue-500"
                        }`}
                      >
                        {isAssigned ? `✓ ${subName}` : `+ ${subName}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Subject Quick Input */}
              <div className="flex gap-2 pt-0.5">
                <Input
                  value={quickSubjectName}
                  onChange={(e) => setQuickSubjectName(e.target.value)}
                  placeholder="Or type custom subject (e.g. French, Robotics)..."
                  className="h-8 text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleQuickAddSubject();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs px-3 shrink-0"
                  disabled={!quickSubjectName.trim() || createSubjectMutation.isPending}
                  onClick={() => handleQuickAddSubject()}
                >
                  {createSubjectMutation.isPending ? "Adding..." : "+ Add"}
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Save Teacher"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Teacher Modal */}
      <Dialog open={Boolean(editTeacher)} onOpenChange={() => setEditTeacher(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Update Faculty Member</DialogTitle>
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
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Address</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            {/* Prepared / Teaching Subjects Selector for Edit */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Assigned / Prepared Subjects
                </label>
                <span className="text-[10px] text-zinc-400 font-normal">
                  {formData.subjectIds.length} selected
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 max-h-32 overflow-y-auto">
                {subjectsData?.data && subjectsData.data.length > 0 ? (
                  subjectsData.data.map((subject) => {
                    const isSelected = formData.subjectIds.includes(subject.id);
                    return (
                      <label
                        key={subject.id}
                        className={`flex items-center gap-2 p-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-medium"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              setFormData({
                                ...formData,
                                subjectIds: formData.subjectIds.filter((id) => id !== subject.id),
                              });
                            } else {
                              setFormData({
                                ...formData,
                                subjectIds: [...formData.subjectIds, subject.id],
                              });
                            }
                          }}
                          className="rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                        />
                        <span className="truncate">{subject.name}</span>
                      </label>
                    );
                  })
                ) : (
                  <p className="col-span-full text-[11px] text-zinc-400 text-center py-2">
                    No subjects in database yet. Add one below!
                  </p>
                )}
              </div>

              {/* Suggested Quick-Add Subjects */}
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400">Suggested Subjects:</span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SUBJECTS.map((subName) => {
                    const existing = subjectsData?.data?.find(
                      (s) => s.name.toLowerCase() === subName.toLowerCase()
                    );
                    const isAssigned = existing && formData.subjectIds.includes(existing.id);
                    return (
                      <button
                        key={subName}
                        type="button"
                        onClick={() => handleQuickAddSubject(subName)}
                        disabled={isAssigned || createSubjectMutation.isPending}
                        className={`px-2 py-0.5 rounded-full text-[10px] border transition-all ${
                          isAssigned
                            ? "border-blue-500/30 bg-blue-500/10 text-blue-400 opacity-60 cursor-default"
                            : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:border-blue-500 hover:text-blue-500"
                        }`}
                      >
                        {isAssigned ? `✓ ${subName}` : `+ ${subName}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Subject Quick Input */}
              <div className="flex gap-2 pt-0.5">
                <Input
                  value={quickSubjectName}
                  onChange={(e) => setQuickSubjectName(e.target.value)}
                  placeholder="Or type custom subject (e.g. French, Robotics)..."
                  className="h-8 text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleQuickAddSubject();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs px-3 shrink-0"
                  disabled={!quickSubjectName.trim() || createSubjectMutation.isPending}
                  onClick={() => handleQuickAddSubject()}
                >
                  {createSubjectMutation.isPending ? "Adding..." : "+ Add"}
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditTeacher(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Update Details"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Teacher"
        description="Are you sure you want to delete this faculty member? If the teacher is assigned to active lessons, reassign those lessons first."
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
