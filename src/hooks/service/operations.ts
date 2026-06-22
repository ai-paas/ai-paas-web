import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Operation, OperationState } from '../../types/cluster';

interface ListOperationsParams {
  state?: OperationState;
  type?: string;
  resourceType?: string;
  resourceId?: string;
  pageSize?: number;
}

// 작업 목록 조회
export const useGetOperations = (params: ListOperationsParams = {}) => {
  const searchParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['operations', searchParams],
    queryFn: () =>
      api
        .get('any-cloud/operations', { searchParams })
        .json<{
          data?: Operation[] | { items?: Operation[] };
          items?: Operation[];
        } | Operation[]>(),
  });

  // backend 응답 envelope 다중 형태:
  //   1) {data: [...]} — flat array
  //   2) {data: {items: [...], nextPageToken}} — PagedData wrapper (현재 backend)
  //   3) {items: [...]} — 일부 legacy
  //   4) [...] — raw array
  const items: Operation[] = (() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    const d = data.data;
    if (Array.isArray(d)) return d;
    if (d && typeof d === 'object' && 'items' in d) return d.items ?? [];
    if ('items' in data && Array.isArray(data.items)) return data.items;
    return [];
  })();

  return { operations: items, isPending, isError, error };
};

// 작업 단건 조회 (polling 시 refetchInterval 활용)
export const useGetOperation = (
  operationId?: string,
  options?: { refetchInterval?: number | false; enabled?: boolean }
) => {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['operation', operationId],
    queryFn: () => api.get(`any-cloud/operations/${operationId}`).json<Operation>(),
    enabled: (options?.enabled ?? true) && !!operationId,
    refetchInterval: options?.refetchInterval,
  });

  return { operation: data, isPending, isError, error, refetch };
};

// 진행 중 작업 취소
export const useCancelOperation = (options?: {
  onSuccess?: (op: Operation) => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess, error } = useMutation({
    mutationKey: ['cancelOperation'],
    mutationFn: (operationId: string) =>
      api.post(`any-cloud/operations/${operationId}/cancel`).json<Operation>(),
    onSuccess: (op, operationId) => {
      queryClient.invalidateQueries({ queryKey: ['operation', operationId] });
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      options?.onSuccess?.(op);
    },
    onError: (err) => options?.onError?.(err),
  });

  return { cancelOperation: mutate, isPending, isError, isSuccess, error };
};
