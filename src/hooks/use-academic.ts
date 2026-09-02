import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api, { getErrorMessage } from "@/lib/api";
import { ApiResponse, ClassItem, Grade, Subject } from "@/types";

// ============ CLASSES ============
export function useClasses(
  params: {
    page?: number;
    limit?: number;
    searchTerm?: string;
    gradeId?: string;
    supervisorId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  } = {}
) {
  return useQuery({
    queryKey: ["classes", params],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ClassItem[]>>("/classes", { params });
      return res.data;
    },
  });
}

export function useClass(id: string) {
  return useQuery({
    queryKey: ["class", id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ClassItem>>(`/classes/${id}`);
      return res.data.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; capacity: number; gradeId: string; supervisorId?: string }) => {
      const res = await api.post<ApiResponse<ClassItem>>("/classes", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Class created successfully");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ClassItem> }) => {
      const res = await api.patch<ApiResponse<ClassItem>>(`/classes/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Class updated successfully");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<ApiResponse<ClassItem>>(`/classes/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Class deleted successfully");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

// ============ GRADES ============
export function useGrades() {
  return useQuery({
    queryKey: ["grades"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Grade[]>>("/grades");
      return res.data;
    },
  });
}

export function useCreateGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { level: number }) => {
      const res = await api.post<ApiResponse<Grade>>("/grades", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      toast.success("Grade level added");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

// ============ SUBJECTS ============
export function useSubjects(params: { page?: number; limit?: number; searchTerm?: string } = {}) {
  return useQuery({
    queryKey: ["subjects", params],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Subject[]>>("/subjects", { params });
      return res.data;
    },
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; teacherIds?: string[] }) => {
      const res = await api.post<ApiResponse<Subject>>("/subjects", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      toast.success("Subject created successfully");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name?: string; teacherIds?: string[] } }) => {
      const res = await api.patch<ApiResponse<Subject>>(`/subjects/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      toast.success("Subject updated successfully");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<ApiResponse<Subject>>(`/subjects/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      toast.success("Subject deleted successfully");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
