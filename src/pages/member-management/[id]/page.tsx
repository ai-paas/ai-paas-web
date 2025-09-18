import { BreadCrumb, Button, Tabs } from "@innogrid/ui";
import { useNavigate } from "react-router";

export default function MemberManagementDetailPage() {
  const navigate = useNavigate();

  return (
    <main>
      <BreadCrumb
        items={[
          { label: "멤버 관리", path: "/member-management" },
          { label: "test" },
        ]}
        onNavigate={navigate}
        className="breadcrumbBox"
      />
      <div className="page-title-box">
        <h2 className="page-title">사용자 상세</h2>
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <Button
              onClick={() => alert("Button clicked!")}
              size="medium"
              color="secondary"
            >
              편집
            </Button>
            <Button
              onClick={() => alert("Button clicked!")}
              size="medium"
              color="negative"
            >
              삭제
            </Button>
          </div>
        </div>
      </div>
      <div className="page-content page-p-40">
        <h3 className="page-detail-title">상세 정보</h3>
        <div className="page-detail-list-box">
          {/* 최대 ul 3개, li 6개 사용 해주세요. */}
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-name">이름</div>
              <div className="page-detail_item-data">테스트 학습</div>
            </li>
            <li>
              <div className="page-detail_item-name">ID</div>
              <div className="page-detail_item-data">sample1</div>
            </li>
            <li>
              <div className="page-detail_item-name">상태</div>
              <div className="page-detail_item-data">사용중</div>
            </li>
          </ul>
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-name">생성일시</div>
              <div className="page-detail_item-data">2025-12-31 10:12</div>
            </li>
            <li>
              <div className="page-detail_item-name">email</div>
              <div className="page-detail_item-data">sample1@gmail.com</div>
            </li>
            <li>
              <div className="page-detail_item-name">역할</div>
              <div className="page-detail_item-data">사용자</div>
            </li>
          </ul>
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-name">최종 접속 일시</div>
              <div className="page-detail_item-data">2025-12-31 10:12</div>
            </li>
            <li>
              <div className="page-detail_item-name">연락처</div>
              <div className="page-detail_item-data">010-0000-0000</div>
            </li>
            <li>
              <div className="page-detail_item-name">설명</div>
              <div className="page-detail_item-data">
                설명이 들어갑니다.설명이 들어갑니다.설명이 들어갑니다.
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div className="page-content page-content-detail">
        <div className="page-tabsBox">
          <Tabs
            labels={["그룹", "권한"]}
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
