import { Button, Input, Modal, useToast } from '@innogrid/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { CSP_OPTIONS } from '@/components/features/infra-management/credentials/csp-selector';
import { type ProvisioningDefaults, type SpecFilter } from '@/hooks/service/providers';
import { useCreateVm } from '@/hooks/service/vms';
import type { VmCreateRequest } from '@/types/vm';

import { BulkProvisionRow, type RowOutcome } from './bulk-provision-row';

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
  const [loaded, setLoaded] = useState<Record<string, ProvisioningDefaults | null>>({});
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [prefix, setPrefix] = useState('e2e-');
  const [confirmation, setConfirmation] = useState('');
  const [outcomes, setOutcomes] = useState<Record<string, RowOutcome>>({});
  const [submitting, setSubmitting] = useState(false);
  /*
   * 조건이 바뀌면 CSP 마다 다시 묻는다. 값을 화면에서 거르면 "조건에 맞는 것이 없다" 와
   * "그 CSP 에 자리가 없다" 를 구분할 수 없다 — 용량 확인도 이 조건으로 돈다.
   */
  const [filter, setFilter] = useState<SpecFilter>({ minVcpu: 2, minMemoryGb: 4, gpu: false });
  const { createVm } = useCreateVm();

  useEffect(() => {
    if (isOpen) return;
    setOutcomes({});
    setConfirmation('');
  }, [isOpen]);

  // 조건이 바뀌면 고른 값이 통째로 달라진다. 이전 선택을 들고 있으면 옛 값으로 만들게 된다.
  useEffect(() => {
    setLoaded({});
    setSelected({});
  }, [filter]);

  /* 줄이 값을 받아오면 만들 수 있는 것만 켠다. 차단된 CSP 를 켜 두면 눌러도 되는 것처럼 보인다. */
  const handleLoaded = useCallback((provider: string, item: ProvisioningDefaults | null) => {
    setLoaded((prev) => (prev[provider] === item ? prev : { ...prev, [provider]: item }));
    setSelected((prev) =>
      provider in prev ? prev : { ...prev, [provider]: !!item?.ready }
    );
  }, []);

  const chosen = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, on]) => on)
        .map(([provider]) => loaded[provider])
        .filter((item): item is ProvisioningDefaults => !!item?.ready),
    [selected, loaded]
  );

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
      <style>{`@keyframes bulk-skeleton{0%{background-position:100% 50%}100%{background-position:0 50%}}`}</style>
      <div style={{ display: 'grid', rowGap: 12 }}>
        <p style={{ fontSize: 13, color: '#b45309' }}>실제 자원이 생성되고 과금됩니다.</p>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 13 }}>
          <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            최소 vCPU
            <input
              type="number"
              min={1}
              value={filter.minVcpu ?? 2}
              disabled={submitting}
              onChange={(e) => setFilter((prev) => ({ ...prev, minVcpu: Number(e.target.value) }))}
              style={{ width: 64, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 4 }}
            />
          </label>
          <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            최소 메모리(GB)
            <input
              type="number"
              min={1}
              value={filter.minMemoryGb ?? 4}
              disabled={submitting}
              onChange={(e) => setFilter((prev) => ({ ...prev, minMemoryGb: Number(e.target.value) }))}
              style={{ width: 72, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 4 }}
            />
          </label>
          <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={!!filter.gpu}
              disabled={submitting}
              onChange={(e) => setFilter((prev) => ({ ...prev, gpu: e.target.checked }))}
            />
            GPU 인스턴스
          </label>
        </div>

        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#666' }}>
              <th style={{ width: 36 }} />
              <th>CSP / 자격증명</th>
              <th>리전 / 존</th>
              <th>인스턴스</th>
              <th>노드</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {isOpen &&
              CSP_OPTIONS.map((csp) => (
                <BulkProvisionRow
                  key={csp.value}
                  provider={csp.value}
                  displayName={csp.label}
                  checked={!!selected[csp.value]}
                  disabled={submitting}
                  outcome={outcomes[csp.value]}
                  onChange={(on) => setSelected((prev) => ({ ...prev, [csp.value]: on }))}
                  onLoaded={(item) => handleLoaded(csp.value, item)}
                  filter={filter}
                />
              ))}
          </tbody>
        </table>

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
