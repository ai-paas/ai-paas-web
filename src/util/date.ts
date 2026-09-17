export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return '';
  // 이미 타임존 표기(Z 또는 +09:00 등)가 있으면 그대로, 없으면 UTC(naive)로 간주해 'Z' 부여
  const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(dateString);
  const date = new Date(hasTimezone ? dateString : dateString + 'Z');
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function formatElapsed(seconds?: number | null): string {
  if (seconds === undefined || seconds === null || seconds < 0) return '-';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s].map((v) => v.toString().padStart(2, '0')).join(':');
}

export function formatRelativeTime(dateString?: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 0) {
    return '방금 전';
  }

  const intervals = {
    년: 31536000,
    개월: 2592000,
    주: 604800,
    일: 86400,
    시간: 3600,
    분: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval}${unit} 전`;
    }
  }

  return '방금 전';
}

/**
 * 시작 시각 이후 흐른 시간을 사람이 읽는 말로.
 *
 * <p>진행 중인 작업 옆에 붙는다. {@link formatElapsed} 의 "00:03:42" 는 한 번 더 읽어야 해서
 * 흘깃 보는 자리에는 맞지 않는다.
 *
 * @param nowMs 테스트에서 시각을 고정하기 위한 기준. 비우면 현재 시각.
 */
export function formatDurationSince(startedAt?: string | null, nowMs?: number): string {
  if (!startedAt) return '';
  const started = new Date(startedAt).getTime();
  if (Number.isNaN(started)) return '';

  const seconds = Math.max(0, Math.floor(((nowMs ?? Date.now()) - started) / 1000));
  if (seconds < 60) return `${seconds}초`;

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}시간 ${m}분`;
  return `${m}분 ${seconds % 60}초`;
}
