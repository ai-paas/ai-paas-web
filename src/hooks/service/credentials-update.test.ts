import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { BASE_URL } from '@/test/mocks/handlers';
import { createHookWrapper, createTestQueryClient } from '@/test/utils/test-utils';
import { useUpdateCredential } from './credentials';

describe('useUpdateCredential', () => {
  const capture = () => {
    const seen: Array<Record<string, unknown>> = [];
    server.use(
      http.patch(`${BASE_URL}/any-cloud/credentials/:id`, async ({ request }) => {
        seen.push((await request.json()) as Record<string, unknown>);
        return HttpResponse.json({ data: { id: 'c1' } });
      })
    );
    return seen;
  };

  it('설명만 바꿀 때 값은 보내지 않는다', async () => {
    const seen = capture();
    const { result } = renderHook(() => useUpdateCredential(), {
      wrapper: createHookWrapper(createTestQueryClient()),
    });

    result.current.updateCredential({ credentialId: 'c1', description: '새 설명' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // 값을 안 보내면 백엔드가 건드리지 않는다. 빈 객체를 보내면 의미가 달라진다.
    expect(seen[0].description).toBe('새 설명');
    expect(seen[0].credentials).toBeUndefined();
  });

  it('값을 바꾸면 전체를 보낸다', async () => {
    const seen = capture();
    const { result } = renderHook(() => useUpdateCredential(), {
      wrapper: createHookWrapper(createTestQueryClient()),
    });

    result.current.updateCredential({
      credentialId: 'c1',
      credentials: { AWS_ACCESS_KEY_ID: 'a', AWS_SECRET_ACCESS_KEY: 'b' },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(seen[0].credentials).toEqual({ AWS_ACCESS_KEY_ID: 'a', AWS_SECRET_ACCESS_KEY: 'b' });
  });
});
