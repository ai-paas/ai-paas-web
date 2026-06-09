import { useMemo, useState } from 'react';
import type { Sorting } from '@innogrid/ui';
import { BreadCrumb, useTableSelection, useTablePagination, Tabs, Table } from '@innogrid/ui';

import { Link, useNavigate, useParams } from 'react-router';
import { EditWorkflowButton } from '@/components/features/workflow/edit-workflow-button';
import { DeleteWorkflowButton } from '@/components/features/workflow/delete-workflow-button';
import { ExecuteWorkflowButton } from '@/components/features/workflow/execute-workflow-button';
import { CopyButton } from '@/components/ui/copy-button';
import { ReactFlowProvider } from '@xyflow/react';
import { FlowChart } from '@/components/ui/flow-chart';
import { StopWorkflowDeploymentButton } from '@/components/features/workflow/stop-workflow-deployment-button';
import { WorkflowInferenceTestPanel } from '@/components/features/workflow/workflow-inference-test-panel';
import { WorkflowStatusPanel } from '@/components/features/workflow/workflow-status-panel';
import { workflowToFlow } from '@/components/features/workflow/workflow-editor/workflow-to-flow';
import { useGetWorkflow, useGetWorkflowModels } from '@/hooks/service/workflows';
import { formatDateTime } from '@/util/date';
import { getWorkflowModelStatus, getWorkflowStatus } from '@/util/workflow';
import type { WorkflowModel } from '@/types/workflow';

const EMPTY_VALUE = '-';

const toRecord = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : {};

const stringifyValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return EMPTY_VALUE;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return EMPTY_VALUE;
};

const getWorkflowValue = (workflow: unknown, keys: string[]) => {
  const record = toRecord(workflow);

  for (const key of keys) {
    const value = record[key];
    const stringValue = stringifyValue(value);
    if (stringValue !== EMPTY_VALUE) return stringValue;
  }

  return EMPTY_VALUE;
};

const columns = [
  {
    id: 'model_name',
    header: '모델명',
    accessorFn: (row: WorkflowModel) => row.model_name || EMPTY_VALUE,
    size: 220,
  },
  {
    id: 'component_name',
    header: '컴포넌트',
    accessorFn: (row: WorkflowModel) => row.component_name || EMPTY_VALUE,
    size: 180,
  },
  {
    id: 'state',
    header: '상태',
    accessorFn: (row: WorkflowModel) => row.status || EMPTY_VALUE,
    size: 140,
    cell: ({ row }: { row: { original: WorkflowModel } }) => {
      const state = getWorkflowModelStatus(row.original.status);

      return <span className={`table-td-state ${state.className}`}>{state.label}</span>;
    },
  },
  {
    id: 'deployment_type',
    header: '배포 유형',
    accessorFn: (row: WorkflowModel) => row.deployment_type || EMPTY_VALUE,
    size: 140,
  },
  {
    id: 'backend_api_url',
    header: '백엔드 API',
    accessorFn: (row: WorkflowModel) => row.backend_api_url ?? EMPTY_VALUE,
    size: 320,
    cell: ({ row }: { row: { original: WorkflowModel } }) => {
      const backendApiUrl = row.original.backend_api_url ?? EMPTY_VALUE;

      return (
        <span>
          {backendApiUrl}
          {backendApiUrl !== EMPTY_VALUE && (
            <CopyButton value={backendApiUrl} style={{ marginLeft: 4 }} />
          )}
        </span>
      );
    },
  },
  {
    id: 'public_url',
    header: '공개 URL',
    accessorFn: (row: WorkflowModel) => row.public_url ?? EMPTY_VALUE,
    size: 260,
  },
  {
    id: 'date',
    header: '배포일시',
    accessorFn: (row: WorkflowModel) =>
      row.deployed_at ? formatDateTime(row.deployed_at) : EMPTY_VALUE,
    size: 225,
  },
];

export default function WorkflowDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { setRowSelection, rowSelection } = useTableSelection();
  const { pagination, setPagination } = useTablePagination();
  const [sorting, setSorting] = useState<Sorting>([{ id: 'name', desc: false }]);

  const { workflow, isPending, isError } = useGetWorkflow(id, !!id);
  const workflowId = workflow?.surro_workflow_id || id;
  const {
    workflowModels,
    backendApiUrl,
    page,
    isPending: isModelsPending,
    isError: isModelsError,
  } = useGetWorkflowModels(workflowId);
  const { nodes, edges } = useMemo(() => workflowToFlow(workflow), [workflow]);

  const publicUrl = getWorkflowValue(workflow, [
    'public_url',
    'publicUrl',
    'endpoint_url',
    'endpoint',
    'url',
  ]);
  const backendApi =
    backendApiUrl ??
    getWorkflowValue(workflow, [
      'backend_api_url',
      'backendApiUrl',
      'api_url',
      'apiUrl',
      'internal_url',
      'internalUrl',
      'backend_url',
    ]);

  if (!id || isError) {
    return (
      <main>
        <div className="breadcrumbBox">
          <BreadCrumb
            items={[
              { label: '워크플로우', path: '/workflow/workflow' },
              { label: '워크플로우 상세' },
            ]}
            onNavigate={navigate}
          />
        </div>
        <div className="page-content page-pb-40">
          <div className="flex size-full items-center justify-center">
            워크플로우 정보를 불러오지 못했습니다.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb
          items={[
            { label: '워크플로우', path: '/workflow/workflow' },
            { label: workflow?.name ?? '' },
          ]}
          onNavigate={navigate}
        />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">워크플로우 상세</h2>
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <EditWorkflowButton workflowId={workflowId} />
            <DeleteWorkflowButton workflowId={workflowId} redirect="/workflow/workflow" />
            <ExecuteWorkflowButton workflowId={workflowId} />
            <StopWorkflowDeploymentButton workflowId={workflowId} />
          </div>
        </div>
      </div>
      <div className="page-content page-pb-40">
        <h3 className="page-detail-title">상세 정보</h3>
        {isPending ? (
          <div className="flex size-full items-center justify-center">Loading workflow...</div>
        ) : (
          <div className="page-detail-list-box">
            <ul className="page-detail-list">
              <li>
                <div className="page-detail_item-name">이름</div>
                <div className="page-detail_item-data">{workflow?.name || EMPTY_VALUE}</div>
              </li>
              <li>
                <div className="page-detail_item-name">생성일시</div>
                <div className="page-detail_item-data">
                  {formatDateTime(workflow?.created_at) || EMPTY_VALUE}
                </div>
              </li>
              <li>
                <div className="page-detail_item-name">최근 업데이트</div>
                <div className="page-detail_item-data">
                  {formatDateTime(workflow?.updated_at) || EMPTY_VALUE}
                </div>
              </li>
              <li>
                <div className="page-detail_item-name">서비스</div>
                <div className="page-detail_item-data">
                  {workflow?.service_id ? (
                    <Link
                      to={`/service/${workflow.service_id}`}
                      className="page-detail_item-data-link"
                    >
                      {workflow.service_id}
                    </Link>
                  ) : (
                    EMPTY_VALUE
                  )}
                </div>
              </li>
              <li>
                <div className="page-detail_item-name">공개 URL</div>
                <div className="page-detail_item-data">
                  {publicUrl}
                  {publicUrl !== EMPTY_VALUE && <CopyButton value={publicUrl} />}
                </div>
              </li>
            </ul>
            <ul className="page-detail-list">
              <li>
                <div className="page-detail_item-name">백엔드 서비스 API</div>
                <div className="page-detail_item-data">
                  {backendApi}
                  {backendApi !== EMPTY_VALUE && <CopyButton value={backendApi} />}
                </div>
              </li>
              <li>
                <div className="page-detail_item-name">카테고리</div>
                <div className="page-detail_item-data">{workflow?.category || EMPTY_VALUE}</div>
              </li>
              <li>
                <div className="page-detail_item-name">상태</div>
                <div className="page-detail_item-data">
                  {workflow?.status ? getWorkflowStatus(workflow.status).label : EMPTY_VALUE}
                </div>
              </li>
              <li>
                <div className="page-detail_item-name">설명</div>
                <div className="page-detail_item-data">{workflow?.description || EMPTY_VALUE}</div>
              </li>
            </ul>
          </div>
        )}
      </div>
      <div className="page-content page-content-detail">
        <div className="page-tabsBox">
          <Tabs
            labels={['워크플로우 오버뷰', '모델', '배포 상태', '추론 테스트']}
            components={[
              <div className="tabs-Content">
                {nodes.length > 0 ? (
                  <div className="h-70">
                    <ReactFlowProvider>
                      <FlowChart initialNodes={nodes} initialEdges={edges} readOnly />
                    </ReactFlowProvider>
                  </div>
                ) : (
                  <div className="flex size-full items-center justify-center">
                    표시할 워크플로우 구성 정보가 없습니다.
                  </div>
                )}
              </div>,
              <div className="tabs-Content">
                <div className="h-70">
                  <Table
                    useClientPagination
                    columns={columns}
                    data={workflowModels}
                    isLoading={isModelsPending}
                    emptyMessage={
                      isModelsError ? '모델 목록을 불러오지 못했습니다.' : '모델이 없습니다.'
                    }
                    totalCount={page.total}
                    pagination={pagination}
                    setPagination={setPagination}
                    rowSelection={rowSelection}
                    setRowSelection={setRowSelection}
                    setSorting={setSorting}
                    sorting={sorting}
                  />
                </div>
              </div>,
              <WorkflowStatusPanel workflowId={workflowId} />,
              <WorkflowInferenceTestPanel workflowId={workflowId} />,
            ]}
          />
        </div>
      </div>
    </main>
  );
}
