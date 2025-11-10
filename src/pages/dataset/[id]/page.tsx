import { BreadCrumb } from '@innogrid/ui';
import { IconDocument } from '../../../assets/img/icon';
import { useNavigate, useParams } from 'react-router';
import { EditDatasetButton } from '../../../components/features/dataset/edit-dataset-button';
import { DeleteDatasetButton } from '../../../components/features/dataset/delete-dataset-button';
import { useGetDataset } from '@/hooks/service/datasets';

export default function DatasetDetailPage() {
  const { id } = useParams();
  const { dataset } = useGetDataset(Number(id));
  const navigate = useNavigate();

  return (
    <main>
      <BreadCrumb
        items={[
          { label: '데이터 셋', path: '/dataset' },
          { label: dataset?.name || '데이터 셋 상세' },
        ]}
        onNavigate={navigate}
        className="breadcrumbBox"
      />
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
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-name">이름</div>
              <div className="page-detail_item-data">{dataset?.name || 'N/A'}</div>
            </li>
            <li>
              <div className="page-detail_item-name">생성일시</div>
              <div className="page-detail_item-data">{dataset?.created_at || 'N/A'}</div>
            </li>
            <li>
              <div className="page-detail_item-name">최근 업데이트</div>
              <div className="page-detail_item-data">{dataset?.updated_at || 'N/A'}</div>
            </li>
            <li>
              <div className="page-detail_item-name">생성자</div>
              <div className="page-detail_item-data">{dataset?.created_by || 'N/A'}</div>
            </li>
          </ul>
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-name">버전 정보</div>
              <div className="page-detail_item-data">
                {`${dataset?.version}${dataset?.subversion ? `.${dataset?.subversion}` : ''}` ||
                  'N/A'}
              </div>
            </li>
            <li>
              <div className="page-detail_item-name">파일</div>
              <div className="page-detail_item-data">
                {dataset?.dataset_registry.artifact_path || 'N/A'}{' '}
                <IconDocument className="page-icon-document" />
              </div>
            </li>
            <li>
              <div className="page-detail_item-name">설명</div>
              <div className="page-detail_item-data">{dataset?.description || 'N/A'}</div>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
