import { describe, expect, it, vi } from 'vitest';
import { renderWithUser, screen } from '@/test/utils/test-utils';

const mockNavigate = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual<typeof import('react-router')>('react-router')),
  useNavigate: () => mockNavigate,
}));

vi.mock('@/hooks/service/dashboard', () => ({
  useGetInfraStatus: () => ({ clusters: [], hasData: false }),
  useGetInfraNodes: () => ({ nodes: [] }),
}));

import { InfraSection } from './infra-section';

describe('InfraSection', () => {
  // 회귀: 리소스 바로가기가 라우트에 없는 /infra-management/monitoring-dashboard로 이동하던 버그
  it('노드·리소스 바로가기는 모두 모니터링 페이지로 이동한다', async () => {
    const { user } = renderWithUser(<InfraSection />, { auth: 'admin' });
    const shortcuts = screen.getAllByRole('button', { name: '바로가기' });
    expect(shortcuts).toHaveLength(2);

    for (const shortcut of shortcuts) {
      mockNavigate.mockClear();
      await user.click(shortcut);
      expect(mockNavigate).toHaveBeenCalledWith('/infra-management/monitoring');
    }
  });
});
