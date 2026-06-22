import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '../../lib/api';
import type {
  HelmRelease,
  HelmReleaseListMeta,
  HelmRepository,
  HelmRepositoryListMeta,
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
  clusterName?: string;
  search?: string;
  page?: number;
  size?: number;
}

export const useGetHelmReleases = (params: GetHelmReleasesParams = {}) => {
  const searchParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  );

  const enabled = !!(params.clusterId || params.clusterName);

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

export const useGetHelmRepositories = () => {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['helm-repositories'],
    queryFn: async () => {
      const response = await api.get('any-cloud/helm-repos').json<{
        data: HelmRepository[];
        page?: number;
        size?: number;
        total?: number;
        total_pages?: number;
      }>();

      const meta: HelmRepositoryListMeta | undefined =
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
        repositories: response.data || [],
        meta,
      };
    },
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

export const useGetHelmReleaseResources = (releaseName: string) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['helm-release-resources', releaseName],
    queryFn: async () => {
      const response = await api
        .get<{ data: HelmReleaseResource[] }>(`any-cloud/catalog/releases/${releaseName}/resources`)
        .json();

      return response.data || [];
    },
    enabled: !!releaseName,
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
      api
        .post(`any-cloud/clusters/${clusterName}/helm-releases`, { json: body })
        .json<Operation>(),
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
