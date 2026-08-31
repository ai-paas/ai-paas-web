import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils/test-utils';
import '@/test/mocks/innogrid-ui';
import { DetailValue } from './detail-value';

describe('DetailValue', () => {
  it('로딩이 아니면 children을 그대로 렌더링한다', () => {
    render(<DetailValue>서비스-01</DetailValue>);

    expect(screen.getByText('서비스-01')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('로딩 중이면 children 대신 스켈레톤을 렌더링한다 (기본 너비 120px)', () => {
    render(<DetailValue isLoading>서비스-01</DetailValue>);

    expect(screen.queryByText('서비스-01')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveStyle({ width: '120px' });
  });

  it('width로 스켈레톤 너비를 지정할 수 있다', () => {
    render(<DetailValue isLoading width={80} />);

    expect(screen.getByRole('status')).toHaveStyle({ width: '80px' });
  });
});
