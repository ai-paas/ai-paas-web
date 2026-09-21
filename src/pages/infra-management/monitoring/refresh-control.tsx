import styles from './refresh-control.module.scss';
import { formatClock, REFRESH_INTERVALS, TIME_RANGES } from './refresh-options';

type RefreshControlProps = {
  rangeSeconds: number;
  onRangeChange: (seconds: number) => void;
  refreshSeconds: number;
  onRefreshChange: (seconds: number) => void;
  updatedAt?: number;
  isFetching: boolean;
};

export const RefreshControl = ({
  rangeSeconds,
  onRangeChange,
  refreshSeconds,
  onRefreshChange,
  updatedAt,
  isFetching,
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

    <div className={styles.status} data-testid="refresh-status">
      {/* 멈춰 있는 화면과 값이 안 바뀌는 화면은 다르다. 마지막으로 받은 시각을 적어 구분한다. */}
      <span className={`${styles.dot} ${isFetching ? styles.dotActive : ''}`} aria-hidden="true" />
      {updatedAt ? `마지막 갱신 ${formatClock(updatedAt / 1000)}` : '갱신 대기'}
      {refreshSeconds > 0 ? ` · ${refreshSeconds}초마다` : ' · 멈춤'}
    </div>
  </div>
);
