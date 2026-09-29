import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { queryKeys } from '@/lib/query-keys';

export interface AuditLog {
  id?: string;
  requestId?: string;
  principal?: string;
  clientIp?: string;
  httpMethod?: string;
  path?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  statusCode?: number;
  durationMs?: number;
  createdAt?: string;
  [key: string]: unknown;
}

interface AuditLogEnvelope {
  data?: { items?: AuditLog[] } | AuditLog[];
  items?: AuditLog[];
  meta?: { pagination?: { pageSize?: number; totalEstimate?: number } };
}

export interface ListAuditLogsParams {
  /** 백엔드는 limit 으로 받는다. pageSize 를 보내면 무시되고 기본 100 이 쓰인다. */
  limit?: number;
  /** 0-based. 감사 로그는 계속 쌓이므로 첫 페이지만으로는 부족하다. */
  page?: number;
  principal?: string;
  path?: string;
  statusCode?: number;
}

// 감사 로그 조회
export const useGetAuditLogs = (params: ListAuditLogsParams = {}) => {
  const searchParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ) as Record<string, string | number>;

  const { data, isPending, isError, error } = useQuery({
    queryKey: queryKeys.auditLogs.list(searchParams),
    queryFn: () =>
      api
        .get('any-cloud/audit-logs', {
          searchParams: Object.fromEntries(
            Object.entries(searchParams).map(([k, v]) => [k, String(v)])
          ),
        })
        .json<AuditLogEnvelope>(),
  });

  const items =
    (data && 'data' in data && Array.isArray(data.data) ? data.data : undefined) ??
    (data && 'data' in data && data.data && 'items' in data.data ? data.data.items : undefined) ??
    (data && 'items' in data ? data.items : undefined) ??
    [];

  // 총 건수를 모르면 마지막 페이지를 계산할 수 없다 — 지금은 받은 건수만큼만 페이지가 생겼다.
  const totalCount = data?.meta?.pagination?.totalEstimate ?? items.length;

  return { logs: items, totalCount, isPending, isError, error };
};
