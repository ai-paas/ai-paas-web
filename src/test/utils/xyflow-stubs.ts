import { afterAll, beforeAll } from 'vitest';
import { installDomMeasurementStubs } from './dom-measure-stubs';

/**
 * @xyflow/react 캔버스(FlowChart 등)를 jsdom에서 마운트하는 테스트 파일 최상단에서 호출:
 *
 *   installXyflowStubs();
 *
 * xyflow 공식 테스트 가이드가 요구하는 브라우저 API를 스텁한다.
 * (ResizeObserver·matchMedia는 setup-tests.ts에서 전역 스텁 — 여기선 나머지만)
 * 좌표 기반 드래그·엣지 연결은 스텁으로도 재현 불가 — E2E 영역이다 (TEST_PLAN.md Phase 4).
 */
export function installXyflowStubs() {
  installDomMeasurementStubs();

  let originalResizeObserver: typeof ResizeObserver;

  beforeAll(() => {
    // xyflow 공식 가이드의 ResizeObserver — observe 즉시 콜백을 호출해 노드를 "측정된"
    // 상태로 만든다. setup-tests의 전역 no-op 스텁으로는 노드 크기가 0으로 남아
    // 노드에 붙은 엣지가 렌더되지 않는다. (opt-in: afterAll에서 원복)
    originalResizeObserver = window.ResizeObserver;
    window.ResizeObserver = class {
      private callback: ResizeObserverCallback;
      constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
      }
      observe(target: Element) {
        this.callback(
          [{ target } as ResizeObserverEntry],
          this as unknown as ResizeObserver
        );
      }
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  });

  afterAll(() => {
    window.ResizeObserver = originalResizeObserver;
  });

  beforeAll(() => {
    // xyflow가 transform 문자열에서 줌 배율을 읽을 때 사용
    if (!globalThis.DOMMatrixReadOnly) {
      class DOMMatrixReadOnly {
        m22: number;
        constructor(transform?: string) {
          // xyflow 공식 가이드 스니펫은 [1-9.]라 0이 포함된 배율(0.5, 1.05)을 놓친다 — [\d.]로 교정
          const scale = transform?.match(/scale\(([\d.]+)\)/)?.[1];
          this.m22 = scale !== undefined ? +scale : 1;
        }
      }
      globalThis.DOMMatrixReadOnly = DOMMatrixReadOnly as unknown as typeof globalThis.DOMMatrixReadOnly;
    }

    // getBBox는 TS 타입상 SVGGraphicsElement에 있지만 jsdom 런타임엔 없어 프로토타입에 주입
    const svgProto = SVGElement.prototype as unknown as { getBBox?: () => DOMRect };
    if (!svgProto.getBBox) {
      svgProto.getBBox = () => ({ x: 0, y: 0, width: 0, height: 0 }) as DOMRect;
    }
  });
}
