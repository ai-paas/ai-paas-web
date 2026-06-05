import { BreadCrumb, Table } from '@innogrid/ui';
import { useQueries } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { IconMore, IconNode } from '../../assets/img/icon';
import {
  useGetDashboardEvents,
  useGetInfraNodes,
  useGetInfraStatus,
} from '../../hooks/service/dashboard';
import { useGetMembers } from '../../hooks/service/member';
import { useGetServices } from '../../hooks/service/services';
import { api } from '../../lib/api';
import { queryKeys } from '../../lib/query-keys';
import type {
  AuditAction,
  AuditLog,
  AuditResourceType,
  NodeStatus,
} from '../../types/dashboard';
import type { Member } from '../../types/member';
import type { MonitoringMetrics, ServiceDetail } from '../../types/service';
import { formatCount } from '../../util/count';
import { formatDateTime } from '../../util/date';
import styles from './dashboard.module.scss';

//breadcrumb
const items = [{ label: '대시보드', path: '/dashboard' }];

export default function DashboardPage() {
  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb items={items} />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">대시보드</h2>
      </div>
      <div className="page-content">
        <div className="page-content-detail-col2">
          <div className="page-detail-round-box page-flex-1 page-mt-0">
            <div className="page-detail-round-name">서비스 현황</div>
            <div className="page-detail-round-data">
              <div className="page-content-detail-row2">
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">
                    서비스
                    <button type="button" className="btn-more">
                      <IconMore />
                      <span>바로가기</span>
                    </button>
                  </div>
                  <div className="page-detail-round-data page-h-110">
                    <div className={styles.stateDataBox}>
                      <div className={styles.stateDataNum}>202</div>
                      <div className={styles.stateDataText}>
                        <div className={styles.stateDataDesc}>
                          <span>사용자1</span>
                          <em>142</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용자2</span>
                          <em>36</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용자3</span>
                          <em>24</em>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">
                    워크플로우
                    <button type="button" className="btn-more">
                      <IconMore />
                      <span>바로가기</span>
                    </button>
                  </div>
                  <div className="page-detail-round-data page-h-110">
                    <div className={styles.stateDataBox}>
                      <div className={styles.stateDataNum}>86</div>
                      <div className={styles.stateDataText}>
                        <div className={styles.stateDataDesc}>
                          <span>사용자1</span>
                          <em>142</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용자2</span>
                          <em>36</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용자3</span>
                          <em>24</em>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">
                    모델
                    <button type="button" className="btn-more">
                      <IconMore />
                      <span>바로가기</span>
                    </button>
                  </div>
                  <div className="page-detail-round-data page-h-110">
                    <div className={styles.stateDataBox}>
                      <div className={styles.stateDataNum}>73</div>
                      <div className={styles.stateDataText}>
                        <div className={styles.stateDataDesc}>
                          <span>사용자1</span>
                          <em>142</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용자2</span>
                          <em>36</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용자3</span>
                          <em>24</em>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">
                    데이터 셋
                    <button type="button" className="btn-more">
                      <IconMore />
                      <span>바로가기</span>
                    </button>
                  </div>
                  <div className="page-detail-round-data page-h-110">
                    <div className={styles.stateDataBox}>
                      <div className={styles.stateDataNum}>58</div>
                      <div className={styles.stateDataText}>
                        <div className={styles.stateDataDesc}>
                          <span>사용자1</span>
                          <em>142</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용자2</span>
                          <em>36</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용자3</span>
                          <em>24</em>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">
                    지식 베이스
                    <button type="button" className="btn-more">
                      <IconMore />
                      <span>바로가기</span>
                    </button>
                  </div>
                  <div className="page-detail-round-data page-h-110">
                    <div className={styles.stateDataBox}>
                      <div className={styles.stateDataNum}>49</div>
                      <div className={styles.stateDataText}>
                        <div className={styles.stateDataDesc}>
                          <span>사용자1</span>
                          <em>142</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용자2</span>
                          <em>36</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용자3</span>
                          <em>24</em>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* 나의 서비스 일때 */}
              <div className="page-content-detail-row2">
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">
                    나의 서비스 001
                    <button type="button" className="btn-more">
                      <IconMore />
                      <span>바로가기</span>
                    </button>
                  </div>
                  <div className="page-detail-round-data page-h-130">
                    <div className={`${styles.stateDataBox} page-content-detail-col2`}>
                      <div className={styles.stateDataText}>
                        <div className={styles.stateDataDesc}>
                          <span>사용자1</span>
                          <em>142</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용자2</span>
                          <em>36</em>
                        </div>
                      </div>
                      <div className={styles.stateDataNoti}>RAG 유형 모델을 사용한 채팅 서비스</div>
                    </div>
                  </div>
                </div>
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">
                    나의 서비스 001
                    <button type="button" className="btn-more">
                      <IconMore />
                      <span>바로가기</span>
                    </button>
                  </div>
                  <div className="page-detail-round-data page-h-130">
                    <div className={`${styles.stateDataBox} page-content-detail-col2`}>
                      <div className={styles.stateDataText}>
                        <div className={styles.stateDataDesc}>
                          <span>사용자1</span>
                          <em>142</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용자2</span>
                          <em>36</em>
                        </div>
                      </div>
                      <div className={styles.stateDataNoti}>RAG 유형 모델을 사용한 채팅 서비스</div>
                    </div>
                  </div>
                </div>
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">
                    나의 서비스 001
                    <button type="button" className="btn-more">
                      <IconMore />
                      <span>바로가기</span>
                    </button>
                  </div>
                  <div className="page-detail-round-data page-h-130">
                    <div className={`${styles.stateDataBox} page-content-detail-col2`}>
                      <div className={styles.stateDataText}>
                        <div className={styles.stateDataDesc}>
                          <span>사용자1</span>
                          <em>142</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용자2</span>
                          <em>36</em>
                        </div>
                      </div>
                      <div className={styles.stateDataNoti}>RAG 유형 모델을 사용한 채팅 서비스</div>
                    </div>
                  </div>
                </div>
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">
                    나의 서비스 001
                    <button type="button" className="btn-more">
                      <IconMore />
                      <span>바로가기</span>
                    </button>
                  </div>
                  <div className="page-detail-round-data page-h-130">
                    <div className={`${styles.stateDataBox} page-content-detail-col2`}>
                      <div className={styles.stateDataText}>
                        <div className={styles.stateDataDesc}>
                          <span>사용자1</span>
                          <em>142</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용자2</span>
                          <em>36</em>
                        </div>
                      </div>
                      <div className={styles.stateDataNoti}>RAG 유형 모델을 사용한 채팅 서비스</div>
                    </div>
                  </div>
                </div>
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">
                    나의 서비스 001
                    <button type="button" className="btn-more">
                      <IconMore />
                      <span>바로가기</span>
                    </button>
                  </div>
                  <div className="page-detail-round-data page-h-130">
                    <div className={`${styles.stateDataBox} page-content-detail-col2`}>
                      <div className={styles.stateDataText}>
                        <div className={styles.stateDataDesc}>
                          <span>워크플로우</span>
                          <em>142</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용 모델</span>
                          <em>36</em>
                        </div>
                      </div>
                      <div className={styles.stateDataNoti}>RAG 유형 모델을 사용한 채팅 서비스</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 인프라 */}
          <InfraSection />

          {/* 서비스 모니터링 */}
          <MonitoringSection />

          <div className="page-content-detail-row2">
            <div className="page-detail-round-box page-flex-1">
              <div className="page-detail-round-name">
                사용자
                <button type="button" className="btn-more">
                  <IconMore />
                  <span>바로가기</span>
                </button>
              </div>
              <div className="page-detail-round-data page-h-288">
                <UserTable />
              </div>
            </div>
            <div className="page-detail-round-box page-flex-1">
              <div className="page-detail-round-name">
                이벤트
                <button type="button" className="btn-more">
                  <IconMore />
                  <span>바로가기</span>
                </button>
              </div>
              <div className="page-detail-round-data page-h-288">
                <EventTable />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ────────────────────────────────────────────────────────────
// 인프라 (노드 + 리소스)
// ────────────────────────────────────────────────────────────

const nodeStatusClass: Record<NodeStatus, string> = {
  ready: styles.nodeImportant,
  warning: styles.nodeWarning,
  error: styles.nodeError,
  unknown: styles.nodeWarning,
};

const InfraSection = () => {
  const { clusters, hasData } = useGetInfraStatus();
  const clusterName = clusters[0]?.name ?? '';
  const { nodes } = useGetInfraNodes({ cluster: clusterName }, hasData && !!clusterName);

  const statusCount = nodes.reduce(
    (acc, node) => {
      if (node.status === 'ready') acc.ready += 1;
      else if (node.status === 'warning') acc.warning += 1;
      else if (node.status === 'error') acc.error += 1;
      return acc;
    },
    { ready: 0, warning: 0, error: 0 }
  );

  // 노드 리소스 집계
  const resource = nodes.reduce(
    (acc, node) => {
      acc.cpu.total += node.resources.cpu.total;
      acc.cpu.used += node.resources.cpu.used;
      acc.memory.total += node.resources.memory.total;
      acc.memory.used += node.resources.memory.used;
      node.resources.filesystems.forEach((fs) => {
        acc.filesystem.total += fs.total;
        acc.filesystem.used += fs.used;
      });
      node.resources.accelerators
        .filter((a) => a.kind === 'gpu')
        .forEach((gpu) => {
          acc.gpu.total += gpu.total ?? 0;
          acc.gpu.used += gpu.used ?? 0;
        });
      return acc;
    },
    {
      cpu: { total: 0, used: 0 },
      gpu: { total: 0, used: 0 },
      memory: { total: 0, used: 0 },
      filesystem: { total: 0, used: 0 },
    }
  );

  return (
    <div className="page-detail-round-box page-flex-1">
      <div className="page-detail-round-name">인프라</div>
      <div className="page-detail-round-data">
        <div className="page-content-detail-row2">
          {/* 노드 */}
          <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
            <div className="page-detail-round-name">
              노드
              <button type="button" className="btn-more">
                <IconMore />
                <span>바로가기</span>
              </button>
            </div>
            <div className="page-detail-round-data page-h-264">
              <div className={styles.nodeLegendBox}>
                <div className={styles.legend}>
                  <div>
                    <i className={`${styles.legendMark} ${styles.legendMark1}`} />
                    <span>실행</span>
                  </div>
                  <em>{statusCount.ready}</em>
                </div>
                <div className={styles.legend}>
                  <div>
                    <i className={`${styles.legendMark} ${styles.legendMark2}`} />
                    <span>경고</span>
                  </div>
                  <em>{statusCount.warning}</em>
                </div>
                <div className={styles.legend}>
                  <div>
                    <i className={`${styles.legendMark} ${styles.legendMark3}`} />
                    <span>에러</span>
                  </div>
                  <em>{statusCount.error}</em>
                </div>
              </div>
              <div className={styles.nodesBox}>
                {nodes.map((node) => (
                  <div key={node.name} className={`${nodeStatusClass[node.status]} ${styles.node}`}>
                    <IconNode />
                    <span>{node.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* 리소스 */}
          <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
            <div className="page-detail-round-name">
              리소스
              <button type="button" className="btn-more">
                <IconMore />
                <span>바로가기</span>
              </button>
            </div>
            <div className="page-detail-round-data page-h-264">
              <div className={styles.resourceBox}>
                <ResourceBar label="CPU" used={resource.cpu.used} total={resource.cpu.total} />
                <ResourceBar label="GPU" used={resource.gpu.used} total={resource.gpu.total} />
                <ResourceBar
                  label="Memory"
                  used={resource.memory.used}
                  total={resource.memory.total}
                />
                <ResourceBar
                  label="파일 시스템"
                  used={resource.filesystem.used}
                  total={resource.filesystem.total}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ResourceBarProps {
  label: string;
  used: number;
  total: number;
}

const ResourceBar = ({ label, used, total }: ResourceBarProps) => {
  const percent = total > 0 ? Math.min((used / total) * 100, 100) : 0;

  return (
    <div>
      <div className={styles.resourceName}>
        <span>{label}</span>
        <em>
          {used} / {total}
        </em>
      </div>
      <div className={styles.resourceProgress}>
        <div className={styles.resourceProgressActionBar} style={{ width: `${percent}%` }} />
        <div className={styles.resourceProgressBar} />
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// 서비스 모니터링 (서비스 상세 monitoring_data 기반 지표별 Top 5)
// 주: 대시보드 API에 집계 엔드포인트가 없어 서비스 목록 + 상세를 조합.
//     랭킹은 조회된 서비스(상위 MONITORING_SIZE개) 범위 내에서 계산됨.
// ────────────────────────────────────────────────────────────

const MONITORING_SIZE = 5;

const monitoringMetrics: { key: keyof MonitoringMetrics; label: string }[] = [
  { key: 'message_count', label: '총 메시지 수' },
  { key: 'active_users', label: '활성 사용자 수' },
  { key: 'token_usage', label: '토큰 사용량' },
  { key: 'error_count', label: '에러 수' },
];

const MonitoringSection = () => {
  const navigate = useNavigate();
  const { services } = useGetServices({ size: MONITORING_SIZE });

  const detailQueries = useQueries({
    queries: services.map((service) => ({
      queryKey: queryKeys.services.detail(service.surro_service_id),
      queryFn: () => api.get<ServiceDetail>(`services/${service.surro_service_id}`).json(),
      enabled: !!service.surro_service_id,
    })),
  });

  const details = detailQueries
    .map((query) => query.data)
    .filter((detail): detail is ServiceDetail => Boolean(detail));

  const getTop5 = (key: keyof MonitoringMetrics) =>
    details
      .map((detail) => ({
        id: detail.surro_service_id,
        name: detail.name,
        value: detail.monitoring_data?.total_metrics[key] ?? 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

  return (
    <div className="page-detail-round-box page-flex-1">
      <div className="page-detail-round-name">서비스 모니터링</div>
      <div className="page-detail-round-data">
        <div className="page-content-detail-row2">
          {monitoringMetrics.map(({ key, label }) => {
            const top5 = getTop5(key);

            return (
              <div
                key={key}
                className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0"
              >
                <div className="page-detail-round-name">
                  {label} Top 5
                  <button type="button" className="btn-more">
                    <IconMore />
                    <span>바로가기</span>
                  </button>
                </div>
                <div className="page-detail-round-data page-h-177">
                  <div className={styles.msgBox}>
                    {top5.length === 0 ? (
                      <div>
                        <span>데이터 없음</span>
                        <em>-</em>
                      </div>
                    ) : (
                      top5.map((item) => (
                        <div
                          key={item.id}
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/service/${item.id}`)}
                        >
                          <span>{item.name}</span>
                          <em>{formatCount(item.value)}</em>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// 사용자 테이블 (회원 목록)
// ────────────────────────────────────────────────────────────

const USER_SIZE = 5;

const roleLabel: Record<string, string> = {
  admin: '관리자',
  user: '사용자',
};

const userColumns = [
  {
    id: 'name',
    header: '이름',
    accessorFn: (row: Member) => row.name,
    size: 200,
  },
  {
    id: 'role',
    header: '권한',
    accessorFn: (row: Member) => roleLabel[row.role] ?? row.role,
    size: 200,
  },
  {
    id: 'email',
    header: '이메일 주소',
    accessorFn: (row: Member) => row.email,
    size: 200,
  },
  {
    id: 'date',
    header: '생성일시',
    accessorFn: (row: Member) => formatDateTime(row.created_at),
    size: 200,
  },
];

const UserTable = () => {
  const { members, isPending } = useGetMembers({ size: USER_SIZE });

  return (
    <Table
      usePagination={false}
      columns={userColumns}
      data={members}
      isLoading={isPending}
      totalCount={members.length}
    />
  );
};

// ────────────────────────────────────────────────────────────
// 이벤트 테이블 (활동 로그 / audit_logs)
// ────────────────────────────────────────────────────────────

const actionLabel: Record<AuditAction, string> = {
  create: '생성',
  update: '수정',
  delete: '삭제',
  restore: '복원',
  login: '로그인',
  logout: '로그아웃',
  status_change: '상태 변경',
  permission_change: '권한 변경',
};

const actionStateClass: Record<AuditAction, string> = {
  create: 'table-td-state-run',
  update: 'table-td-state-ing',
  delete: 'table-td-state-negative',
  restore: 'table-td-state-run',
  login: 'table-td-state-run',
  logout: 'table-td-state-temp',
  status_change: 'table-td-state-warning',
  permission_change: 'table-td-state-warning',
};

const resourceTypeLabel: Record<AuditResourceType, string> = {
  service: '서비스',
  workflow: '워크플로우',
  model: '모델',
  model_improvement: '모델 개선',
  dataset: '데이터셋',
  experiment: '실험',
  knowledge_base: '지식베이스',
  prompt: '프롬프트',
  member: '사용자',
};

const getEventContent = (event: AuditLog): string => {
  const name = event.metadata?.name;
  if (typeof name === 'string' && name.length > 0) return name;
  const resource = resourceTypeLabel[event.resource_type] ?? event.resource_type;
  return `${resource} ${actionLabel[event.action] ?? event.action}`;
};

const getEventResource = (event: AuditLog): string => {
  const resource = resourceTypeLabel[event.resource_type] ?? event.resource_type;
  return event.resource_id ? `${resource} / ${event.resource_id}` : resource;
};

const eventColumns = [
  {
    id: 'time',
    header: '시간',
    accessorFn: (row: AuditLog) => formatDateTime(row.created_at),
    size: 200,
  },
  {
    id: 'type',
    header: '이벤트 타입',
    accessorFn: (row: AuditLog) => row.action,
    size: 200,
    cell: ({ row }: { row: { original: AuditLog } }) => (
      <span className={`table-td-state ${actionStateClass[row.original.action] ?? ''}`}>
        {actionLabel[row.original.action] ?? row.original.action}
      </span>
    ),
  },
  {
    id: 'content',
    header: '이벤트 내용',
    accessorFn: (row: AuditLog) => getEventContent(row),
    size: 200,
  },
  {
    id: 'resource',
    header: '대상 리소스',
    accessorFn: (row: AuditLog) => getEventResource(row),
    size: 200,
  },
];

const EventTable = () => {
  const { events } = useGetDashboardEvents({ size: 20 });

  return (
    <Table usePagination={false} columns={eventColumns} data={events} totalCount={events.length} />
  );
};
