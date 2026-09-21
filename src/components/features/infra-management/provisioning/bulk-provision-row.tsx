import { useEffect } from 'react';

import {
  useGetProvisioningDefaults,
  type ProvisioningDefaults,
  type SpecFilter,
} from '@/hooks/service/providers';

export type RowOutcome = 'pending' | 'running' | 'accepted' | 'failed';

interface Props {
  provider: string;
  displayName: string;
  checked: boolean;
  disabled: boolean;
  outcome?: RowOutcome;
  onChange: (checked: boolean) => void;
  onLoaded: (defaults: ProvisioningDefaults | null) => void;
  /** 조건이 바뀌면 그 조건으로 다시 묻는다. */
  filter: SpecFilter;
}

const skeleton = (width: number) => (
  <span
    aria-hidden
    style={{
      display: 'inline-block',
      width,
      height: 10,
      borderRadius: 3,
      background: 'linear-gradient(90deg,#eee 25%,#f5f5f5 37%,#eee 63%)',
      backgroundSize: '400% 100%',
      animation: 'bulk-skeleton 1.2s ease-in-out infinite',
    }}
  />
);

/** {@code 2 vCPU · 8 GB · GPU 1} 처럼. 값이 없으면 그 조각만 빠진다. */
const specSummary = (item: ProvisioningDefaults) => {
  const parts: string[] = [];
  if (item.vcpu) parts.push(`${item.vcpu} vCPU`);
  if (item.memoryGb) parts.push(`${Number(item.memoryGb.toFixed(1))} GB`);
  if (item.gpuCount) parts.push(`GPU ${item.gpuCount}`);
  return parts.join(' · ');
};

/**
 * CSP 한 줄.
 *
 * <p>줄마다 따로 조회한다. 7종을 한 번에 물으면 가장 느린 CSP 가 끝날 때까지 화면이 비어 있어
 * 멈춘 것처럼 보인다 — 실제로 20초가 넘었다.
 */
export const BulkProvisionRow = ({
  provider,
  displayName,
  checked,
  disabled,
  outcome,
  onChange,
  onLoaded,
  filter,
}: Props) => {
  const { defaults, isPending, isError } = useGetProvisioningDefaults(provider, filter);
  const item = defaults[0] ?? null;

  useEffect(() => {
    if (isPending) return;
    onLoaded(item);
    // onLoaded 는 부모가 매 렌더 새로 만든다. 의존성에 넣으면 무한 루프가 된다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, item]);

  const status = () => {
    if (isPending) return '조회 중';
    if (isError) return '조회 실패';
    if (outcome === 'running') return '요청 중';
    if (outcome === 'accepted') return '수락됨';
    if (outcome === 'failed') return '요청 실패';
    return item?.ready ? '준비됨' : (item?.blockedReason ?? '사용할 수 없음');
  };

  const ready = !!item?.ready;
  const tone = isPending ? '#666' : ready ? '#15803d' : '#b45309';

  return (
    <tr style={{ borderTop: '1px solid #eee' }} data-testid={`bulk-row-${provider}`}>
      <td style={{ padding: '8px 0' }}>
        <input
          type="checkbox"
          aria-label={`${displayName} 선택`}
          checked={checked}
          disabled={disabled || !ready}
          onChange={(e) => onChange(e.target.checked)}
        />
      </td>
      <td>
        <div>{displayName}</div>
        {/* 어느 계정에 과금되는지가 여기서 갈린다. 이름을 안 보여주면 확인하러 나가야 한다. */}
        <div style={{ fontSize: 11, color: '#888' }}>
          {isPending ? skeleton(70) : (item?.credentialName ?? '자격증명 없음')}
        </div>
      </td>
      <td>
        <div>{isPending ? skeleton(90) : (item?.region ?? '—')}</div>
        {/* 존마다 파는 인스턴스가 달라, 어느 존으로 잡혔는지가 성공과 실패를 가른다. */}
        <div style={{ fontSize: 11, color: '#888' }}>
          {isPending ? skeleton(76) : (item?.providerSpec?.zone ?? '')}
        </div>
      </td>
      <td>
        <div>{isPending ? skeleton(100) : (item?.masterInstanceType ?? '—')}</div>
        <div style={{ fontSize: 11, color: '#888' }}>
          {isPending ? skeleton(80) : specSummary(item ?? ({} as ProvisioningDefaults))}
        </div>
      </td>
      <td>{isPending ? skeleton(70) : ready ? 'master 1 · worker 1' : '—'}</td>
      <td style={{ color: tone }}>{status()}</td>
    </tr>
  );
};
