import { api } from '@/lib/api';
import type { Page } from '@/types/api';
import type { KubernetesPod } from '@/types/cluster';
import { queryOptions, useQuery } from '@tanstack/react-query';

export type MonitoringMetricInfo = Record<string, string>;

export interface MonitoringVectorMetric {
  info?: MonitoringMetricInfo;
  value: number;
}

export interface MonitoringRangeMetricValue {
  time: string;
  value: number;
}

export interface MonitoringRangeMetric {
  info?: MonitoringMetricInfo;
  values: MonitoringRangeMetricValue[];
}

export type PrometheusQueryType = 'query' | 'query_range';

export interface MonitoringQueryFilter {
  pod?: string;
  instance?: string;
  [key: string]: string | undefined;
}

export type PrometheusValue = [number, string];

export type PrometheusVectorResult<TLabel = Record<string, string>> = {
  metric: TLabel;
  value: PrometheusValue;
};

export type PrometheusMatrixResult<TLabel = Record<string, string>> = {
  metric: TLabel;
  values: PrometheusValue[];
};

export type PrometheusScalarResult = PrometheusValue;

export type PrometheusStringResult = PrometheusValue;

export type PrometheusResult =
  | PrometheusVectorResult[]
  | PrometheusMatrixResult[]
  | PrometheusScalarResult
  | PrometheusStringResult;

export type PrometheusQueryResponse<TData = PrometheusResult> = {
  status: 'success';
  data: {
    resultType: 'matrix' | 'vector' | 'scalar' | 'string';
    result: TData;
  };
  warnings?: string[];
  infos?: string[];
};

type RangeQueryParams = {
  clusterName?: string;
  query?: string;
  start?: number;
  end?: number;
  step?: number;
};

type RangeQueryOptions = {
  enabled?: boolean;
};

type KubernetesPodPageResponse =
  | Page<KubernetesPod>
  | KubernetesPod[]
  | { data?: KubernetesPod[]; total?: number; size?: number; total_pages?: number };

type NormalizedKubernetesPodPage = {
  data: KubernetesPod[];
  total: number;
  size: number;
  totalPages: number;
};

const normalizeKubernetesPodPageResponse = (
  response: KubernetesPodPageResponse | undefined
): NormalizedKubernetesPodPage => {
  if (Array.isArray(response)) {
    return {
      data: response,
      total: response.length,
      size: response.length,
      totalPages: 1,
    };
  }

  if (response && typeof response === 'object') {
    const data = 'data' in response && Array.isArray(response.data) ? (response.data ?? []) : [];
    const total = Number(response.total ?? data.length);
    const size = Number(response.size ?? data.length);
    const totalPages =
      Number('total_pages' in response ? response.total_pages : undefined) ||
      Math.max(1, Math.ceil(total / Math.max(1, size || data.length || 1)));

    return {
      data,
      total,
      size,
      totalPages,
    };
  }

  return {
    data: [],
    total: 0,
    size: 0,
    totalPages: 1,
  };
};

export const createInstantQueryOptions = <TLabel = Record<string, string>>(
  query?: string,
  clusterName?: string
) =>
  queryOptions({
    queryKey: ['monitoring-instant-query', query, clusterName],
    queryFn: () =>
      api
        .get(`any-cloud/monit/${clusterName}/query`, {
          searchParams: {
            query: query!,
          },
        })
        .json<PrometheusQueryResponse<PrometheusVectorResult<TLabel>[]>>(),
    enabled: !!query && !!clusterName,
  });

export const createRangeQueryOptions = <TLabel = Record<string, string>>(
  { query, clusterName, start, end, step }: RangeQueryParams,
  options?: RangeQueryOptions
) =>
  queryOptions({
    queryKey: ['monitoring-range-query', clusterName, query, start, end, step],
    queryFn: () =>
      api
        .get(`any-cloud/monit/${clusterName}/query_range`, {
          searchParams: {
            ...(query ? { query } : {}),
            ...(start !== undefined ? { start: String(start) } : {}),
            ...(end !== undefined ? { end: String(end) } : {}),
            ...(step !== undefined ? { step: String(step) } : {}),
          },
        })
        .json<PrometheusQueryResponse<PrometheusMatrixResult<TLabel>[]>>(),
    enabled:
      (options?.enabled ?? true) &&
      !!query &&
      !!clusterName &&
      start !== undefined &&
      end !== undefined &&
      step !== undefined,
  });

export const useInstantQuery = <TLabel = Record<string, string>>(query?: string, clusterName?: string) =>
  useQuery(createInstantQueryOptions<TLabel>(query, clusterName));

export const useRangeQuery = <TLabel = Record<string, string>>(
  { query, clusterName, start, end, step }: RangeQueryParams,
  options?: RangeQueryOptions
)=>
  useQuery(createRangeQueryOptions<TLabel>({ query, clusterName, start, end, step }, options));

export const useGetKubernetesPodsResource = (
  clusterName?: string,
  namespace?: string,
  enabled: boolean = true
) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['kubernetes-pods-resource', clusterName, namespace],
    queryFn: async () => {
      const pageSize = 100;
      const baseSearchParams: Record<string, string> = {
        clusterName: clusterName ?? '',
        size: String(pageSize),
      };

      if (namespace) {
        baseSearchParams.namespace = namespace;
      }

      const firstPageResponse = await api
        .get('any-cloud/kubernetes/pods', {
          searchParams: {
            ...baseSearchParams,
            page: '1',
          },
        })
        .json<KubernetesPodPageResponse>();
      const firstPage = normalizeKubernetesPodPageResponse(firstPageResponse);

      if (firstPage.totalPages === 1) {
        return firstPage.data;
      }

      const remainingPages = await Promise.all(
        Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
          api
            .get('any-cloud/kubernetes/pods', {
              searchParams: {
                ...baseSearchParams,
                page: String(index + 2),
              },
            })
            .json<KubernetesPodPageResponse>()
            .then((pageResponse) => normalizeKubernetesPodPageResponse(pageResponse))
            .catch(() => ({ data: [] as KubernetesPod[] }))
        )
      );

      const allPods = [firstPage, ...remainingPages].flatMap((page) => page.data ?? []);
      const dedupedPods = new Map<string, KubernetesPod>();

      allPods.forEach((pod, index) => {
        const podKey = [pod.metadata.namespace, pod.metadata.name, pod.spec.nodeName, index]
          .filter(Boolean)
          .join(':');
        dedupedPods.set(podKey, pod);
      });

      return [...dedupedPods.values()];
    },
    enabled: enabled && !!clusterName,
    retry: 1,
    staleTime: 30000,
  });

  return {
    pods: data ?? [],
    isPending,
    isError,
    error,
  };
};
