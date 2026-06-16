import {
  BreadCrumb,
  CellCheckbox,
  HeaderCheckbox,
  Table,
  Tabs,
  useTablePagination,
  useTableSelection,
  type ColDef,
  type Sorting,
  type TableRow,
} from '@innogrid/ui';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { CreateKnowledgeBaseFileButton } from '../../../components/features/knowledge-base/create-knowledge-base-file-button';
import { DeleteKnowledgeBaseButton } from '../../../components/features/knowledge-base/delete-knowledge-base-button';
import { DeleteKnowledgeBaseFileButton } from '../../../components/features/knowledge-base/delete-knowledge-base-file-button';
import { EditKnowledgeBaseButton } from '../../../components/features/knowledge-base/edit-knowledge-base-button';
import { RetrievalTestTab } from '../../../components/features/knowledge-base/retrieval-test/retrieval-test-tab';
import { useGetKnowledgeBase } from '@/hooks/service/knowledgebase';
import { formatDateTime } from '@/util/date';
import type { KnowledgeBaseFile } from '@/types/knowledgebase';

const columns: ColDef<KnowledgeBaseFile>[] = [
  {
    id: 'select',
    size: 30,
    header: ({
      table,
    }: {
      table: Parameters<typeof HeaderCheckbox<KnowledgeBaseFile>>[0]['table'];
    }) => <HeaderCheckbox table={table} />,
    cell: ({ row }: { row: TableRow<KnowledgeBaseFile> }) => <CellCheckbox row={row} />,
    enableSorting: false,
  },
  {
    id: 'name',
    header: '이름',
    accessorFn: (row: KnowledgeBaseFile) => row.name,
    size: 280,
  },
  {
    id: 'partition_name',
    header: '파티션명',
    accessorFn: (row: KnowledgeBaseFile) => row.partition_name ?? '-',
    size: 231,
  },
  {
    id: 'chunk_number',
    header: '청크 수',
    accessorFn: (row: KnowledgeBaseFile) => row.chunk_number ?? '-',
    size: 160,
  },
  {
    id: 'created_by',
    header: '생성자',
    accessorFn: (row: KnowledgeBaseFile) => row.created_by ?? '-',
    size: 291,
  },
  {
    id: 'created_at',
    header: '생성일시',
    accessorFn: (row: KnowledgeBaseFile) => formatDateTime(row.created_at),
    size: 231,
  },
  {
    id: 'updated_at',
    header: '최근 업데이트',
    accessorFn: (row: KnowledgeBaseFile) => formatDateTime(row.updated_at),
    size: 231,
  },
];

export default function KnowledgeBaseDetailPage() {
  const { id } = useParams();
  const { knowledgeBase, isError } = useGetKnowledgeBase(Number(id));
  const navigate = useNavigate();
  const { setRowSelection, rowSelection } = useTableSelection();
  const { pagination, setPagination } = useTablePagination();
  const [sorting, setSorting] = useState<Sorting>([{ id: 'name', desc: false }]);

  const files = knowledgeBase?.files ?? [];

  const selectedFileIds = useMemo(
    () =>
      Object.keys(rowSelection)
        .map((key) => files[parseInt(key)]?.id)
        .filter((fileId): fileId is number => fileId != null),
    [rowSelection, files]
  );

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb
          items={[
            { label: '지식 베이스', path: '/knowledge-base' },
            { label: knowledgeBase?.name ?? '' },
          ]}
          onNavigate={navigate}
        />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">지식 베이스 상세</h2>
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <EditKnowledgeBaseButton knowledgeBaseId={Number(id)} />
            <DeleteKnowledgeBaseButton knowledgeBaseId={Number(id)} />
          </div>
        </div>
      </div>
      <div className="page-content page-p-40">
        <h3 className="page-detail-title">상세 정보</h3>
        <div className="page-detail-list-box">
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-name">이름</div>
              <div className="page-detail_item-data">{knowledgeBase?.name}</div>
            </li>
          </ul>
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-name">생성일시</div>
              <div className="page-detail_item-data">
                {formatDateTime(knowledgeBase?.created_at)}
              </div>
            </li>
          </ul>
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-name">최근 업데이트</div>
              <div className="page-detail_item-data">
                {formatDateTime(knowledgeBase?.updated_at)}
              </div>
            </li>
          </ul>
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-name">설명</div>
              <div className="page-detail_item-data">{knowledgeBase?.description}</div>
            </li>
          </ul>
        </div>
      </div>
      <div className="page-content page-content-detail">
        <div className="page-tabsBox">
          <Tabs
            labels={['파일', '검색 테스트']}
            components={[
              <div className="tabs-Content">
                <div className="page-toolBox">
                  <div className="page-toolBox-btns">
                    <CreateKnowledgeBaseFileButton knowledgeBaseId={Number(id)} />
                    <DeleteKnowledgeBaseFileButton
                      knowledgeBaseId={Number(id)}
                      fileIds={selectedFileIds}
                      onDeleted={() => setRowSelection({})}
                    />
                  </div>
                </div>
                <div>
                  <Table
                    useClientPagination
                    useMultiSelect
                    columns={columns}
                    data={files}
                    totalCount={files.length}
                    pagination={pagination}
                    setPagination={setPagination}
                    rowSelection={rowSelection}
                    setRowSelection={setRowSelection}
                    setSorting={setSorting}
                    sorting={sorting}
                    emptyMessage={
                      isError
                        ? '파일 목록을 불러오는 데 실패했습니다.'
                        : '등록된 파일이 없습니다.'
                    }
                  />
                </div>
              </div>,
              <div className="tabs-Content">
                <RetrievalTestTab
                  knowledgeBaseId={Number(id)}
                  defaultTopK={knowledgeBase?.top_k}
                />
              </div>,
            ]}
          />
        </div>
      </div>
    </main>
  );
}
