import { useState, useMemo } from 'react';
import type { ColDef, Sorting } from '@innogrid/ui';
import {
  BreadCrumb,
  Button,
  Table,
  useTableSelection,
  useTablePagination,
  Tabs,
} from '@innogrid/ui';

import {
  IconArrowModelTree,
  IconLogoEpertx,
  IconLogoHuggingface,
  IconDownload,
} from '../../../../assets/img/icon';
import styles from '../../model.module.scss';

//breadcrumb
const items = [
  { label: '모델', path: '/model/custom-model' },
  { label: '커스텀 모델' },
  { label: 'DeepSeek-R1' },
];

export default function CustomModelDetailPage() {
  //table
  const basicColumns = [
    {
      id: 'name',
      header: '이름',
      accessorFn: (row) => row.name,
      size: 500,
      // cell: ({ row }) => (
      //   <a href={"/"} className="table-td-link">
      //     {row.original.name}
      //   </a>
      // ),
    },
    {
      id: 'fileSize',
      header: '파일 크기',
      accessorFn: (row) => row.fileSize,
      size: 500,
    },
    {
      id: 'date',
      header: '업데이트 일시',
      accessorFn: (row) => row.date,
      size: 500,
    },
    {
      id: 'download',
      header: '다운로드',
      accessorFn: (row) => row.download,
      size: 123,
      cell: ({ row }) => (
        <button type="button" className={styles.btnDownload}>
          <IconDownload className={styles.iconDownload} />
        </button>
      ),
      enableSorting: false, //오름차순/내림차순 아이콘 숨기기
    },
  ];

  const { setRowSelection, rowSelection } = useTableSelection();
  const { pagination, setPagination } = useTablePagination();
  const [sorting, setSorting] = useState<Sorting>([{ id: 'name', desc: false }]);

  const columns: ColDef<any>[] = useMemo(() => [...basicColumns], []);
  const [rowData, setRowData] = useState([
    {
      name: 'Model-0001-of-0004.safetensors',
      fileSize: '4.43 GB',
      date: '2025-12-31 10:12',
      download: '',
    },
  ]);

  return (
    <main>
      <BreadCrumb items={items} onNavigate={(path: string) => {}} className="breadcrumbBox" />
      <div className="page-title-box">
        <h2 className="page-title">모델 상세</h2>
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <Button onClick={() => alert('Button clicked!')} size="medium" color="secondary">
              하드웨어 최적화
            </Button>
            <Button onClick={() => alert('Button clicked!')} size="medium" color="secondary">
              모델 경량화
            </Button>
            <Button onClick={() => alert('Button clicked!')} size="medium" color="secondary">
              편집
            </Button>
            <Button onClick={() => alert('Button clicked!')} size="medium" color="negative">
              삭제
            </Button>
          </div>
        </div>
      </div>
      <div className="page-content page-pb-40">
        <h3 className="page-detail-title">상세 정보</h3>
        <div className="page-detail-list-box">
          {/* 최대 ul 3개, li 5개 사용 해주세요. */}
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-name">모델 소개</div>
              <div className="page-detail_item-data">
                모델 소개 자세히 보기{' '}
                <a
                  href={'https://huggingface.co/'}
                  target={'_blank'}
                  className={`page-detail_item-data-link ${styles.itemLink}`}
                >
                  <IconLogoHuggingface />
                  허깅페이스 바로가기
                </a>
                <a
                  href={'https://epretx.etri.re.kr/'}
                  target={'_blank'}
                  className={`page-detail_item-data-link ${styles.itemLink}`}
                >
                  <IconLogoEpertx />
                  e-PreTX 바로가기
                </a>
              </div>
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
              <div className="page-detail_item-name">모델 ID</div>
              <div className="page-detail_item-data">meta-liama/Meta-Liama-3-8B</div>
            </li>
          </ul>
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-name">모델 공급자 ID</div>
              <div className="page-detail_item-data">texttexttexttexttext</div>
            </li>
            <li>
              <div className="page-detail_item-name">모델 타입 ID</div>
              <div className="page-detail_item-data">texttexttexttexttext</div>
            </li>
            <li>
              <div className="page-detail_item-name">모델 포맷 ID</div>
              <div className="page-detail_item-data">texttexttexttexttext</div>
            </li>
            <li>
              <div className="page-detail_item-name">모델 트리</div>
              <div className="page-detail_item-data">
                <div className={styles.modelTree}>
                  <div>Basemodel</div>
                  <div>
                    <IconArrowModelTree />
                    Basemodel
                  </div>
                  <div>
                    <IconArrowModelTree />
                    Basemodel
                  </div>
                  <div>
                    <IconArrowModelTree />
                    Basemodel
                  </div>
                </div>
                <div className={styles.modelTreeLink}>
                  <div>
                    <a href={'/'} className="page-detail_item-data-link">
                      모델명 링크
                    </a>
                  </div>
                  <div>
                    <a href={'/'} className="page-detail_item-data-link">
                      모델명 링크
                    </a>
                  </div>
                  <div>
                    <a href={'/'} className="page-detail_item-data-link">
                      모델명 링크
                    </a>
                  </div>
                  <div>
                    <a href={'/'} className="page-detail_item-data-link">
                      모델명 링크
                    </a>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div className="page-content page-content-detail">
        <div className="page-tabsBox">
          <Tabs
            labels={['파일']}
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
            ]}
          />
        </div>
      </div>
    </main>
  );
}
