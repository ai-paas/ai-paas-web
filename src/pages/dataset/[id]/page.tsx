import { BreadCrumb } from '@innogrid/ui';
import { IconDocument } from '../../../assets/img/icon';
import { useNavigate, useParams } from 'react-router';
import { EditDatasetButton } from '../../../components/features/dataset/edit-dataset-button';
import { DeleteDatasetButton } from '../../../components/features/dataset/delete-dataset-button';
import { useGetDataset } from '@/hooks/service/datasets';
import { DetailValue } from '@/components/ui/detail-value';

export default function DatasetDetailPage() {
  const { id } = useParams();
  const { dataset, isPending } = useGetDataset(Number(id));
  const navigate = useNavigate();

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb
          items={[{ label: '데이터 셋', path: '/dataset' }, { label: dataset?.name ?? '' }]}
          onNavigate={navigate}
        />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">데이터 셋 상세</h2>
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <EditDatasetButton datasetId={Number(id)} />
            <DeleteDatasetButton datasetId={Number(id)} redirect="/dataset" />
          </div>
        </div>
      </div>
      <div className="page-content page-pb-40">
        <h3 className="page-detail-title">상세 정보</h3>
        <div className="page-detail-list-box">
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-name">이름</div>
              <div className="page-detail_item-data">
                <DetailValue isLoading={isPending} width={160}>
                  {dataset?.name || 'N/A'}
                </DetailValue>
              </div>
            </li>
            <li>
              <div className="page-detail_item-name">생성일시</div>
              <div className="page-detail_item-data">
                <DetailValue isLoading={isPending} width={140}>
                  {dataset?.created_at || 'N/A'}
                </DetailValue>
              </div>
            </li>
            <li>
              <div className="page-detail_item-name">최근 업데이트</div>
              <div className="page-detail_item-data">
                <DetailValue isLoading={isPending} width={140}>
                  {dataset?.updated_at || 'N/A'}
                </DetailValue>
              </div>
            </li>
            <li>
              <div className="page-detail_item-name">생성자</div>
              <div className="page-detail_item-data">
                <DetailValue isLoading={isPending} width={120}>
                  {dataset?.created_by || 'N/A'}
                </DetailValue>
              </div>
            </li>
          </ul>
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-name">버전 정보</div>
              <div className="page-detail_item-data">
                <DetailValue isLoading={isPending} width={100}>
                  {dataset?.version
                    ? `${dataset.version}${dataset.subversion ? `.${dataset.subversion}` : ''}`
                    : 'N/A'}
                </DetailValue>
              </div>
            </li>
            <li>
              <div className="page-detail_item-name">파일</div>
              <div className="page-detail_item-data">
                <DetailValue isLoading={isPending} width={200}>
                  {dataset?.dataset_registry.artifact_path || 'N/A'}{' '}
                  <span className="page-icon-document"><IconDocument /></span>
                </DetailValue>
              </div>
            </li>
            <li>
              <div className="page-detail_item-name">설명</div>
              <div className="page-detail_item-data">
                <DetailValue isLoading={isPending} width={240}>
                  {dataset?.description || 'N/A'}
                </DetailValue>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
