import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  formatDateTime,
  formatDurationSince,
  formatElapsed,
  formatRelativeTime,
  parseServerDate,
} from './date';

// vitest 설정에서 TZ='Asia/Seoul' 고정 — 모든 기대값은 KST 기준이다.

describe('date 유틸', () => {
  // ============================================
  // formatDateTime 테스트
  // ============================================
  describe('formatDateTime', () => {
    it('undefined면 빈 문자열을 반환한다', () => {
      expect(formatDateTime(undefined)).toBe('');
      expect(formatDateTime()).toBe('');
    });

    it('빈 문자열이면 빈 문자열을 반환한다', () => {
      expect(formatDateTime('')).toBe('');
    });

    it('타임존 표기가 없는 naive 문자열은 UTC로 간주해 KST(+9시간)로 변환한다', () => {
      expect(formatDateTime('2026-01-01T00:00:00')).toBe('2026-01-01 09:00');
    });

    it('naive 문자열의 UTC→KST 변환으로 날짜가 넘어가는 경우를 처리한다', () => {
      expect(formatDateTime('2026-01-01T20:30:00')).toBe('2026-01-02 05:30');
    });

    it.each([
      ['대문자 Z 접미사', '2026-01-01T00:00:00Z', '2026-01-01 09:00'],
      ['소문자 z 접미사', '2026-01-01T00:00:00z', '2026-01-01 09:00'],
      ['+09:00 오프셋', '2026-01-01T09:00:00+09:00', '2026-01-01 09:00'],
      ['콜론 없는 -0500 오프셋', '2026-01-01T00:00:00-0500', '2026-01-01 14:00'],
    ])('%s 표기를 파싱해 KST로 변환한다 (%s → %s)', (_label, input, expected) => {
      expect(formatDateTime(input)).toBe(expected);
    });

    it('파싱할 수 없는 문자열이면 빈 문자열을 반환한다', () => {
      expect(formatDateTime('not-a-date')).toBe('');
      expect(formatDateTime('2026-13-99T99:99:99Z')).toBe('');
    });

    it('한 자리 월·일·시·분을 0으로 패딩한다', () => {
      // UTC 2025-12-31 18:03 → KST 2026-01-01 03:03 (월·일·시·분 모두 한 자리)
      expect(formatDateTime('2025-12-31T18:03:00Z')).toBe('2026-01-01 03:03');
      // UTC 2026-03-05 01:07 → KST 2026-03-05 10:07
      expect(formatDateTime('2026-03-05T01:07:00Z')).toBe('2026-03-05 10:07');
    });
  });

  // ============================================
  // formatElapsed 테스트
  // ============================================
  describe('formatElapsed', () => {
    it('undefined면 "-"를 반환한다', () => {
      expect(formatElapsed(undefined)).toBe('-');
      expect(formatElapsed()).toBe('-');
    });

    it('null이면 "-"를 반환한다', () => {
      expect(formatElapsed(null as unknown as number)).toBe('-');
    });

    it.each([
      [-1, '-'],
      [-0.5, '-'],
    ])('음수 %s초면 "-"를 반환한다', (input, expected) => {
      expect(formatElapsed(input)).toBe(expected);
    });

    it.each([
      [0, '00:00:00'],
      [59, '00:00:59'],
      [60, '00:01:00'],
      [3600, '01:00:00'],
      [3661, '01:01:01'],
      [86399, '23:59:59'],
    ])('%s초를 %s로 포맷한다', (input, expected) => {
      expect(formatElapsed(input)).toBe(expected);
    });

    it.each([
      [0.999, '00:00:00'],
      [59.9, '00:00:59'],
      [3661.999, '01:01:01'],
    ])('소수점 초 %s는 내림(floor)해 %s로 포맷한다', (input, expected) => {
      expect(formatElapsed(input)).toBe(expected);
    });

    it.each([
      [360000, '100:00:00'],
      [362999, '100:49:59'],
      [3600000, '1000:00:00'],
    ])('100시간 이상(%s초)은 시간 자리를 확장해 %s로 포맷한다', (input, expected) => {
      expect(formatElapsed(input)).toBe(expected);
    });
  });

  // ============================================
  // formatRelativeTime 테스트
  // ============================================
  describe('formatRelativeTime', () => {
    // 현재 시각 고정: KST 2026-08-11 12:00:00 (= UTC 03:00:00)
    const NOW = new Date('2026-08-11T03:00:00Z');

    const secondsAgo = (seconds: number) => new Date(NOW.getTime() - seconds * 1000).toISOString();

    const withFrozenNow = () => {
      vi.useFakeTimers();
      vi.setSystemTime(NOW);
    };

    afterEach(() => {
      vi.useRealTimers();
    });

    it('undefined면 빈 문자열을 반환한다', () => {
      expect(formatRelativeTime(undefined)).toBe('');
      expect(formatRelativeTime()).toBe('');
    });

    it('빈 문자열이면 빈 문자열을 반환한다', () => {
      expect(formatRelativeTime('')).toBe('');
    });

    it('미래 시각이면 "방금 전"을 반환한다', () => {
      withFrozenNow();
      expect(formatRelativeTime(secondsAgo(-10))).toBe('방금 전');
    });

    it.each([
      [0, '방금 전'],
      [59, '방금 전'],
      [60, '1분 전'],
      [3599, '59분 전'],
      [3600, '1시간 전'],
      [86399, '23시간 전'],
      [86400, '1일 전'],
      [604799, '6일 전'],
      [604800, '1주 전'],
      [2591999, '4주 전'],
      [2592000, '1개월 전'],
      [31535999, '12개월 전'],
      [31536000, '1년 전'],
      [63072000, '2년 전'],
    ])('%s초 전이면 "%s"를 반환한다', (seconds, expected) => {
      withFrozenNow();
      expect(formatRelativeTime(secondsAgo(seconds))).toBe(expected);
    });

    describe('오프셋 없는 문자열은 UTC 로 읽는다', () => {
      /*
       * 백엔드는 UTC 로 돌면서 오프셋 없는 문자열을 내보낸다. 예전에는 formatDateTime 만 'Z' 를
       * 붙이고 formatRelativeTime 은 붙이지 않아, 같은 문자열이 두 함수에서 9시간 차이로 읽혔다.
       */
      it('두 함수가 같은 순간으로 해석한다', () => {
        withFrozenNow();
        // 현재 시각: KST 2026-08-11 12:00:00 = UTC 03:00:00
        // naive '2026-08-11T02:00:00' → UTC 02:00 = KST 11:00 → 1시간 전
        expect(formatRelativeTime('2026-08-11T02:00:00')).toBe('1시간 전');
        expect(formatDateTime('2026-08-11T02:00:00')).toBe('2026-08-11 11:00');
      });

      it('Z 를 붙이든 안 붙이든 같은 결과다', () => {
        withFrozenNow();
        expect(formatRelativeTime('2026-08-11T02:00:00Z')).toBe('1시간 전');
        expect(formatRelativeTime('2026-08-11T02:00:00')).toBe('1시간 전');
      });

      it('파싱할 수 없는 문자열은 빈 문자열이다', () => {
        // 예전에는 NaN 비교가 모두 false 라 "방금 전" 으로 떨어져 오래된 값처럼 보이지 않았다.
        withFrozenNow();
        expect(formatRelativeTime('not-a-date')).toBe('');
      });
    });
  });
});

describe('formatDurationSince', () => {
  const now = new Date('2026-09-16T12:00:00Z').getTime();

  it('몇 분째인지 바로 읽힌다', () => {
    // "00:03:42" 는 한 번 더 읽어야 한다. 진행 중인 작업을 볼 때 그 한 번이 거슬린다.
    expect(formatDurationSince('2026-09-16T11:56:18Z', now)).toBe('3분 42초');
  });

  it('한 시간을 넘으면 시간부터 말한다', () => {
    expect(formatDurationSince('2026-09-16T09:30:00Z', now)).toBe('2시간 30분');
  });

  it('1분이 안 되면 초만 말한다', () => {
    expect(formatDurationSince('2026-09-16T11:59:53Z', now)).toBe('7초');
  });

  it('시작 시각이 없으면 빈 문자열', () => {
    // "-" 를 넣으면 0초 동안 진행 중인 것처럼 보인다.
    expect(formatDurationSince(undefined, now)).toBe('');
  });

  it('시계가 앞서 있어도 음수를 보여주지 않는다', () => {
    expect(formatDurationSince('2026-09-16T12:00:30Z', now)).toBe('0초');
  });
});

describe('오프셋 없는 서버 시각', () => {
  /*
   * 백엔드는 UTC 로 돌면서 오프셋 없는 문자열을 내보낸다. 보정하지 않으면 브라우저가 로컬
   * 시각으로 읽어 KST 기준 9시간이 어긋난다. 프로비저닝 경과 시간이 "9시간" 으로 보였다.
   */
  const NAIVE_UTC = '2026-09-18T02:20:18';
  const SAME_MOMENT = Date.UTC(2026, 8, 18, 2, 20, 18);

  it('parseServerDate 는 오프셋이 없으면 UTC 로 읽는다', () => {
    expect(parseServerDate(NAIVE_UTC)?.getTime()).toBe(SAME_MOMENT);
  });

  it('오프셋이 있으면 그대로 존중한다', () => {
    expect(parseServerDate('2026-09-18T11:20:18+09:00')?.getTime()).toBe(SAME_MOMENT);
    expect(parseServerDate('2026-09-18T02:20:18Z')?.getTime()).toBe(SAME_MOMENT);
  });

  it('빈 값과 깨진 값은 null', () => {
    expect(parseServerDate(undefined)).toBeNull();
    expect(parseServerDate('')).toBeNull();
    expect(parseServerDate('not-a-date')).toBeNull();
  });

  it('formatDurationSince 가 9시간을 더하지 않는다', () => {
    const tenMinutesLater = SAME_MOMENT + 10 * 60 * 1000;

    expect(formatDurationSince(NAIVE_UTC, tenMinutesLater)).toBe('10분 0초');
  });

  it('formatRelativeTime 도 같은 기준으로 읽는다', () => {
    vi.setSystemTime(new Date(SAME_MOMENT + 5 * 60 * 1000));

    expect(formatRelativeTime(NAIVE_UTC)).toBe('5분 전');

    vi.useRealTimers();
  });
});
