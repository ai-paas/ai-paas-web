/** 화면에 보이는 구간. 짧을수록 점이 촘촘해 변화가 바로 보인다. */
export const TIME_RANGES = [
  { label: '30분', seconds: 30 * 60 },
  { label: '3시간', seconds: 3 * 60 * 60 },
  { label: '24시간', seconds: 24 * 60 * 60 },
] as const;

/** 0 은 멈춤. 분석하거나 화면을 캡처하는 동안 그래프가 흔들리지 않게 한다. */
export const REFRESH_INTERVALS = [
  { label: '10초', seconds: 10 },
  { label: '30초', seconds: 30 },
  { label: '1분', seconds: 60 },
  { label: '멈춤', seconds: 0 },
] as const;

/**
 * 구간 길이로 step 을 정한다.
 *
 * <p>step 을 고정하면 짧은 구간에서 점이 몇 개 안 남고, 긴 구간에서는 수백 개가 되어 선이
 * 뭉갠다. Prometheus 수집 주기(15s)보다 촘촘하게 잡아도 같은 값이 반복될 뿐이다.
 */
export const SCRAPE_INTERVAL_SECONDS = 15;
const TARGET_POINTS = 120;

export const stepFor = (rangeSeconds: number): number => {
  const raw = Math.round(rangeSeconds / TARGET_POINTS);
  const aligned = Math.round(raw / SCRAPE_INTERVAL_SECONDS) * SCRAPE_INTERVAL_SECONDS;
  return Math.max(SCRAPE_INTERVAL_SECONDS, aligned);
};

export const formatClock = (epochSeconds: number): string =>
  new Date(epochSeconds * 1000).toLocaleTimeString('ko-KR', { hour12: false });
