import { useEffect, useMemo, useState } from 'react';
import { Table, useTablePagination, useTableSelection } from '@innogrid/ui';
import { useGetOperations } from '@/hooks/service/operations';
import { formatDateTime } from '@/util/date';
import { workflowStepLabel } from '@/util/provisioning-labels';
import { operationStateTone } from '@/util/status-tone';
import type { Operation, OperationState } from '@/types/cluster';

// 작업 이력을 한 곳에서 그린다.
//
// 시스템 설정과 클러스터 상세가 같은 데이터를 각자 그리고 있었다. stateColor 가 복제돼 있어
// 한 곳을 고쳐도 다른 쪽은 그대로 남았다. 차이는 "클러스터로 좁히느냐" 하나뿐이다.

interface Props {
  /** 지정하면 이 클러스터의 작업만. 생략하면 전체. */
  resourceId?: string;
  state?: OperationState;
  height?: number;
}

export const OperationTable = ({ resourceId, state, height = 480 }: Props) => {
  const { pagination, setPagination, initializePagination } = useTablePagination();
  const { rowSelection, setRowSelection } = useTableSelection();

  const { operations, isPending, isError } = useGetOperations({
    resourceId: resourceId || undefined,
    state: state || undefined,
    pageSize: 100,
  });

  // 자르지 않고 넘기면 페이지 이동이 아무 일도 하지 않는다.
  const paged = useMemo<Operation[]>(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return operations.slice(start, start + pagination.pageSize);
  }, [operations, pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    initializePagination();
  }, [resourceId, state, initializePagination]);

  const selectedKeys = Object.keys(rowSelection);
  const selected = selectedKeys.length === 1 ? paged[parseInt(selectedKeys[0], 10)] : undefined;

  const columns = useMemo(
    () => [
      { id: 'id', header: '작업 ID', accessorFn: (r: Operation) => r.id ?? '-', size: 190 },
      { id: 'type', header: '종류', accessorFn: (r: Operation) => r.type ?? '-', size: 170 },
      ...(resourceId
        ? []
        : [
            {
              id: 'resourceId',
              header: '대상',
              accessorFn: (r: Operation) => r.resourceId ?? '-',
              size: 170,
            },
          ]),
      {
        id: 'state',
        header: '상태',
        accessorFn: (r: Operation) => r.state ?? '-',
        size: 120,
        cell: ({ row }: { row: { original: Operation } }) => {
          const s = row.original.state;
          return (
            <span className={`table-td-state table-td-state-${operationStateTone(s)}`}>
              {s ?? '-'}
            </span>
          );
        },
      },
      {
        id: 'progress',
        header: '진행',
        accessorFn: (r: Operation) => r.progress?.currentStep ?? '',
        size: 220,
        // percent 만 보이면 지금 무엇을 기다리는지 알 수 없다.
        cell: ({ row }: { row: { original: Operation } }) => {
          const p = row.original.progress;
          if (!p) return '-';
          const running = row.original.state === 'RUNNING';
          return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              {p.percent !== undefined && (
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{p.percent}%</span>
              )}
              {running && p.currentStep && (
                <span
                  style={{
                    color: '#6b7280',
                    fontSize: 12,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={p.currentStep}
                >
                  {workflowStepLabel(p.currentStep)}
                </span>
              )}
            </span>
          );
        },
      },
      {
        id: 'startedAt',
        header: '시작 시각',
        accessorFn: (r: Operation) => formatDateTime(r.startedAt),
        size: 170,
      },
      {
        id: 'endedAt',
        header: '종료 시각',
        accessorFn: (r: Operation) => formatDateTime(r.endedAt),
        size: 170,
      },
    ],
    [resourceId]
  );

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
      {/* 다중 선택은 켜지 않는다 — 상세는 한 건씩 본다. 여러 건을 고르면 우측에
          무엇을 띄울지 정할 수 없다. */}
      <div style={{ flex: 1, minWidth: 0, height }}>
        <Table
          columns={columns}
          data={paged}
          isLoading={isPending}
          emptyMessage={isError ? '작업 이력을 불러오는 데 실패했습니다.' : '작업 이력이 없습니다.'}
          totalCount={operations.length}
          pagination={pagination}
          setPagination={setPagination}
          useClientPagination
          useSelect
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
      {selected && <OperationDetail operation={selected} showClusterLink={!resourceId} />}
    </div>
  );
};

/** 목록을 유지한 채 옆에서 본다 — 상단에 펼치면 클릭할 때마다 표가 아래로 밀린다. */
const OperationDetail = ({
  operation,
  showClusterLink,
}: {
  operation: Operation;
  showClusterLink: boolean;
}) => {
  const [rawOpen, setRawOpen] = useState(false);
  const request = operation.request;
  const summary = summarizeRequest(request);

  return (
    <aside
      style={{
        width: 320,
        flexShrink: 0,
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 14,
        background: '#fafafa',
        overflow: 'auto',
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
        {operation.resourceId ?? '-'}
      </div>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>{operation.type}</div>

      <Row label="상태" value={operation.state ?? '-'} />
      {operation.progress?.currentStep && (
        <Row label="단계" value={workflowStepLabel(operation.progress.currentStep)} />
      )}
      <Row label="작업 ID" value={operation.id ?? '-'} mono />

      {operation.errorMessage && (
        <div
          style={{
            marginTop: 10,
            padding: '8px 10px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 6,
            fontSize: 12,
            color: '#b91c1c',
            wordBreak: 'break-all',
          }}
        >
          {operation.errorMessage}
        </div>
      )}

      {summary.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>요청</div>
          {summary.map(([k, v]) => (
            <Row key={k} label={k} value={v} />
          ))}
        </div>
      )}

      {request && (
        <div style={{ marginTop: 10 }}>
          <button
            type="button"
            onClick={() => setRawOpen((v) => !v)}
            style={{
              border: 'none',
              background: 'transparent',
              padding: 0,
              fontSize: 12,
              color: '#4b5563',
              cursor: 'pointer',
            }}
          >
            {rawOpen ? '원본 접기' : '원본 보기'}
          </button>
          {rawOpen && (
            <pre
              style={{
                marginTop: 6,
                fontSize: 11,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                maxHeight: 220,
                overflow: 'auto',
                color: '#374151',
              }}
            >
              {request}
            </pre>
          )}
        </div>
      )}

      {showClusterLink && operation.resourceType === 'cluster' && operation.resourceId && (
        <a
          href={`/infra-management/cluster-management/${encodeURIComponent(operation.resourceId)}`}
          className="table-td-link"
          style={{ display: 'inline-block', marginTop: 14, fontSize: 12 }}
        >
          클러스터 상세로 →
        </a>
      )}
    </aside>
  );
};

const Row = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <div style={{ display: 'flex', gap: 8, fontSize: 12, padding: '3px 0', minWidth: 0 }}>
    <span style={{ color: '#6b7280', width: 74, flexShrink: 0 }}>{label}</span>
    <span
      style={{
        wordBreak: 'break-all',
        fontFamily: mono ? 'monospace' : undefined,
      }}
    >
      {value}
    </span>
  </div>
);

/** 요청 본문에서 사람이 볼 항목만 추린다. 전체는 "원본 보기" 에 있다. */
const summarizeRequest = (raw?: string): Array<[string, string]> => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const spec = (parsed.spec ?? {}) as Record<string, unknown>;
    const pick: Array<[string, unknown]> = [
      ['프로바이더', spec.provider ?? parsed.provider],
      ['리전', spec.region ?? parsed.region],
      ['환경', spec.environment ?? parsed.environment],
      ['master', spec.masterInstanceType],
      ['worker', spec.workerInstanceType],
      ['worker 수', spec.workerCount],
    ];
    return pick
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => [k, String(v)] as [string, string]);
  } catch {
    return [];
  }
};
