import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AcceleratorPanel } from './accelerator-panel';

vi.mock('./metric-line-chart', () => ({
  MetricLineChart: ({ title }: { title: string }) => <div data-testid={`chart-${title}`} />,
}));

const renderPanel = () =>
  render(
    <AcceleratorPanel
      isPending={false}
      charts={{
        util: undefined,
        memory: undefined,
        temperature: undefined,
        power: undefined,
        smActive: undefined,
        tensorActive: undefined,
        dramActive: undefined,
        pcie: undefined,
      }}
    />
  );

describe('AcceleratorPanel', () => {
  it('사용률만으로는 안 보이는 지표를 함께 건다', () => {
    // GPU_UTIL 은 커널이 떠 있기만 해도 100% 다. 얼마나 채웠는지는 SM, 텐서코어로만 보인다.
    renderPanel();

    expect(screen.getByTestId('chart-SM ACTIVE')).toBeInTheDocument();
    expect(screen.getByTestId('chart-TENSOR CORE ACTIVE')).toBeInTheDocument();
    expect(screen.getByTestId('chart-MEMORY BANDWIDTH ACTIVE')).toBeInTheDocument();
    expect(screen.getByTestId('chart-PCIE THROUGHPUT')).toBeInTheDocument();
  });

  it('기존 GPU 그래프도 이 섹션이 맡는다', () => {
    renderPanel();

    expect(screen.getByTestId('chart-GPU UTILIZATION')).toBeInTheDocument();
    expect(screen.getByTestId('chart-GPU MEMORY USAGE')).toBeInTheDocument();
    expect(screen.getByTestId('chart-GPU TEMPERATURE')).toBeInTheDocument();
    expect(screen.getByTestId('chart-GPU POWER USAGE')).toBeInTheDocument();
  });

  it('장치 목록과 점유 파드는 가속기 페이지 몫이라 여기 없다', () => {
    renderPanel();

    expect(screen.queryByText('장치별 현황')).not.toBeInTheDocument();
    expect(screen.queryByText('GPU 점유 파드')).not.toBeInTheDocument();
  });
});
