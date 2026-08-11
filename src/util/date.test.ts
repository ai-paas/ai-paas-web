import { describe, it, expect, afterEach, vi } from 'vitest';
import { formatDateTime, formatElapsed, formatRelativeTime } from './date';

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

    // ============================================
    // 특성화 테스트 (현재 동작 고정)
    // ============================================
    describe('특성화: naive 문자열의 타임존 해석이 formatDateTime과 다르다', () => {
      // 버그 의심 — 팀 확인 필요:
      // formatDateTime은 타임존 표기가 없는 naive 문자열에 'Z'를 붙여 UTC로 간주하지만,
      // formatRelativeTime은 'Z'를 부여하지 않고 new Date()에 그대로 넘겨 로컬(KST)로 해석한다.
      // 같은 naive 문자열이 두 함수에서 9시간 차이로 다르게 해석된다.
      it('naive 문자열을 로컬(KST)로 해석한다 — UTC로 해석하는 formatDateTime과 불일치', () => {
        withFrozenNow();
        // 현재 시각: KST 2026-08-11 12:00:00
        // naive '2026-08-11T11:00:00' → 로컬(KST) 11:00으로 해석 → 1시간 전
        expect(formatRelativeTime('2026-08-11T11:00:00')).toBe('1시간 전');

        // 같은 문자열을 formatDateTime은 UTC로 간주 → KST 20:00 (현재보다 8시간 미래)
        expect(formatDateTime('2026-08-11T11:00:00')).toBe('2026-08-11 20:00');
      });

      it('같은 시각이라도 Z 접미사 유무에 따라 결과가 달라진다', () => {
        withFrozenNow();
        // 'Z'가 붙으면 UTC 11:00 = KST 20:00 → 미래 → '방금 전'
        expect(formatRelativeTime('2026-08-11T11:00:00Z')).toBe('방금 전');
        // naive면 KST 11:00 → '1시간 전' (위 테스트와 대비)
        expect(formatRelativeTime('2026-08-11T11:00:00')).toBe('1시간 전');
      });

      // 버그 의심 — 팀 확인 필요:
      // 파싱 불가 문자열이면 formatDateTime은 ''를 반환하지만,
      // formatRelativeTime은 NaN 비교가 모두 false가 되어 '방금 전'으로 떨어진다.
      it('파싱할 수 없는 문자열이면 "방금 전"을 반환한다 (formatDateTime의 ""와 불일치)', () => {
        withFrozenNow();
        expect(formatRelativeTime('not-a-date')).toBe('방금 전');
      });
    });
  });
});
