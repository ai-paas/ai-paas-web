import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Page } from '../../types/api';
import type {
  Vm,
  VmCreateRequest,
  VmPatchRequest,
  GetVmsParams,
  VmSshKey,
  VmNodeList,
} from '../../types/vm';

// 백엔드 응답 envelope 안의 data 가 PagedData<T>{items: T[]} 또는 T[] 일 수 있어 양쪽 모두 unwrap.
type ListEnvelope<T> = {
  success?: boolean;
  data?: T[] | { items?: T[]; nextPageToken?: string | null };
};

// ============= VM 목록 =============
export const useGetVms = (params: GetVmsParams = {}) => {
  const searchParams = Object.fromEntries(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => [k, String(v)])
  );

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['vms', searchParams],
    queryFn: () => api.get('any-cloud/vms', { searchParams }).json<ListEnvelope<Vm>>(),
  });

  const vms: Vm[] = (() => {
    const raw = data?.data;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    return raw.items ?? [];
  })();

  return { vms, isPending, isError, error, refetch };
};

// ============= 단일 VM 상세 =============
export const useGetVm = (vmName?: string, enabled: boolean = true) => {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['vm', vmName],
    queryFn: () => api.get(`any-cloud/vms/${vmName}`).json<{ data?: Vm } | Vm>(),
    enabled: enabled && !!vmName,
  });

  const vm: Vm | undefined = data && typeof data === 'object' && 'data' in data ? data.data : (data as Vm | undefined);
  return { vm, isPending, isError, refetch };
};

// ============= VM 생성 (Pulumi provision 트리거) =============
export const useCreateVm = (options?: {
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();
  const { mutate, isPending, isError, isSuccess, error } = useMutation({
    mutationKey: ['createVm'],
    mutationFn: (data: VmCreateRequest) =>
      api.post('any-cloud/vms', { json: data }).json<unknown>(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vms'] });
      options?.onSuccess?.(data);
    },
    onError: (error) => options?.onError?.(error),
  });
  return { createVm: mutate, isPending, isError, isSuccess, error };
};

// ============= VM scale (workerCount 변경) =============
export const useScaleVm = (options?: {
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();
  const { mutate, isPending, isError, isSuccess, error } = useMutation({
    mutationKey: ['scaleVm'],
    mutationFn: ({ vmName, request }: { vmName: string; request: VmPatchRequest }) =>
      api.patch(`any-cloud/vms/${vmName}`, { json: request }).json<unknown>(),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vms'] });
      queryClient.invalidateQueries({ queryKey: ['vm', variables.vmName] });
      options?.onSuccess?.(data);
    },
    onError: (error) => options?.onError?.(error),
  });
  return { scaleVm: mutate, isPending, isError, isSuccess, error };
};

// ============= VM 삭제 (Pulumi destroy 트리거) =============
export const useDeleteVm = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();
  const { mutate, isPending, isError, isSuccess, error } = useMutation({
    mutationKey: ['deleteVm'],
    mutationFn: (vmName: string) => api.delete(`any-cloud/vms/${vmName}`).json<unknown>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vms'] });
      options?.onSuccess?.();
    },
    onError: (error) => options?.onError?.(error),
  });
  return { deleteVm: mutate, isPending, isError, isSuccess, error };
};

// ============= VM operations (이력 / 재시도) =============
export const useGetVmOperations = (vmName?: string, pageSize: number = 50) => {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['vm-operations', vmName, pageSize],
    queryFn: () =>
      api
        .get(`any-cloud/vms/${vmName}/operations`, { searchParams: { pageSize } })
        .json<Page<unknown>>(),
    enabled: !!vmName,
  });
  return { operations: data, isPending, isError, refetch };
};

export const useRetryVmOperation = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: ({ vmName, type }: { vmName: string; type: string }) =>
      api.post(`any-cloud/vms/${vmName}/operations`, { json: { type } }).json<unknown>(),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vm', variables.vmName] });
      queryClient.invalidateQueries({ queryKey: ['vm-operations', variables.vmName] });
      options?.onSuccess?.();
    },
    onError: (error) => options?.onError?.(error),
  });
  return { retryOperation: mutate, isPending };
};

// ============= VM state history =============
export const useGetVmStateHistory = (vmName?: string, pageSize: number = 50) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['vm-state-history', vmName, pageSize],
    queryFn: () =>
      api
        .get(`any-cloud/vms/${vmName}/state-history`, { searchParams: { pageSize } })
        .json<Page<unknown>>(),
    enabled: !!vmName,
  });
  return { history: data, isPending, isError };
};

// ============= VM 노드 목록 =============
export const useGetVmNodes = (vmName?: string) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['vm-nodes', vmName],
    queryFn: () => api.get(`any-cloud/vms/${vmName}/nodes`).json<VmNodeList>(),
    enabled: !!vmName,
  });
  return { nodes: data, isPending, isError };
};

// ============= VM SSH key 발급 =============
export const useIssueVmSshKey = (options?: {
  onSuccess?: (data: VmSshKey) => void;
  onError?: (error: unknown) => void;
}) => {
  const { mutate, isPending, isError, isSuccess, error } = useMutation({
    mutationFn: (vmName: string) =>
      api.post(`any-cloud/vms/${vmName}/ssh-key`, { searchParams: { format: 'json' } }).json<VmSshKey>(),
    onSuccess: (data) => options?.onSuccess?.(data),
    onError: (error) => options?.onError?.(error),
  });
  return { issueSshKey: mutate, isPending, isError, isSuccess, error };
};

// ============= VM kubeconfig 다운로드 =============
export const downloadVmKubeconfig = async (vmName: string, params: Record<string, string | number> = {}) => {
  const searchParams = Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]));
  const text = await api.get(`any-cloud/vms/${vmName}/kubeconfig`, { searchParams }).text();
  const blob = new Blob([text], { type: 'application/yaml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${vmName}-kubeconfig.yaml`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
