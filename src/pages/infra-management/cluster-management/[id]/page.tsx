import { useNavigate, useParams } from 'react-router';
import { BreadCrumb, Tabs } from '@innogrid/ui';
import { EditClusterButton } from '@/components/features/infra-managememt/cluster-management/edit-cluster-button';
import { DeleteClusterButton } from '@/components/features/infra-managememt/cluster-management/delete-cluster-button';
import { useGetCluster } from '@/hooks/service/clusters';
import { formatDateTime } from '@/util/date';

// 쿠버네티스 리소스 탭 컴포넌트들
import { NodesTab } from '@/components/features/infra-managememt/cluster-management/tabs/nodes-tab';
import { NamespacesTab } from '@/components/features/infra-managememt/cluster-management/tabs/namespaces-tab';
import { DeploymentsTab } from '@/components/features/infra-managememt/cluster-management/tabs/deployments-tab';
import { ReplicaSetsTab } from '@/components/features/infra-managememt/cluster-management/tabs/replica-sets-tab';
import { PodsTab } from '@/components/features/infra-managememt/cluster-management/tabs/pods-tab';
import { ServicesTab } from '@/components/features/infra-managememt/cluster-management/tabs/services-tab';
import { DaemonSetsTab } from '@/components/features/infra-managememt/cluster-management/tabs/daemon-sets-tab';
import { GpuSchedulingTab } from '@/components/features/infra-managememt/cluster-management/tabs/gpu-scheduling-tab';
import { ServiceAccountsTab } from '@/components/features/infra-managememt/cluster-management/tabs/service-accounts-tab';
import { ConfigMapsTab } from '@/components/features/infra-managememt/cluster-management/tabs/config-maps-tab';
import { SecretsTab } from '@/components/features/infra-managememt/cluster-management/tabs/secrets-tab';

export default function ClusterDetailPage() {
  const { id } = useParams();
  const { cluster } = useGetCluster(id);
  const navigate = useNavigate();

  return (
    <main>
      <BreadCrumb
        items={[
          { label: '인프라 관리' },
          { label: '클러스터 관리', path: '/infra-management/cluster-management' },
          { label: '클러스터 상세' },
        ]}
        onNavigate={navigate}
        className="breadcrumbBox"
      />
      <div className="page-title-box">
        <h2 className="page-title">클러스터 상세</h2>
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <EditClusterButton
              clusterId={id}
              returnTo={`/infra-management/cluster-management/${id}`}
            />
            <DeleteClusterButton clusterId={id} />
          </div>
        </div>
      </div>
      <div className="page-content page-pb-40">
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* 왼쪽: 클러스터 기본 정보 */}
          <div style={{ flex: 1 }}>
            <h3 className="page-detail-title">상세 정보</h3>
            <div className="page-detail-list-box">
              <ul className="page-detail-list">
                <li>
                  <div className="page-detail_item-name">이름</div>
                  <div className="page-detail_item-data">{cluster?.id}</div>
                </li>
                <li>
                  <div className="page-detail_item-name">생성일시</div>
                  <div className="page-detail_item-data">{formatDateTime(cluster?.createdAt)}</div>
                </li>
                <li>
                  <div className="page-detail_item-name">연동 상태</div>
                  <div className="page-detail_item-data">
                    <span
                      className={`table-td-state table-td-state-${cluster?.monitServerUrl ? 'run' : 'negative'}`}
                    >
                      {cluster?.monitServerUrl ? '연결됨' : '연결 안됨'}
                    </span>
                  </div>
                </li>
                <li>
                  <div className="page-detail_item-name">유형</div>
                  <div className="page-detail_item-data">{cluster?.clusterType || 'Kubernetes'}</div>
                </li>
                <li>
                  <div className="page-detail_item-name">프로바이더</div>
                  <div className="page-detail_item-data">{cluster?.clusterProvider || 'On-Premise'}</div>
                </li>
              </ul>
            </div>
          </div>

          {/* 오른쪽: 쿠버네티스 정보 */}
          <div style={{ flex: 1 }}>
            <h3 className="page-detail-title">쿠버네티스 정보</h3>
            <div className="page-detail-list-box">
              <ul className="page-detail-list">
                <li>
                  <div className="page-detail_item-name">버전</div>
                  <div className="page-detail_item-data">{cluster?.version}</div>
                </li>
                <li>
                  <div className="page-detail_item-name">API 서버 URL</div>
                  <div className="page-detail_item-data">{cluster?.apiServerUrl}</div>
                </li>
                <li>
                  <div className="page-detail_item-name">API 서버 IP</div>
                  <div className="page-detail_item-data">{cluster?.apiServerIp}</div>
                </li>
                <li>
                  <div className="page-detail_item-name">모니터링 서버 URL</div>
                  <div className="page-detail_item-data">{cluster?.monitServerUrl || '-'}</div>
                </li>
                <li>
                  <div className="page-detail_item-name">설명</div>
                  <div className="page-detail_item-data">{cluster?.description}</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="page-content page-content-detail">
        <div className="page-tabsBox">
          <Tabs
            labels={[
              '노드',
              '네임스페이스',
              '디플로이먼트',
              '레플리카셋',
              '파드',
              '서비스',
              '데몬셋',
              'GPU 스케줄링',
              '서비스 어카운트',
              '콘픽맵',
              '시크릿',
            ]}
            components={[
              <NodesTab key="nodes" clusterName={cluster?.id} />,
              <NamespacesTab key="namespaces" clusterName={cluster?.id} />,
              <DeploymentsTab key="deployments" clusterName={cluster?.id} />,
              <ReplicaSetsTab key="replicasets" clusterName={cluster?.id} />,
              <PodsTab key="pods" clusterName={cluster?.id} />,
              <ServicesTab key="services" clusterName={cluster?.id} />,
              <DaemonSetsTab key="daemonsets" clusterName={cluster?.id} />,
              <GpuSchedulingTab key="gpu-scheduling" clusterName={cluster?.id} />,
              <ServiceAccountsTab key="service-accounts" clusterName={cluster?.id} />,
              <ConfigMapsTab key="config-maps" clusterName={cluster?.id} />,
              <SecretsTab key="secrets" clusterName={cluster?.id} />,
            ]}
          />
        </div>
      </div>
    </main>
  );
}
