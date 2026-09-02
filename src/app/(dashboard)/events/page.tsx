"use client";

import React, { useState, useRef } from "react";
import {
  CalendarDays,
  Plus,
  Search,
  Trash2,
  Clock,
  Layers,
  Upload,
  Image as ImageIcon,
  X,
} from "lucide-react";
import {
  useEvents,
  useCreateEvent,
  useDeleteEvent,
  useUploadEventImage,
} from "@/hooks/use-notices";
import { useClasses } from "@/hooks/use-academic";
import VisualDateTimePicker from "@/components/ui/visual-datetime-picker";
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
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: eventsData, isLoading } = useEvents({ searchTerm });
  const { data: classesData } = useClasses({ limit: 100 });

  const createMutation = useCreateEvent();
  const deleteMutation = useDeleteEvent();
  const uploadImageMutation = useUploadEventImage();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "2026-09-20T10:00:00.000Z",
    endTime: "2026-09-20T12:00:00.000Z",
    img: "",
    classId: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const openCreate = () => {
    setFormData({
      title: "",
      description: "",
      startTime: "2026-09-20T10:00:00.000Z",
      endTime: "2026-09-20T12:00:00.000Z",
      img: "",
      classId: "",
    });
    setImageFile(null);
    setPreviewUrl(null);
    setIsCreateOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        startTime: formData.startTime,
        endTime: formData.endTime,
        img: formData.img || undefined,
        classId: formData.classId || undefined,
      });

      // If an image file was selected, upload directly to Cloudinary (school-sphere/events folder)
      if (imageFile && res.data?.id) {
        await uploadImageMutation.mutateAsync({
          id: res.data.id,
          file: imageFile,
        });
      }

      setIsCreateOpen(false);
    } catch (err) {
      // Error handled by mutations
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const events = eventsData?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campus Events Calendar"
        description="Plan academic seminars, athletic meets, parent conferences, and graduation ceremonies."
      >
        <Button onClick={openCreate} variant="gradient" className="gap-2">
          <Plus className="h-4 w-4" />
          <span>New Event</span>
        </Button>
      </PageHeader>

      {/* Events Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No events on the calendar"
          description="Schedule a school assembly, parent-teacher meeting, or sports day."
          actionLabel="Create Event"
          onAction={openCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => {
            const eventImg = ev.img || ev.image;
            return (
              <Card
                key={ev.id}
                className="overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between group shadow-sm"
              >
                {/* Event Picture handled from backend */}
                {eventImg && (
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <img
                      src={eventImg}
                      alt={ev.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={ev.class ? "indigo" : "secondary"} className="text-[10px]">
                      {ev.class ? `Class ${ev.class.name}` : "School-wide"}
                    </Badge>
                    <button
                      onClick={() => setDeleteId(ev.id)}
                      className="text-zinc-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                      title="Delete Event"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <CardTitle className="mt-2 text-base font-bold text-zinc-900 dark:text-white font-heading">
                    {ev.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {ev.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 space-y-1.5 border-t border-zinc-100 dark:border-zinc-800/80 mt-2 py-3">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                    <Clock className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span>{formatDateTime(ev.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 font-mono pl-5">
                    <span>until {formatDateTime(ev.endTime)}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Event Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-[#111114] border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="font-heading">Add Campus Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            {/* Event Picture Upload to Cloudinary */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Event Picture (Cloudinary: school-sphere/events)
              </label>

              {previewUrl ? (
                <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-5 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-blue-500 bg-zinc-50 dark:bg-zinc-900/50 cursor-pointer transition-colors"
                >
                  <Upload className="h-6 w-6 text-zinc-400 mb-1.5" />
                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Click to select event picture
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">PNG, JPG, WebP up to 5MB</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Or Direct Image URL */}
              {!imageFile && (
                <div className="pt-1">
                  <Input
                    type="url"
                    placeholder="Or enter direct image URL (https://...)"
                    value={formData.img}
                    onChange={(e) => setFormData({ ...formData, img: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Event Title</label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Digital Marketing Workshop"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Description</label>
              <textarea
                required
                rows={3}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Event agenda, guest speakers, location..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Target Cohort (Optional)</label>
              <select
                className="flex h-9 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100"
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              >
                <option value="">Whole Campus (All Cohorts)</option>
                {classesData?.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    Class {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Start Time</label>
                <VisualDateTimePicker
                  value={formData.startTime}
                  onChange={(iso) => setFormData({ ...formData, startTime: iso })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">End Time</label>
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
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending || uploadImageMutation.isPending}
              >
                {createMutation.isPending || uploadImageMutation.isPending
                  ? "Saving Event..."
                  : "Save Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Event"
        description="Are you sure you want to cancel and remove this event from the calendar?"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
