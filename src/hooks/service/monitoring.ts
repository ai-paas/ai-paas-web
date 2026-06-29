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

// page.tsx 가 30s 주기로 anchor 갱신 — 그 사이 focus/mount/reconnect refetch 는 차단.
const MONITOR_QUERY_DEFAULTS = {
  staleTime: 25_000,
  gcTime: 5 * 60_000,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
} as const;

export const createInstantQueryOptions = <TLabel = Record<string, string>>(
  query?: string,
  clusterName?: string,
  options?: { enabled?: boolean }
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
    enabled: (options?.enabled ?? true) && !!query && !!clusterName,
    ...MONITOR_QUERY_DEFAULTS,
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
    ...MONITOR_QUERY_DEFAULTS,
  });

export const useInstantQuery = <TLabel = Record<string, string>>(
  query?: string,
  clusterName?: string,
  options?: { enabled?: boolean }
) => useQuery(createInstantQueryOptions<TLabel>(query, clusterName, options));

export interface MultiQuerySpec {
  name: string;
  type: 'instant' | 'range';
  query: string;
  time?: string;
  start?: number;
  end?: number;
  step?: number;
}

// N개 PromQL 을 backend 가 병렬 실행. 모니터링 페이지 27 요청 → 1 요청.
export const useMultiPromQuery = (
  clusterName: string | undefined,
  queries: MultiQuerySpec[],
  options?: { enabled?: boolean }
) => {
  const queryKey = useMemoizedQueryKey(clusterName, queries);
  return useQuery({
    queryKey,
    queryFn: async () => {
      const body = {
        queries: queries.map((q) => ({
          name: q.name,
          type: q.type,
          query: q.query,
          ...(q.time !== undefined ? { time: q.time } : {}),
          ...(q.start !== undefined ? { start: String(q.start) } : {}),
          ...(q.end !== undefined ? { end: String(q.end) } : {}),
          ...(q.step !== undefined ? { step: String(q.step) } : {}),
        })),
      };
      const raw = await api
        .post(`any-cloud/monit/${clusterName}/multi-query`, { json: body })
        .json<Record<string, PrometheusQueryResponse>>();
      return raw;
    },
    enabled: (options?.enabled ?? true) && !!clusterName && queries.length > 0,
    ...MONITOR_QUERY_DEFAULTS,
  });
};

// queryKey 안정화 — queries 배열 ref 가 매 렌더 새로 만들어져도 동일 spec 이면 같은 key.
const useMemoizedQueryKey = (clusterName: string | undefined, queries: MultiQuerySpec[]) => {
  const signature = queries
    .map((q) => `${q.name}:${q.type}:${q.query}:${q.start ?? ''}:${q.end ?? ''}:${q.step ?? ''}:${q.time ?? ''}`)
    .join('|');
  return ['monitoring-multi-query', clusterName, signature];
};

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
  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
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
    isFetching,
    isError,
    error,
    refetch,
  };
};
