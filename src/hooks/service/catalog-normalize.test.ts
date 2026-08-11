import { describe, it, expect } from 'vitest';
import {
  normalizeCatalogResponse,
  normalizeDocumentResponse,
  normalizeReadmeResponse,
  normalizeValuesResponse,
} from './catalog';
import type { CatalogResponse, CatalogDocumentResponse, Chart } from '../../types/catalog';

// 테스트 입력은 의도적으로 타입 밖의 형태(비정상 envelope)를 포함하므로 캐스트 헬퍼를 사용한다
const asCatalog = (value: unknown) => value as CatalogResponse;
const asDoc = (value: unknown) => value as CatalogDocumentResponse;

const makeChart = (name: string): Chart => ({
  name,
  version: '1.0.0',
  description: `${name} 차트`,
  appVersion: '2.0.0',
  keywords: ['ai'],
  icon: 'icon.png',
  created: '2026-01-01T00:00:00Z',
});

const chartA = makeChart('chart-a');
const chartB = makeChart('chart-b');

const readmeOptions = { priorityFields: ['readmeContent', 'readme', 'markdown'] };

describe('normalizeCatalogResponse', () => {
  // ============================================
  // envelope 변형별 charts / meta 추출
  // ============================================
  describe('envelope 변형별 charts 추출', () => {
    it('직배열 응답이면 그대로 charts로 사용하고 meta는 없다', () => {
      const result = normalizeCatalogResponse([chartA, chartB]);

      expect(result.charts).toEqual([chartA, chartB]);
      expect(result.meta).toBeUndefined();
    });

    const metaFields = { page: 2, size: 10, total: 25, total_pages: 3 };
    const expectedMeta = { page: 2, size: 10, total: 25, totalPages: 3 };

    it.each([
      {
        label: '{data:[...]} 평평한 envelope',
        response: asCatalog({ data: [chartA, chartB], ...metaFields }),
      },
      {
        label: '{data:{data:[...]}} 이중 중첩 data 배열',
        response: asCatalog({ data: { data: [chartA, chartB], ...metaFields } }),
      },
      {
        label: '{data:{charts:[...]}} charts 키 envelope',
        response: asCatalog({ data: { charts: [chartA, chartB], ...metaFields } }),
      },
      {
        label: '{data:{data:{charts:[...]}}} 삼중 중첩 charts',
        response: asCatalog({ data: { data: { charts: [chartA, chartB], ...metaFields } } }),
      },
    ])('$label 에서 charts와 meta(page/size/total/total_pages)를 추출한다', ({ response }) => {
      const result = normalizeCatalogResponse(response);

      expect(result.charts).toEqual([chartA, chartB]);
      expect(result.meta).toEqual(expectedMeta);
    });

    it('{data:{data:[...], charts:[...]}} 처럼 둘 다 있으면 data 배열이 charts 키보다 우선한다', () => {
      const result = normalizeCatalogResponse(
        asCatalog({ data: { data: [chartA], charts: [chartB] } })
      );

      expect(result.charts).toEqual([chartA]);
    });
  });

  // ============================================
  // meta 추출 규칙
  // ============================================
  describe('meta 추출 규칙', () => {
    it('meta 필드가 하나도 없으면 meta는 undefined다', () => {
      const result = normalizeCatalogResponse(asCatalog({ data: [chartA] }));

      expect(result.charts).toEqual([chartA]);
      expect(result.meta).toBeUndefined();
    });

    it('meta 필드가 일부만 있으면 있는 값만 채워진다', () => {
      const result = normalizeCatalogResponse(asCatalog({ data: [chartA], total: 7 }));

      expect(result.meta).toEqual({ total: 7 });
    });

    it('숫자가 아닌 meta 필드는 무시한다', () => {
      const result = normalizeCatalogResponse(
        asCatalog({ data: [chartA], page: '2', size: null, total: undefined, total_pages: '3' })
      );

      expect(result.meta).toBeUndefined();
    });

    it('meta 값이 0이어도 유효한 숫자로 추출한다', () => {
      const result = normalizeCatalogResponse(asCatalog({ data: [], page: 0, total: 0 }));

      expect(result.meta).toEqual({ page: 0, total: 0 });
    });
  });

  // ============================================
  // 경계·비정상 입력
  // ============================================
  describe('경계·비정상 입력', () => {
    it.each([
      { label: '빈 객체 {}', response: asCatalog({}) },
      { label: '{data: null}', response: asCatalog({ data: null }) },
      { label: '{data: 문자열}', response: asCatalog({ data: 'oops' }) },
      { label: '{data: {}} 빈 중첩 객체', response: asCatalog({ data: {} }) },
      { label: '{data:{data:{}}} charts 없는 삼중 중첩', response: asCatalog({ data: { data: {} } }) },
      {
        label: '{data:{data:{charts: 문자열}}} charts가 배열이 아님',
        response: asCatalog({ data: { data: { charts: 'not-array' } } }),
      },
      { label: '숫자 입력', response: asCatalog(42) },
      { label: '불리언 입력', response: asCatalog(true) },
      { label: '문자열 입력', response: asCatalog('hello') },
    ])('$label 이면 빈 charts를 반환한다', ({ response }) => {
      const result = normalizeCatalogResponse(response);

      expect(result.charts).toEqual([]);
      expect(result.meta).toBeUndefined();
    });

    // 버그 의심 — 팀 확인 필요: null/undefined 응답 가드가 없어 property 접근에서 TypeError가 난다.
    // API가 null body를 반환하면 쿼리가 크래시한다. 현재 동작을 특성화 테스트로 고정한다.
    it.each([
      { label: 'null', response: asCatalog(null) },
      { label: 'undefined', response: asCatalog(undefined) },
    ])('$label 입력이면 TypeError를 던진다 (특성화: null 가드 없음)', ({ response }) => {
      expect(() => normalizeCatalogResponse(response)).toThrow(TypeError);
    });
  });
});

describe('normalizeDocumentResponse', () => {
  // ============================================
  // falsy·문자열 입력
  // ============================================
  describe('falsy·문자열 입력', () => {
    it.each([
      { label: 'null', response: asDoc(null) },
      { label: 'undefined', response: asDoc(undefined) },
      { label: '빈 문자열', response: asDoc('') },
    ])('$label 입력이면 빈 content를 반환한다', ({ response }) => {
      expect(normalizeDocumentResponse(response, readmeOptions)).toEqual({
        version: undefined,
        content: '',
      });
    });

    it('falsy 입력이어도 inheritedVersion은 유지된다', () => {
      expect(normalizeDocumentResponse(asDoc(null), readmeOptions, '1.0.0')).toEqual({
        version: '1.0.0',
        content: '',
      });
    });

    it('문자열 입력이면 그대로 content가 된다', () => {
      expect(normalizeDocumentResponse('# README', readmeOptions)).toEqual({
        version: undefined,
        content: '# README',
      });
    });

    it('문자열 입력에도 inheritedVersion이 상속된다', () => {
      expect(normalizeDocumentResponse('내용', readmeOptions, '2.0.0')).toEqual({
        version: '2.0.0',
        content: '내용',
      });
    });

    it('문자열/배열/객체가 아닌 입력(숫자)이면 빈 content로 폴백한다', () => {
      expect(normalizeDocumentResponse(asDoc(42), readmeOptions, '3.0.0')).toEqual({
        version: '3.0.0',
        content: '',
      });
    });
  });

  // ============================================
  // 배열 입력 정규화
  // ============================================
  describe('배열 입력 정규화', () => {
    it('문자열 배열은 빈 줄(\\n\\n)로 이어 붙인다', () => {
      expect(normalizeDocumentResponse(['a', 'b'], readmeOptions).content).toBe('a\n\nb');
    });

    it('빈 문자열 항목은 건너뛴다', () => {
      expect(normalizeDocumentResponse(['', 'a', ''], readmeOptions).content).toBe('a');
    });

    it('중첩 배열의 문자열은 줄바꿈(\\n)으로 합친다', () => {
      expect(normalizeDocumentResponse(asDoc([['x', 'y']]), readmeOptions).content).toBe('x\ny');
    });

    it('중첩 배열에서 문자열이 아닌 값은 걸러낸다', () => {
      expect(normalizeDocumentResponse(asDoc([['x', 42, null, 'y']]), readmeOptions).content).toBe(
        'x\ny'
      );
    });

    it('객체 항목은 재귀 정규화해 content만 이어 붙인다', () => {
      expect(
        normalizeDocumentResponse(asDoc([{ content: 'obj' }]), readmeOptions).content
      ).toBe('obj');
    });

    it('문자열·중첩 배열·객체가 섞인 배열을 모두 합친다', () => {
      const result = normalizeDocumentResponse(
        asDoc(['a', ['b', 'c'], { readmeContent: 'd' }]),
        readmeOptions
      );

      expect(result.content).toBe('a\n\nb\nc\n\nd');
    });

    it.each([
      { label: '빈 배열', response: asDoc([]) },
      { label: 'null/undefined/숫자만 있는 배열', response: asDoc([null, undefined, 42]) },
    ])('$label 이면 빈 content를 반환한다', ({ response }) => {
      expect(normalizeDocumentResponse(response, readmeOptions).content).toBe('');
    });

    it('배열 결과에도 inheritedVersion이 유지된다', () => {
      expect(normalizeDocumentResponse(['a'], readmeOptions, '2.0.0')).toEqual({
        version: '2.0.0',
        content: 'a',
      });
    });

    // 버그 의심 — 팀 확인 필요: 최상위 배열 항목 객체가 version을 갖고 있어도 결과 version에
    // 반영되지 않는다(inheritedVersion만 유지). 현재 동작을 특성화 테스트로 고정한다.
    it('배열 항목 객체의 version은 무시된다 (특성화)', () => {
      const result = normalizeDocumentResponse(
        asDoc([{ version: '9.9.9', content: 'x' }]),
        readmeOptions
      );

      expect(result).toEqual({ version: undefined, content: 'x' });
    });
  });

  // ============================================
  // 객체 입력 — 필드 추출과 version 처리
  // ============================================
  describe('객체 입력 정규화', () => {
    it('priorityFields 다음에 content > result > data 순으로 폴백한다', () => {
      expect(
        normalizeDocumentResponse(asDoc({ data: 'd', result: 'r', content: 'c' }), readmeOptions)
          .content
      ).toBe('c');
      expect(
        normalizeDocumentResponse(asDoc({ data: 'd', result: 'r' }), readmeOptions).content
      ).toBe('r');
      expect(normalizeDocumentResponse(asDoc({ data: 'd' }), readmeOptions).content).toBe('d');
    });

    it('자체 version 필드가 있으면 결과에 사용한다', () => {
      expect(
        normalizeDocumentResponse(asDoc({ version: '1.2.3', readmeContent: 'r' }), readmeOptions)
      ).toEqual({ version: '1.2.3', content: 'r' });
    });

    it('version이 문자열이 아니면 inheritedVersion을 사용한다', () => {
      expect(
        normalizeDocumentResponse(asDoc({ version: 123, content: 'c' }), readmeOptions, '0.9.0')
      ).toEqual({ version: '0.9.0', content: 'c' });
    });

    it('필드 값이 문자열/배열/객체가 아니면 건너뛰고 다음 필드로 폴백한다', () => {
      expect(
        normalizeDocumentResponse(asDoc({ readmeContent: 42, content: 'c' }), readmeOptions)
          .content
      ).toBe('c');
    });

    it('null/undefined 필드는 건너뛴다', () => {
      expect(
        normalizeDocumentResponse(
          asDoc({ readmeContent: null, readme: undefined, markdown: 'm' }),
          readmeOptions
        ).content
      ).toBe('m');
    });

    it('매칭되는 필드가 없으면 빈 content와 versionCandidate를 반환한다', () => {
      expect(normalizeDocumentResponse(asDoc({ status: 200 }), readmeOptions)).toEqual({
        version: undefined,
        content: '',
      });
      expect(normalizeDocumentResponse(asDoc({ version: 'v1' }), readmeOptions)).toEqual({
        version: 'v1',
        content: '',
      });
    });

    // 버그 의심 — 팀 확인 필요: 우선순위 필드가 빈 문자열('')이면 후순위 필드에 실제 내용이
    // 있어도 빈 content로 단락 반환한다(null/undefined만 건너뜀). 현재 동작을 고정한다.
    it('우선순위 필드가 빈 문자열이면 후순위 필드를 무시하고 빈 content를 반환한다 (특성화)', () => {
      expect(
        normalizeDocumentResponse(asDoc({ readmeContent: '', content: 'actual' }), readmeOptions)
      ).toEqual({ version: undefined, content: '' });
    });

    it('배열 필드는 문자열·중첩 배열·객체를 모두 합쳐 반환한다', () => {
      const result = normalizeDocumentResponse(
        asDoc({ readmeContent: ['a', ['b', 'c'], { content: 'd' }] }),
        readmeOptions
      );

      expect(result.content).toBe('a\n\nb\nc\n\nd');
    });

    it('배열 필드 항목 객체에 versionCandidate가 상속된다', () => {
      expect(
        normalizeDocumentResponse(
          asDoc({ version: '3.0.0', readmeContent: [{ content: 'inner' }] }),
          readmeOptions
        )
      ).toEqual({ version: '3.0.0', content: 'inner' });
    });

    it('배열 필드에서 내용이 나오지 않으면 다음 필드로 폴백한다', () => {
      expect(
        normalizeDocumentResponse(
          asDoc({ readmeContent: ['', [42]], content: 'fallback' }),
          readmeOptions
        ).content
      ).toBe('fallback');
    });

    it('객체 필드는 재귀 정규화해 content를 추출한다', () => {
      expect(
        normalizeDocumentResponse(asDoc({ data: { readmeContent: 'nested' } }), readmeOptions)
      ).toEqual({ version: undefined, content: 'nested' });
    });

    it('객체 필드 재귀 시 외부 version이 상속된다', () => {
      expect(
        normalizeDocumentResponse(
          asDoc({ version: '1.0.0', data: { readmeContent: 'n' } }),
          readmeOptions
        )
      ).toEqual({ version: '1.0.0', content: 'n' });
    });

    it('내부 객체의 version이 외부 version보다 우선한다', () => {
      expect(
        normalizeDocumentResponse(
          asDoc({ version: '1.0.0', data: { version: '2.0.0', readmeContent: 'n' } }),
          readmeOptions
        )
      ).toEqual({ version: '2.0.0', content: 'n' });
    });

    it('객체 필드에서 content가 비면 다음 필드로 폴백한다', () => {
      expect(
        normalizeDocumentResponse(
          asDoc({ readmeContent: { unknown: 'x' }, content: 'fallback' }),
          readmeOptions
        ).content
      ).toBe('fallback');
    });
  });
});

describe('normalizeReadmeResponse', () => {
  it.each([
    { label: 'readmeContent가 readme보다 우선', response: { readmeContent: 'A', readme: 'B' }, expected: 'A' },
    { label: 'readme가 markdown보다 우선', response: { readme: 'B', markdown: 'C' }, expected: 'B' },
    { label: 'markdown이 content보다 우선', response: { markdown: 'C', content: 'D' }, expected: 'C' },
    { label: 'content가 result보다 우선', response: { content: 'D', result: 'E' }, expected: 'D' },
  ])('$label 한다', ({ response, expected }) => {
    expect(normalizeReadmeResponse(response).content).toBe(expected);
  });

  it('문자열 응답은 그대로 content가 된다', () => {
    expect(normalizeReadmeResponse('# 제목')).toEqual({ version: undefined, content: '# 제목' });
  });

  it('values 계열 필드는 readme 정규화에서 무시된다', () => {
    expect(normalizeReadmeResponse({ valuesContent: 'V', yaml: 'Y' }).content).toBe('');
  });

  it('version과 readme 필드를 함께 추출한다', () => {
    expect(normalizeReadmeResponse({ version: '1.0.0', readme: '# doc' })).toEqual({
      version: '1.0.0',
      content: '# doc',
    });
  });
});

describe('normalizeValuesResponse', () => {
  it.each([
    { label: 'valuesContent가 values보다 우선', response: { valuesContent: 'A', values: 'B' }, expected: 'A' },
    { label: 'values가 yaml보다 우선', response: { values: 'B', yaml: 'C' }, expected: 'B' },
    { label: 'yaml이 content보다 우선', response: { yaml: 'C', content: 'D' }, expected: 'C' },
  ])('$label 한다', ({ response, expected }) => {
    expect(normalizeValuesResponse(response).content).toBe(expected);
  });

  it('readme 계열 필드는 values 정규화에서 무시된다', () => {
    expect(normalizeValuesResponse({ readmeContent: 'R', markdown: 'M' }).content).toBe('');
  });

  it('version과 valuesContent를 함께 추출한다', () => {
    expect(normalizeValuesResponse({ version: '1.0.0', valuesContent: 'replicas: 2' })).toEqual({
      version: '1.0.0',
      content: 'replicas: 2',
    });
  });
});
