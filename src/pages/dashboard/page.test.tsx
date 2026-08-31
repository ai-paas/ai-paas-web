import { describe, expect, it, vi } from 'vitest';
import { render, renderWithUser, screen } from '@/test/utils/test-utils';
import '@/test/mocks/innogrid-ui';

const mockNavigate = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual<typeof import('react-router')>('react-router')),
  useNavigate: () => mockNavigate,
}));

// 하위 섹션은 부분 목킹 — 각 섹션의 데이터 렌더링은 개별 테스트 대상이고,
// 여기서는 isAdmin 분기에 따라 어떤 섹션이 마운트되는지만 검증한다.
vi.mock('@/components/features/dashboard/asset-summary-section', () => ({
  AssetSummarySection: () => <div data-testid="asset-summary-section" />,
}));
vi.mock('@/components/features/dashboard/activity-table', () => ({
  EventTable: () => <div data-testid="event-table" />,
  MyActivityTable: () => <div data-testid="my-activity-table" />,
}));
vi.mock('@/components/features/dashboard/infra-section', () => ({
  InfraSection: () => <div data-testid="infra-section" />,
}));
vi.mock('@/components/features/dashboard/monitoring-section', () => ({
  MonitoringSection: () => <div data-testid="monitoring-section" />,
}));
vi.mock('@/components/features/dashboard/my-service-cards', () => ({
  MyServiceCards: () => <div data-testid="my-service-cards" />,
}));
vi.mock('@/components/features/dashboard/user-table', () => ({
  UserTable: () => <div data-testid="user-table" />,
}));

import DashboardPage from './page';

describe('DashboardPage', () => {
  it('관리자에게는 자산 요약·인프라·사용자·이벤트 섹션을 렌더한다', () => {
    render(<DashboardPage />, { auth: 'admin' });

    expect(screen.getByTestId('asset-summary-section')).toBeInTheDocument();
    expect(screen.getByTestId('infra-section')).toBeInTheDocument();
    expect(screen.getByTestId('user-table')).toBeInTheDocument();
    expect(screen.getByTestId('event-table')).toBeInTheDocument();

    expect(screen.queryByTestId('my-service-cards')).not.toBeInTheDocument();
    expect(screen.queryByTestId('monitoring-section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('my-activity-table')).not.toBeInTheDocument();
  });

  it('일반 사용자에게는 나의 서비스·모니터링·나의 활동 섹션을 렌더한다', () => {
    render(<DashboardPage />, { auth: 'user' });

    expect(screen.getByTestId('my-service-cards')).toBeInTheDocument();
    expect(screen.getByTestId('monitoring-section')).toBeInTheDocument();
    expect(screen.getByTestId('my-activity-table')).toBeInTheDocument();

    expect(screen.queryByTestId('asset-summary-section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('infra-section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('user-table')).not.toBeInTheDocument();
    expect(screen.queryByTestId('event-table')).not.toBeInTheDocument();
  });

  it('관리자의 바로가기 버튼은 사용자 → 멤버 관리, 이벤트 → 이벤트 페이지로 이동한다', async () => {
    const { user } = renderWithUser(<DashboardPage />, { auth: 'admin' });
    const shortcuts = screen.getAllByRole('button', { name: '바로가기' });
    expect(shortcuts).toHaveLength(2);

    await user.click(shortcuts[0]);
    expect(mockNavigate).toHaveBeenLastCalledWith('/member-management');

    await user.click(shortcuts[1]);
    expect(mockNavigate).toHaveBeenLastCalledWith('/infra-management/event');
  });

  it('일반 사용자에게는 이벤트 바로가기만 노출된다', async () => {
    const { user } = renderWithUser(<DashboardPage />, { auth: 'user' });
    const shortcuts = screen.getAllByRole('button', { name: '바로가기' });
    expect(shortcuts).toHaveLength(1);

    await user.click(shortcuts[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/infra-management/event');
  });
});
