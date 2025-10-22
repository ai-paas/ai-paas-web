import { Button } from '@innogrid/ui';

export type ResourceType =
  | 'cluster'
  | 'namespace'
  | 'deployment'
  | 'replicaset'
  | 'pod'
  | 'service'
  | 'daemonset'
  | 'gpu-scheduling'
  | 'service-account'
  | 'config-map'
  | 'secret';

interface ResourceActionButtonsProps {
  resourceType: ResourceType;
  clusterName?: string | null;
  resourceName?: string;
  onSuccess?: () => void;
  // 버튼 표시 여부를 제어하는 props
  showCreate?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  // 선택된 행 (체크박스 선택 상태)
  rowSelection?: Record<string, boolean>;
}

// 리소스 타입별 한글 이름 매핑
const resourceTypeNames: Record<ResourceType, string> = {
  cluster: '클러스터',
  namespace: '네임스페이스',
  deployment: '디플로이먼트',
  replicaset: '레플리카셋',
  pod: '파드',
  service: '서비스',
  daemonset: '데몬셋',
  'gpu-scheduling': 'GPU 스케줄링',
  'service-account': '서비스 어카운트',
  'config-map': '컨피그맵',
  secret: '시크릿',
};

export const ResourceActionButtons = ({
  resourceType,
  clusterName,
  resourceName,
  onSuccess,
  showCreate = true,
  showEdit = true,
  showDelete = true,
  rowSelection = {},
}: ResourceActionButtonsProps) => {
  const resourceTypeName = resourceTypeNames[resourceType];
  const selectedCount = Object.keys(rowSelection).length;

  const handleCreate = () => {
    // TODO: 실제 생성 로직 구현
    console.log(`${resourceTypeName} 생성`, { clusterName });
    onSuccess?.();
  };

  const handleEdit = () => {
    // TODO: 실제 편집 로직 구현
    console.log(`${resourceTypeName} 편집`, { resourceName, clusterName });
    onSuccess?.();
  };

  const handleDelete = () => {
    // TODO: 실제 삭제 로직 구현
    console.log(`${resourceTypeName} 삭제`, { resourceName, clusterName });
    onSuccess?.();
  };

  // 정확히 1개 선택되었을 때만 활성화
  const isEnabled = selectedCount === 1;

  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
      {showCreate && (
        <Button size="medium" color="primary" onClick={handleCreate}>
          생성
        </Button>
      )}
      {showEdit && (
        <Button size="medium" color="secondary" onClick={handleEdit} disabled={!isEnabled}>
          편집
        </Button>
      )}
      {showDelete && (
        <Button size="medium" color="negative" onClick={handleDelete} disabled={!isEnabled}>
          삭제
        </Button>
      )}
    </div>
  );
};
