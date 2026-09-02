import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api, { getErrorMessage } from "@/lib/api";
import { ApiResponse, Teacher } from "@/types";

interface TeacherFilters {
  page?: number;
  limit?: number;
  searchTerm?: string;
  subjectId?: string;
  classId?: string;
  sex?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function useTeachers(filters: TeacherFilters = {}) {
  return useQuery({
    queryKey: ["teachers", filters],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Teacher[]>>("/teachers", {
        params: filters,
      });
      return res.data;
    },
  });
}

export function useTeacher(id: string) {
  return useQuery({
    queryKey: ["teacher", id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Teacher>>(`/teachers/${id}`);
      return res.data.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await api.post<ApiResponse<Teacher>>("/teachers", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("Teacher created successfully");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, any> }) => {
      const res = await api.patch<ApiResponse<Teacher>>(`/teachers/${id}`, data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["teacher", variables.id] });
      toast.success("Teacher updated successfully");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<ApiResponse<Teacher>>(`/teachers/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("Teacher deleted successfully");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
