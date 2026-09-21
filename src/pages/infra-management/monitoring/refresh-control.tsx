import styles from './refresh-control.module.scss';
import { formatClock, REFRESH_INTERVALS, TIME_RANGES } from './refresh-options';

type RefreshControlProps = {
  rangeSeconds: number;
  onRangeChange: (seconds: number) => void;
  refreshSeconds: number;
  onRefreshChange: (seconds: number) => void;
};

type RefreshStatusDotProps = {
  refreshSeconds: number;
  updatedAt?: number;
  isFetching: boolean;
};

/**
 * 제목 옆 점 하나로 살아 있다는 것만 알린다.
 *
 * <p>시각과 주기를 본문에 적으면 자리를 차지하는데, 평소에 읽을 일은 거의 없다. 멈춤과
 * 고장은 다르므로 색으로 가른다 — 멈춰 둔 화면이 고장처럼 보이면 안 된다.
 */
export const RefreshStatusDot = ({
  refreshSeconds,
  updatedAt,
  isFetching,
}: RefreshStatusDotProps) => {
  const paused = refreshSeconds <= 0;
  const title = [
    updatedAt ? `마지막 갱신 ${formatClock(updatedAt / 1000)}` : '갱신 대기',
    paused ? '멈춤' : `${refreshSeconds}초마다`,
  ].join(' · ');

  return (
    <span
      className={`${styles.dot} ${paused ? styles.dotPaused : styles.dotLive} ${
        isFetching ? styles.dotFetching : ''
      }`}
      role="status"
      aria-label={title}
      title={title}
      data-testid="refresh-status"
    />
  );
};

export const RefreshControl = ({
  rangeSeconds,
  onRangeChange,
  refreshSeconds,
  onRefreshChange,
}: RefreshControlProps) => (
  <div className={styles.bar}>
    <div className={styles.group}>
      <span className={styles.label}>구간</span>
      <div className={styles.segment} role="group" aria-label="시간 구간">
        {TIME_RANGES.map((range) => (
          <button
            key={range.seconds}
            type="button"
            className={`${styles.segmentButton} ${
              rangeSeconds === range.seconds ? styles.segmentButtonActive : ''
            }`}
            aria-pressed={rangeSeconds === range.seconds}
            onClick={() => onRangeChange(range.seconds)}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>

    <div className={styles.group}>
      <span className={styles.label}>갱신</span>
      <div className={styles.segment} role="group" aria-label="갱신 주기">
        {REFRESH_INTERVALS.map((interval) => (
          <button
            key={interval.seconds}
            type="button"
            className={`${styles.segmentButton} ${
              refreshSeconds === interval.seconds ? styles.segmentButtonActive : ''
            }`}
            aria-pressed={refreshSeconds === interval.seconds}
            onClick={() => onRefreshChange(interval.seconds)}
          >
            {interval.label}
          </button>
        ))}
      </div>
    </div>

  </div>
);
