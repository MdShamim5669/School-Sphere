"use client";

import React, { useState } from "react";
import {
  Megaphone,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  useAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
} from "@/hooks/use-notices";
import { useClasses } from "@/hooks/use-academic";
import PageHeader from "@/components/shared/page-header";
import EmptyState from "@/components/shared/empty-state";
import ConfirmDialog from "@/components/shared/confirm-dialog";
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

export default function AnnouncementsPage() {
  const { data: announcementsData, isLoading } = useAnnouncements({ limit: 100 });
  const { data: classesData } = useClasses({ limit: 100 });

  const createMutation = useCreateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString(),
    classId: "",
  });

  const openCreate = () => {
    setFormData({
      title: "",
      description: "",
      date: new Date().toISOString(),
      classId: "",
    });
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      ...formData,
      classId: formData.classId || undefined,
    });
    setIsCreateOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const announcements = announcementsData?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Noticeboard & Announcements"
        description="Broadcast school news, term schedules, holiday alerts, and emergency bulletins."
      >
        <Button onClick={openCreate} variant="gradient" className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Post Announcement</span>
        </Button>
      </PageHeader>

      {/* Announcements List */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No notices broadcasted"
          description="Keep your campus community informed by posting announcements."
          actionLabel="Post Notice"
          onAction={openCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((notice) => (
            <Card key={notice.id} className="hover:border-indigo-500/30 transition-all flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={notice.class ? "indigo" : "success"}>
                    {notice.class ? `Class ${notice.class.name}` : "Campus-Wide"}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 dark:text-zinc-500">{formatDate(notice.date)}</span>
                    <button
                      onClick={() => setDeleteId(notice.id)}
                      className="text-gray-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                      title="Delete notice"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <CardTitle className="mt-2 text-lg font-bold text-white">
                  {notice.title}
                </CardTitle>
                <CardDescription className="text-gray-300 text-xs whitespace-pre-line mt-2 leading-relaxed">
                  {notice.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 border-t border-white/5 py-2.5 text-[11px] text-zinc-500 dark:text-zinc-500">
                Posted to School Sphere Portal
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Broadcast Announcement Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Broadcast Announcement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Notice Title</label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Midterm Break Schedule"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Announcement Content</label>
              <textarea
                required
                rows={4}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed announcement bulletin..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Broadcast Target</label>
              <select
                className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-gray-100"
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              >
                <option value="">Campus-Wide (All Grades & Classes)</option>
                {classesData?.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    Class {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Date (ISO)</label>
              <Input
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Broadcasting..." : "Broadcast Notice"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Notice"
        description="Are you sure you want to remove this announcement bulletin?"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
