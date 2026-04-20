import { useGetModel } from '@/hooks/service/models';
import { formatDateTime } from '@/util/date';
import {
  BreadCrumb,
  Button,
  Table,
  Tabs,
  useTablePagination,
  useTableSelection,
  type Sorting,
} from '@innogrid/ui';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

const columns = [
  {
    id: 'name',
    header: '이름',
    accessorFn: (row) => row.name,
    size: 425,
  },
  {
    id: 'id',
    header: '파일 크기',
    accessorFn: (row) => row.id,
    size: 425,
  },
  {
    id: 'state',
    header: '업데이트 일시',
    accessorFn: (row) => row.state,
    size: 425,
  },
  {
    id: 'desc',
    header: '다운로드',
    accessorFn: (row) => row.desc,
    size: 434,
    cell: ({ row }) => <Button color="tertiary">버튼</Button>,
  },
];

export default function ModelCatalogDetailPage() {
  const { id } = useParams();
  const { model } = useGetModel(Number(id));
  const navigate = useNavigate();

  const { setRowSelection, rowSelection } = useTableSelection();
  const { pagination, setPagination } = useTablePagination();
  const [sorting, setSorting] = useState<Sorting>([{ id: 'name', desc: false }]);

  const [rowData, setRowData] = useState([
    {
      name: 'Model-00001-of-D0004. safetensors',
      id: '워크플로우 001',
      state: '4.43GB',
      desc: '2025-12-31 10:12',
    },
  ]);

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb
          items={[
            { label: '모델' },
            { label: '모델 카탈로그', path: '/model/model-catalog' },
            { label: model?.name ?? '' },
          ]}
          onNavigate={navigate}
        />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">모델 상세</h2>
      </div>
      <div className="page-content page-p-40">
        <h3 className="page-detail-title">상세 정보</h3>
        <ul style={{ marginBottom: '20px' }}>
          <li className="space-y-2 rounded-md bg-[#F2F2F2] px-5 pt-3.5 pb-4">
            <div className="page-detail_item-name">모델 소개</div>
            <div className="page-detail_item-data">{model?.description ?? ''}</div>
          </li>
        </ul>
        <div className="page-detail-list-box">
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-name">이름</div>
              <div className="page-detail_item-data">{model?.name ?? '-'}</div>
            </li>
            <li>
              <div className="page-detail_item-name">생성자</div>
              <div className="page-detail_item-data">{model?.created_by ?? '-'}</div>
            </li>
            <li>
              <div className="page-detail_item-name">task</div>
              <div className="page-detail_item-data">{model?.task ?? '-'}</div>
            </li>
          </ul>
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-name">생성일시</div>
              <div className="page-detail_item-data">{formatDateTime(model?.created_at)}</div>
            </li>
            <li>
              <div className="page-detail_item-name">모델 ID</div>
              <div className="page-detail_item-data">{model?.registry.uri ?? '-'}</div>
            </li>
            <li>
              <div className="page-detail_item-name">Params</div>
              <div className="page-detail_item-data">{model?.parameter ?? '-'}</div>
            </li>
          </ul>
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-name">최근 업데이트</div>
              <div className="page-detail_item-data">{formatDateTime(model?.updated_at)}</div>
            </li>
            <li>
              <div className="page-detail_item-name">버전 정보</div>
              <div className="page-detail_item-data">v1</div>
            </li>
          </ul>
        </div>
      </div>
      <div className="page-content page-content-detail">
        <div className="page-tabsBox">
          <Tabs
            labels={['파일', '샘플 코드']}
            components={[
              <div className="tabs-Content">
                <div>
                  <Table
                    useClientPagination
                    useMultiSelect
                    columns={columns}
                    data={rowData}
                    totalCount={rowData.length}
                    pagination={pagination}
                    setPagination={setPagination}
                    rowSelection={rowSelection}
                    setRowSelection={setRowSelection}
                    setSorting={setSorting}
                    sorting={sorting}
                  />
                </div>
              </div>,
              <div className="tabs-Content">
                <div className="rounded-md border border-[#DEDEDE] px-6 py-5">
                  import torch from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor,
                  pipeline from datasets import load_dataset device = "cuda:0" if
                  torch.cuda.is_available() else "cpu" torch_dtype = torch.float16 if
                  torch.cuda.is_available() else torch.float32 model_id = "openai/whisper-large-v3"
                  model = AutoModelForSpeechSeq2Seq.from_pretrained( model_id,
                  torch_dtype=torch_dtype, low_cpu_mem_usage=True, use_safetensors=True )
                  model.to(device) processor = AutoProcessor.from_pretrained(model_id) pipe =
                  pipeline "automatic-speech-recognition",
                </div>
              </div>,
            ]}
          />
        </div>
      </div>
    </main>
  );
}
