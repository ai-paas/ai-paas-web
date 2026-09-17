import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import UsagePage from './page';

vi.mock('@/hooks/service/monitoring', () => ({
  useRangeQuery: () => ({ data: undefined, isPending: false }),
}));
vi.mock('@/components/features/infra-management/cluster-picker', () => ({
  ClusterPicker: () => <div data-testid="cluster-picker" />,
}));

const renderUsage = () =>
  render(
    <MemoryRouter>
      <UsagePage clusterName="demo" />
    </MemoryRouter>
  );

describe('UsagePage 화면 구조', () => {
  it('각 영역에 무엇을 보여주는지 제목이 붙는다', () => {
    // 제목 없이 카드만 떠 있으면 무엇의 사용량인지 화면에서 알 수 없다.
    renderUsage();

    expect(screen.getByText('가속기 사용량')).toBeInTheDocument();
    expect(screen.getByText('가속기 사용량 히트맵')).toBeInTheDocument();
  });

  it('카드 틀은 다른 인프라 화면과 같은 것을 쓴다', () => {
    /*
     * 공용 레이아웃 클래스는 화면에 드러나는 형태가 없어 role 이나 text 로는 잡을 수 없다.
     * 그런데 이 화면이 테두리와 모서리를 따로 만들던 것이 바로 고친 문제라, 클래스로라도
     * 고정하지 않으면 다음에 또 어긋난다.
     */
    const { container } = renderUsage();

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelectorAll('.page-detail-round-box')).toHaveLength(2);
  });

  it('히트맵은 그대로 남는다', () => {
    // 이 화면에만 있는 표현이라 없애면 볼 수 있는 것이 줄어든다.
    renderUsage();

    expect(screen.getByText('Node / Device')).toBeInTheDocument();
  });

  it('가속기 지표가 없으면 무엇을 확인할지 알려준다', () => {
    // "데이터가 없습니다" 만으로는 GPU 가 없는 건지 수집기가 빠진 건지 알 수 없다.
    renderUsage();

    expect(screen.getByText(/가속기 지표가 없습니다/)).toBeInTheDocument();
    expect(screen.getByText(/DCGM exporter/)).toBeInTheDocument();
  });
});

describe('기간 선택', () => {
  it('하나만 고르는 조작이라는 것이 화면에 드러난다', () => {
    // 버튼을 직접 꾸미면 눌린 상태를 보조기술이 알 수 없다. 라디오는 그 자체로 알려준다.
    renderUsage();

    const group = screen.getByRole('radiogroup');
    expect(within(group).getByLabelText('24시간')).toBeChecked();
  });

  it('기간 후보가 모두 있다', () => {
    renderUsage();

    const group = screen.getByRole('radiogroup');
    for (const label of ['24시간', '7일', '30일']) {
      expect(within(group).getByLabelText(label)).toBeInTheDocument();
    }
  });

  it('고르면 그 기간으로 바뀐다', () => {
    renderUsage();
    const group = screen.getByRole('radiogroup');

    fireEvent.click(within(group).getByLabelText('7일'));

    expect(within(group).getByLabelText('7일')).toBeChecked();
    expect(within(group).getByLabelText('24시간')).not.toBeChecked();
  });
});
