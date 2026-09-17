import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { api } from '@/lib/api';
import { createHookWrapper, createTestQueryClient } from '@/test/utils/test-utils';
import { useDeleteCredential } from './credentials';

/**
 * 여러 건을 고르고 삭제하면 고른 만큼 지워져야 한다.
 *
 * <p>같은 useMutation 인스턴스의 mutate 를 연속으로 부를 때 앞선 호출이 묻히면 한 건만
 * 지워진다. 화면에서는 "N개 삭제" 라고 묻고 한 건만 사라진다.
 */
describe('useDeleteCredential — 여러 건 삭제', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('고른 수만큼 DELETE 를 보낸다', async () => {
    const deleted: string[] = [];
    vi.spyOn(api, 'delete').mockImplementation((url) => {
      deleted.push(String(url));
      return { json: () => Promise.resolve({}) } as ReturnType<typeof api.delete>;
    });

    const { result } = renderHook(() => useDeleteCredential(), {
      wrapper: createHookWrapper(createTestQueryClient()),
    });

    ['cred-1', 'cred-2', 'cred-3'].forEach((id) => result.current.deleteCredential(id));

    await waitFor(() => expect(deleted).toHaveLength(3));
    expect(deleted).toEqual([
      'any-cloud/credentials/cred-1',
      'any-cloud/credentials/cred-2',
      'any-cloud/credentials/cred-3',
    ]);
  });

  it('성공 콜백이 건마다 호출된다', async () => {
    vi.spyOn(api, 'delete').mockImplementation(
      () => ({ json: () => Promise.resolve({}) }) as ReturnType<typeof api.delete>
    );
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useDeleteCredential({ onSuccess }), {
      wrapper: createHookWrapper(createTestQueryClient()),
    });

    ['a', 'b', 'c'].forEach((id) => result.current.deleteCredential(id));

    // 콜백이 한 번만 오면 화면의 진행 카운트가 0 으로 내려가지 않는다.
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(3));
  });
});
