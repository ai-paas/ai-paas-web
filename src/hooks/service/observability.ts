import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export interface ObservabilityTarget {
  job?: string;
  instance?: string;
  health?: string;
  lastError?: string;
  lastScrape?: string;
  [key: string]: unknown;
}

export interface ObservabilityAlert {
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  state?: string;
  activeAt?: string;
  value?: string;
  [key: string]: unknown;
}

export interface AlertSilence {
  id?: string;
  matchers?: Array<{ name: string; value: string; isRegex?: boolean }>;
  startsAt?: string;
  endsAt?: string;
  createdBy?: string;
  comment?: string;
  status?: { state?: string };
  [key: string]: unknown;
}

export interface AlertRuleSet {
  id?: string;
  displayName?: string;
  description?: string;
  ruleCount?: number;
  manifestYaml?: string;
}

const extractItems = <T>(data: unknown): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.data)) return d.data as T[];
    if (d.data && typeof d.data === 'object') {
      const inner = d.data as Record<string, unknown>;
      if (Array.isArray(inner.items)) return inner.items as T[];
      if (Array.isArray(inner.data)) return inner.data as T[];
    }
    if (Array.isArray(d.items)) return d.items as T[];
  }
  return [];
};

// scrape target 상태
export const useGetObservabilityTargets = (clusterName?: string) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['observability-targets', clusterName],
    queryFn: () =>
      api.get(`any-cloud/clusters/${clusterName}/observability/targets`).json<unknown>(),
    enabled: !!clusterName,
    refetchInterval: 30000,
  });
  return { targets: extractItems<ObservabilityTarget>(data), isPending, isError };
};

// 발생 alert
export const useGetObservabilityAlerts = (clusterName?: string) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['observability-alerts', clusterName],
    queryFn: () =>
      api.get(`any-cloud/clusters/${clusterName}/observability/alerts`).json<unknown>(),
    enabled: !!clusterName,
    refetchInterval: 30000,
  });
  return { alerts: extractItems<ObservabilityAlert>(data), isPending, isError };
};

// silence 목록
export const useGetAlertSilences = (clusterName?: string) => {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['alert-silences', clusterName],
    queryFn: () =>
      api.get(`any-cloud/clusters/${clusterName}/observability/alert-silences`).json<unknown>(),
    enabled: !!clusterName,
  });
  return { silences: extractItems<AlertSilence>(data), isPending, isError, refetch };
};

// silence 생성
export const useCreateAlertSilence = (
  clusterName?: string,
  options?: { onSuccess?: () => void; onError?: (error: unknown) => void }
) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationKey: ['createAlertSilence', clusterName],
    mutationFn: (body: Record<string, unknown>) =>
      api
        .post(`any-cloud/clusters/${clusterName}/observability/alert-silences`, { json: body })
        .json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-silences', clusterName] });
      options?.onSuccess?.();
    },
    onError: (err) => options?.onError?.(err),
  });
  return { createSilence: mutate, isPending };
};

// silence 제거
export const useDeleteAlertSilence = (
  clusterName?: string,
  options?: { onSuccess?: () => void; onError?: (error: unknown) => void }
) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationKey: ['deleteAlertSilence', clusterName],
    mutationFn: (silenceId: string) =>
      api
        .delete(`any-cloud/clusters/${clusterName}/observability/alert-silences/${silenceId}`)
        .json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-silences', clusterName] });
      options?.onSuccess?.();
    },
    onError: (err) => options?.onError?.(err),
  });
  return { deleteSilence: mutate, isPending };
};

// alert rule 카탈로그 (전역)
export const useGetAlertRules = () => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['alert-rules'],
    queryFn: () => api.get('any-cloud/observability/alert-rules').json<unknown>(),
  });
  return { rules: extractItems<AlertRuleSet>(data), isPending, isError };
};

// alert rule 설치
export const useInstallAlertRule = (
  clusterName?: string,
  options?: { onSuccess?: () => void; onError?: (error: unknown) => void }
) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationKey: ['installAlertRule', clusterName],
    mutationFn: (ruleSetId: string) =>
      api
        .post(
          `any-cloud/clusters/${clusterName}/observability/alert-rules/${ruleSetId}`
        )
        .json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
      options?.onSuccess?.();
    },
    onError: (err) => options?.onError?.(err),
  });
  return { installRule: mutate, isPending };
};

// alert rule 전체 설치
export const useInstallAllAlertRules = (
  clusterName?: string,
  options?: { onSuccess?: () => void; onError?: (error: unknown) => void }
) => {
  const { mutate, isPending } = useMutation({
    mutationKey: ['installAllAlertRules', clusterName],
    mutationFn: () =>
      api
        .post(`any-cloud/clusters/${clusterName}/observability/alert-rules/install-all`)
        .json(),
    onSuccess: () => options?.onSuccess?.(),
    onError: (err) => options?.onError?.(err),
  });
  return { installAll: mutate, isPending };
};

// alert rule 제거
export const useDeleteAlertRule = (
  clusterName?: string,
  options?: { onSuccess?: () => void; onError?: (error: unknown) => void }
) => {
  const { mutate, isPending } = useMutation({
    mutationKey: ['deleteAlertRule', clusterName],
    mutationFn: (ruleSetId: string) =>
      api
        .delete(`any-cloud/clusters/${clusterName}/observability/alert-rules/${ruleSetId}`)
        .json(),
    onSuccess: () => options?.onSuccess?.(),
    onError: (err) => options?.onError?.(err),
  });
  return { deleteRule: mutate, isPending };
};

// 클러스터 대시보드 메타
export const useGetObservabilityDashboard = (clusterName?: string) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['observability-dashboard', clusterName],
    queryFn: () =>
      api.get(`any-cloud/clusters/${clusterName}/observability/dashboard`).json<unknown>(),
    enabled: !!clusterName,
  });
  return { dashboard: data, isPending, isError };
};

// 표준 metric (시계열) — node-cpu / node-memory / namespace-cpu / namespace-memory / pod-phases / top-cpu
export const useGetStandardMetric = (
  clusterName?: string,
  metric?: string,
  params?: Record<string, string>
) => {
  const searchParams = params
    ? Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
      )
    : undefined;
  const { data, isPending, isError } = useQuery({
    queryKey: ['standard-metric', clusterName, metric, searchParams],
    queryFn: () =>
      api
        .get(`any-cloud/monit/${clusterName}/standard/${metric}`, { searchParams })
        .json<unknown>(),
    enabled: !!clusterName && !!metric,
    refetchInterval: 30000,
  });
  return { metric: data, isPending, isError };
};
