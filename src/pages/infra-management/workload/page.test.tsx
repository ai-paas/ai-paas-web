import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import WorkloadPage from './page';

let podsState = { pods: [] as unknown[], isLoading: false, isError: false };

vi.mock('@/hooks/service/monitoring', () => ({
  useGetKubernetesPodsResource: () => podsState,
}));
vi.mock('@/hooks/service/clusters', () => ({
  useGetKubernetesNamespaces: () => ({ namespaces: [], isPending: false }),
}));
vi.mock('@/components/features/infra-management/cluster-picker', () => ({
  ClusterPicker: () => <div data-testid="cluster-picker" />,
}));

const renderPage = (props: { clusterName?: string } = {}) =>
  render(
    <MemoryRouter>
      <WorkloadPage {...props} />
    </MemoryRouter>
  );

describe('WorkloadPage', () => {
  beforeEach(() => {
    podsState = { pods: [], isLoading: false, isError: false };
  });

  it('클러스터를 고르기 전에는 무엇을 해야 하는지 말한다', () => {
    // 비활성 쿼리의 isPending 을 로딩으로 읽어 표가 영원히 돌던 자리다.
    renderPage();

    expect(screen.getByText('클러스터를 선택해주세요.')).toBeInTheDocument();
  });

  it('클러스터가 정해져 있으면 고르라고 하지 않는다', () => {
    // 클러스터 상세 안에서는 그 클러스터로 고정된다.
    renderPage({ clusterName: 'demo' });

    expect(screen.queryByText('클러스터를 선택해주세요.')).not.toBeInTheDocument();
  });

  it('GPU 워크로드가 없으면 없다고 말한다', () => {
    renderPage({ clusterName: 'demo' });

    expect(screen.getByText('GPU 워크로드가 없습니다.')).toBeInTheDocument();
  });

  it('조회에 실패하면 실패라고 말한다', () => {
    // "없음" 과 "못 가져옴" 은 뒤져야 할 곳이 다르다.
    podsState = { pods: [], isLoading: false, isError: true };
    renderPage({ clusterName: 'demo' });

    expect(screen.getByText(/불러오는 데 실패/)).toBeInTheDocument();
  });

  it('클러스터 상세 안에서는 클러스터 선택을 보여주지 않는다', () => {
    renderPage({ clusterName: 'demo' });

    expect(screen.queryByTestId('cluster-picker')).not.toBeInTheDocument();
  });

  it('단독 화면에서는 클러스터를 고를 수 있다', () => {
    renderPage();

    expect(screen.getByTestId('cluster-picker')).toBeInTheDocument();
  });
});
