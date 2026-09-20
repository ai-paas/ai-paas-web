import { Button, Input, Modal, useToast } from '@innogrid/ui';
import { useEffect, useMemo, useState } from 'react';

import { useGetProvisioningDefaults, type ProvisioningDefaults } from '@/hooks/service/providers';
import { useCreateVm } from '@/hooks/service/vms';
import type { VmCreateRequest } from '@/types/vm';

type Outcome = 'pending' | 'running' | 'accepted' | 'failed';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/** 요청 한 벌을 만든다. 값은 전부 백엔드가 준 것이고 화면은 이름만 붙인다. */
const toRequest = (item: ProvisioningDefaults, prefix: string): VmCreateRequest => ({
  vmGroupName: `${prefix}${item.provider.toLowerCase()}`,
  provider: item.provider.toLowerCase(),
  environment: 'dev',
  region: item.region ?? undefined,
  credentialId: item.credentialId ?? undefined,
  spec: {
    masterCount: 1,
    workerCount: 1,
    masterInstanceType: item.masterInstanceType ?? undefined,
    workerInstanceType: item.workerInstanceType ?? undefined,
    ...(item.osImage ? { osImage: item.osImage } : {}),
  },
  ...(item.providerSpec && Object.keys(item.providerSpec).length > 0
    ? { providerSpec: item.providerSpec }
    : {}),
});

/**
 * 여러 CSP 에 검증용 클러스터를 한 번에 만든다.
 *
 * <p>7종을 띄울 때마다 리전, 스펙, 이미지, CSP 고유 값을 손으로 맞추면 한 곳만 틀려도
 * 프로비저닝 중반에 실패한다. 기본값은 백엔드가 계정에서 조회해 조립한 것을 그대로 쓴다.
 */
export const BulkProvisionModal = ({ isOpen, onClose }: Props) => {
  const { open: openToast } = useToast();
  const { defaults, isPending, isError } = useGetProvisioningDefaults(isOpen);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [prefix, setPrefix] = useState('e2e-');
  const [confirmation, setConfirmation] = useState('');
  const [outcomes, setOutcomes] = useState<Record<string, Outcome>>({});
  const [submitting, setSubmitting] = useState(false);
  const { createVm } = useCreateVm();

  const ready = useMemo(() => defaults.filter((d) => d.ready), [defaults]);

  // 만들 수 있는 것만 미리 켜 둔다. 차단된 CSP 를 켜 두면 눌러도 되는 것처럼 보인다.
  useEffect(() => {
    if (!isOpen) return;
    setSelected(Object.fromEntries(ready.map((d) => [d.provider, true])));
    setOutcomes({});
    setConfirmation('');
  }, [isOpen, ready]);

  const chosen = ready.filter((d) => selected[d.provider]);
  const confirmed = confirmation.trim() === prefix.trim() && prefix.trim().length > 0;
  const canSubmit = chosen.length > 0 && confirmed && !submitting;

  const handleSubmit = async () => {
    setSubmitting(true);
    for (const item of chosen) {
      setOutcomes((prev) => ({ ...prev, [item.provider]: 'running' }));
      /*
       * 하나씩 보낸다. 한꺼번에 던지면 실패한 것이 어느 CSP 인지 화면에서 짚기 어렵고,
       * 백엔드도 CSP 마다 API 를 두드리느라 동시 요청에서 더 잘 막힌다.
       */
      await new Promise<void>((resolve) => {
        createVm(toRequest(item, prefix), {
          onSuccess: () => {
            setOutcomes((prev) => ({ ...prev, [item.provider]: 'accepted' }));
            resolve();
          },
          onError: () => {
            setOutcomes((prev) => ({ ...prev, [item.provider]: 'failed' }));
            resolve();
          },
        });
      });
    }
    setSubmitting(false);
    openToast({ title: `${chosen.length}개 CSP 생성 요청을 보냈습니다.` });
  };

  const statusText = (item: ProvisioningDefaults) => {
    const outcome = outcomes[item.provider];
    if (outcome === 'running') return '요청 중';
    if (outcome === 'accepted') return '수락됨';
    if (outcome === 'failed') return '요청 실패';
    return item.ready ? '준비됨' : (item.blockedReason ?? '사용할 수 없음');
  };

  return (
    <Modal
      isOpen={isOpen}
      size="large"
      title="CSP 일괄 프로비저닝 (검증용)"
      buttonTitle={submitting ? '요청 중...' : `${chosen.length}종 생성`}
      action={handleSubmit}
      onRequestClose={() => !submitting && onClose()}
      buttonDisabled={!canSubmit}
      isButtonLoading={submitting}
      subButton={
        <Button size="large" color="secondary" onClick={onClose} disabled={submitting}>
          닫기
        </Button>
      }
    >
      <div style={{ display: 'grid', rowGap: 12 }}>
        <p style={{ fontSize: 13, color: '#b45309' }}>
          실제 자원이 생성되고 과금됩니다. CSP 마다 master 1대, worker 1대가 만들어집니다.
        </p>

        {isPending && <p style={{ fontSize: 13 }}>계정에서 쓸 수 있는 값을 조회하는 중입니다...</p>}
        {isError && <p style={{ fontSize: 13, color: '#b91c1c' }}>기본값을 불러오지 못했습니다.</p>}

        {defaults.length > 0 && (
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#666' }}>
                <th style={{ width: 36 }} />
                <th>CSP</th>
                <th>리전</th>
                <th>인스턴스</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {defaults.map((item) => (
                <tr key={item.provider} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: '6px 0' }}>
                    <input
                      type="checkbox"
                      aria-label={`${item.displayName} 선택`}
                      checked={!!selected[item.provider]}
                      disabled={!item.ready || submitting}
                      onChange={(e) =>
                        setSelected((prev) => ({ ...prev, [item.provider]: e.target.checked }))
                      }
                    />
                  </td>
                  <td>{item.displayName}</td>
                  <td>{item.region ?? '—'}</td>
                  <td>{item.masterInstanceType ?? '—'}</td>
                  <td style={{ color: item.ready ? '#15803d' : '#b45309' }}>{statusText(item)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label style={{ fontSize: 13, minWidth: 72 }} htmlFor="bulk-prefix">
            이름 접두
          </label>
          <Input
            id="bulk-prefix"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            disabled={submitting}
          />
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label style={{ fontSize: 13, minWidth: 72 }} htmlFor="bulk-confirm">
            접두 확인
          </label>
          {/* 오클릭 한 번으로 7종이 올라가지 않게, 같은 값을 한 번 더 받는다. */}
          <Input
            id="bulk-confirm"
            placeholder="위 접두를 그대로 입력"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            disabled={submitting}
          />
        </div>
      </div>
    </Modal>
  );
};
