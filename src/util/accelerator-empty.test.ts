import { describe, it, expect } from 'vitest';
import { acceleratorEmptyReason } from './accelerator-empty';

const base = { clusterSelected: true, isPending: false, anyFailed: false, rowCount: 0 };

describe('acceleratorEmptyReason', () => {
  it('클러스터를 고르지 않았으면 그것부터 말한다', () => {
    expect(acceleratorEmptyReason({ ...base, clusterSelected: false })).toContain('클러스터');
  });

  it('불러오는 중에는 아무 판단도 하지 않는다', () => {
    // 로딩 중에 "가속기가 없습니다" 를 띄우면 매번 깜빡인다.
    expect(acceleratorEmptyReason({ ...base, isPending: true })).toBeUndefined();
  });

  it('지표를 못 가져왔으면 가속기가 없다고 단정하지 않는다', () => {
    // Prometheus 가 없을 때도 "GPU 없음" 으로 보이면 엉뚱한 곳을 뒤진다.
    const msg = acceleratorEmptyReason({ ...base, anyFailed: true });

    expect(msg).toContain('지표를 가져오지 못했습니다');
    expect(msg).not.toContain('가속기가 없');
  });

  it('조회는 됐는데 값이 없으면 가속기나 수집기를 짚는다', () => {
    const msg = acceleratorEmptyReason(base);

    expect(msg).toContain('가속기');
    expect(msg).toMatch(/수집기|exporter/);
  });

  it('행이 있으면 빈 화면일 이유가 없다', () => {
    expect(acceleratorEmptyReason({ ...base, rowCount: 3 })).toBeUndefined();
  });

  it('행이 있으면 일부 조회가 실패해도 보여준다', () => {
    // GPU 는 있고 TPU 쿼리만 실패하는 클러스터가 흔하다. 하나 때문에 전체를 가리면 안 된다.
    expect(acceleratorEmptyReason({ ...base, rowCount: 2, anyFailed: true })).toBeUndefined();
  });
});
