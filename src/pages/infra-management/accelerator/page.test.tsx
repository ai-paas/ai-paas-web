import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import AcceleratorPage from './page';

// @innogrid/ui 의 Table 은 height:100% 다. 부모가 높이를 주지 않으면 헤더와 페이지네이션
// 높이로 줄고, 비어 있을 때의 안내는 컨테이너 기준 absolute 라 헤더 위로 올라붙은 뒤
// overflow:hidden 에 잘린다. 빈 목록이 깨져 보이던 원인이라 래퍼 높이를 고정한다.

vi.mock('@/hooks/service/clusters', () => ({
  useGetKubernetesNodes: () => ({ nodes: [], isPending: false, isError: false }),
}));
vi.mock('@/hooks/service/monitoring', () => ({
  useInstantQuery: () => ({ data: undefined }),
  useGetKubernetesPodsResource: () => ({ pods: [] }),
}));
vi.mock('@/components/features/infra-management/cluster-picker', () => ({
  ClusterPicker: () => <div data-testid="cluster-picker" />,
}));
vi.mock('@innogrid/ui', async () => ({
  ...(await vi.importActual<typeof import('@innogrid/ui')>('@innogrid/ui')),
  Table: () => <div data-testid="table" />,
}));

describe('AcceleratorPage', () => {
  it('목록은 높이가 정해진 상자 안에 있다', () => {
    render(
      <MemoryRouter>
        <AcceleratorPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('accelerator-table-box').className).toMatch(/\bh-\[\d+px\]/);
    expect(screen.getByTestId('table')).toBeInTheDocument();
  });
});
