import { BreadCrumb, Button } from 'innogrid-ui';
import { useNavigate } from 'react-router';
import { EditPromptButton } from '../../../components/features/prompt/edit-prompt-button';
import { DeletePromptButton } from '../../../components/features/prompt/delete-prompt-button';

export default function PromptDetailPage() {
  const navigate = useNavigate();

  return (
    <main>
      <BreadCrumb
        items={[{ label: '프롬프트', path: '/prompt' }, { label: '프롬프트 테스트' }]}
        onNavigate={navigate}
        className="breadcrumbBox"
      />
      <div className="page-title-box">
        <h2 className="page-title">프롬프트 테스트</h2>
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <EditPromptButton />
            <DeletePromptButton />
          </div>
        </div>
      </div>
      <div className="page-content page-pb-40">
        <h3 className="page-detail-title">상세 정보</h3>
        <div className="page-detail-list-box">
          {/* 최대 ul 3개, li 5개 사용 해주세요. */}
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-name">생성일시</div>
              <div className="page-detail_item-data">2025-12-31 10:12</div>
            </li>
            <li>
              <div className="page-detail_item-name">최근 업데이트</div>
              <div className="page-detail_item-data">2025-12-31 10:12</div>
            </li>
            <li>
              <div className="page-detail_item-name">설명</div>
              <div className="page-detail_item-data">
                설명이 들어갑니다. 설명이 들어갑니다. 설명이 들어갑니다.
              </div>
            </li>
            <li>
              <div className="page-detail_item-name">생성자</div>
              <div className="page-detail_item-data">홍길동</div>
            </li>
          </ul>
        </div>
      </div>
      <div className="page-content page-content-detail">
        <div className="page-content-detail-row2">
          <div className="page-detail-round-box page-flex-1">
            <div className="page-detail-round-name">프롬프트</div>
            <div className="page-detail-round-data page-h-430">
              <pre className="page-input_item-code">
                <code>
                  function myFunction(){' '}
                  {
                    // 코드 로직
                  }
                </code>
              </pre>
            </div>
          </div>
          <div className="page-detail-round-box page-w-536">
            <div className="page-detail-round-name">변수</div>
            <div className="page-detail-round-data page-h-430">
              변수가 들어갑니다. 변수가 들어갑니다. 변수가 들어갑니다. 변수가 들어갑니다.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
