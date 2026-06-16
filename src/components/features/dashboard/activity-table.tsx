import { Table } from '@innogrid/ui';

import { useGetDashboardEvents, useGetMeDashboardActivities } from '@/hooks/service/dashboard';
import type { AuditAction, AuditResourceType, MeActivity } from '@/types/dashboard';
import { formatDateTime } from '@/util/date';

// ────────────────────────────────────────────────────────────
// 이벤트 / 작업 이력 테이블 (audit_logs)
// EventTable: 관리자 전체 이벤트, MyActivityTable: 본인 작업 이력
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

const getEventContent = (event: MeActivity): string => {
  const name = event.metadata?.name;
  if (typeof name === 'string' && name.length > 0) return name;
  const resource = resourceTypeLabel[event.resource_type] ?? event.resource_type;
  return `${resource} ${actionLabel[event.action] ?? event.action}`;
};

const getEventResource = (event: MeActivity): string => {
  const resource = resourceTypeLabel[event.resource_type] ?? event.resource_type;
  return event.resource_id ? `${resource} / ${event.resource_id}` : resource;
};

const eventColumns = [
  {
    id: 'time',
    header: '시간',
    accessorFn: (row: MeActivity) => formatDateTime(row.created_at),
    size: 200,
  },
  {
    id: 'type',
    header: '이벤트 타입',
    accessorFn: (row: MeActivity) => row.action,
    size: 200,
    cell: ({ row }: { row: { original: MeActivity } }) => (
      <span className={`table-td-state ${actionStateClass[row.original.action] ?? ''}`}>
        {actionLabel[row.original.action] ?? row.original.action}
      </span>
    ),
  },
  {
    id: 'content',
    header: '이벤트 내용',
    accessorFn: (row: MeActivity) => getEventContent(row),
    size: 200,
  },
  {
    id: 'resource',
    header: '대상 리소스',
    accessorFn: (row: MeActivity) => getEventResource(row),
    size: 200,
  },
];

// 관리자: 전체 활동 로그 (/admin/dashboard/events)
export const EventTable = () => {
  const { events, isPending } = useGetDashboardEvents({ size: 20 });

  return (
    <Table
      usePagination={false}
      columns={eventColumns}
      data={events}
      isLoading={isPending}
      totalCount={events.length}
    />
  );
};

// 사용자: 본인 작업 이력 (/me/dashboard/activities)
export const MyActivityTable = () => {
  const { activities, isPending } = useGetMeDashboardActivities({ size: 20 });

  return (
    <Table
      usePagination={false}
      columns={eventColumns}
      data={activities}
      isLoading={isPending}
      totalCount={activities.length}
    />
  );
};
