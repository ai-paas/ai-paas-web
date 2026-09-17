import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { subscribeSse } from '@/lib/sse';
import { queryKeys } from '@/lib/query-keys';

/** 백엔드가 보내는 변경 신호. 값이 아니라 무엇이 바뀌었는지만 담긴다. */
export interface ResourceChangedSignal {
  type: string;
  name?: string;
}

/**
 * 신호 하나가 어떤 조회를 무효화하는지.
 *
 * <p>상위 키 하나로 하위를 모두 덮는다 — 하위 키를 나열하면 새 화면이 생길 때마다 빠뜨린다.
 * 모르는 종류는 빈 배열이다. 모른다고 전체를 지우면 신호 하나에 화면 전체가 다시 로딩된다.
 */
export const invalidationKeysFor = (
  signal: ResourceChangedSignal
): ReadonlyArray<readonly unknown[]> => {
  switch (signal.type) {
    case 'vmCluster':
      // 클러스터 목록은 VM 행과 등록 행을 합쳐 보여줘 함께 갱신해야 한다.
      return [queryKeys.vms.all, queryKeys.clusterNodes.all, queryKeys.clusters.all];
    case 'operation':
      return [queryKeys.operations.all, queryKeys.vms.all];
    case 'credential':
      return [queryKeys.credentials.all];
    case 'cluster':
      return [queryKeys.clusters.all];
    default:
      return [];
  }
};

/**
 * 변경 신호를 받아 해당 조회만 다시 부른다. 앱에서 한 번만 붙인다 — 화면마다 붙이면
 * 화면 수만큼 연결이 생긴다.
 */
export const useResourceEvents = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const controller = new AbortController();

    void subscribeSse('any-cloud/events', {
      signal: controller.signal,
      onMessage: ({ event, data }) => {
        if (event !== 'changed') return;
        try {
          const signal = JSON.parse(data) as ResourceChangedSignal;
          for (const key of invalidationKeysFor(signal)) {
            queryClient.invalidateQueries({ queryKey: key });
          }
        } catch {
          // 알 수 없는 프레임은 버린다. 신호 하나가 깨졌다고 스트림을 끊을 이유가 없다.
        }
      },
    });

    return () => controller.abort();
  }, [queryClient]);
};

/**
 * 스트림을 여는 것 말고는 아무것도 그리지 않는다.
 *
 * <p>레이아웃에서 직접 훅을 부르면 인증 전에도 열린다 — 토큰 없이 붙으면 401 재연결이
 * 반복된다. 인증된 트리 안에서만 마운트되도록 컴포넌트로 감싼다.
 */
export const ResourceEventsBridge = () => {
  useResourceEvents();
  return null;
};
