"use client";

import React, { useState } from "react";
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  Eye,
  GraduationCap,
  Calendar,
  Layers,
  HeartHandshake,
  X,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";
import {
  useStudents,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
} from "@/hooks/use-students";
import { useClasses, useGrades } from "@/hooks/use-academic";
import { useParents } from "@/hooks/use-parents";
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
import { Student } from "@/types";
import { formatDate } from "@/lib/utils";

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [selectedSex, setSelectedSex] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data: studentsData, isLoading } = useStudents({
    searchTerm: searchTerm.trim() || undefined,
    page,
    limit,
    classId: selectedClassId || undefined,
    gradeId: selectedGradeId || undefined,
    sex: selectedSex || undefined,
    sortBy,
    sortOrder,
  });

  const { data: classesData } = useClasses({ limit: 100 });
  const { data: gradesData } = useGrades();
  const { data: parentsData } = useParents({ limit: 100 });

  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const deleteMutation = useDeleteStudent();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
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
    bloodType: "A_POSITIVE",
    sex: "MALE",
    birthday: "2010-01-01",
    parentId: "",
    classId: "",
    gradeId: "",
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
      bloodType: "A_POSITIVE",
      sex: "MALE",
      birthday: "2010-01-01",
      parentId: parentsData?.data?.[0]?.id || "",
      classId: classesData?.data?.[0]?.id || "",
      gradeId: gradesData?.data?.[0]?.id || "",
    });
    setIsCreateOpen(true);
  };

  const openEdit = (student: Student) => {
    setEditStudent(student);
    setFormData({
      username: student.username,
      password: "",
      name: student.name,
      surname: student.surname,
      email: student.email || "",
      phone: student.phone || "",
      address: student.address,
      bloodType: student.bloodType,
      sex: student.sex,
      birthday: student.birthday ? student.birthday.slice(0, 10) : "2010-01-01",
      parentId: student.parentId,
      classId: student.classId,
      gradeId: student.gradeId,
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedClass = classesData?.data?.find((c) => c.id === formData.classId);
    const payload: any = {
      username: formData.username.trim(),
      password: formData.password,
      name: formData.name.trim(),
      surname: formData.surname.trim(),
      address: formData.address.trim(),
      bloodType: formData.bloodType,
      sex: formData.sex,
      birthday: new Date(formData.birthday).toISOString(),
      parentId: formData.parentId,
      classId: formData.classId,
      gradeId: selectedClass?.gradeId || formData.gradeId,
    };
    if (formData.email?.trim()) payload.email = formData.email.trim();
    if (formData.phone?.trim()) payload.phone = formData.phone.trim();

    await createMutation.mutateAsync(payload);
    setIsCreateOpen(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudent) return;
    const { password, username, ...rawPayload } = formData;
    const selectedClass = classesData?.data?.find((c) => c.id === formData.classId);
    const payload: any = {
      ...rawPayload,
      gradeId: selectedClass?.gradeId || rawPayload.gradeId,
      birthday: rawPayload.birthday ? new Date(rawPayload.birthday).toISOString() : undefined,
    };
    if (formData.email?.trim()) payload.email = formData.email.trim();
    else payload.email = undefined;
    if (formData.phone?.trim()) payload.phone = formData.phone.trim();
    else payload.phone = undefined;

    await updateMutation.mutateAsync({
      id: editStudent.id,
      data: payload,
    });
    setEditStudent(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const students = studentsData?.data || [];
  const meta = studentsData?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Directory"
        description="Manage enrolled pupils, guardian links, class placement, and academic records."
      >
        <Button onClick={openCreate} variant="gradient" className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Enroll Student</span>
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
                placeholder="Search by name, ID, phone..."
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

            {/* Class Filter */}
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setPage(1);
              }}
              className="h-8 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Classes</option>
              {classesData?.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  Class {c.name}
                </option>
              ))}
            </select>

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
              <option value="MALE">Boys (Male)</option>
              <option value="FEMALE">Girls (Female)</option>
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
              <option value="surname-asc">Sort: Surname (A to Z)</option>
            </select>

            {/* Reset Filters */}
            {(searchTerm || selectedClassId || selectedGradeId || selectedSex || sortBy !== "createdAt" || sortOrder !== "desc") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedClassId("");
                  setSelectedGradeId("");
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
            Total: <span className="font-semibold text-zinc-900 dark:text-white">{meta?.total ?? students.length}</span> students
          </div>
        </div>
      </div>

      {/* Students Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students found"
          description="No students found matching your criteria. Enroll a new student to begin."
          actionLabel="Enroll Student"
          onAction={openCreate}
        />
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 overflow-hidden shadow-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class & Grade</TableHead>
                <TableHead>Parent / Guardian</TableHead>
                <TableHead>Gender & Blood</TableHead>
                <TableHead>Birthday</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-800">
                        <AvatarFallback>
                          {student.name[0]}
                          {student.surname[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-white">
                          {student.name} {student.surname}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-500">
                          @{student.username}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="indigo">Class {student.class?.name || "—"}</Badge>
                      <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                        Grade {student.grade?.level || "—"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {student.parent ? (
                      <div className="text-xs">
                        <span className="font-medium text-gray-200">
                          {student.parent.name} {student.parent.surname}
                        </span>
                        <div className="text-zinc-500 dark:text-zinc-500">{student.parent.phone}</div>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-500 dark:text-zinc-500">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary">{student.sex}</Badge>
                      <Badge variant="outline">{student.bloodType.replace("_", " ")}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-600 dark:text-zinc-400">
                    {formatDate(student.birthday)}
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
                          onClick={() => setViewStudent(student)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4 text-indigo-400" />
                          <span>Student File</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openEdit(student)}
                          className="gap-2"
                        >
                          <Edit2 className="h-4 w-4 text-emerald-400" />
                          <span>Edit Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(student.id)}
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
              total={meta?.total ?? students.length}
              onPageChange={setPage}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
            />
          </div>
        </div>
      )}

      {/* View Student File Modal */}
      <Dialog open={Boolean(viewStudent)} onOpenChange={() => setViewStudent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Student Academic File</DialogTitle>
          </DialogHeader>
          {viewStudent && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border border-indigo-500/30">
                  <AvatarFallback className="text-lg">
                    {viewStudent.name[0]}
                    {viewStudent.surname[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {viewStudent.name} {viewStudent.surname}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="indigo">Class {viewStudent.class?.name}</Badge>
                    <Badge variant="outline">Grade {viewStudent.grade?.level}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-white/[0.02] p-4 rounded-xl border border-white/5">
                <div>
                  <span className="text-gray-500 block">Username</span>
                  <span className="text-gray-200">@{viewStudent.username}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Gender</span>
                  <span className="text-gray-200">{viewStudent.sex}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Blood Group</span>
                  <span className="text-gray-200">{viewStudent.bloodType}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Date of Birth</span>
                  <span className="text-gray-200">{formatDate(viewStudent.birthday)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 block">Home Address</span>
                  <span className="text-gray-200">{viewStudent.address}</span>
                </div>
              </div>

              {viewStudent.parent && (
                <div className="p-3 rounded-xl border border-white/5 bg-zinc-50 dark:bg-zinc-900/60">
                  <div className="flex items-center gap-2 mb-2">
                    <HeartHandshake className="h-4 w-4 text-pink-400" />
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Parent / Guardian Info
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>
                      Name: <span className="text-gray-200">{viewStudent.parent.name} {viewStudent.parent.surname}</span>
                    </div>
                    <div>
                      Phone: <span className="text-gray-200">{viewStudent.parent.phone}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enroll Student Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Enroll New Student</DialogTitle>
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

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">Class</label>
                <select
                  required
                  className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-gray-100"
                  value={formData.classId}
                  onChange={(e) => {
                    const cid = e.target.value;
                    const sc = classesData?.data?.find((c) => c.id === cid);
                    setFormData((prev) => ({
                      ...prev,
                      classId: cid,
                      gradeId: sc?.gradeId || prev.gradeId,
                    }));
                  }}
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

              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">Parent / Guardian</label>
                <select
                  required
                  className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-gray-100"
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                >
                  <option value="">Select Parent</option>
                  {parentsData?.data?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.surname} ({p.phone})
                    </option>
                  ))}
                </select>
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
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Home Address</label>
              <Input
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Enrolling..." : "Enroll Student"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Student Modal */}
      <Dialog open={Boolean(editStudent)} onOpenChange={() => setEditStudent(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Update Student Information</DialogTitle>
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

            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Address</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditStudent(null)}>
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
        title="Delete Student Record"
        description="Are you sure you want to delete this student record? This action cannot be undone."
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
