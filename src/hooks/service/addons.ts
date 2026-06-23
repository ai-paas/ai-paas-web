import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Operation } from '../../types/cluster';

export type AddonType =
  | 'MONITORING'
  | 'INGRESS_NGINX'
  | 'CERT_MANAGER'
  | 'GPU_EXPORTER'
  | 'VELERO'
  | string;

export interface AddonCatalogItem {
  id?: string;
  type?: AddonType;
  displayName?: string;
  description?: string;
  chartName?: string;
  chartRepo?: string;
  chartVersion?: string;
  defaultNamespace?: string;
  [key: string]: unknown;
}

export interface ClusterAddon {
  id?: string;
  clusterId?: string;
  type?: AddonType;
  catalogId?: string;
  releaseName?: string;
  namespace?: string;
  chartRepo?: string;
  chartName?: string;
  chartVersion?: string;
  state?: string;
  enabled?: boolean;
  [key: string]: unknown;
}

export interface AddonInstallRequest {
  type: AddonType;
  catalogId?: string;
  releaseName?: string;
  namespace?: string;
  chartRepo?: string;
  chartName?: string;
  chartVersion?: string;
  repoUrl?: string;
  valuesYaml?: string;
  enabled?: boolean;
}

// 애드온 카탈로그
export const useGetAddonCatalog = () => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['addon-catalog'],
    queryFn: () =>
      api
        .get('any-cloud/addons')
        .json<{ data?: AddonCatalogItem[]; items?: AddonCatalogItem[] }>(),
  });

  const items = data?.data ?? data?.items ?? [];
  return { catalog: items, isPending, isError, error };
};

// 클러스터에 설치된 애드온 목록
export const useGetClusterAddons = (clusterName?: string, enabled: boolean = true) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['cluster-addons', clusterName],
    queryFn: () =>
      api
        .get(`any-cloud/clusters/${clusterName}/addons`)
        .json<{ data?: ClusterAddon[]; items?: ClusterAddon[] }>(),
    enabled: enabled && !!clusterName,
  });

  const items = data?.data ?? data?.items ?? [];
  return { addons: items, isPending, isError, error };
};

// 애드온 단건 조회
export const useGetClusterAddon = (clusterName?: string, addonId?: string) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['cluster-addon', clusterName, addonId],
    queryFn: () =>
      api.get(`any-cloud/clusters/${clusterName}/addons/${addonId}`).json<ClusterAddon>(),
    enabled: !!clusterName && !!addonId,
  });

  return { addon: data, isPending, isError, error };
};

// 애드온 설치 요청
export const useInstallAddon = (
  clusterName?: string,
  options?: { onSuccess?: (op: ClusterAddon) => void; onError?: (error: unknown) => void }
) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess, error } = useMutation({
    mutationKey: ['installAddon', clusterName],
    mutationFn: (body: AddonInstallRequest) =>
      api.post(`any-cloud/clusters/${clusterName}/addons`, { json: body }).json<ClusterAddon>(),
    onSuccess: (op) => {
      queryClient.invalidateQueries({ queryKey: ['cluster-addons', clusterName] });
      options?.onSuccess?.(op);
    },
    onError: (err) => options?.onError?.(err),
  });

  return { installAddon: mutate, isPending, isError, isSuccess, error };
};

// 애드온 제거 요청
export const useUninstallAddon = (
  clusterName?: string,
  options?: { onSuccess?: (op: Operation) => void; onError?: (error: unknown) => void }
) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess, error } = useMutation({
    mutationKey: ['uninstallAddon', clusterName],
    mutationFn: (addonId: string) =>
      api.delete(`any-cloud/clusters/${clusterName}/addons/${addonId}`).json<Operation>(),
    onSuccess: (op) => {
      queryClient.invalidateQueries({ queryKey: ['cluster-addons', clusterName] });
      options?.onSuccess?.(op);
    },
    onError: (err) => options?.onError?.(err),
  });

  return { uninstallAddon: mutate, isPending, isError, isSuccess, error };
};

// 실패한 애드온 재시도
export const useRetryAddon = (
  clusterName?: string,
  options?: { onSuccess?: (op: Operation) => void; onError?: (error: unknown) => void }
) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess, error } = useMutation({
    mutationKey: ['retryAddon', clusterName],
    mutationFn: (addonId: string) =>
      api
        .post(`any-cloud/clusters/${clusterName}/addons/${addonId}/retry`)
        .json<Operation>(),
    onSuccess: (op) => {
      queryClient.invalidateQueries({ queryKey: ['cluster-addons', clusterName] });
      options?.onSuccess?.(op);
    },
    onError: (err) => options?.onError?.(err),
  });

  return { retryAddon: mutate, isPending, isError, isSuccess, error };
};
