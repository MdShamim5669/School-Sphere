"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  Award,
  BookOpen,
  Search,
  X,
} from "lucide-react";
import {
  useResults,
  useCreateResult,
  useUpdateResult,
  useDeleteResult,
  useExams,
  useAssignments,
} from "@/hooks/use-assessments";
import { useStudents } from "@/hooks/use-students";
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
import { ResultItem } from "@/types";
import { formatDate } from "@/lib/utils";

export default function ResultsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "EXAM" | "ASSIGNMENT">("ALL");
  const [scoreTier, setScoreTier] = useState<"ALL" | "DISTINCTION" | "PASS" | "REVIEW">("ALL");
  const [sortBy, setSortBy] = useState<"score" | "createdAt">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: resultsData, isLoading } = useResults({ limit: 200, sortBy, sortOrder });
  const { data: studentsData } = useStudents({ limit: 100 });
  const { data: examsData } = useExams({ limit: 100 });
  const { data: assignmentsData } = useAssignments({ limit: 100 });

  const createMutation = useCreateResult();
  const updateMutation = useUpdateResult();
  const deleteMutation = useDeleteResult();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editResult, setEditResult] = useState<ResultItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state (Type: "EXAM" or "ASSIGNMENT")
  const [targetType, setTargetType] = useState<"EXAM" | "ASSIGNMENT">("EXAM");
  const [studentId, setStudentId] = useState("");
  const [examId, setExamId] = useState("");
  const [assignmentId, setAssignmentId] = useState("");
  const [score, setScore] = useState(85);

  const openCreate = () => {
    setTargetType("EXAM");
    setStudentId(studentsData?.data?.[0]?.id || "");
    setExamId(examsData?.data?.[0]?.id || "");
    setAssignmentId(assignmentsData?.data?.[0]?.id || "");
    setScore(85);
    setIsCreateOpen(true);
  };

  const openEdit = (res: ResultItem) => {
    setEditResult(res);
    setScore(res.score);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      score: Number(score),
      studentId,
      examId: targetType === "EXAM" ? examId : undefined,
      assignmentId: targetType === "ASSIGNMENT" ? assignmentId : undefined,
    });
    setIsCreateOpen(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editResult) return;
    await updateMutation.mutateAsync({
      id: editResult.id,
      data: { score: Number(score) },
    });
    setEditResult(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const filteredResults = useMemo(() => {
    let list = resultsData?.data || [];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((r) => {
        const studentName = `${r.student?.name || ""} ${r.student?.surname || ""}`.toLowerCase();
        const title = (r.exam?.title || r.assignment?.title || "").toLowerCase();
        return studentName.includes(q) || title.includes(q);
      });
    }

    // Type filter
    if (typeFilter === "EXAM") {
      list = list.filter((r) => Boolean(r.examId || r.exam));
    } else if (typeFilter === "ASSIGNMENT") {
      list = list.filter((r) => Boolean(r.assignmentId || r.assignment));
    }

    // Score tier filter
    if (scoreTier === "DISTINCTION") {
      list = list.filter((r) => r.score >= 80);
    } else if (scoreTier === "PASS") {
      list = list.filter((r) => r.score >= 50 && r.score < 80);
    } else if (scoreTier === "REVIEW") {
      list = list.filter((r) => r.score < 50);
    }

    // Sort
    list = [...list].sort((a, b) => {
      if (sortBy === "score") {
        return sortOrder === "asc" ? a.score - b.score : b.score - a.score;
      }
      return sortOrder === "asc"
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [resultsData?.data, searchTerm, typeFilter, scoreTier, sortBy, sortOrder]);

  const paginatedResults = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredResults.slice(start, start + limit);
  }, [filteredResults, page, limit]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gradebook & Evaluation Results"
        description="Record and analyze pupil scores across exam terms and homework assignments."
      >
        <Button onClick={openCreate} variant="gradient" className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Record Score</span>
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
                placeholder="Search student or assessment..."
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

            {/* Assessment Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as any);
                setPage(1);
              }}
              className="h-8 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Types (Exams & Assignments)</option>
              <option value="EXAM">Exams Only</option>
              <option value="ASSIGNMENT">Assignments Only</option>
            </select>

            {/* Score Tier Filter */}
            <select
              value={scoreTier}
              onChange={(e) => {
                setScoreTier(e.target.value as any);
                setPage(1);
              }}
              className="h-8 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Scores</option>
              <option value="DISTINCTION">High Distinction (80-100%)</option>
              <option value="PASS">Passing (50-79%)</option>
              <option value="REVIEW">Needs Review (&lt;50%)</option>
            </select>

            {/* Sort Selector */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split("-");
                setSortBy(newSortBy as any);
                setSortOrder(newSortOrder as "asc" | "desc");
                setPage(1);
              }}
              className="h-8 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500"
            >
              <option value="score-desc">Sort: Highest Score</option>
              <option value="score-asc">Sort: Lowest Score</option>
              <option value="createdAt-desc">Sort: Newest First</option>
              <option value="createdAt-asc">Sort: Oldest First</option>
            </select>

            {/* Reset Button */}
            {(searchTerm || typeFilter !== "ALL" || scoreTier !== "ALL" || sortBy !== "score" || sortOrder !== "desc") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("ALL");
                  setScoreTier("ALL");
                  setSortBy("score");
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
            Total: <span className="font-semibold text-zinc-900 dark:text-white">{filteredResults.length}</span> records
          </div>
        </div>
      </div>

      {/* Results Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      ) : filteredResults.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No scores found"
          description="No evaluation scores match your filter criteria."
          actionLabel="Record Score"
          onAction={openCreate}
        />
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Assessment Type</TableHead>
                <TableHead>Assessment Name</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Date Recorded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedResults.map((res) => {
                const isExam = Boolean(res.examId || res.exam);
                const assessmentTitle = res.exam?.title || res.assignment?.title || "Assessment";

                return (
                  <TableRow key={res.id}>
                    <TableCell>
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        {res.student ? `${res.student.name} ${res.student.surname}` : "Student"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isExam ? "indigo" : "warning"}>
                        {isExam ? "Exam" : "Assignment"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-700 dark:text-zinc-300">
                      {assessmentTitle}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-sm ${
                            res.score >= 80
                              ? "text-emerald-500"
                              : res.score >= 50
                              ? "text-blue-500"
                              : "text-amber-500"
                          }`}
                        >
                          {res.score}%
                        </span>
                        <Badge
                          variant={
                            res.score >= 80
                              ? "success"
                              : res.score >= 50
                              ? "default"
                              : "warning"
                          }
                        >
                          {res.score >= 80
                            ? "Distinction"
                            : res.score >= 50
                            ? "Passed"
                            : "Needs Review"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-zinc-500 dark:text-zinc-400">
                      {formatDate(res.createdAt)}
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
                            onClick={() => openEdit(res)}
                            className="gap-2"
                          >
                            <Edit2 className="h-4 w-4 text-emerald-400" />
                            <span>Edit Score</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteId(res.id)}
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
              total={filteredResults.length}
              onPageChange={setPage}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
            />
          </div>
        </div>
      )}

      {/* Record Score Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Assessment Score</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Student</label>
              <select
                required
                className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-gray-100"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              >
                <option value="">Select Student</option>
                {studentsData?.data?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.surname} (@{s.username})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Evaluation Category</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetType("EXAM")}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    targetType === "EXAM"
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "border-zinc-200 dark:border-zinc-800 text-gray-400 hover:bg-white/5"
                  }`}
                >
                  Examination
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType("ASSIGNMENT")}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    targetType === "ASSIGNMENT"
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "border-zinc-200 dark:border-zinc-800 text-gray-400 hover:bg-white/5"
                  }`}
                >
                  Assignment
                </button>
              </div>
            </div>

            {targetType === "EXAM" ? (
              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">Target Exam</label>
                <select
                  required
                  className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-gray-100"
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                >
                  <option value="">Select Exam</option>
                  {examsData?.data?.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.title}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">Target Assignment</label>
                <select
                  required
                  className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-gray-100"
                  value={assignmentId}
                  onChange={(e) => setAssignmentId(e.target.value)}
                >
                  <option value="">Select Assignment</option>
                  {assignmentsData?.data?.map((asg) => (
                    <option key={asg.id} value={asg.id}>
                      {asg.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Score / Grade (0 - 100)</label>
              <Input
                required
                type="number"
                min={0}
                max={100}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Recording..." : "Record Score"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Score Modal */}
      <Dialog open={Boolean(editResult)} onOpenChange={() => setEditResult(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Score</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Score (0 - 100)</label>
              <Input
                required
                type="number"
                min={0}
                max={100}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditResult(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Save Score"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Score"
        description="Are you sure you want to delete this grade record?"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
