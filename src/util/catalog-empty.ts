interface CatalogState {
  repoSelected: boolean;
  /** 저장소가 실제로 들고 있는 차트 수 — 검색 필터를 거치기 전 값. */
  chartCount: number;
  searchValue: string;
  isError?: boolean;
}

/**
 * 목록이 비었을 때 화면에 쓸 이유.
 *
 * <p>모두 "검색 결과가 없습니다" 로 뭉뚱그리면, 저장소가 비었을 때도 검색을 의심하게 된다. 실제로
 * ChartMuseum 에 차트를 올린 적이 없어 index.yaml 의 entries 가 비어 있는 상태를 검색 탓으로
 * 읽었다.
 *
 * @return 비어 있지 않으면 undefined
 */
export const catalogEmptyReason = ({
  repoSelected,
  chartCount,
  searchValue,
  isError,
}: CatalogState): string | undefined => {
  if (!repoSelected) return '저장소를 선택해주세요.';
  if (isError) return '차트 목록을 불러오지 못했습니다. 저장소 주소와 연결을 확인해주세요.';
  if (chartCount === 0) {
    return '이 저장소에 차트가 없습니다. 헬름 저장소를 추가하거나 차트를 올려주세요.';
  }
  if (searchValue) return `'${searchValue}' 에 해당하는 차트가 없습니다.`;
  return undefined;
};
