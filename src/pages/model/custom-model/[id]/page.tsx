import { useState } from 'react';
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
import { useNavigate, useParams } from 'react-router';
import { useGetModel } from '@/hooks/service/models';
import { formatDateTime } from '@/util/date';
import { DeleteCustomModelButton } from '@/components/features/model/delete-custom-model-button';
import type { Model, ModelReadChild, ModelVisibility } from '@/types/model';

interface ModelFile {
  name: string;
  fileSize: string;
  date: string;
  download: string;
}

type ModelTreeRelation = 'ancestor' | 'current' | 'descendant';

interface ModelTreeNode {
  id: number;
  name: string;
  depth: number;
  relation: ModelTreeRelation;
  /** 게이트웨이가 보강한 모델 분류. 보강 실패 시 null. */
  visibility: ModelVisibility | null;
}

/**
 * 모델 상세 응답의 parent_model(재귀)·child_models(재귀)를 평탄화해
 * 루트 부모 → 현재 모델 → 자식 순서의 트리 노드 목록으로 변환한다.
 */
function buildModelTree(model: Model): ModelTreeNode[] {
  const nodes: ModelTreeNode[] = [];

  // 부모 계보: 위로 거슬러 올라간 뒤 루트가 맨 위에 오도록 뒤집는다.
  const ancestors: { id: number; name: string; visibility: ModelVisibility | null }[] = [];
  let parent = model.parent_model;
  while (parent) {
    ancestors.unshift({ id: parent.id, name: parent.name, visibility: parent.visibility ?? null });
    parent = parent.parent_model ?? null;
  }

  let depth = 0;
  ancestors.forEach((a) => nodes.push({ ...a, depth: depth++, relation: 'ancestor' }));

  const currentDepth = depth;
  nodes.push({
    id: model.id,
    name: model.name,
    depth: currentDepth,
    relation: 'current',
    visibility: (model.visibility as ModelVisibility) ?? null,
  });

  // 자식 계보: 아래로 재귀적으로 펼친다.
  const addChildren = (children: ModelReadChild[] | null | undefined, d: number) => {
    children?.forEach((c) => {
      nodes.push({
        id: c.id,
        name: c.name,
        depth: d,
        relation: 'descendant',
        visibility: c.visibility ?? null,
      });
      addChildren(c.child_models, d + 1);
    });
  };
  addChildren(model.child_models, currentDepth + 1);

  return nodes;
}

/**
 * 트리 노드의 이동 경로를 분기한다.
 * 게이트웨이가 보강한 visibility(CATALOG/CUSTOM)를 우선 사용하고,
 * 보강 실패(null)인 경우 계보 위치로 추정한다(부모=카탈로그, 자식=커스텀).
 */
function getModelTreeRoute(node: ModelTreeNode): string {
  const isCatalog =
    node.visibility === 'CATALOG' ||
    (node.visibility === null && node.relation === 'ancestor');
  return isCatalog
    ? `/model/model-catalog/${node.id}`
    : `/model/custom-model/${node.id}`;
}

const columns: ColDef<ModelFile>[] = [
  {
    id: 'name',
    header: '이름',
    accessorFn: (row: ModelFile) => row.name,
    size: 500,
  },
  {
    id: 'fileSize',
    header: '파일 크기',
    accessorFn: (row: ModelFile) => row.fileSize,
    size: 500,
  },
  {
    id: 'date',
    header: '업데이트 일시',
    accessorFn: (row: ModelFile) => row.date,
    size: 500,
  },
  {
    id: 'download',
    header: '다운로드',
    accessorFn: (row: ModelFile) => row.download,
    size: 123,
    cell: () => (
      <button type="button" className={styles.btnDownload}>
        <IconDownload />
      </button>
    ),
    enableSorting: false,
  },
];

export default function CustomModelDetailPage() {
  const { id } = useParams();
  const { model } = useGetModel(Number(id));
  const navigate = useNavigate();

  const treeNodes = model ? buildModelTree(model) : [];

  const { setRowSelection, rowSelection } = useTableSelection();
  const { pagination, setPagination } = useTablePagination();
  const [sorting, setSorting] = useState<Sorting>([{ id: 'name', desc: false }]);
  const [rowData] = useState([
    {
      name: 'Model-0001-of-0004.safetensors',
      fileSize: '4.43 GB',
      date: '2025-12-31 10:12',
      download: '',
    },
  ]);

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb
          items={[
            { label: '모델' },
            { label: '커스텀 모델', path: '/model/custom-model' },
            { label: model?.name ?? '' },
          ]}
          onNavigate={navigate}
        />
      </div>
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
            <DeleteCustomModelButton customModelId={model?.id} />
          </div>
        </div>
      </div>
      <div className="page-content page-pb-40">
        <h3 className="page-detail-title">상세 정보</h3>
        <div className="page-detail-list-box">
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-name">모델 소개</div>
              <div className="page-detail_item-data">
                {model?.name || '-'}
                {model?.provider_info.name === 'huggingface' && (
                  <a
                    href={`https://huggingface.co/${model?.repo_id}`}
                    target={'_blank'}
                    className={`page-detail_item-data-link ${styles.itemLink}`}
                  >
                    <IconLogoHuggingface />
                    허깅페이스 바로가기
                  </a>
                )}
                {model?.provider_info.name === 'epretx' && (
                  <a
                    href={'https://epretx.etri.re.kr/'}
                    target={'_blank'}
                    className={`page-detail_item-data-link ${styles.itemLink}`}
                  >
                    <IconLogoEpertx />
                    e-PreTX 바로가기
                  </a>
                )}
              </div>
            </li>
            <li>
              <div className="page-detail_item-name">생성일시</div>
              <div className="page-detail_item-data">
                {formatDateTime(model?.created_at.toString())}
              </div>
            </li>
            <li>
              <div className="page-detail_item-name">최근 업데이트</div>
              <div className="page-detail_item-data">
                {formatDateTime(model?.updated_at.toString())}
              </div>
            </li>
            <li>
              <div className="page-detail_item-name">생성자</div>
              <div className="page-detail_item-data">{model?.created_by || '-'}</div>
            </li>
            <li>
              <div className="page-detail_item-name">모델 ID</div>
              <div className="page-detail_item-data">{model?.repo_id}</div>
            </li>
          </ul>
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-name">모델 공급자 ID</div>
              <div className="page-detail_item-data">{model?.provider_info.name}</div>
            </li>
            <li>
              <div className="page-detail_item-name">모델 타입 ID</div>
              <div className="page-detail_item-data">{model?.type_info.name}</div>
            </li>
            <li>
              <div className="page-detail_item-name">모델 포맷 ID</div>
              <div className="page-detail_item-data">{model?.format_info.name}</div>
            </li>
            <li>
              <div className="page-detail_item-name">모델 트리</div>
              <div className="page-detail_item-data">
                {treeNodes.length > 0 ? (
                  <>
                    <div className={styles.modelTree}>
                      {treeNodes.map((node) => (
                        <div
                          key={node.id}
                          style={{ paddingLeft: node.depth === 0 ? 0 : 4 + (node.depth - 1) * 24 }}
                          className={node.relation === 'current' ? styles.modelTreeCurrent : undefined}
                        >
                          {node.depth > 0 && <IconArrowModelTree />}
                          {node.name}
                        </div>
                      ))}
                    </div>
                    <div className={styles.modelTreeLink}>
                      {treeNodes.map((node) => {
                        const route = getModelTreeRoute(node);
                        return (
                          <div key={node.id}>
                            {node.relation === 'current' ? (
                              <span>{node.name}</span>
                            ) : (
                              <a
                                href={route}
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate(route);
                                }}
                                className="page-detail_item-data-link"
                              >
                                {node.name}
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  '-'
                )}
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
              <div className="tabs-Content" key="files">
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
