import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AddonPicker, type AddonSelection } from './addon-picker';

const value: AddonSelection = { monitoring: true, gpuOperator: false, ingress: false };

describe('애드온 선택', () => {
  it('클러스터에 올릴 것들을 한 자리에서 켜고 끈다', async () => {
    // 모니터링만 고급 옵션에 숨어 있고 나머지는 화면에 없었다.
    const onChange = vi.fn();
    render(<AddonPicker value={value} onChange={onChange} hasGpuNodes={false} />);

    await userEvent.click(screen.getByLabelText('Ingress NGINX'));

    expect(onChange).toHaveBeenCalledWith({ ...value, ingress: true });
  });

  it('GPU 노드면 왜 켜졌는지 적어 준다', () => {
    render(
      <AddonPicker value={{ ...value, gpuOperator: true }} onChange={vi.fn()} hasGpuNodes />
    );

    expect(screen.getByText('GPU 노드라 자동으로 켰습니다')).toBeInTheDocument();
  });

  it('GPU 노드인데 꺼 두면 경고한다', () => {
    // 막지는 않는다. 끌 수 없게 하면 운영자가 직접 올리는 경우를 막는다.
    render(<AddonPicker value={value} onChange={vi.fn()} hasGpuNodes />);

    expect(screen.getByText('GPU 노드인데 꺼져 있습니다')).toBeInTheDocument();
    expect(screen.getByLabelText('GPU Operator')).toBeEnabled();
  });

  it('GPU 가 아니면 아무 말도 붙이지 않는다', () => {
    render(<AddonPicker value={value} onChange={vi.fn()} hasGpuNodes={false} />);

    expect(screen.queryByText(/GPU 노드/)).not.toBeInTheDocument();
  });
});
