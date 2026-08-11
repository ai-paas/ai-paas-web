import { afterAll, beforeAll } from 'vitest';

/**
 * jsdom은 레이아웃 계산을 하지 않아 모든 크기 측정이 0을 반환한다.
 * 가상화 테이블(@innogrid/ui Table)·셀 Tooltip의 말줄임 판정 등은 크기 측정에
 * 의존하므로, 이런 컴포넌트를 실제로 렌더하는 테스트 파일에서 최상단에 호출한다:
 *
 *   installDomMeasurementStubs();
 *
 * 전역 setup에 넣지 않는 이유: offsetHeight 등을 프로토타입 레벨에서 덮어쓰면
 * 크기 0을 전제로 하는 다른 테스트(빈 상태 분기 등)에 영향을 줄 수 있어 opt-in으로 둔다.
 */
export function installDomMeasurementStubs({ width = 1000, height = 500 } = {}) {
  const rect = {
    width,
    height,
    top: 0,
    left: 0,
    bottom: height,
    right: width,
    x: 0,
    y: 0,
    toJSON: () => {},
  } as DOMRect;

  const originals: Array<() => void> = [];

  beforeAll(() => {
    const props = {
      offsetHeight: height,
      offsetWidth: width,
      clientHeight: height,
      clientWidth: width,
    } as const;

    for (const [name, value] of Object.entries(props)) {
      const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, name);
      Object.defineProperty(HTMLElement.prototype, name, {
        configurable: true,
        get: () => value,
      });
      originals.push(() => {
        if (original) Object.defineProperty(HTMLElement.prototype, name, original);
        else delete (HTMLElement.prototype as unknown as Record<string, unknown>)[name];
      });
    }

    const originalElementRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = () => rect;
    originals.push(() => {
      Element.prototype.getBoundingClientRect = originalElementRect;
    });

    // 셀 내부 Tooltip이 말줄임 판정에 Range.getBoundingClientRect를 사용 (jsdom 미구현)
    const originalRangeRect = Range.prototype.getBoundingClientRect;
    Range.prototype.getBoundingClientRect = () => rect;
    originals.push(() => {
      Range.prototype.getBoundingClientRect = originalRangeRect;
    });
  });

  afterAll(() => {
    originals.reverse().forEach((restore) => restore());
    originals.length = 0;
  });
}
