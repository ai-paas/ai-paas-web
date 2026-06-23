import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Page } from '../../types/api';
import type {
  BootstrapInfo,
  Cluster,
  ClusterRegistrationResponse,
  CreateClusterRequest,
  GetClustersParams,
  UpdateClusterRequest,
  Operation,
  KubernetesNode,
  KubernetesNamespace,
  KubernetesDeployment,
  KubernetesReplicaSet,
  KubernetesPod,
  KubernetesService,
  KubernetesDaemonSet,
  GpuScheduling,
  KubernetesServiceAccount,
  KubernetesConfigMap,
  KubernetesSecret,
} from '../../types/cluster';

// 클러스터 종합 health
export const useGetClusterHealth = (clusterName?: string, enabled: boolean = true) => {
  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['cluster-health', clusterName],
    queryFn: () =>
      api.get(`any-cloud/system/cluster/${clusterName}/health`).json<Record<string, unknown>>(),
    enabled: enabled && !!clusterName,
    refetchInterval: 30000,
  });
  return { health: data, isPending, isFetching, isError, error, refetch };
};

// 클러스터별 작업 이력
export const useGetClusterOperations = (
  clusterName?: string,
  params?: Record<string, string | number>,
  enabled: boolean = true
) => {
  const searchParams = params
    ? Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== null && v !== '')
          .map(([k, v]) => [k, String(v)])
      )
    : undefined;
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['cluster-operations', clusterName, searchParams],
    queryFn: () =>
      api
        .get(`any-cloud/system/cluster/${clusterName}/operations`, { searchParams })
        .json<{ data?: Operation[] | { items?: Operation[] }; items?: Operation[] }>(),
    enabled: enabled && !!clusterName,
  });
  const items =
    (data && 'data' in data && Array.isArray(data.data) ? data.data : undefined) ??
    (data && 'data' in data && data.data && 'items' in data.data ? data.data.items : undefined) ??
    (data && 'items' in data ? data.items : undefined) ??
    [];
  return { operations: items, isPending, isError, error };
};

// VM 클러스터 workflow state 변경 이력
export const useGetClusterStateHistory = (clusterName?: string, enabled: boolean = true) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['cluster-state-history', clusterName],
    queryFn: () =>
      api
        .get(`any-cloud/system/cluster/${clusterName}/state-history`)
        .json<{ data?: unknown[] | { items?: unknown[] }; items?: unknown[] }>(),
    enabled: enabled && !!clusterName,
  });
  const items =
    (data && 'data' in data && Array.isArray(data.data) ? data.data : undefined) ??
    (data && 'data' in data && data.data && 'items' in data.data ? data.data.items : undefined) ??
    (data && 'items' in data ? data.items : undefined) ??
    [];
  return { history: items, isPending, isError, error };
};

// 클러스터 지원 kind 목록
export const useGetClusterResourceKinds = (clusterName?: string, enabled: boolean = true) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['cluster-resource-kinds', clusterName],
    queryFn: () =>
      api
        .get(`any-cloud/system/cluster/${clusterName}/resource-kinds`)
        .json<{ data?: unknown[] | { items?: unknown[] }; items?: unknown[] }>(),
    enabled: enabled && !!clusterName,
    staleTime: 60000,
  });
  const items =
    (data && 'data' in data && Array.isArray(data.data) ? data.data : undefined) ??
    (data && 'data' in data && data.data && 'items' in data.data ? data.data.items : undefined) ??
    (data && 'items' in data ? data.items : undefined) ??
    [];
  return { kinds: items, isPending, isError, error };
};

// K8s 리소스 생성 (YAML 적용)
export const useCreateKubernetesResource = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();
  const { mutate, isPending, isError, isSuccess, error } = useMutation({
    mutationKey: ['createKubernetesResource'],
    mutationFn: ({
      resourceType,
      clusterName,
      namespace,
      body,
    }: {
      resourceType: string;
      clusterName: string;
      namespace?: string;
      body: Record<string, unknown>;
    }) => {
      const searchParams: Record<string, string> = { clusterName };
      if (namespace) searchParams.namespace = namespace;
      return api
        .post(`any-cloud/kubernetes/${resourceType}`, {
          searchParams,
          json: body,
        })
        .json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kubernetes-pods'] });
      queryClient.invalidateQueries({ queryKey: ['kubernetes-deployments'] });
      queryClient.invalidateQueries({ queryKey: ['kubernetes-services'] });
      queryClient.invalidateQueries({ queryKey: ['kubernetes-config-maps'] });
      queryClient.invalidateQueries({ queryKey: ['kubernetes-secrets'] });
      options?.onSuccess?.();
    },
    onError: (err) => options?.onError?.(err),
  });
  return { createResource: mutate, isPending, isError, isSuccess, error };
};

// K8s 단일 리소스 상세 조회 — drawer Overview/YAML 표시에 사용
export const useGetKubernetesResource = (
  resourceType: string | undefined,
  resourceName: string | undefined,
  clusterName?: string,
  namespace?: string,
  enabled: boolean = true
) => {
  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['kubernetes-resource', resourceType, resourceName, clusterName, namespace],
    queryFn: async () => {
      const searchParams: Record<string, string> = { clusterName: clusterName! };
      if (namespace) searchParams.namespace = namespace;
      const raw = await api
        .get(`any-cloud/kubernetes/${resourceType}/${encodeURIComponent(resourceName!)}`, {
          searchParams,
        })
        .json<Record<string, unknown> | { data?: Record<string, unknown> }>();
      // envelope 처리 — `{ data: {...} }` 또는 raw
      if (raw && typeof raw === 'object' && 'data' in raw && raw.data) {
        return raw.data as Record<string, unknown>;
      }
      return raw as Record<string, unknown>;
    },
    enabled: enabled && !!resourceType && !!resourceName && !!clusterName,
    retry: 1,
    refetchOnWindowFocus: false,
  });
  return { resource: data, isPending, isFetching, isError, error, refetch };
};

// K8s 리소스 삭제
export const useDeleteKubernetesResource = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();
  const { mutate, mutateAsync, isPending, isError, error } = useMutation({
    mutationKey: ['deleteKubernetesResource'],
    mutationFn: ({
      resourceType,
      resourceName,
      clusterName,
      namespace,
    }: {
      resourceType: string;
      resourceName: string;
      clusterName: string;
      namespace?: string;
    }) => {
      const searchParams: Record<string, string> = { clusterName };
      if (namespace) searchParams.namespace = namespace;
      return api
        .delete(`any-cloud/kubernetes/${resourceType}/${encodeURIComponent(resourceName)}`, {
          searchParams,
        })
        .json();
    },
    onSuccess: () => {
      // 모든 K8s list query 무효화 — kind 별로 enumerate 하기보다 prefix 일괄 처리
      queryClient.invalidateQueries({ queryKey: ['kubernetes-pods'] });
      queryClient.invalidateQueries({ queryKey: ['kubernetes-deployments'] });
      queryClient.invalidateQueries({ queryKey: ['kubernetes-replicasets'] });
      queryClient.invalidateQueries({ queryKey: ['kubernetes-daemonsets'] });
      queryClient.invalidateQueries({ queryKey: ['kubernetes-services'] });
      queryClient.invalidateQueries({ queryKey: ['kubernetes-config-maps'] });
      queryClient.invalidateQueries({ queryKey: ['kubernetes-secrets'] });
      queryClient.invalidateQueries({ queryKey: ['kubernetes-service-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['kubernetes-namespaces'] });
      queryClient.invalidateQueries({ queryKey: ['kubernetes-nodes'] });
      options?.onSuccess?.();
    },
    onError: (err) => options?.onError?.(err),
  });
  return { deleteResource: mutate, deleteResourceAsync: mutateAsync, isPending, isError, error };
};

// K8s Event 목록 조회 — drawer 의 이벤트 탭에서 사용. involvedObject 필터링은 backend 에서 처리.
export const useGetKubernetesEvents = (
  resourceType?: string,
  resourceName?: string,
  clusterName?: string,
  namespace?: string,
  enabled: boolean = true
) => {
  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['kubernetes-events', resourceType, resourceName, clusterName, namespace],
    queryFn: async () => {
      const searchParams: Record<string, string> = { clusterName: clusterName! };
      if (namespace) searchParams.namespace = namespace;
      const raw = await api
        .get(`any-cloud/kubernetes/${resourceType}/${encodeURIComponent(resourceName!)}/events`, {
          searchParams,
        })
        .json<unknown>();
      // backend / gateway shape 다양성 대응 — raw 가 envelope / payload / 직배열 어느 형태든 array 로 정규화.
      const items = extractItems(raw);
      return items;
    },
    enabled: enabled && !!resourceType && !!resourceName && !!clusterName,
    refetchOnWindowFocus: false,
  });
  return {
    events: Array.isArray(data) ? data : [],
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  };
};

/**
 * Events response 정규화. agent 가 K8s List wrapper (kind: EventList, items: [...]) 통째로
 * 보내므로 backend / gateway 거친 후 envelope 는 { data: { items: { kind, items: [...] } } }
 * 형태. 아래는 그 외 변종까지 다 잡는 안전망.
 */
function extractItems(raw: unknown): Array<Record<string, unknown>> {
  return findItemsArray(raw, 0) ?? [];
}

function findItemsArray(
  node: unknown,
  depth: number,
): Array<Record<string, unknown>> | null {
  if (depth > 4) return null;
  if (Array.isArray(node)) return node as Array<Record<string, unknown>>;
  if (!node || typeof node !== 'object') return null;
  const obj = node as Record<string, unknown>;
  const directItems = obj.items;
  if (Array.isArray(directItems)) return directItems as Array<Record<string, unknown>>;
  for (const key of ['items', 'data']) {
    const next = obj[key];
    if (next !== undefined) {
      const found = findItemsArray(next, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

// K8s 리소스 재시작 — pods: delete / deployments+: rollout restart annotation patch (backend 가 분기)
export const useRestartKubernetesResource = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();
  const { mutate, mutateAsync, isPending, isError, error } = useMutation({
    mutationKey: ['restartKubernetesResource'],
    mutationFn: ({
      resourceType,
      resourceName,
      clusterName,
      namespace,
    }: {
      resourceType: string;
      resourceName: string;
      clusterName: string;
      namespace?: string;
    }) => {
      const searchParams: Record<string, string> = { clusterName };
      if (namespace) searchParams.namespace = namespace;
      return api
        .post(`any-cloud/kubernetes/${resourceType}/${encodeURIComponent(resourceName)}/restart`, {
          searchParams,
        })
        .json();
    },
    onSuccess: () => {
      // 워크로드 리스트 + 단건 + events 무효화 — 재시작 직후 readyReplicas 0 → 회복 흐름이 자연스럽게 보이도록.
      queryClient.invalidateQueries({ queryKey: ['kubernetes-pods'] });
      queryClient.invalidateQueries({ queryKey: ['kubernetes-deployments'] });
      queryClient.invalidateQueries({ queryKey: ['kubernetes-replicasets'] });
      queryClient.invalidateQueries({ queryKey: ['kubernetes-daemonsets'] });
      queryClient.invalidateQueries({ queryKey: ['kubernetes-resource'] });
      queryClient.invalidateQueries({ queryKey: ['kubernetes-events'] });
      options?.onSuccess?.();
    },
    onError: (err) => options?.onError?.(err),
  });
  return { restartResource: mutate, restartResourceAsync: mutateAsync, isPending, isError, error };
};

// K8s 리소스 스케일 — deployments/replicasets/statefulsets 의 replicas 변경
export const useScaleKubernetesResource = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();
  const { mutate, mutateAsync, isPending, isError, error } = useMutation({
    mutationKey: ['scaleKubernetesResource'],
    mutationFn: ({
      resourceType,
      resourceName,
      clusterName,
      namespace,
      replicas,
    }: {
      resourceType: string;
      resourceName: string;
      clusterName: string;
      namespace?: string;
      replicas: number;
    }) => {
      const searchParams: Record<string, string> = {
        clusterName,
        replicas: String(replicas),
      };
      if (namespace) searchParams.namespace = namespace;
      return api
        .post(`any-cloud/kubernetes/${resourceType}/${encodeURIComponent(resourceName)}/scale`, {
          searchParams,
        })
        .json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kubernetes-deployments'] });
      queryClient.invalidateQueries({ queryKey: ['kubernetes-replicasets'] });
      queryClient.invalidateQueries({ queryKey: ['kubernetes-resource'] });
      options?.onSuccess?.();
    },
    onError: (err) => options?.onError?.(err),
  });
  return { scaleResource: mutate, scaleResourceAsync: mutateAsync, isPending, isError, error };
};

// 파드 로그 조회 (text/plain — SSE 아님)
export const useGetPodLogs = (
  clusterName?: string,
  namespace?: string,
  podName?: string,
  options?: { tailLines?: number; container?: string; enabled?: boolean }
) => {
  const searchParams: Record<string, string> = { clusterName: clusterName ?? '' };
  if (namespace) searchParams.namespace = namespace;
  if (options?.tailLines !== undefined) searchParams.tailLines = String(options.tailLines);
  if (options?.container) searchParams.container = options.container;
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['pod-logs', clusterName, namespace, podName, options],
    queryFn: async () => {
      const response = await api
        .get(`any-cloud/kubernetes/pods/${podName}/logs`, { searchParams })
        .text();
      return response;
    },
    enabled: (options?.enabled ?? true) && !!clusterName && !!podName,
    retry: 1,
  });
  return { logs: data ?? '', isPending, isError, error, refetch };
};

// kubeconfig / agent-manifest 다운로드 — File 응답이므로 raw fetch 사용.
// Accept 에 application/json 도 포함 — backend 가 에러 시 RFC 9457 ProblemDetail JSON 으로 응답.
// 4xx 면 body 의 message 를 추출해 caller 에 노출 (500 일 때도 동일).
const downloadYaml = async (path: string, filename: string) => {
  const accessToken = (await import('@/lib/api')).getAccessToken();
  const response = await fetch(`/api/v1/${path}`, {
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      Accept: 'application/yaml, application/json',
    },
  });
  if (!response.ok) {
    let detail = '';
    try {
      const errorBody = await response.json();
      detail = errorBody?.message || errorBody?.detail || '';
    } catch {
      // ignore parse failure
    }
    const suffix = detail ? ` — ${detail}` : '';
    throw new Error(`다운로드 실패 (${response.status})${suffix}`);
  }
  const text = await response.text();
  const blob = new Blob([text], { type: 'application/yaml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export interface KubeconfigDownloadOptions {
  /** 명시 안 하면 backend 가 VM cluster 면 admin SA 자동, 그 외는 SERVICE_ACCOUNT_REQUIRED. */
  serviceAccount?: string;
  /** namespace 미지정 시 backend 가 "default" 사용. */
  namespace?: string;
  /** token TTL (초). 미지정 시 backend default. */
  ttlSeconds?: number;
}

export const downloadClusterKubeconfig = (clusterName: string, options?: KubeconfigDownloadOptions) => {
  const params = new URLSearchParams();
  if (options?.serviceAccount) params.set('serviceAccount', options.serviceAccount);
  if (options?.namespace) params.set('namespace', options.namespace);
  if (options?.ttlSeconds !== undefined) params.set('ttlSeconds', String(options.ttlSeconds));
  const qs = params.toString();
  const path = `any-cloud/system/cluster/${encodeURIComponent(clusterName)}/kubeconfig${qs ? '?' + qs : ''}`;
  const filename = options?.serviceAccount
    ? `${clusterName}-${options.serviceAccount}-kubeconfig.yaml`
    : `${clusterName}-kubeconfig.yaml`;
  return downloadYaml(path, filename);
};

export const downloadClusterAgentManifest = (clusterName: string) =>
  downloadYaml(
    `any-cloud/system/cluster/${encodeURIComponent(clusterName)}/agent-manifest`,
    `${clusterName}-agent-manifest.yaml`
  );

// Cluster-agent bootstrap 정보 재발급 (modal 에서 "다시 보기" 시).
// useMutation 으로 사용 — 사용자 클릭 시점에만 호출 (auto-fetch 회피).
export const useFetchClusterBootstrap = (options?: {
  onSuccess?: (data: BootstrapInfo) => void;
  onError?: (error: unknown) => void;
}) => {
  const { mutate, isPending, isError, error } = useMutation({
    mutationKey: ['fetchClusterBootstrap'],
    mutationFn: async (clusterName: string) => {
      const raw = await api
        .get(`any-cloud/system/cluster/${encodeURIComponent(clusterName)}/agent-bootstrap`)
        .json<BootstrapInfo | { data?: BootstrapInfo }>();
      const body =
        raw && typeof raw === 'object' && 'data' in raw && raw.data
          ? (raw.data as BootstrapInfo)
          : (raw as BootstrapInfo);
      return body;
    },
    onSuccess: (data) => options?.onSuccess?.(data),
    onError: (err) => options?.onError?.(err),
  });
  return { fetchBootstrap: mutate, isPending, isError, error };
};

// SSH 키 발급 (VM 클러스터)
export const useIssueClusterSshKey = (options?: {
  onSuccess?: (data: Record<string, unknown>) => void;
  onError?: (error: unknown) => void;
}) => {
  const { mutate, isPending, isError, isSuccess, error } = useMutation({
    mutationKey: ['issueSshKey'],
    mutationFn: (clusterName: string) =>
      api
        .post(`any-cloud/system/cluster/${clusterName}/ssh-key`, { json: {} })
        .json<Record<string, unknown>>(),
    onSuccess: (data) => options?.onSuccess?.(data),
    onError: (err) => options?.onError?.(err),
  });
  return { issueSshKey: mutate, isPending, isError, isSuccess, error };
};

// 쿠버네티스 리소스 list 공통 query — namespace 옵션 포함
const fetchKubernetesResource = async <T>(
  resourceType: string,
  clusterName: string,
  namespace?: string,
  extraParams?: Record<string, string>
): Promise<T[]> => {
  const searchParams: Record<string, string> = { clusterName };
  if (namespace) searchParams.namespace = namespace;
  if (extraParams) Object.assign(searchParams, extraParams);
  const response = await api
    .get(`any-cloud/kubernetes/${resourceType}`, { searchParams })
    .json<Page<T> | { data: T[] }>();
  return response.data ?? [];
};

// 클러스터 목록 조회
export const useGetClusters = (params: GetClustersParams = {}) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['clusters', params],
    queryFn: () =>
      api
        .get('any-cloud/system/clusters', { searchParams: { ...params } })
        .json<Page<Cluster> | Cluster[]>(),
  });

  const clusters = Array.isArray(data) ? data : (data?.data ?? []);
  const total = Array.isArray(data) ? data.length : (data?.total ?? 0);
  const size = Array.isArray(data) ? data.length : (data?.size ?? 10);
  const pageNumber = Array.isArray(data) ? 1 : (data?.page ?? 1);

  return {
    clusters,
    page: {
      number: pageNumber,
      size,
      total,
    },
    isPending,
    isError,
  };
};

// 클러스터 등록 — 응답에 operation + bootstrap (helm/kubectl install command + token).
// 일부 backend 는 envelope `{data: {...}}` 로 감싸므로 두 형태 모두 unwrap.
export const useCreateCluster = (options?: {
  onSuccess?: (data: ClusterRegistrationResponse) => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess, error } = useMutation({
    mutationKey: ['createCluster'], // 중복 호출 방지
    mutationFn: async (data: CreateClusterRequest) => {
      const raw = await api
        .post('any-cloud/system/cluster', { json: data })
        .json<ClusterRegistrationResponse | { data?: ClusterRegistrationResponse }>();
      // envelope `{data: ...}` 또는 flat 응답 모두 수용
      const body =
        raw && typeof raw === 'object' && 'data' in raw && raw.data
          ? (raw.data as ClusterRegistrationResponse)
          : (raw as ClusterRegistrationResponse);
      return body;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });

  return {
    createCluster: mutate,
    isPending,
    isError,
    isSuccess,
    error,
  };
};

// 클러스터 단일 조회
export const useGetCluster = (clusterId?: string, enabled: boolean = true) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['cluster', clusterId],
    queryFn: () => api.get(`any-cloud/system/cluster/${clusterId}`).json<Cluster>(),
    enabled: enabled && !!clusterId,
  });

  return {
    cluster: data,
    isPending,
    isError,
  };
};

// 클러스터 수정 — backend 는 spec.workerCount 만 지원 (VM source scale 변경)
export const useUpdateCluster = (options?: {
  onSuccess?: (data: Cluster) => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess, error } = useMutation({
    mutationKey: ['updateCluster'],
    mutationFn: ({ clusterName, spec }: UpdateClusterRequest) => {
      return api
        .put(`any-cloud/system/cluster/${clusterName}`, { json: { spec } })
        .json<Cluster>();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
      queryClient.invalidateQueries({ queryKey: ['cluster', variables.clusterName] });
      if (variables.clusterId) {
        queryClient.invalidateQueries({ queryKey: ['cluster', variables.clusterId] });
      }
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });

  return {
    updateCluster: mutate,
    isPending,
    isError,
    isSuccess,
    error,
  };
};

// 클러스터 삭제
export const useDeleteCluster = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (clusterId: string) =>
      api.delete(`any-cloud/system/cluster/${clusterId}`).json<string>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });

  return {
    deleteCluster: mutate,
    isPending,
    isError,
    isSuccess,
  };
};

// 쿠버네티스 노드 조회 (cluster-scoped)
export const useGetKubernetesNodes = (clusterName?: string, enabled: boolean = true) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['kubernetes-nodes', clusterName],
    queryFn: () => fetchKubernetesResource<KubernetesNode>('nodes', clusterName!),
    enabled: enabled && !!clusterName,
    retry: 1,
    refetchOnWindowFocus: true,
  });

  return { nodes: data ?? [], isPending, isError, error };
};

// 쿠버네티스 네임스페이스 조회 (cluster-scoped)
export const useGetKubernetesNamespaces = (clusterName?: string, enabled: boolean = true) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['kubernetes-namespaces', clusterName],
    queryFn: () => fetchKubernetesResource<KubernetesNamespace>('namespaces', clusterName!),
    enabled: enabled && !!clusterName,
    retry: 1,
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });

  return { namespaces: data ?? [], isPending, isError, error };
};

// 쿠버네티스 디플로이먼트 조회
export const useGetKubernetesDeployments = (
  clusterName?: string,
  namespace?: string,
  enabled: boolean = true
) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['kubernetes-deployments', clusterName, namespace],
    queryFn: () =>
      fetchKubernetesResource<KubernetesDeployment>('deployments', clusterName!, namespace),
    enabled: enabled && !!clusterName,
    retry: 1,
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });

  return { deployments: data ?? [], isPending, isError, error };
};

// 쿠버네티스 레플리카셋 조회
export const useGetKubernetesReplicaSets = (
  clusterName?: string,
  namespace?: string,
  enabled: boolean = true
) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['kubernetes-replicasets', clusterName, namespace],
    queryFn: () =>
      fetchKubernetesResource<KubernetesReplicaSet>('replicasets', clusterName!, namespace),
    enabled: enabled && !!clusterName,
    retry: 1,
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });

  return { replicaSets: data ?? [], isPending, isError, error };
};

// 쿠버네티스 파드 조회
export const useGetKubernetesPods = (
  clusterName?: string,
  namespace?: string,
  enabled: boolean = true
) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['kubernetes-pods', clusterName, namespace],
    queryFn: () => fetchKubernetesResource<KubernetesPod>('pods', clusterName!, namespace),
    enabled: enabled && !!clusterName,
    retry: 1,
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });

  return { pods: data ?? [], isPending, isError, error };
};

// labelSelector 기반 파드 조회 — Workload(Deployment/RS/DaemonSet/StatefulSet) 의 집계 로그용.
// `key1=val1,key2=val2` 형태의 K8s labelSelector 그대로 전달. namespace 미지정 시 all-ns.
export const useGetKubernetesPodsBySelector = (
  clusterName?: string,
  namespace?: string,
  labelSelector?: string,
  enabled: boolean = true
) => {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['kubernetes-pods-by-selector', clusterName, namespace, labelSelector],
    queryFn: () =>
      fetchKubernetesResource<KubernetesPod>('pods', clusterName!, namespace, {
        labelSelector: labelSelector!,
      }),
    enabled: enabled && !!clusterName && !!labelSelector,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  return { pods: data ?? [], isPending, isError, error, refetch };
};

// 쿠버네티스 서비스 조회
export const useGetKubernetesServices = (
  clusterName?: string,
  namespace?: string,
  enabled: boolean = true
) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['kubernetes-services', clusterName, namespace],
    queryFn: () => fetchKubernetesResource<KubernetesService>('services', clusterName!, namespace),
    enabled: enabled && !!clusterName,
    retry: 1,
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });

  return { services: data ?? [], isPending, isError, error };
};

// 쿠버네티스 데몬셋 조회
export const useGetKubernetesDaemonSets = (
  clusterName?: string,
  namespace?: string,
  enabled: boolean = true
) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['kubernetes-daemonsets', clusterName, namespace],
    queryFn: () =>
      fetchKubernetesResource<KubernetesDaemonSet>('daemonsets', clusterName!, namespace),
    enabled: enabled && !!clusterName,
    retry: 1,
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });

  return { daemonSets: data ?? [], isPending, isError, error };
};

// GPU 스케줄링 조회
export const useGetGpuSchedulings = (
  clusterName?: string,
  namespace?: string,
  enabled: boolean = true
) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['gpu-schedulings', clusterName, namespace],
    queryFn: () =>
      fetchKubernetesResource<GpuScheduling>('gpu-schedulings', clusterName!, namespace),
    enabled: enabled && !!clusterName,
    retry: 1,
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });

  return { gpuSchedulings: data ?? [], isPending, isError, error };
};

// 쿠버네티스 서비스 어카운트 조회
export const useGetKubernetesServiceAccounts = (
  clusterName?: string,
  namespace?: string,
  enabled: boolean = true
) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['kubernetes-service-accounts', clusterName, namespace],
    queryFn: () =>
      fetchKubernetesResource<KubernetesServiceAccount>(
        'service-accounts',
        clusterName!,
        namespace
      ),
    enabled: enabled && !!clusterName,
    retry: 1,
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });

  return { serviceAccounts: data ?? [], isPending, isError, error };
};

// 쿠버네티스 컨피그맵 조회
export const useGetKubernetesConfigMaps = (
  clusterName?: string,
  namespace?: string,
  enabled: boolean = true
) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['kubernetes-config-maps', clusterName, namespace],
    queryFn: () =>
      fetchKubernetesResource<KubernetesConfigMap>('config-maps', clusterName!, namespace),
    enabled: enabled && !!clusterName,
    retry: 1,
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });

  return { configMaps: data ?? [], isPending, isError, error };
};

// 쿠버네티스 시크릿 조회
export const useGetKubernetesSecrets = (
  clusterName?: string,
  namespace?: string,
  enabled: boolean = true
) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['kubernetes-secrets', clusterName, namespace],
    queryFn: () => fetchKubernetesResource<KubernetesSecret>('secrets', clusterName!, namespace),
    enabled: enabled && !!clusterName,
    retry: 1,
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });

  return { secrets: data ?? [], isPending, isError, error };
};
