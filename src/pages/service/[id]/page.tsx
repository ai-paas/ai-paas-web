import { useNavigate, useParams } from 'react-router';
import { BreadCrumb, Tabs } from 'innogrid-ui';
import { EditServiceButton } from '@/components/features/service/edit-service-button';
import { DeleteServiceButton } from '@/components/features/service/delete-service-button';
import { WorkflowTab } from '@/components/features/service/workflow-tab';
import { KnowledgeBaseTab } from '@/components/features/service/knowledge-base-tab';
import { ModelTab } from '@/components/features/service/model-tab';
import { PromptTab } from '@/components/features/service/prompt-tab';
import { MonitoringTab } from '@/components/features/service/monitoring-tab';
import { useGetService } from '@/hooks/service/services';
import { formatDateTime } from '@/util/date';

export default function ServiceDetailPage() {
  const { id } = useParams();
  const { service } = useGetService(Number(id));
  const navigate = useNavigate();

  return (
    <main>
      <BreadCrumb
        items={[{ label: '서비스', path: '/service' }, { label: '서비스 상세' }]}
        onNavigate={navigate}
        className="breadcrumbBox"
      />
      <div className="page-title-box">
        <h2 className="page-title">서비스 상세</h2>
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <EditServiceButton serviceId={Number(id)} />
            <DeleteServiceButton serviceId={Number(id)} />
          </div>
        </div>
      </div>
      <div className="page-content page-pb-40">
        <h3 className="page-detail-title">상세 정보</h3>
        <div className="page-detail-list-box">
          {/* 최대 ul 3개, li 5개 사용 해주세요. */}
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-name">이름</div>
              <div className="page-detail_item-data">{service?.name}</div>
            </li>
            <li>
              <div className="page-detail_item-name">생성일시</div>
              <div className="page-detail_item-data">{formatDateTime(service?.created_at)}</div>
            </li>
            <li>
              <div className="page-detail_item-name">최근 업데이트</div>
              <div className="page-detail_item-data">{formatDateTime(service?.updated_at)}</div>
            </li>
            <li>
              <div className="page-detail_item-name">태그</div>
              <div className="page-detail_item-data">{service?.tag}</div>
            </li>
            <li>
              <div className="page-detail_item-name">설명</div>
              <div className="page-detail_item-data">{service?.description}</div>
            </li>
          </ul>
        </div>
      </div>
      <div className="page-content page-content-detail">
        <div className="page-tabsBox">
          <Tabs
            labels={['워크플로우', '지식 베이스', '모델', '프롬프트', '모니터링']}
            components={[
              <WorkflowTab />,
              <KnowledgeBaseTab />,
              <ModelTab />,
              <PromptTab />,
              <MonitoringTab />,
            ]}
          />
        </div>
      </div>
    </main>
  );
}
