import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api, { getErrorMessage } from "@/lib/api";
import { ApiResponse, Parent } from "@/types";

interface ParentFilters {
  page?: number;
  limit?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function useParents(filters: ParentFilters = {}) {
  return useQuery({
    queryKey: ["parents", filters],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Parent[]>>("/parents", {
        params: filters,
      });
      return res.data;
    },
  });
}

export function useParent(id: string) {
  return useQuery({
    queryKey: ["parent", id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Parent>>(`/parents/${id}`);
      return res.data.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await api.post<ApiResponse<Parent>>("/parents", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parents"] });
      toast.success("Parent account created successfully");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useUpdateParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, any> }) => {
      const res = await api.patch<ApiResponse<Parent>>(`/parents/${id}`, data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["parents"] });
      queryClient.invalidateQueries({ queryKey: ["parent", variables.id] });
      toast.success("Parent updated successfully");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<ApiResponse<Parent>>(`/parents/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parents"] });
      toast.success("Parent account deleted");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
