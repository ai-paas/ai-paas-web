import { BreadCrumb } from '@innogrid/ui';
import { useNavigate } from 'react-router';

import { IconMore } from '../../assets/img/icon';
import { AssetSummarySection } from '../../components/features/dashboard/asset-summary-section';
import { EventTable, MyActivityTable } from '../../components/features/dashboard/activity-table';
import { InfraSection } from '../../components/features/dashboard/infra-section';
import { MonitoringSection } from '../../components/features/dashboard/monitoring-section';
import { MyServiceCards } from '../../components/features/dashboard/my-service-cards';
import { UserTable } from '../../components/features/dashboard/user-table';
import { useAuth } from '../../hooks/useAuth';

//breadcrumb
const items = [{ label: '대시보드', path: '/dashboard' }];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

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
              {/* 관리자: 전체 자산 카운트 */}
              {isAdmin && <AssetSummarySection />}
              {/* 사용자: 나의 서비스 */}
              {!isAdmin && <MyServiceCards />}
            </div>
          </div>

          {/* 관리자: 인프라 */}
          {isAdmin && <InfraSection />}

          {/* 사용자: 서비스 모니터링 */}
          {!isAdmin && <MonitoringSection />}

          <div className="page-content-detail-row2">
            <div className="page-detail-round-box page-flex-1">
              <div className="page-detail-round-name">
                사용자
                <button
                  type="button"
                  className="btn-more"
                  onClick={() => navigate('/member-management')}
                >
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
                <button
                  type="button"
                  className="btn-more"
                  onClick={() => navigate('/infra-management/event')}
                >
                  <IconMore />
                  <span>바로가기</span>
                </button>
              </div>
              <div className="page-detail-round-data page-h-288">
                {isAdmin ? <EventTable /> : <MyActivityTable />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
