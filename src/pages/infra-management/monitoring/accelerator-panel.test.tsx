import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AcceleratorPanel, type AcceleratorPanelProps } from './accelerator-panel';

vi.mock('./metric-line-chart', () => ({
  MetricLineChart: ({ title }: { title: string }) => <div data-testid={`chart-${title}`} />,
}));

const emptyCharts = {
  util: undefined,
  memory: undefined,
  temperature: undefined,
  power: undefined,
  smActive: undefined,
  tensorActive: undefined,
  dramActive: undefined,
  pcie: undefined,
};

const renderPanel = (override: Partial<AcceleratorPanelProps> = {}) =>
  render(
    <AcceleratorPanel
      isPending={false}
      totalGpu={4}
      allocatedGpu={4}
      devices={[
        {
          key: 'w1/0',
          node: 'w1',
          device: '0',
          model: 'NVIDIA L4',
          util: 91,
          memUsedMib: 20480,
          memTotalMib: 23552,
          tempC: 72,
          powerW: 68,
        },
        {
          key: 'w1/1',
          node: 'w1',
          device: '1',
          model: 'NVIDIA L4',
          util: 0,
          memUsedMib: 0,
          memTotalMib: 23552,
          tempC: 34,
          powerW: 18,
        },
      ]}
      pods={[{ key: 'ml/train-0', namespace: 'ml', pod: 'train-0', node: 'w1', count: 2 }]}
      xidCount={0}
      throttledCount={0}
      eccErrorCount={0}
      charts={emptyCharts}
      {...override}
    />
  );

describe('AcceleratorPanel', () => {
  it('할당률과 실사용률을 따로 보여준다', () => {
    // 둘을 합쳐 두면 8 장을 잡아 두고 아무것도 안 돌리는 클러스터가 100% 로 읽힌다.
    renderPanel();

    expect(screen.getByText('할당')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('실사용')).toBeInTheDocument();
    expect(screen.getByText('46%')).toBeInTheDocument();
  });

  it('노는 장을 센다', () => {
    renderPanel();

    expect(screen.getByTestId('gpu-idle-count')).toHaveTextContent('1장');
  });

  it('장치마다 한 줄씩 나온다', () => {
    renderPanel();

    expect(screen.getByTestId('gpu-device-w1/0')).toHaveTextContent('NVIDIA L4');
    expect(screen.getByTestId('gpu-device-w1/1')).toBeInTheDocument();
  });

  it('GPU 를 점유한 파드를 보여준다', () => {
    renderPanel();

    expect(screen.getByText('train-0')).toBeInTheDocument();
    expect(screen.getByText('ml')).toBeInTheDocument();
  });

  it('하드웨어 오류는 XID 와 ECC 를 합쳐 센다', () => {
    renderPanel({ xidCount: 1, eccErrorCount: 2 });

    expect(screen.getByTestId('gpu-fault-count')).toHaveTextContent('3건');
  });

  it('사용률만으로는 안 보이는 지표를 함께 건다', () => {
    renderPanel();

    expect(screen.getByTestId('chart-SM ACTIVE')).toBeInTheDocument();
    expect(screen.getByTestId('chart-TENSOR CORE ACTIVE')).toBeInTheDocument();
    expect(screen.getByTestId('chart-MEMORY BANDWIDTH ACTIVE')).toBeInTheDocument();
    expect(screen.getByTestId('chart-PCIE THROUGHPUT')).toBeInTheDocument();
  });

  it('장치가 없으면 빈 표 대신 이유를 적는다', () => {
    renderPanel({ devices: [], pods: [] });

    expect(screen.getByText('수집된 GPU 장치가 없습니다.')).toBeInTheDocument();
    expect(screen.getByText('GPU 를 요청한 파드가 없습니다.')).toBeInTheDocument();
  });
});
