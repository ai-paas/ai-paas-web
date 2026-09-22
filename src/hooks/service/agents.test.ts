import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';

import { server } from '@/test/mocks/server';
import { BASE_URL } from '@/test/mocks/handlers';
import { createHookWrapper, createTestQueryClient } from '@/test/utils/test-utils';
import { useGetAdminAgents } from './agents';

describe('useGetAdminAgents', () => {
  it('게이트웨이가 받는 1-based 페이지를 보낸다', async () => {
    // 0 을 보내면 422 로 거절돼 에이전트 목록이 통째로 비었다.
    let asked: string | null = null;
    server.use(
      http.get(`${BASE_URL}/any-cloud/admin/agents`, ({ request }) => {
        asked = new URL(request.url).searchParams.get('page');
        return HttpResponse.json({ data: [], total: 0 });
      })
    );

    const { result } = renderHook(() => useGetAdminAgents(), {
      wrapper: createHookWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(asked).toBe('1');
  });
});
