import { useMemo } from 'react';
import { BreadCrumb, Button, Tabs } from '@innogrid/ui';
import { useNavigate, useParams } from 'react-router';
import { DeleteWorkflowTemplateButton } from '@/components/features/workflow/delete-workflow-template-button';
import { ReactFlowProvider } from '@xyflow/react';
import { FlowChart } from '@/components/ui/flow-chart';
import { workflowToFlow } from '@/components/features/workflow/workflow-editor/workflow-to-flow';
import { useGetWorkflowTemplate } from '@/hooks/service/workflows';
import { formatDateTime } from '@/util/date';
import { getWorkflowStatus } from '@/util/workflow';

const EMPTY_VALUE = '-';

export default function WorkflowTemplateDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { workflowTemplate, isPending, isError } = useGetWorkflowTemplate(id);
  const { nodes, edges } = useMemo(() => workflowToFlow(workflowTemplate), [workflowTemplate]);

  if (!id || isError) {
    return (
      <main>
        <div className="breadcrumbBox">
          <BreadCrumb
            items={[
              { label: '워크플로우', path: '/workflow/workflow' },
              { label: '워크플로우 템플릿', path: '/workflow/templates' },
              { label: '템플릿 상세' },
            ]}
            onNavigate={navigate}
          />
        </div>
        <div className="page-content page-pb-40">
          <div className="flex size-full items-center justify-center">
            템플릿 정보를 불러오지 못했습니다.
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
            { label: '워크플로우 템플릿', path: '/workflow/templates' },
            { label: workflowTemplate?.name ?? '' },
          ]}
          onNavigate={navigate}
        />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">템플릿 상세</h2>
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <Button
              size="medium"
              color="secondary"
              disabled={!id}
              onClick={() => navigate(`/workflow/templates/${id}/edit`)}
            >
              수정
            </Button>
            <DeleteWorkflowTemplateButton
              templateId={id}
              templateName={workflowTemplate?.name}
              onDeleted={() => navigate('/workflow/templates')}
            />
          </div>
        </div>
      </div>
      <div className="page-content page-pb-40">
        <h3 className="page-detail-title">상세 정보</h3>
        {isPending ? (
          <div className="flex size-full items-center justify-center">Loading template...</div>
        ) : (
          <div className="page-detail-list-box">
            <ul className="page-detail-list">
              <li>
                <div className="page-detail_item-name">이름</div>
                <div className="page-detail_item-data">{workflowTemplate?.name || EMPTY_VALUE}</div>
              </li>
              <li>
                <div className="page-detail_item-name">카테고리</div>
                <div className="page-detail_item-data">
                  {workflowTemplate?.category || EMPTY_VALUE}
                </div>
              </li>
              <li>
                <div className="page-detail_item-name">상태</div>
                <div className="page-detail_item-data">
                  {workflowTemplate?.status
                    ? getWorkflowStatus(workflowTemplate.status).label
                    : EMPTY_VALUE}
                </div>
              </li>
              <li>
                <div className="page-detail_item-name">사용 수</div>
                <div className="page-detail_item-data">
                  {workflowTemplate?.usage_count ?? EMPTY_VALUE}
                </div>
              </li>
            </ul>
            <ul className="page-detail-list">
              <li>
                <div className="page-detail_item-name">생성자</div>
                <div className="page-detail_item-data">
                  {workflowTemplate?.creator?.name || EMPTY_VALUE}
                </div>
              </li>
              <li>
                <div className="page-detail_item-name">생성일시</div>
                <div className="page-detail_item-data">
                  {formatDateTime(workflowTemplate?.created_at) || EMPTY_VALUE}
                </div>
              </li>
              <li>
                <div className="page-detail_item-name">최근 업데이트</div>
                <div className="page-detail_item-data">
                  {formatDateTime(workflowTemplate?.updated_at) || EMPTY_VALUE}
                </div>
              </li>
              <li>
                <div className="page-detail_item-name">설명</div>
                <div className="page-detail_item-data">
                  {workflowTemplate?.description || EMPTY_VALUE}
                </div>
              </li>
            </ul>
          </div>
        )}
      </div>
      <div className="page-content page-content-detail">
        <div className="page-tabsBox">
          <Tabs
            labels={['워크플로우 오버뷰']}
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
            ]}
          />
        </div>
      </div>
    </main>
  );
}
