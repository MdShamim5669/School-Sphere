import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api, { getErrorMessage } from "@/lib/api";
import { ApiResponse, AttendanceItem } from "@/types";

interface AttendanceFilters {
  page?: number;
  limit?: number;
  date?: string;
  studentId?: string;
  lessonId?: string;
}

export function useAttendance(filters: AttendanceFilters = {}) {
  return useQuery({
    queryKey: ["attendances", filters],
    queryFn: async () => {
      const res = await api.get<ApiResponse<AttendanceItem[]>>("/attendances", {
        params: filters,
      });
      return res.data;
    },
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { date: string; present: boolean; studentId: string; lessonId: string }) => {
      const res = await api.post<ApiResponse<AttendanceItem>>("/attendances", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
      toast.success("Attendance marked");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, present }: { id: string; present: boolean }) => {
      const res = await api.patch<ApiResponse<AttendanceItem>>(`/attendances/${id}`, { present });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
      toast.success("Attendance updated");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
