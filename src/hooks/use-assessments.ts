import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api, { getErrorMessage } from "@/lib/api";
import { ApiResponse, AssignmentItem, ExamItem, ResultItem } from "@/types";

// ============ EXAMS ============
export function useExams(params: { page?: number; limit?: number; searchTerm?: string } = {}) {
  return useQuery({
    queryKey: ["exams", params],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ExamItem[]>>("/exams", { params });
      return res.data;
    },
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; startTime: string; endTime: string; lessonId: string }) => {
      const res = await api.post<ApiResponse<ExamItem>>("/exams", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Exam created successfully");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useUpdateExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ExamItem> }) => {
      const res = await api.patch<ApiResponse<ExamItem>>(`/exams/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Exam updated successfully");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<ApiResponse<ExamItem>>(`/exams/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Exam deleted successfully");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

// ============ ASSIGNMENTS ============
export function useAssignments(params: { page?: number; limit?: number; searchTerm?: string } = {}) {
  return useQuery({
    queryKey: ["assignments", params],
    queryFn: async () => {
      const res = await api.get<ApiResponse<AssignmentItem[]>>("/assignments", { params });
      return res.data;
    },
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; startDate: string; dueDate: string; lessonId: string }) => {
      const res = await api.post<ApiResponse<AssignmentItem>>("/assignments", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      toast.success("Assignment created successfully");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AssignmentItem> }) => {
      const res = await api.patch<ApiResponse<AssignmentItem>>(`/assignments/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      toast.success("Assignment updated successfully");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<ApiResponse<AssignmentItem>>(`/assignments/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      toast.success("Assignment deleted successfully");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

// ============ RESULTS ============
export function useResults(
  params: {
    page?: number;
    limit?: number;
    studentId?: string;
    examId?: string;
    assignmentId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  } = {}
) {
  return useQuery({
    queryKey: ["results", params],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ResultItem[]>>("/results", { params });
      return res.data;
    },
  });
}

export function useCreateResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { score: number; studentId: string; examId?: string; assignmentId?: string }) => {
      const res = await api.post<ApiResponse<ResultItem>>("/results", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results"] });
      toast.success("Score recorded successfully");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useUpdateResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { score: number } }) => {
      const res = await api.patch<ApiResponse<ResultItem>>(`/results/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results"] });
      toast.success("Score updated successfully");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<ApiResponse<ResultItem>>(`/results/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results"] });
      toast.success("Score deleted");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
