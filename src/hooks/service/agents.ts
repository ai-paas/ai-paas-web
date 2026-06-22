import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AdminAgent, AdminAgentsResponse } from '@/types/agent';

/**
 * Admin fleet 페이지의 cluster-agent 목록 조회 — 30s polling.
 * 단순화: 전체 fetch 후 client-side 검색/페이지네이션 (cluster-management 와 동일 패턴).
 * 운영자가 보는 agent 수는 cluster 수와 같은 order (수십~수백) — 한 번에 가져와도 부담 없음.
 */
export const useGetAdminAgents = () => {
  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['admin-agents'],
    queryFn: async () => {
      return api
        .get('any-cloud/admin/agents', { searchParams: { page: '0', size: '200' } })
        .json<AdminAgentsResponse>();
    },
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });
  const agents: AdminAgent[] = data?.data ?? [];
  const total = data?.total ?? agents.length;
  return { agents, total, isPending, isFetching, isError, error, refetch };
};
