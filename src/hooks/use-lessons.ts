import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api, { getErrorMessage } from "@/lib/api";
import { ApiResponse, Lesson } from "@/types";

interface LessonFilters {
  page?: number;
  limit?: number;
  searchTerm?: string;
  day?: string;
  classId?: string;
  teacherId?: string;
  subjectId?: string;
}

export function useLessons(filters: LessonFilters = {}) {
  return useQuery({
    queryKey: ["lessons", filters],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Lesson[]>>("/lessons", {
        params: filters,
      });
      return res.data;
    },
  });
}

export function useLesson(id: string) {
  return useQuery({
    queryKey: ["lesson", id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Lesson>>(`/lessons/${id}`);
      return res.data.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await api.post<ApiResponse<Lesson>>("/lessons", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      toast.success("Lesson scheduled successfully");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, any> }) => {
      const res = await api.patch<ApiResponse<Lesson>>(`/lessons/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      toast.success("Lesson updated successfully");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<ApiResponse<Lesson>>(`/lessons/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      toast.success("Lesson removed");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
