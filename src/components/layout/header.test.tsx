import { describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { BASE_URL } from '@/test/mocks/handlers';
import { renderWithUser, screen, waitFor } from '@/test/utils/test-utils';
import { getAccessToken } from '@/lib/api';
import { Header } from './header';

describe('Header 로그아웃', () => {
  it('내 계정 버튼을 클릭하면 로그아웃 메뉴가 열린다', async () => {
    const { user } = renderWithUser(<Header />, { auth: 'user' });

    expect(screen.queryByRole('menuitem', { name: '로그아웃' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '내 계정' }));

    expect(screen.getByRole('menuitem', { name: '로그아웃' })).toBeInTheDocument();
  });

  it('로그아웃 클릭 시 로그아웃 API를 호출하고 토큰을 비운다', async () => {
    const requestSpy = vi.fn();
    server.use(
      http.post(`${BASE_URL}/auth/logout`, () => {
        requestSpy();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const { user } = renderWithUser(<Header />, { auth: 'user' });

    await user.click(screen.getByRole('button', { name: '내 계정' }));
    await user.click(screen.getByRole('menuitem', { name: '로그아웃' }));

    await waitFor(() => {
      expect(getAccessToken()).toBeNull();
    });
    expect(requestSpy).toHaveBeenCalledTimes(1);
  });

  it('로그아웃 API가 실패해도 로컬 토큰은 비운다', async () => {
    server.use(
      http.post(`${BASE_URL}/auth/logout`, () =>
        HttpResponse.json({ message: 'error' }, { status: 500 })
      )
    );

    const { user } = renderWithUser(<Header />, { auth: 'user' });

    await user.click(screen.getByRole('button', { name: '내 계정' }));
    await user.click(screen.getByRole('menuitem', { name: '로그아웃' }));

    await waitFor(() => {
      expect(getAccessToken()).toBeNull();
    });
  });
});
