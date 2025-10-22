import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Page } from '../../types/api';
import type {
  Cluster,
  CreateClusterRequest,
  GetClustersParams,
  UpdateClusterRequest,
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

// 클러스터 목록 조회
export const useGetClusters = (params: GetClustersParams = {}) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['clusters', params],
    queryFn: () =>
      api.get<Page<Cluster>>('any-cloud/system/clusters', { searchParams: { ...params } }).json(),
  });

  return {
    clusters: data?.data ?? [],
    page: {
      number: data?.page ?? 1,
      size: data?.size ?? 10,
      total: data?.total ?? 0,
    },
    isPending,
    isError,
  };
};

// 클러스터 생성
export const useCreateCluster = (options?: {
  onSuccess?: (data: Cluster) => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess, error } = useMutation({
    mutationKey: ['createCluster'], // 중복 호출 방지
    mutationFn: (data: CreateClusterRequest) =>
      api.post('any-cloud/system/cluster', { json: data }).json<Cluster>(),
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

// 클러스터 수정
export const useUpdateCluster = (options?: {
  onSuccess?: (data: Cluster) => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess, error } = useMutation({
    mutationKey: ['updateCluster'], // 중복 호출 방지
    mutationFn: ({ clusterName, ...data }: UpdateClusterRequest) => {
      return api.put(`any-cloud/system/cluster/${clusterName}`, { json: data }).json<Cluster>();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
      queryClient.invalidateQueries({ queryKey: ['cluster', variables.clusterId] });
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

// 쿠버네티스 노드 조회
export const useGetKubernetesNodes = (clusterName?: string, enabled: boolean = true) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['kubernetes-nodes', clusterName],
    queryFn: () =>
      api
        .get(`any-cloud/kubernetes/nodes?clusterName=${clusterName}`)
        .json<{ data: KubernetesNode[] }>()
        .then((response) => response.data),
    enabled: enabled && !!clusterName,
    retry: 1, // 재시도 횟수 제한
    refetchOnWindowFocus: true, // 창 포커스 시 refetch
  });

  return {
    nodes: data ?? [],
    isPending,
    isError,
    error,
  };
};

// 쿠버네티스 네임스페이스 조회
export const useGetKubernetesNamespaces = (clusterName?: string, enabled: boolean = true) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['kubernetes-namespaces', clusterName],
    queryFn: () =>
      api
        .get(`any-cloud/kubernetes/namespaces?clusterName=${clusterName}`)
        .json<{ data: KubernetesNamespace[] }>()
        .then((response) => response.data),
    enabled: enabled && !!clusterName,
    retry: 1, // 재시도 횟수 제한
    refetchOnWindowFocus: true, // 창 포커스 시 refetch
    staleTime: 30000, // 30초 동안 데이터를 fresh로 유지
  });

  return {
    namespaces: data ?? [],
    isPending,
    isError,
    error,
  };
};

// 쿠버네티스 디플로이먼트 조회
export const useGetKubernetesDeployments = (clusterName?: string, enabled: boolean = true) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['kubernetes-deployments', clusterName],
    queryFn: () =>
      api
        .get(`any-cloud/kubernetes/deployments?clusterName=${clusterName}`)
        .json<{ data: KubernetesDeployment[] }>()
        .then((response) => response.data),
    enabled: enabled && !!clusterName,
    retry: 1, // 재시도 횟수 제한
    refetchOnWindowFocus: true, // 창 포커스 시 refetch
    staleTime: 30000, // 30초 동안 데이터를 fresh로 유지
  });

  return {
    deployments: data ?? [],
    isPending,
    isError,
    error,
  };
};

// 쿠버네티스 레플리카셋 조회
export const useGetKubernetesReplicaSets = (clusterName?: string, enabled: boolean = true) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['kubernetes-replicasets', clusterName],
    queryFn: () =>
      api
        .get(`any-cloud/kubernetes/replicasets?clusterName=${clusterName}`)
        .json<{ data: KubernetesReplicaSet[] }>()
        .then((response) => response.data),
    enabled: enabled && !!clusterName,
    retry: 1, // 재시도 횟수 제한
    refetchOnWindowFocus: true, // 창 포커스 시 refetch
    staleTime: 30000, // 30초 동안 데이터를 fresh로 유지
  });

  return {
    replicaSets: data ?? [],
    isPending,
    isError,
    error,
  };
};

// 쿠버네티스 파드 조회
export const useGetKubernetesPods = (clusterName?: string, enabled: boolean = true) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['kubernetes-pods', clusterName],
    queryFn: () =>
      api
        .get(`any-cloud/kubernetes/pods?clusterName=${clusterName}`)
        .json<{ data: KubernetesPod[] }>()
        .then((response) => response.data),
    enabled: enabled && !!clusterName,
    retry: 1, // 재시도 횟수 제한
    refetchOnWindowFocus: true, // 창 포커스 시 refetch
    staleTime: 30000, // 30초 동안 데이터를 fresh로 유지
  });

  return {
    pods: data ?? [],
    isPending,
    isError,
    error,
  };
};

// 쿠버네티스 서비스 조회
export const useGetKubernetesServices = (clusterName?: string, enabled: boolean = true) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['kubernetes-services', clusterName],
    queryFn: () =>
      api
        .get(`any-cloud/kubernetes/services?clusterName=${clusterName}`)
        .json<{ data: KubernetesService[] }>()
        .then((response) => response.data),
    enabled: enabled && !!clusterName,
    retry: 1, // 재시도 횟수 제한
    refetchOnWindowFocus: true, // 창 포커스 시 refetch
    staleTime: 30000, // 30초 동안 데이터를 fresh로 유지
  });

  return {
    services: data ?? [],
    isPending,
    isError,
    error,
  };
};

// 쿠버네티스 데몬셋 조회
export const useGetKubernetesDaemonSets = (clusterName?: string, enabled: boolean = true) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['kubernetes-daemonsets', clusterName],
    queryFn: () =>
      api
        .get(`any-cloud/kubernetes/daemonsets?clusterName=${clusterName}`)
        .json<{ data: KubernetesDaemonSet[] }>()
        .then((response) => response.data),
    enabled: enabled && !!clusterName,
    retry: 1, // 재시도 횟수 제한
    refetchOnWindowFocus: true, // 창 포커스 시 refetch
    staleTime: 30000, // 30초 동안 데이터를 fresh로 유지
  });

  return {
    daemonSets: data ?? [],
    isPending,
    isError,
    error,
  };
};

// GPU 스케줄링 조회
export const useGetGpuSchedulings = (clusterName?: string, enabled: boolean = true) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['gpu-schedulings', clusterName],
    queryFn: () =>
      api
        .get(`any-cloud/kubernetes/gpu-schedulings?clusterName=${clusterName}`)
        .json<{ data: GpuScheduling[] }>()
        .then((response) => response.data),
    enabled: enabled && !!clusterName,
    retry: 1, // 재시도 횟수 제한
    refetchOnWindowFocus: true, // 창 포커스 시 refetch
    staleTime: 30000, // 30초 동안 데이터를 fresh로 유지
  });

  return {
    gpuSchedulings: data ?? [],
    isPending,
    isError,
    error,
  };
};

// 쿠버네티스 서비스 어카운트 조회
export const useGetKubernetesServiceAccounts = (clusterName?: string, enabled: boolean = true) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['kubernetes-service-accounts', clusterName],
    queryFn: () =>
      api
        .get(`any-cloud/kubernetes/service-accounts?clusterName=${clusterName}`)
        .json<{ data: KubernetesServiceAccount[] }>()
        .then((response) => response.data),
    enabled: enabled && !!clusterName,
    retry: 1, // 재시도 횟수 제한
    refetchOnWindowFocus: true, // 창 포커스 시 refetch
    staleTime: 30000, // 30초 동안 데이터를 fresh로 유지
  });

  return {
    serviceAccounts: data ?? [],
    isPending,
    isError,
    error,
  };
};

// 쿠버네티스 컨피그맵 조회
export const useGetKubernetesConfigMaps = (clusterName?: string, enabled: boolean = true) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['kubernetes-config-maps', clusterName],
    queryFn: () =>
      api
        .get(`any-cloud/kubernetes/config-maps?clusterName=${clusterName}`)
        .json<{ data: KubernetesConfigMap[] }>()
        .then((response) => response.data),
    enabled: enabled && !!clusterName,
    retry: 1, // 재시도 횟수 제한
    refetchOnWindowFocus: true, // 창 포커스 시 refetch
    staleTime: 30000, // 30초 동안 데이터를 fresh로 유지
  });

  return {
    configMaps: data ?? [],
    isPending,
    isError,
    error,
  };
};

// 쿠버네티스 시크릿 조회
export const useGetKubernetesSecrets = (clusterName?: string, enabled: boolean = true) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['kubernetes-secrets', clusterName],
    queryFn: () =>
      api
        .get(`any-cloud/kubernetes/secrets?clusterName=${clusterName}`)
        .json<{ data: KubernetesSecret[] }>()
        .then((response) => response.data),
    enabled: enabled && !!clusterName,
    retry: 1, // 재시도 횟수 제한
    refetchOnWindowFocus: true, // 창 포커스 시 refetch
    staleTime: 30000, // 30초 동안 데이터를 fresh로 유지
  });

  return {
    secrets: data ?? [],
    isPending,
    isError,
    error,
  };
};
