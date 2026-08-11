import { HTTPError, type NormalizedOptions } from 'ky';
import { describe, it, expect } from 'vitest';
import { parseWorkflowError } from './parse-workflow-error';

const FALLBACK = '워크플로우 작업에 실패했습니다.';

// ky의 실제 HTTPError를 생성한다 (instanceof 체크 때문에 목킹 불가).
// options는 파싱 로직에서 사용되지 않으므로 빈 객체로 충분하다.
const createHttpError = (body: string | null, status = 422) =>
  new HTTPError(
    new Response(body, { status }),
    new Request('http://localhost/x'),
    {} as NormalizedOptions
  );

const createJsonHttpError = (payload: unknown, status = 422) =>
  createHttpError(JSON.stringify(payload), status);

describe('parseWorkflowError', () => {
  // ============================================
  // HTTPError가 아닌 에러
  // ============================================
  describe('HTTPError가 아닌 에러', () => {
    it('일반 Error면 message를 반환한다', async () => {
      const error = new Error('네트워크 연결이 끊어졌습니다');

      await expect(parseWorkflowError(error, FALLBACK)).resolves.toBe(
        '네트워크 연결이 끊어졌습니다'
      );
    });

    it.each([
      ['문자열', '문자열 에러'],
      ['숫자', 500],
      ['null', null],
      ['undefined', undefined],
      ['message 프로퍼티만 있는 일반 객체', { message: '객체 메시지' }],
    ])('Error가 아닌 값(%s)이면 fallback을 반환한다', async (_label, value) => {
      await expect(parseWorkflowError(value, FALLBACK)).resolves.toBe(FALLBACK);
    });
  });

  // ============================================
  // detail 배열 (FastAPI validation 에러 형식)
  // ============================================
  describe('detail 배열', () => {
    it("loc에서 'body'를 제거한 경로와 msg를 'path: msg' 형식으로 반환한다", async () => {
      const error = createJsonHttpError({
        detail: [{ msg: 'Field required', loc: ['body', 'name'] }],
      });

      await expect(parseWorkflowError(error, FALLBACK)).resolves.toBe('name: Field required');
    });

    it('중첩 loc은 점(.)으로 조인한다', async () => {
      const error = createJsonHttpError({
        detail: [{ msg: 'value is not a valid float', loc: ['body', 'config', 'temperature'] }],
      });

      await expect(parseWorkflowError(error, FALLBACK)).resolves.toBe(
        'config.temperature: value is not a valid float'
      );
    });

    it('여러 항목은 줄바꿈(\\n)으로 조인한다', async () => {
      const error = createJsonHttpError({
        detail: [
          { msg: 'Field required', loc: ['body', 'name'] },
          { msg: 'Input should be a valid integer', loc: ['body', 'nodes', 0, 'id'] },
        ],
      });

      await expect(parseWorkflowError(error, FALLBACK)).resolves.toBe(
        'name: Field required\nnodes.0.id: Input should be a valid integer'
      );
    });

    it.each([
      ['빈 배열', []],
      ['없음', undefined],
      ['배열이 아닌 값', 'body'],
    ])('loc이 %s이면 msg만 반환한다', async (_label, loc) => {
      const error = createJsonHttpError({ detail: [{ msg: 'Field required', loc }] });

      await expect(parseWorkflowError(error, FALLBACK)).resolves.toBe('Field required');
    });

    it("loc이 ['body']뿐이면 경로 없이 msg만 반환한다", async () => {
      const error = createJsonHttpError({ detail: [{ msg: 'Invalid payload', loc: ['body'] }] });

      await expect(parseWorkflowError(error, FALLBACK)).resolves.toBe('Invalid payload');
    });

    it('무효 항목(객체가 아니거나 msg가 문자열이 아님)은 걸러내고 유효 항목만 조인한다', async () => {
      const error = createJsonHttpError({
        detail: [
          'not-an-object',
          null,
          { msg: 123, loc: ['body', 'count'] },
          { loc: ['body', 'name'] },
          { msg: 'Field required', loc: ['body', 'name'] },
        ],
      });

      await expect(parseWorkflowError(error, FALLBACK)).resolves.toBe('name: Field required');
    });

    it('전부 무효 항목이면 error.message로 폴백한다', async () => {
      const error = createJsonHttpError({ detail: ['oops', { msg: 42 }, null] });

      await expect(parseWorkflowError(error, FALLBACK)).resolves.toBe(error.message);
    });

    it('빈 detail 배열이면 error.message로 폴백한다', async () => {
      const error = createJsonHttpError({ detail: [] });

      await expect(parseWorkflowError(error, FALLBACK)).resolves.toBe(error.message);
    });
  });

  // ============================================
  // detail 문자열
  // ============================================
  describe('detail 문자열', () => {
    it('문자열 detail은 그대로 반환한다', async () => {
      const error = createJsonHttpError({ detail: '이미 존재하는 워크플로우 이름입니다' }, 409);

      await expect(parseWorkflowError(error, FALLBACK)).resolves.toBe(
        '이미 존재하는 워크플로우 이름입니다'
      );
    });

    it('빈 문자열 detail은 error.message로 폴백한다', async () => {
      const error = createJsonHttpError({ detail: '' });

      await expect(parseWorkflowError(error, FALLBACK)).resolves.toBe(error.message);
    });

    it('detail이 없는 JSON 본문이면 error.message로 폴백한다', async () => {
      const error = createJsonHttpError({ message: 'Internal Server Error' }, 500);

      await expect(parseWorkflowError(error, FALLBACK)).resolves.toBe(error.message);
    });
  });

  // ============================================
  // JSON이 아닌 응답 본문
  // ============================================
  describe('JSON이 아닌 응답 본문', () => {
    it('HTML 본문이면 JSON 파싱 실패 후 error.message를 반환한다', async () => {
      const error = createHttpError('<html><body>502 Bad Gateway</body></html>', 502);

      await expect(parseWorkflowError(error, FALLBACK)).resolves.toBe(error.message);
    });

    it('error.message마저 비어 있으면 fallback을 반환한다', async () => {
      const error = createHttpError('<html></html>', 500);
      error.message = '';

      await expect(parseWorkflowError(error, FALLBACK)).resolves.toBe(FALLBACK);
    });
  });
});
