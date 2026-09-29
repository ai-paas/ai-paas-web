import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { CollectorNotice } from './collector-notice';

describe('CollectorNotice', () => {
  it('장치는 있는데 수집기가 없다는 것과 설치 경로를 알린다', () => {
    // 값 0 으로만 보여 주면 "놀고 있다" 로 읽혀 할 일을 알 수 없다.
    render(
      <MemoryRouter>
        <CollectorNotice deviceName="GPU" addonName="NVIDIA GPU Operator" clusterName="c1" />
      </MemoryRouter>
    );

    expect(screen.getByRole('status')).toHaveTextContent('NVIDIA GPU Operator');
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/infra-management/cluster-management/c1/addons'
    );
  });

  it('클러스터를 모르면 링크를 걸지 않는다', () => {
    render(
      <MemoryRouter>
        <CollectorNotice deviceName="NPU" addonName="Furiosa NPU Exporter" />
      </MemoryRouter>
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
