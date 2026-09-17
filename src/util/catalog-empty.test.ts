import { describe, it, expect } from 'vitest';
import { catalogEmptyReason } from './catalog-empty';

describe('catalogEmptyReason', () => {
  it('저장소를 고르지 않았으면 그것부터 말한다', () => {
    expect(catalogEmptyReason({ repoSelected: false, chartCount: 0, searchValue: '' })).toContain(
      '저장소'
    );
  });

  it('불러오지 못했으면 검색 탓으로 돌리지 않는다', () => {
    // "검색 결과가 없습니다" 는 레포가 죽었을 때도 똑같이 나와 원인을 가린다.
    expect(
      catalogEmptyReason({ repoSelected: true, chartCount: 0, searchValue: '', isError: true })
    ).toContain('불러오지');
  });

  it('저장소가 비어 있으면 검색이 아니라 저장소를 짚는다', () => {
    // ChartMuseum 에 차트를 한 번도 올리지 않으면 index.yaml 의 entries 가 비어 있다.
    const msg = catalogEmptyReason({ repoSelected: true, chartCount: 0, searchValue: '' });

    expect(msg).toContain('저장소에 차트가 없습니다');
    expect(msg).not.toContain('검색');
  });

  it('차트는 있는데 검색이 안 맞으면 검색 결과가 없다고 한다', () => {
    expect(catalogEmptyReason({ repoSelected: true, chartCount: 12, searchValue: 'nginx' })).toBe(
      "'nginx' 에 해당하는 차트가 없습니다."
    );
  });

  it('검색어가 없고 차트도 있으면 빈 화면일 이유가 없다', () => {
    expect(
      catalogEmptyReason({ repoSelected: true, chartCount: 12, searchValue: '' })
    ).toBeUndefined();
  });
});
