import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { BreadCrumb, Tabs, Table, AlertDialog, useTablePagination, Button } from '@innogrid/ui';
import {
  useGetHelmReleases,
  useGetHelmReleaseResources,
  useGetHelmReleaseValues,
} from '@/hooks/service/helm';
import { formatDateTime } from '@/util/date';
import type { HelmReleaseResource } from '@/types/helm';
import Editor from '@monaco-editor/react';

const normalizeStatus = (status?: string) => {
  if (!status) {
    return { label: '-', variant: 'temp' as const };
  }

  const normalized = status.trim().toLowerCase();

  if (['deployed', 'deploy', 'success', 'succeeded', 'completed', 'active'].includes(normalized)) {
    return { label: 'Deployed', variant: 'run' as const };
  }

  if (['failed', 'error', 'errored', 'uninstalling'].includes(normalized)) {
    return { label: 'Failed', variant: 'negative' as const };
  }

  if (['pending', 'installing', 'progressing', 'upgrading'].includes(normalized)) {
    return { label: 'Pending', variant: 'ing' as const };
  }

  if (['deleted', 'superseded'].includes(normalized)) {
    return { label: 'Deleted', variant: 'temp' as const };
  }

  return { label: status, variant: 'temp' as const };
};

const normalizeResourceStatus = (status?: string) => {
  if (!status) {
    return { label: '-', variant: 'temp' as const };
  }

  const normalized = status.trim().toLowerCase();

  if (['bound', 'success', 'running', 'active', 'ready'].includes(normalized)) {
    return { label: status, variant: 'run' as const };
  }

  if (['failed', 'error', 'errored'].includes(normalized)) {
    return { label: status, variant: 'negative' as const };
  }

  if (['pending', 'in progress', 'progressing'].includes(normalized)) {
    return { label: status, variant: 'ing' as const };
  }

  return { label: status, variant: 'temp' as const };
};

export default function HelmReleaseDetailPage() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const navigate = useNavigate();
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [selectedResource, setSelectedResource] = useState<HelmReleaseResource | null>(null);
  const [isYamlModalOpen, setIsYamlModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { pagination, setPagination } = useTablePagination();

  // URL 쿼리 파라미터에서 클러스터 ID 가져오기
  const [searchParams] = useSearchParams();
  const clusterId = searchParams.get('clusterId') || undefined;

  const { releases } = useGetHelmReleases({
    clusterId,
  });

  // 목록에서 현재 릴리즈 찾기
  const release = useMemo(() => {
    if (!name || !namespace) return undefined;
    return releases.find((r) => r.name === name && r.namespace === namespace);
  }, [releases, name, namespace]);

  // 리소스 정보 가져오기
  const {
    resources,
    isPending: isResourcesPending,
    isError: isResourcesError,
  } = useGetHelmReleaseResources(name || '');

  // Values YAML 가져오기
  const {
    values,
    isPending: isValuesPending,
    isError: isValuesError,
  } = useGetHelmReleaseValues(name || '');

  const handleResourceNameClick = useCallback((resource: HelmReleaseResource) => {
    setSelectedResource(resource);
    setIsYamlModalOpen(true);
  }, []);

  const handleCloseYamlModal = useCallback(() => {
    setIsYamlModalOpen(false);
    setSelectedResource(null);
  }, []);

  const handleDeleteClick = useCallback(() => {
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    // TODO: 헬름 릴리즈 삭제 API 호출
    console.log('헬름 릴리즈 삭제:', name);
    setIsDeleteDialogOpen(false);
    // 삭제 성공 시 목록 페이지로 이동
    navigate('/infra-management/application/helm-release');
  }, [name, navigate]);

  const handleDeleteCancel = useCallback(() => {
    setIsDeleteDialogOpen(false);
  }, []);

  const statusMeta = normalizeStatus(release?.status);

  const resourceColumns = useMemo(
    () => [
      {
        id: 'name',
        header: '이름',
        accessorFn: (row: HelmReleaseResource) => row.name ?? '-',
        size: 250,
        cell: ({ row }: { row: { original: HelmReleaseResource } }) => {
          const resource = row.original;
          return (
            <button
              type="button"
              onClick={() => handleResourceNameClick(resource)}
              className="table-td-link"
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                color: '#2563eb',
                textDecoration: 'underline',
              }}
            >
              {resource.name ?? '-'}
            </button>
          );
        },
      },
      {
        id: 'namespace',
        header: '네임스페이스',
        accessorFn: (row: HelmReleaseResource) => row.namespace ?? '-',
        size: 200,
      },
      {
        id: 'status',
        header: '상태',
        accessorFn: (row: HelmReleaseResource) => row.status ?? '-',
        size: 160,
        cell: ({ row }: { row: { original: HelmReleaseResource } }) => {
          const meta = normalizeResourceStatus(row.original.status);
          return (
            <span className={`table-td-state table-td-state-${meta.variant}`}>{meta.label}</span>
          );
        },
      },
      {
        id: 'type',
        header: '종류',
        accessorFn: (row: HelmReleaseResource) => row.type ?? '-',
        size: 200,
      },
      {
        id: 'createdAt',
        header: '생성일시',
        accessorFn: (row: HelmReleaseResource) =>
          row.created || row.createdAt ? formatDateTime(row.created || row.createdAt || '') : '-',
        size: 200,
      },
    ],
    [handleResourceNameClick]
  );

  const breadcrumbItems = [
    { label: '인프라 관리' },
    { label: '애플리케이션' },
    { label: '헬름 릴리즈', path: '/infra-management/application/helm-release' },
    { label: release?.name || '상세' },
  ];

  if (!release) {
    return (
      <main>
        <BreadCrumb items={breadcrumbItems} onNavigate={navigate} />
        <div className="page-title-box">
          <h2 className="page-title">헬름 릴리즈 상세</h2>
        </div>
        <div className="page-content">
          <div className="flex flex-col items-center gap-4">
            <div>헬름 릴리즈를 찾을 수 없습니다.</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <BreadCrumb items={breadcrumbItems} onNavigate={navigate} />
      <div className="page-title-box">
        <h2 className="page-title">헬름 릴리즈 상세</h2>
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <Button onClick={handleDeleteClick} color="negative" size="medium">
              삭제
            </Button>
          </div>
        </div>
      </div>
      <div className="page-content page-pb-40">
        <h3 className="page-detail-title">상세 정보</h3>
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* 왼쪽 컬럼 */}
          <div style={{ flex: 1 }}>
            <div className="page-detail-list-box">
              <ul className="page-detail-list">
                <li>
                  <div className="page-detail_item-name">이름</div>
                  <div className="page-detail_item-data">{release.name}</div>
                </li>
                <li>
                  <div className="page-detail_item-name">배포 상태</div>
                  <div className="page-detail_item-data">
                    <span className={`table-td-state table-td-state-${statusMeta.variant}`}>
                      {statusMeta.label}
                    </span>
                  </div>
                </li>
                <li>
                  <div className="page-detail_item-name">네임스페이스</div>
                  <div className="page-detail_item-data">{release.namespace ?? '-'}</div>
                </li>
                <li>
                  <div className="page-detail_item-name">리비전</div>
                  <div className="page-detail_item-data">
                    {typeof release.revision === 'number'
                      ? release.revision
                      : (release.revision ?? '-')}
                  </div>
                </li>
                <li>
                  <div className="page-detail_item-name">차트이름</div>
                  <div className="page-detail_item-data">{release.chart ?? '-'}</div>
                </li>
              </ul>
            </div>
          </div>

          {/* 오른쪽 컬럼 */}
          <div style={{ flex: 1 }}>
            <div className="page-detail-list-box">
              <ul className="page-detail-list">
                <li>
                  <div className="page-detail_item-name">차트 버전</div>
                  <div className="page-detail_item-data">{release.chartVersion ?? '-'}</div>
                </li>
                <li>
                  <div className="page-detail_item-name">최근 업데이트</div>
                  <div className="page-detail_item-data">
                    {release.updated || release.updatedAt
                      ? formatDateTime(release.updated || release.updatedAt || '')
                      : '-'}
                  </div>
                </li>
                <li>
                  <div className="page-detail_item-name">생성일시</div>
                  <div className="page-detail_item-data">
                    {release.created || release.createdAt
                      ? formatDateTime(release.created || release.createdAt || '')
                      : '-'}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="page-content page-content-detail">
        <div className="page-tabsBox">
          <Tabs
            labels={['리소스 정보', 'Values Yaml']}
            value={String(activeTabIndex)}
            onValueChange={(index) => setActiveTabIndex(Number(index))}
            components={[
              <div key="resources" className="tabs-Content">
                <div className="h-[520px]">
                  <Table
                    columns={resourceColumns}
                    data={resources}
                    isLoading={isResourcesPending}
                    emptyMessage={
                      isResourcesError ? (
                        <div className="flex flex-col items-center gap-4">
                          <div>리소스 정보를 불러오는 중 오류가 발생했습니다.</div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-4">
                          <div>등록된 리소스가 없습니다.</div>
                        </div>
                      )
                    }
                    totalCount={resources.length}
                    pagination={pagination}
                    setPagination={setPagination}
                  />
                </div>
              </div>,
              <div key="values" className="tabs-Content">
                <div className="h-[520px]">
                  {isValuesPending ? (
                    <div className="flex h-full items-center justify-center">
                      <div>Values YAML을 불러오는 중입니다...</div>
                    </div>
                  ) : isValuesError ? (
                    <div className="flex h-full items-center justify-center">
                      <div>Values YAML을 불러오는 중 오류가 발생했습니다.</div>
                    </div>
                  ) : (
                    <Editor
                      height="100%"
                      language="yaml"
                      value={values || release.values || ''}
                      theme="vs-dark"
                      options={{
                        readOnly: true,
                        minimap: { enabled: true },
                        scrollBeyondLastLine: false,
                        fontSize: 13,
                        lineNumbers: 'on',
                        wordWrap: 'on',
                      }}
                    />
                  )}
                </div>
              </div>,
            ]}
          />
        </div>
      </div>

      <AlertDialog
        isOpen={isYamlModalOpen}
        confirmButtonText="확인"
        onClickConfirm={handleCloseYamlModal}
        onClickClose={handleCloseYamlModal}
      >
        <div className="flex flex-col gap-4">
          <div>
            <strong>리소스 YAML</strong>
          </div>
          <div style={{ height: '500px', border: '1px solid #d1d5db', borderRadius: '6px' }}>
            <Editor
              height="100%"
              language="yaml"
              value={selectedResource?.yaml || ''}
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                fontSize: 13,
                lineNumbers: 'on',
                wordWrap: 'on',
              }}
            />
          </div>
        </div>
      </AlertDialog>

      <AlertDialog
        isOpen={isDeleteDialogOpen}
        confirmButtonText="확인"
        cancelButtonText="취소"
        onClickConfirm={handleDeleteConfirm}
        onClickClose={handleDeleteCancel}
      >
        <span>헬름 릴리즈를 삭제하시겠습니까?</span>
      </AlertDialog>
    </main>
  );
}
