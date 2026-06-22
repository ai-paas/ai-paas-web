import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export interface Credential {
  id?: string;
  provider?: string;
  name?: string;
  description?: string;
  active?: boolean;
  credentialKeys?: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CreateCredentialRequest {
  provider: string;
  name: string;
  description?: string;
  credentials?: Record<string, string>;
}

// CSP 자격증명 목록
export const useGetCredentials = (params?: { provider?: string }) => {
  const searchParams = params?.provider ? { provider: params.provider } : undefined;
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['credentials', searchParams],
    queryFn: () =>
      api
        .get('any-cloud/credentials', { searchParams })
        .json<{ data?: { items?: Credential[] } | Credential[]; items?: Credential[] }>(),
  });

  const items =
    (data && 'data' in data && Array.isArray(data.data) ? data.data : undefined) ??
    (data && 'data' in data && data.data && 'items' in data.data ? data.data.items : undefined) ??
    (data && 'items' in data ? data.items : undefined) ??
    [];

  return { credentials: items, isPending, isError, error };
};

// CSP 자격증명 단건 조회
export const useGetCredential = (credentialId?: string) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['credential', credentialId],
    queryFn: () => api.get(`any-cloud/credentials/${credentialId}`).json<Credential>(),
    enabled: !!credentialId,
  });

  return { credential: data, isPending, isError, error };
};

// CSP 자격증명 등록
export const useCreateCredential = (options?: {
  onSuccess?: (data: Credential) => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess, error } = useMutation({
    mutationKey: ['createCredential'],
    mutationFn: (data: CreateCredentialRequest) =>
      api.post('any-cloud/credentials', { json: data }).json<Credential>(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
      options?.onSuccess?.(data);
    },
    onError: (err) => options?.onError?.(err),
  });

  return { createCredential: mutate, isPending, isError, isSuccess, error };
};

// CSP 자격증명 삭제
export const useDeleteCredential = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess, error } = useMutation({
    mutationKey: ['deleteCredential'],
    mutationFn: (credentialId: string) =>
      api.delete(`any-cloud/credentials/${credentialId}`).json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
      options?.onSuccess?.();
    },
    onError: (err) => options?.onError?.(err),
  });

  return { deleteCredential: mutate, isPending, isError, isSuccess, error };
};
