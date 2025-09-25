import { BreadCrumb, Button } from '@innogrid/ui';

import { IconDocument } from '../../../assets/img/icon';
import { useNavigate } from 'react-router';
import { EditDatasetButton } from '../../../components/features/dataset/edit-dataset-button';
import { DeleteDatasetButton } from '../../../components/features/dataset/delete-dataset-button';

//breadcrumb
const items = [{ label: '데이터 셋', path: '/dataset' }, { label: '데이터 셋 상세' }];

export default function DatasetDetailPage() {
  const navigate = useNavigate();

  return (
    <main>
      <BreadCrumb items={items} onNavigate={navigate} className="breadcrumbBox" />
      <div className="page-title-box">
        <h2 className="page-title">데이터 셋 상세</h2>
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <EditDatasetButton />
            <DeleteDatasetButton />
          </div>
        </div>
      </div>
      <div className="page-content page-pb-40">
        <h3 className="page-detail-title">상세 정보</h3>
        <div className="page-detail-list-box">
          {/* 최대 ul 3개, li 5개 사용 해주세요. */}
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-name">이름</div>
              <div className="page-detail_item-data">Meta-Liama-3-8B</div>
            </li>
            <li>
              <div className="page-detail_item-name">생성일시</div>
              <div className="page-detail_item-data">2025-12-31 10:12</div>
            </li>
            <li>
              <div className="page-detail_item-name">최근 업데이트</div>
              <div className="page-detail_item-data">2025-12-31 10:12</div>
            </li>
            <li>
              <div className="page-detail_item-name">생성자</div>
              <div className="page-detail_item-data">Meta-Liama</div>
            </li>
            <li>
              <div className="page-detail_item-name">유형</div>
              <div className="page-detail_item-data">PNG</div>
            </li>
          </ul>
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-name">버전 정보</div>
              <div className="page-detail_item-data">v1.0</div>
            </li>
            <li>
              <div className="page-detail_item-name">학습 파일</div>
              <div className="page-detail_item-data">
                file.txt <IconDocument className="page-icon-document" />
              </div>
            </li>
            <li>
              <div className="page-detail_item-name">평가 파일</div>
              <div className="page-detail_item-data">
                file.txt <IconDocument className="page-icon-document" />
              </div>
            </li>
            <li>
              <div className="page-detail_item-name">설명</div>
              <div className="page-detail_item-data">설명이 들어갑니다. 설명이 들어갑니다.</div>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
