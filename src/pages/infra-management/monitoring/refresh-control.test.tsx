import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { RefreshControl, RefreshStatusDot } from './refresh-control';
import { SCRAPE_INTERVAL_SECONDS, stepFor } from './refresh-options';

describe('stepFor', () => {
  it('구간이 짧아지면 점이 촘촘해진다', () => {
    // step 이 고정이면 짧은 구간에서 점이 몇 개 안 남아 그래프가 멈춰 보인다.
    expect(stepFor(30 * 60)).toBeLessThan(stepFor(3 * 60 * 60));
  });

  it('수집 주기보다 촘촘하게 잡지 않는다', () => {
    // 같은 값이 반복될 뿐인데 점만 늘어난다.
    expect(stepFor(60)).toBe(SCRAPE_INTERVAL_SECONDS);
    expect(stepFor(30 * 60) % SCRAPE_INTERVAL_SECONDS).toBe(0);
  });
});

describe('RefreshStatusDot', () => {
  const renderDot = (refreshSeconds = 30, isFetching = false) =>
    render(
      <RefreshStatusDot
        refreshSeconds={refreshSeconds}
        updatedAt={new Date('2026-09-21T05:04:03Z').getTime()}
        isFetching={isFetching}
      />
    );

  it('마지막으로 받은 시각과 주기를 툴팁으로 남긴다', () => {
    // 본문에 적으면 자리를 차지하는데 평소에 읽을 일은 거의 없다.
    renderDot();

    const dot = screen.getByTestId('refresh-status');
    expect(dot).toHaveAttribute('title', expect.stringContaining('마지막 갱신'));
    expect(dot).toHaveAttribute('title', expect.stringContaining('30초마다'));
  });

  it('멈춤과 동작 중을 다른 색으로 가른다', () => {
    // 멈춰 둔 화면이 고장처럼 보이면 안 된다.
    const { unmount } = renderDot(30);
    const live = screen.getByTestId('refresh-status').className;
    unmount();

    renderDot(0);
    const paused = screen.getByTestId('refresh-status').className;

    expect(live).not.toEqual(paused);
    expect(screen.getByTestId('refresh-status')).toHaveAttribute(
      'title',
      expect.stringContaining('멈춤')
    );
  });
});

describe('RefreshControl', () => {
  const setup = (refreshSeconds = 30) => {
    const onRangeChange = vi.fn();
    const onRefreshChange = vi.fn();
    render(
      <RefreshControl
        rangeSeconds={30 * 60}
        onRangeChange={onRangeChange}
        refreshSeconds={refreshSeconds}
        onRefreshChange={onRefreshChange}
      />
    );
    return { onRangeChange, onRefreshChange };
  };

  it('구간과 주기를 바꿀 수 있다', () => {
    const { onRangeChange, onRefreshChange } = setup();

    fireEvent.click(screen.getByRole('button', { name: '3시간' }));
    fireEvent.click(screen.getByRole('button', { name: '10초' }));

    expect(onRangeChange).toHaveBeenCalledWith(3 * 60 * 60);
    expect(onRefreshChange).toHaveBeenCalledWith(10);
  });

  it('고른 구간을 눌린 상태로 표시한다', () => {
    setup();

    expect(screen.getByRole('button', { name: '30분' })).toHaveAttribute('aria-pressed', 'true');
  });
});
