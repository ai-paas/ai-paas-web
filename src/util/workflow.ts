import type { WorkflowStatus } from '@/types/workflow';

export const workflowStatusMap: Record<WorkflowStatus, { label: string; className: string }> = {
  DRAFT: { label: '임시저장', className: 'table-td-state-temp' },
  ACTIVE: { label: '정상', className: 'table-td-state-run' },
  ERROR: { label: '오류', className: 'table-td-state-negative' },
};

export const getWorkflowStatus = (status: string) =>
  workflowStatusMap[status as WorkflowStatus] ?? {
    label: status,
    className: 'table-td-state-temp',
  };

export const workflowModelStatusMap: Record<string, { label: string; className: string }> = {
  PENDING: { label: '대기중', className: 'table-td-state-ing' },
  DEPLOYING: { label: '배포중', className: 'table-td-state-ing' },
  DEPLOYED: { label: '배포완료', className: 'table-td-state-run' },
  FAILED: { label: '실패', className: 'table-td-state-negative' },
  DELETED: { label: '삭제됨', className: 'table-td-state-temp' },
};

export const getWorkflowModelStatus = (status: string) =>
  workflowModelStatusMap[status] ?? {
    label: status,
    className: 'table-td-state-temp',
  };
