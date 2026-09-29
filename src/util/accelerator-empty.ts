interface AcceleratorState {
  clusterSelected: boolean;
  isPending: boolean;
  /** 세 지표(GPU/NPU/TPU) 조회 중 하나라도 실패했는지. */
  anyFailed: boolean;
  /** 히트맵에 그릴 행 수. */
  rowCount: number;
}

/**
 * 가속기 사용량이 비었을 때 화면에 쓸 이유.
 *
 * <p>"데이터가 없습니다" 하나로 뭉뚱그리면 Prometheus 가 없을 때도 GPU 가 없는 것처럼 보여 엉뚱한
 * 곳을 뒤지게 된다. 못 가져온 것과 없는 것은 다른 말이다.
 *
 * @return 비어 있지 않으면 undefined
 */
export const acceleratorEmptyReason = ({
  clusterSelected,
  isPending,
  anyFailed,
  rowCount,
}: AcceleratorState): string | undefined => {
  if (rowCount > 0) return undefined;
  if (!clusterSelected) return '클러스터를 선택해주세요.';
  if (isPending) return undefined;
  if (anyFailed) {
    return '가속기 지표를 가져오지 못했습니다. 모니터링 스택이 설치되어 있는지 확인해주세요.';
  }
  return '이 클러스터에 가속기 지표가 없습니다. GPU/NPU/TPU 노드가 없거나 지표 수집기(DCGM exporter 등)가 설치되지 않았습니다.';
};
