import { useNavigate } from 'react-router';

import { IconMore, IconNode } from '@/assets/img/icon';
import { useGetInfraNodes, useGetInfraStatus } from '@/hooks/service/dashboard';
import type { NodeStatus } from '@/types/dashboard';
import styles from '@/pages/dashboard/dashboard.module.scss';

const nodeStatusClass: Record<NodeStatus, string> = {
  ready: styles.nodeImportant,
  warning: styles.nodeWarning,
  error: styles.nodeError,
  unknown: styles.nodeWarning,
};

// 관리자: 인프라 (노드 + 리소스)
export const InfraSection = () => {
  const navigate = useNavigate();
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
              <button
                type="button"
                className="btn-more"
                onClick={() => navigate('/infra-management/monitoring-dashboard')}
              >
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
              <button
                type="button"
                className="btn-more"
                onClick={() => navigate('/infra-management/monitoring-dashboard')}
              >
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
