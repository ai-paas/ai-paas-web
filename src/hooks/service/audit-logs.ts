import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export interface AuditLog {
  id?: string;
  requestId?: string;
  principal?: string;
  clientIp?: string;
  httpMethod?: string;
  path?: string;
  status?: number;
  timestamp?: string;
  [key: string]: unknown;
}

export interface ListAuditLogsParams {
  pageSize?: number;
  pageToken?: string;
  principal?: string;
  path?: string;
  status?: number;
}

// 감사 로그 조회
export const useGetAuditLogs = (params: ListAuditLogsParams = {}) => {
  const searchParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ) as Record<string, string | number>;

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['audit-logs', searchParams],
    queryFn: () =>
      api
        .get('any-cloud/audit-logs', {
          searchParams: Object.fromEntries(
            Object.entries(searchParams).map(([k, v]) => [k, String(v)])
          ),
        })
        .json<{ data?: { items?: AuditLog[] } | AuditLog[]; items?: AuditLog[] }>(),
  });

  const items =
    (data && 'data' in data && Array.isArray(data.data) ? data.data : undefined) ??
    (data && 'data' in data && data.data && 'items' in data.data ? data.data.items : undefined) ??
    (data && 'items' in data ? data.items : undefined) ??
    [];

  return { logs: items, isPending, isError, error };
};
