"use client";

import React, { useState } from "react";
import { Award, Plus, Layers, Users } from "lucide-react";
import { useGrades, useCreateGrade } from "@/hooks/use-academic";
import PageHeader from "@/components/shared/page-header";
import EmptyState from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

export default function GradesPage() {
  const { data: gradesData, isLoading } = useGrades();
  const createMutation = useCreateGrade();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [level, setLevel] = useState<number>(1);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({ level: Number(level) });
    setIsCreateOpen(false);
  };

  const grades = gradesData?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Grade Levels"
        description="Configure standard academic grade tiers from Elementary through Senior High."
      >
        <Button onClick={() => setIsCreateOpen(true)} variant="gradient" className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Add Grade Level</span>
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      ) : grades.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No grade levels created"
          description="Create grade levels (e.g. Grade 1, 2, 3...) to organize your classes and students."
          actionLabel="Add Grade"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {grades.map((grade) => (
            <Card key={grade.id} className="hover:border-indigo-500/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-base">
                    {grade.level}
                  </div>
                  <Badge variant="indigo">Tier {grade.level}</Badge>
                </div>
                <CardTitle className="mt-3 text-lg">Grade {grade.level}</CardTitle>
                <CardDescription>Academic Standing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <div className="flex items-center justify-between text-xs py-1.5 border-t border-white/5">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-500" />
                    Classes
                  </span>
                  <span className="font-semibold text-gray-200">
                    {grade.classes?.length ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs py-1.5 border-t border-white/5">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-500" />
                    Students
                  </span>
                  <span className="font-semibold text-gray-200">
                    {grade.students?.length ?? 0}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-500 pt-2">
                  Created {formatDate(grade.createdAt)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Grade Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Grade Level</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Grade Level (Numeric, e.g. 1, 2, ..., 12)</label>
              <Input
                required
                type="number"
                min={1}
                max={20}
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Save Grade"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
