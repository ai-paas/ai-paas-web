import { useNavigate } from 'react-router';

import { IconMore } from '@/assets/img/icon';
import { useGetDashboardSummary, useGetDashboardTopUsers } from '@/hooks/service/dashboard';
import styles from '@/pages/dashboard/dashboard.module.scss';

// 관리자: 전체 자산 카운트 + 도메인별 보유 상위 사용자
export const AssetSummarySection = () => {
  const navigate = useNavigate();

  const { summary } = useGetDashboardSummary();
  const serviceUsers = useGetDashboardTopUsers({ domain: 'service', size: 3 });
  const workflowUsers = useGetDashboardTopUsers({ domain: 'workflow', size: 3 });
  const modelUsers = useGetDashboardTopUsers({ domain: 'model', size: 3 });
  const datasetUsers = useGetDashboardTopUsers({ domain: 'dataset', size: 3 });
  const knowledgeBaseUsers = useGetDashboardTopUsers({ domain: 'knowledge_base', size: 3 });

  return (
    <div className="page-content-detail-row2">
      <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
        <div className="page-detail-round-name">
          서비스
          <button type="button" className="btn-more" onClick={() => navigate('/service')}>
            <IconMore />
            <span>바로가기</span>
          </button>
        </div>
        <div className="page-detail-round-data page-h-110">
          <div className={styles.stateDataBox}>
            <div className={styles.stateDataNum}>{summary?.services.total ?? 0}</div>
            <div className={`${styles.stateDataText} ${styles.stateDataTextCenter}`}>
              {serviceUsers.items.length === 0 ? (
                <div className={styles.stateDataEmpty}>사용자 없음</div>
              ) : (
                serviceUsers.items.map((user) => (
                  <div key={user.member_id} className={styles.stateDataDesc}>
                    <span>{user.name ?? user.member_id}</span>
                    <em>{user.count}</em>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
        <div className="page-detail-round-name">
          워크플로우
          <button type="button" className="btn-more" onClick={() => navigate('/workflow/workflow')}>
            <IconMore />
            <span>바로가기</span>
          </button>
        </div>
        <div className="page-detail-round-data page-h-110">
          <div className={styles.stateDataBox}>
            <div className={styles.stateDataNum}>{summary?.workflows.total ?? 0}</div>
            <div className={`${styles.stateDataText} ${styles.stateDataTextCenter}`}>
              {workflowUsers.items.length === 0 ? (
                <div className={styles.stateDataEmpty}>사용자 없음</div>
              ) : (
                workflowUsers.items.map((user) => (
                  <div key={user.member_id} className={styles.stateDataDesc}>
                    <span>{user.name ?? user.member_id}</span>
                    <em>{user.count}</em>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
        <div className="page-detail-round-name">
          모델
          <button type="button" className="btn-more" onClick={() => navigate('/model/model-catalog')}>
            <IconMore />
            <span>바로가기</span>
          </button>
        </div>
        <div className="page-detail-round-data page-h-110">
          <div className={styles.stateDataBox}>
            <div className={styles.stateDataNum}>{summary?.models.total ?? 0}</div>
            <div className={`${styles.stateDataText} ${styles.stateDataTextCenter}`}>
              {modelUsers.items.length === 0 ? (
                <div className={styles.stateDataEmpty}>사용자 없음</div>
              ) : (
                modelUsers.items.map((user) => (
                  <div key={user.member_id} className={styles.stateDataDesc}>
                    <span>{user.name ?? user.member_id}</span>
                    <em>{user.count}</em>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
        <div className="page-detail-round-name">
          데이터 셋
          <button type="button" className="btn-more" onClick={() => navigate('/dataset')}>
            <IconMore />
            <span>바로가기</span>
          </button>
        </div>
        <div className="page-detail-round-data page-h-110">
          <div className={styles.stateDataBox}>
            <div className={styles.stateDataNum}>{summary?.datasets.total ?? 0}</div>
            <div className={`${styles.stateDataText} ${styles.stateDataTextCenter}`}>
              {datasetUsers.items.length === 0 ? (
                <div className={styles.stateDataEmpty}>사용자 없음</div>
              ) : (
                datasetUsers.items.map((user) => (
                  <div key={user.member_id} className={styles.stateDataDesc}>
                    <span>{user.name ?? user.member_id}</span>
                    <em>{user.count}</em>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
        <div className="page-detail-round-name">
          지식 베이스
          <button type="button" className="btn-more" onClick={() => navigate('/knowledge-base')}>
            <IconMore />
            <span>바로가기</span>
          </button>
        </div>
        <div className="page-detail-round-data page-h-110">
          <div className={styles.stateDataBox}>
            <div className={styles.stateDataNum}>{summary?.knowledge_bases.total ?? 0}</div>
            <div className={`${styles.stateDataText} ${styles.stateDataTextCenter}`}>
              {knowledgeBaseUsers.items.length === 0 ? (
                <div className={styles.stateDataEmpty}>사용자 없음</div>
              ) : (
                knowledgeBaseUsers.items.map((user) => (
                  <div key={user.member_id} className={styles.stateDataDesc}>
                    <span>{user.name ?? user.member_id}</span>
                    <em>{user.count}</em>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
