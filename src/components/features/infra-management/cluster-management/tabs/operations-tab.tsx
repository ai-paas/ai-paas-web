import { OperationTable } from '@/components/features/infra-management/operation-table';

interface OperationsTabProps {
  clusterName?: string | null;
}

/** 시스템 설정의 작업 이력과 같은 화면이다. 클러스터로 좁히는 것만 다르다. */
export const OperationsTab = ({ clusterName }: OperationsTabProps) => (
  <OperationTable resourceId={clusterName ?? undefined} height={481} />
);
