import { describe, it, expect } from 'vitest';
import { makeTestJwt } from '@/test/utils/test-utils';
import { parseJwt } from './jwt';

// btoa는 Latin1 한정이므로 유니코드 클레임은 UTF-8 바이트로 변환한 뒤 base64url 인코딩한다
const base64urlUtf8 = (value: object) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(value))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

describe('parseJwt', () => {
  // ============================================
  // 정상 토큰 디코딩
  // ============================================
  describe('정상 토큰', () => {
    it('JWT payload를 객체로 디코딩한다', () => {
      const token = makeTestJwt({ sub: 'user-1', role: 'admin', exp: 1754900000 });

      expect(parseJwt(token)).toEqual({ sub: 'user-1', role: 'admin', exp: 1754900000 });
    });

    it("base64url 특수문자 '-', '_'를 표준 base64로 치환해 디코딩한다", () => {
      // '???>>>' 클레임의 base64url 인코딩(eyJxIjoiPz8_Pj4-In0)에는 '-'와 '_'가 모두 포함된다
      const token = makeTestJwt({ q: '???>>>' });
      const payloadPart = token.split('.')[1];

      expect(payloadPart).toContain('-');
      expect(payloadPart).toContain('_');
      expect(parseJwt(token)).toEqual({ q: '???>>>' });
    });

    it('한글 등 유니코드 클레임을 UTF-8로 복원한다', () => {
      const token = `header.${base64urlUtf8({ name: '홍길동', role: '관리자' })}.sig`;

      expect(parseJwt(token)).toEqual({ name: '홍길동', role: '관리자' });
    });
  });

  // ============================================
  // 비정상 입력 → null
  // ============================================
  describe('비정상 입력', () => {
    it.each([
      ['빈 문자열', ''],
      ["'.'가 없는 문자열", 'not-a-jwt-token'],
      ['base64가 아닌 페이로드', 'header.!!!not-base64!!!.sig'],
      ['JSON이 아닌 페이로드', `header.${btoa('not json')}.sig`],
      ['UTF-8로 해석할 수 없는 페이로드', `header.${btoa('\xff\xfe')}.sig`],
    ])('%s이면 null을 반환한다', (_label, token) => {
      expect(parseJwt(token)).toBeNull();
    });
  });
});
