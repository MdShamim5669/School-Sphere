import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api, { getErrorMessage } from "@/lib/api";
import { AnnouncementItem, ApiResponse, EventItem } from "@/types";

// ============ EVENTS ============
export function useEvents(params: { page?: number; limit?: number; searchTerm?: string; classId?: string } = {}) {
  return useQuery({
    queryKey: ["events", params],
    queryFn: async () => {
      const res = await api.get<ApiResponse<EventItem[]>>("/events", { params });
      return res.data;
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      startTime: string;
      endTime: string;
      img?: string | null;
      classId?: string;
    }) => {
      const res = await api.post<ApiResponse<EventItem>>("/events", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event added successfully");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useUploadEventImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.post<ApiResponse<EventItem>>(`/events/${id}/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event picture uploaded to Cloudinary");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useRemoveEventImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<ApiResponse<EventItem>>(`/events/${id}/image`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event picture removed");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<ApiResponse<EventItem>>(`/events/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event deleted");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

// ============ ANNOUNCEMENTS ============
export function useAnnouncements(params: { page?: number; limit?: number; searchTerm?: string; classId?: string } = {}) {
  return useQuery({
    queryKey: ["announcements", params],
    queryFn: async () => {
      const res = await api.get<ApiResponse<AnnouncementItem[]>>("/announcements", { params });
      return res.data;
    },
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description: string; date: string; classId?: string }) => {
      const res = await api.post<ApiResponse<AnnouncementItem>>("/announcements", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Announcement broadcasted successfully");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<ApiResponse<AnnouncementItem>>(`/announcements/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Announcement deleted");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
