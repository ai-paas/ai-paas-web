import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { queryKeys } from '@/lib/query-keys';

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
  /** 마지막 확인 결과. 없으면 확인한 적 없음 — "정상" 과 구분해야 한다. */
  /** UNKNOWN 은 검증 방법이 없는 프로바이더다. 실패와 구분해야 한다. */
  healthStatus?: 'HEALTHY' | 'UNHEALTHY' | 'UNKNOWN';
  healthKind?: string;
  healthDetail?: string;
  healthCheckedAt?: string;
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
    queryKey: queryKeys.credentials.list(searchParams),
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
    queryKey: queryKeys.credentials.detail(credentialId),
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
      queryClient.invalidateQueries({ queryKey: queryKeys.credentials.all });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.credentials.all });
      options?.onSuccess?.();
    },
    onError: (err) => options?.onError?.(err),
  });

  return { deleteCredential: mutate, isPending, isError, isSuccess, error };
};

/**
 * 자격증명 수정 — 설명과 값만. 이름과 프로바이더는 백엔드가 막는다.
 *
 * <p>값은 통째로 교체된다. 일부만 보내면 나머지는 사라진다.
 */
export const useUpdateCredential = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess, error } = useMutation({
    mutationKey: ['updateCredential'],
    mutationFn: ({
      credentialId,
      description,
      credentials,
    }: {
      credentialId: string;
      description?: string;
      credentials?: Record<string, string>;
    }) =>
      api
        .patch(`any-cloud/credentials/${credentialId}`, { json: { description, credentials } })
        .json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.credentials.all });
      options?.onSuccess?.();
    },
    onError: (err) => options?.onError?.(err),
  });

  return { updateCredential: mutate, isPending, isError, isSuccess, error };
};

export interface CredentialHealth {
  healthy: boolean;
  /** 확인 시각. 저장된 값을 그대로 받은 경우에도 채워진다. */
  checkedAt?: string;
  /** 실패 원인 분류. healthy 면 없다. */
  kind?: string;
  /** 사용자가 할 일. */
  hint?: string;
  /** CSP 원본 메시지 — 지원 문의용. */
  detail?: string;
  checkedRegions: number;
}

/**
 * 자격증명이 실제로 쓸 수 있는지 확인한다.
 *
 * 주기적으로 돌리지 않는다 — CSP 요청 제한에 걸리고 자격증명은 자주 바뀌지 않는다.
 * 확인 자체는 성공한 호출이라 healthy=false 도 200 으로 온다.
 */
/** 사용자가 누른 확인은 'check', 화면 진입 시 자동 갱신은 'refresh'. */
export interface CheckHealthArgs {
  credentialId: string;
  mode: 'check' | 'refresh';
}

export const useCheckCredentialHealth = (options?: {
  onSuccess?: (health: CredentialHealth, credentialId: string) => void;
  onError?: (error: unknown) => void;
}) => {
  const { mutate, isPending, variables } = useMutation({
    mutationKey: ['checkCredentialHealth'],
    mutationFn: async ({ credentialId, mode }: CheckHealthArgs) => {
      const path =
        mode === 'refresh'
          ? `any-cloud/credentials/${credentialId}/health/refresh`
          : `any-cloud/credentials/${credentialId}/health`;
      const res = await api.post(path).json<{ data?: CredentialHealth } | CredentialHealth>();
      return ('data' in res ? res.data : res) as CredentialHealth;
    },
    onSuccess: (health, args) => options?.onSuccess?.(health, args.credentialId),
    onError: (err) => options?.onError?.(err),
  });

  return { checkHealth: mutate, isPending, checkingId: variables?.credentialId };
};

/**
 * 오래된 것만 다시 확인한다. 최근에 확인했으면 서버가 저장값을 즉시 돌려준다.
 *
 * 훅이 아니라 함수인 이유 — 화면 진입 시 여러 건을 순서대로 부르기 때문이다.
 * 한꺼번에 던지면 CSP 요청 제한에 걸린다.
 */
export const refreshCredentialHealth = async (credentialId: string): Promise<CredentialHealth> => {
  const res = await api
    .post(`any-cloud/credentials/${credentialId}/health/refresh`)
    .json<{ data?: CredentialHealth } | CredentialHealth>();
  return ('data' in res ? res.data : res) as CredentialHealth;
};

/**
 * 등록된 자격증명 값을 가져온다.
 *
 * 목록에는 값이 없다 — 값은 이 호출로만 나오고, 누가 언제 봤는지 백엔드 감사 로그에 남는다.
 * 그래서 캐시하지 않는다. 화면을 닫으면 사라져야 한다.
 */
export const revealCredential = async (credentialId: string): Promise<Record<string, string>> => {
  const res = await api
    .get(`any-cloud/credentials/${credentialId}/reveal`)
    .json<{ data?: Record<string, string> } | Record<string, string>>();
  return ('data' in res ? res.data : res) as Record<string, string>;
};
