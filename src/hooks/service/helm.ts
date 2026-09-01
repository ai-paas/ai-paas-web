import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '../../lib/api';
import type {
  GetHelmRepositoriesParams,
  HelmRelease,
  HelmReleaseListMeta,
  HelmRepository,
  HelmRepositoryCreateRequest,
  HelmRepositoryDetailResponse,
  HelmRepositoryExistsResponse,
  HelmRepositoryListMeta,
  HelmRepositoryListResponse,
  HelmRepositoryMutationResponse,
  HelmReleaseResource,
} from '../../types/helm';
import type { Operation } from '../../types/cluster';

export interface InstallHelmReleaseRequest {
  releaseName: string;
  chart: string; // "<repo>/<chart>"
  version?: string;
  namespace?: string;
  values?: Record<string, unknown>;
  valuesYaml?: string;
}

export interface GetHelmReleasesParams {
  clusterId?: string;
  namespace?: string;
  search?: string;
  page?: number;
  size?: number;
}

const helmRepositoryQueryKeys = {
  all: ['helm-repositories'] as const,
  list: (params: Record<string, string | number>) =>
    [...helmRepositoryQueryKeys.all, 'list', params] as const,
  detail: (name?: string) => [...helmRepositoryQueryKeys.all, 'detail', name] as const,
  exists: (name?: string) => [...helmRepositoryQueryKeys.all, 'exists', name] as const,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const compactSearchParams = <T extends object>(params: T) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  ) as Record<string, string | number>;

const toHelmRepositoryMeta = (
  payload: Record<string, unknown>
): HelmRepositoryListMeta | undefined => {
  const page = typeof payload.page === 'number' ? payload.page : undefined;
  const size = typeof payload.size === 'number' ? payload.size : undefined;
  const total = typeof payload.total === 'number' ? payload.total : undefined;
  const totalPages =
    typeof payload.total_pages === 'number'
      ? payload.total_pages
      : typeof payload.totalPages === 'number'
        ? payload.totalPages
        : undefined;

  return [page, size, total, totalPages].some((value) => value !== undefined)
    ? { page, size, total, totalPages }
    : undefined;
};

export const normalizeHelmRepositoryListResponse = (
  response: HelmRepositoryListResponse
): { repositories: HelmRepository[]; meta?: HelmRepositoryListMeta } => {
  let current: unknown = response;
  let meta: HelmRepositoryListMeta | undefined;
  const visited = new Set<object>();

  for (let depth = 0; depth < 5; depth += 1) {
    if (Array.isArray(current)) {
      return { repositories: current as HelmRepository[], meta };
    }
    if (!isRecord(current) || visited.has(current)) break;

    visited.add(current);
    meta = toHelmRepositoryMeta(current) ?? meta;

    for (const key of ['repositories', 'items'] as const) {
      if (Array.isArray(current[key])) {
        return { repositories: current[key] as HelmRepository[], meta };
      }
    }

    if (!('data' in current)) break;
    current = current.data;
  }

  return { repositories: [], meta };
};

export const normalizeHelmRepositoryDetailResponse = (
  response: HelmRepositoryDetailResponse
): HelmRepository | undefined => {
  let current: unknown = response;
  const visited = new Set<object>();

  for (let depth = 0; depth < 5; depth += 1) {
    if (!isRecord(current) || visited.has(current)) return undefined;
    visited.add(current);

    if ('name' in current || 'url' in current) {
      return current as HelmRepository;
    }

    current = current.repository ?? current.data;
  }

  return undefined;
};

export const normalizeHelmRepositoryExistsResponse = (
  response: HelmRepositoryExistsResponse
): boolean | undefined => {
  let current: unknown = response;
  const visited = new Set<object>();

  for (let depth = 0; depth < 5; depth += 1) {
    if (typeof current === 'boolean') return current;
    if (!isRecord(current) || visited.has(current)) return undefined;
    visited.add(current);

    const explicit = current.exists ?? current.isExists;
    if (typeof explicit === 'boolean') return explicit;

    current = current.data ?? current.result;
  }

  return undefined;
};

export const useGetHelmReleases = (params: GetHelmReleasesParams = {}) => {
  const searchParams = compactSearchParams(params);

  const enabled = !!params.clusterId;

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['helm-releases', searchParams],
    queryFn: async () => {
      const response = await api
        .get('any-cloud/catalog/releases', {
          searchParams,
        })
        .json<{
          data: HelmRelease[];
          page?: number;
          size?: number;
          total?: number;
          total_pages?: number;
        }>();

      const meta: HelmReleaseListMeta | undefined =
        response.page !== undefined ||
        response.size !== undefined ||
        response.total !== undefined ||
        response.total_pages !== undefined
          ? {
              page: response.page,
              size: response.size,
              total: response.total,
              totalPages: response.total_pages,
            }
          : undefined;

      return {
        releases: response.data || [],
        meta,
      };
    },
    enabled,
  });

  return {
    releases: data?.releases ?? [],
    meta: data?.meta,
    isPending,
    isError,
    error,
    refetch,
  };
};

export const useGetHelmRepositories = (params: GetHelmRepositoriesParams = {}) => {
  const searchParams = compactSearchParams(params);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: helmRepositoryQueryKeys.list(searchParams),
    queryFn: () =>
      api
        .get('any-cloud/helm-repos', { searchParams })
        .json<HelmRepositoryListResponse>()
        .then(normalizeHelmRepositoryListResponse),
  });

  return {
    repositories: data?.repositories ?? [],
    meta: data?.meta,
    isPending,
    isError,
    error,
    refetch,
  };
};

export const useGetHelmRepository = (helmRepoName?: string) => {
  const name = helmRepoName?.trim();
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: helmRepositoryQueryKeys.detail(name),
    queryFn: () =>
      api
        .get(`any-cloud/helm-repos/${encodeURIComponent(name ?? '')}`)
        .json<HelmRepositoryDetailResponse>()
        .then(normalizeHelmRepositoryDetailResponse),
    enabled: !!name,
  });

  return { repository: data, isPending, isError, error, refetch };
};

export const useGetHelmRepositoryExists = (helmRepoName?: string) => {
  const name = helmRepoName?.trim();
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: helmRepositoryQueryKeys.exists(name),
    queryFn: () =>
      api
        .get(`any-cloud/helm-repos/${encodeURIComponent(name ?? '')}/exists`)
        .json<HelmRepositoryExistsResponse>()
        .then(normalizeHelmRepositoryExistsResponse),
    enabled: !!name,
  });

  return { exists: data, isPending, isError, error, refetch };
};

export const useCreateHelmRepository = (options?: {
  onSuccess?: (data: HelmRepositoryMutationResponse, request: HelmRepositoryCreateRequest) => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();
  const { mutate, mutateAsync, isPending, isError, isSuccess, error } = useMutation({
    mutationKey: ['createHelmRepository'],
    mutationFn: (request: HelmRepositoryCreateRequest) =>
      api.post('any-cloud/helm-repos', { json: request }).json<HelmRepositoryMutationResponse>(),
    onSuccess: (data, request) => {
      queryClient.invalidateQueries({ queryKey: helmRepositoryQueryKeys.all });
      options?.onSuccess?.(data, request);
    },
    onError: (mutationError) => options?.onError?.(mutationError),
  });

  return {
    createHelmRepository: mutate,
    createHelmRepositoryAsync: mutateAsync,
    isPending,
    isError,
    isSuccess,
    error,
  };
};

export const useDeleteHelmRepository = (options?: {
  onSuccess?: (data: HelmRepositoryMutationResponse, helmRepoName: string) => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();
  const { mutate, mutateAsync, isPending, isError, isSuccess, error } = useMutation({
    mutationKey: ['deleteHelmRepository'],
    mutationFn: (helmRepoName: string) =>
      api
        .delete(`any-cloud/helm-repos/${encodeURIComponent(helmRepoName)}`)
        .json<HelmRepositoryMutationResponse>(),
    onSuccess: (data, helmRepoName) => {
      queryClient.invalidateQueries({ queryKey: helmRepositoryQueryKeys.all });
      options?.onSuccess?.(data, helmRepoName);
    },
    onError: (mutationError) => options?.onError?.(mutationError),
  });

  return {
    deleteHelmRepository: mutate,
    deleteHelmRepositoryAsync: mutateAsync,
    isPending,
    isError,
    isSuccess,
    error,
  };
};

export const useGetHelmReleaseResources = (
  releaseName: string,
  clusterId?: string,
  namespace?: string
) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['helm-release-resources', releaseName, clusterId, namespace],
    queryFn: async () => {
      if (!clusterId || !namespace) return [];

      const response = await api
        .get<{
          data: HelmReleaseResource[];
        }>(`any-cloud/catalog/releases/${encodeURIComponent(releaseName)}/resources`, {
          searchParams: { clusterId, namespace },
        })
        .json();

      return response.data || [];
    },
    enabled: !!releaseName && !!clusterId && !!namespace,
  });

  return {
    resources: data ?? [],
    isPending,
    isError,
    error,
  };
};

// Helm 릴리즈 설치 (JSON body)
export const useInstallHelmRelease = (
  clusterName?: string,
  options?: { onSuccess?: (op: Operation) => void; onError?: (error: unknown) => void }
) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess, error } = useMutation({
    mutationKey: ['installHelmRelease', clusterName],
    mutationFn: (body: InstallHelmReleaseRequest) =>
      api.post(`any-cloud/clusters/${clusterName}/helm-releases`, { json: body }).json<Operation>(),
    onSuccess: (op) => {
      queryClient.invalidateQueries({ queryKey: ['helm-releases'] });
      options?.onSuccess?.(op);
    },
    onError: (err) => options?.onError?.(err),
  });

  return { installHelmRelease: mutate, isPending, isError, isSuccess, error };
};

export const useGetHelmReleaseValues = (releaseName: string) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['helm-release-values', releaseName],
    queryFn: async () => {
      const response = await api
        .get<{ data: string }>(`any-cloud/catalog/releases/${releaseName}/values`)
        .json();

      return response.data || '';
    },
    enabled: !!releaseName,
  });

  return {
    values: data ?? '',
    isPending,
    isError,
    error,
  };
};
