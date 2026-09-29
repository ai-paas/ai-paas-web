import { useEffect, useMemo } from 'react';
import { Select, type SelectSingleValue } from '@innogrid/ui';
import { useGetClusters } from '@/hooks/service/clusters';
import { clusterReadiness } from '@/util/cluster-readiness';

// 클러스터 선택을 한 곳에서 그린다.
//
// 모니터링, GPU 워크로드, 헬름 릴리즈, 사용량이 각자 다르게 그리고 있었다. 관측/조작 데이터는
// agent 를 통해 오므로 끊긴 클러스터를 고르면 빈 화면이 나오는데, 화면에서는 "데이터가 없다" 로
// 읽혀 원인을 알 수 없다. 고르기 전에 막고 이유를 함께 보여준다.

export interface ClusterOption {
  label: string;
  value: string;
  isDisabled?: boolean;
  reason?: string;
}

interface Props {
  value?: string;
  onChange: (clusterName: string) => void;
  /** false 면 준비되지 않은 클러스터도 고를 수 있다 (목록 조회만 하는 화면). */
  requireReady?: boolean;
  /** 첫 번째 선택 가능한 클러스터를 자동으로 고른다. */
  autoSelectFirst?: boolean;
  placeholder?: string;
}

export const ClusterPicker = ({
  value,
  onChange,
  requireReady = true,
  autoSelectFirst = true,
  placeholder = '클러스터를 선택해주세요.',
}: Props) => {
  const { clusters, isPending } = useGetClusters();

  const options = useMemo<ClusterOption[]>(
    () =>
      clusters
        .filter((c) => !!c.clusterName)
        .map((c) => {
          const { selectable, reason } = clusterReadiness(c);
          const blocked = requireReady && !selectable;
          return {
            label: c.clusterName ?? '',
            value: c.clusterName ?? '',
            isDisabled: blocked,
            reason: selectable ? undefined : reason,
          };
        }),
    [clusters, requireReady]
  );

  const selected = useMemo(() => options.find((o) => o.value === value) ?? null, [options, value]);

  useEffect(() => {
    if (!autoSelectFirst || options.length === 0) return;
    const current = options.find((o) => o.value === value);
    if (current && !current.isDisabled) return;
    // 고를 수 없는 클러스터가 기본값이면 화면이 빈 채로 열린다.
    const first = options.find((o) => !o.isDisabled);
    if (first) onChange(first.value);
  }, [autoSelectFirst, options, value, onChange]);

  return (
    <Select
      options={options}
      value={selected}
      isLoading={isPending}
      isOptionDisabled={(o: ClusterOption) => !!o.isDisabled}
      // 사유를 다 적으면 목록이 길어진다. 왜 막혔는지는 선택하려 할 때가 아니라
      // 해당 클러스터 화면에서 확인한다.
      getOptionLabel={(o: ClusterOption) => (o.isDisabled ? `${o.label} (사용 불가)` : o.label)}
      getOptionValue={(o: ClusterOption) => o.value}
      onChange={(opt: SelectSingleValue<ClusterOption>) => {
        if (opt && !opt.isDisabled) onChange(opt.value);
      }}
      placeholder={placeholder}
    />
  );
};
