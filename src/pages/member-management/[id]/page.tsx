import { useGetMember } from '@/hooks/service/member';
import { formatDateTime } from '@/util/date';
import { BreadCrumb, Tabs } from '@innogrid/ui';
import { useNavigate, useParams } from 'react-router';
import { formatPhone } from '@/util/phone';

export default function MemberManagementDetailPage() {
  const { id } = useParams();
  const { member } = useGetMember(id);
  const navigate = useNavigate();

  return (
    <main>
      <BreadCrumb
        items={[{ label: '멤버 관리', path: '/member-management' }, { label: '사용자 상세' }]}
        onNavigate={navigate}
        className="breadcrumbBox"
      />
      <div className="page-title-box">
        <h2 className="page-title">사용자 상세</h2>
        <div className="page-toolBox">
          <div className="page-toolBox-btns"></div>
        </div>
      </div>
      <div className="page-content page-p-40">
        <h3 className="page-detail-title">상세 정보</h3>
        <div className="page-detail-list-box">
          {/* 최대 ul 3개, li 6개 사용 해주세요. */}
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-name">이름</div>
              <div className="page-detail_item-data">{member?.name}</div>
            </li>
            <li>
              <div className="page-detail_item-name">ID</div>
              <div className="page-detail_item-data">{member?.member_id}</div>
            </li>
            <li>
              <div className="page-detail_item-name">상태</div>
              <div className="page-detail_item-data">{member?.is_active}</div>
            </li>
          </ul>
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-name">생성일시</div>
              <div className="page-detail_item-data">{formatDateTime(member?.created_at)}</div>
            </li>
            <li>
              <div className="page-detail_item-name">email</div>
              <div className="page-detail_item-data">{member?.email}</div>
            </li>
            <li>
              <div className="page-detail_item-name">역할</div>
              <div className="page-detail_item-data">{member?.role}</div>
            </li>
          </ul>
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-name">최종 접속 일시</div>
              <div className="page-detail_item-data">{formatDateTime(member?.last_login)}</div>
            </li>
            <li>
              <div className="page-detail_item-name">연락처</div>
              <div className="page-detail_item-data">{formatPhone(member?.phone)}</div>
            </li>
            <li>
              <div className="page-detail_item-name">설명</div>
              <div className="page-detail_item-data">{member?.description}</div>
            </li>
          </ul>
        </div>
      </div>
      <div className="page-content page-content-detail">
        <div className="page-tabsBox">
          <Tabs
            labels={['그룹', '권한']}
            components={[
              <div className="tabs-Content">
                <div>그룹 영역</div>
              </div>,
              <div className="tabs-Content">
                <div>권한 영역</div>
              </div>,
            ]}
          />
        </div>
      </div>
    </main>
  );
}
