import { useGetMember } from '@/hooks/service/member';
import { formatDateTime } from '@/util/date';
import { BreadCrumb, Tabs } from '@innogrid/ui';
import { useNavigate, useParams } from 'react-router';
import { formatPhone } from '@/util/phone';
import { DetailValue } from '@/components/ui/detail-value';

export default function MemberManagementDetailPage() {
  const { id } = useParams();
  const { member, isPending } = useGetMember(id);
  const navigate = useNavigate();

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb
          items={[{ label: '멤버 관리', path: '/member-management' }, { label: '사용자 상세' }]}
          onNavigate={navigate}
        />
      </div>
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
              <div className="page-detail_item-data">
                <DetailValue isLoading={isPending} width={160}>
                  {member?.name}
                </DetailValue>
              </div>
            </li>
            <li>
              <div className="page-detail_item-name">ID</div>
              <div className="page-detail_item-data">
                <DetailValue isLoading={isPending} width={120}>
                  {member?.member_id}
                </DetailValue>
              </div>
            </li>
            <li>
              <div className="page-detail_item-name">상태</div>
              <div className="page-detail_item-data">
                <DetailValue isLoading={isPending} width={100}>
                  {member?.is_active}
                </DetailValue>
              </div>
            </li>
          </ul>
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-name">생성일시</div>
              <div className="page-detail_item-data">
                <DetailValue isLoading={isPending} width={140}>
                  {formatDateTime(member?.created_at)}
                </DetailValue>
              </div>
            </li>
            <li>
              <div className="page-detail_item-name">email</div>
              <div className="page-detail_item-data">
                <DetailValue isLoading={isPending} width={200}>
                  {member?.email}
                </DetailValue>
              </div>
            </li>
            <li>
              <div className="page-detail_item-name">역할</div>
              <div className="page-detail_item-data">
                <DetailValue isLoading={isPending} width={100}>
                  {member?.role}
                </DetailValue>
              </div>
            </li>
          </ul>
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-name">최종 접속 일시</div>
              <div className="page-detail_item-data">
                <DetailValue isLoading={isPending} width={140}>
                  {formatDateTime(member?.last_login)}
                </DetailValue>
              </div>
            </li>
            <li>
              <div className="page-detail_item-name">연락처</div>
              <div className="page-detail_item-data">
                <DetailValue isLoading={isPending} width={140}>
                  {formatPhone(member?.phone)}
                </DetailValue>
              </div>
            </li>
            <li>
              <div className="page-detail_item-name">설명</div>
              <div className="page-detail_item-data">
                <DetailValue isLoading={isPending} width={240}>
                  {member?.description}
                </DetailValue>
              </div>
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
