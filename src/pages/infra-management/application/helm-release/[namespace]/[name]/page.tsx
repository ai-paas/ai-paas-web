import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import {
  BreadCrumb,
  Tabs,
  Table,
  AlertDialog,
  useTablePagination,
  useToast,
  Button,
} from '@innogrid/ui';
import { InstallReleasePanel } from '@/components/features/infra-management/application/install-release-panel';
import styles from './revisions.module.scss';
import {
  useGetHelmReleases,
  useGetHelmReleaseResources,
  useGetHelmReleaseValues,
  useGetHelmReleaseRevisions,
  useRollbackHelmRelease,
} from '@/hooks/service/helm';
import { formatDateTime } from '@/util/date';
import type { HelmReleaseResource } from '@/types/helm';
import Editor from '@monaco-editor/react';
import { DetailValue } from '@/components/ui/detail-value';

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
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [rollbackTarget, setRollbackTarget] = useState<number | null>(null);
  const { pagination, setPagination } = useTablePagination();

  // URL 쿼리 파라미터에서 클러스터 ID 가져오기
  const [searchParams] = useSearchParams();
  const clusterId = searchParams.get('clusterId') || undefined;

  const { releases, isPending } = useGetHelmReleases({
    clusterId,
  });
  // clusterId 가 없으면 쿼리가 비활성화되어 isPending 이 계속 true 로 남는다
  const isReleasesPending = !!clusterId && isPending;

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
    // 클러스터와 네임스페이스를 넘기지 않아 쿼리가 꺼진 채였다 — 탭이 늘 비어 있었다.
  } = useGetHelmReleaseResources(name || '', clusterId, namespace);

  // Values YAML 가져오기
  const {
    values,
    isPending: isValuesPending,
    isError: isValuesError,
  } = useGetHelmReleaseValues(name || '', clusterId, namespace);

  const {
    revisions,
    isPending: isRevisionsPending,
    isError: isRevisionsError,
  } = useGetHelmReleaseRevisions(name || '', clusterId, namespace);

  const { open: openToast } = useToast();
  const { rollbackHelmRelease, isPending: isRollingBack } = useRollbackHelmRelease(clusterId, {
    onSuccess: () => {
      openToast({ title: '되돌리기 요청을 보냈습니다.' });
      setRollbackTarget(null);
    },
    onError: (error) => {
      openToast({
        title: error instanceof Error ? error.message : '되돌리기에 실패했습니다.',
        status: 'error',
      });
    },
  });

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

  if (!isReleasesPending && !release) {
    return (
      <main>
        <div className="breadcrumbBox">
          <BreadCrumb items={breadcrumbItems} onNavigate={navigate} />
        </div>
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
      <div className="breadcrumbBox">
        <BreadCrumb items={breadcrumbItems} onNavigate={navigate} />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">헬름 릴리즈 상세</h2>
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            {/* 설치와 같은 폼을 쓴다. 업그레이드용 화면을 따로 만들면 규칙이 갈린다. */}
            <Button onClick={() => setUpgradeOpen(true)} color="primary" size="medium">
              업그레이드
            </Button>
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
                  <div className="page-detail_item-data">
                    <DetailValue isLoading={isReleasesPending} width={160}>
                      {release?.name}
                    </DetailValue>
                  </div>
                </li>
                <li>
                  <div className="page-detail_item-name">배포 상태</div>
                  <div className="page-detail_item-data">
                    <DetailValue isLoading={isReleasesPending} width={100}>
                      <span className={`table-td-state table-td-state-${statusMeta.variant}`}>
                        {statusMeta.label}
                      </span>
                    </DetailValue>
                  </div>
                </li>
                <li>
                  <div className="page-detail_item-name">네임스페이스</div>
                  <div className="page-detail_item-data">
                    <DetailValue isLoading={isReleasesPending} width={120}>
                      {release?.namespace ?? '-'}
                    </DetailValue>
                  </div>
                </li>
                <li>
                  <div className="page-detail_item-name">리비전</div>
                  <div className="page-detail_item-data">
                    <DetailValue isLoading={isReleasesPending} width={100}>
                      {typeof release?.revision === 'number'
                        ? release.revision
                        : (release?.revision ?? '-')}
                    </DetailValue>
                  </div>
                </li>
                <li>
                  <div className="page-detail_item-name">차트이름</div>
                  <div className="page-detail_item-data">
                    <DetailValue isLoading={isReleasesPending} width={160}>
                      {release?.chart ?? '-'}
                    </DetailValue>
                  </div>
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
                  <div className="page-detail_item-data">
                    <DetailValue isLoading={isReleasesPending} width={100}>
                      {release?.chartVersion ?? '-'}
                    </DetailValue>
                  </div>
                </li>
                <li>
                  <div className="page-detail_item-name">최근 업데이트</div>
                  <div className="page-detail_item-data">
                    <DetailValue isLoading={isReleasesPending} width={140}>
                      {release?.updated || release?.updatedAt
                        ? formatDateTime(release.updated || release.updatedAt || '')
                        : '-'}
                    </DetailValue>
                  </div>
                </li>
                <li>
                  <div className="page-detail_item-name">생성일시</div>
                  <div className="page-detail_item-data">
                    <DetailValue isLoading={isReleasesPending} width={140}>
                      {release?.created || release?.createdAt
                        ? formatDateTime(release.created || release.createdAt || '')
                        : '-'}
                    </DetailValue>
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
            labels={['리소스 정보', 'Values Yaml', '이력']}
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
                          {/*
                            에이전트는 app.kubernetes.io/instance 라벨로 찾는다. 그 라벨을 붙이지
                            않는 차트는 릴리즈가 멀쩡해도 여기가 빈다 — 설치 실패로 읽히지 않게 적는다.
                          */}
                          <div>이 네임스페이스에서 찾은 리소스가 없습니다.</div>
                          <div>
                            차트가 app.kubernetes.io/instance 라벨을 붙이지 않으면 목록에 잡히지
                            않습니다. 릴리즈 상태가 deployed 면 배포 자체는 정상입니다.
                          </div>
                        </div>
                      )
                    }
                    totalCount={resources.length}
                    pagination={pagination}
                    setPagination={setPagination}
                    useClientPagination
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
                      value={values || release?.values || ''}
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
              <div key="revisions" className="tabs-Content">
                {/*
                  업그레이드가 잘못됐을 때 되돌릴 길이 화면에 없었다. 백엔드와 에이전트는
                  이미 rollback 을 지원하고 있었다.
                */}
                <div className={styles.revisionWrap}>
                  {isRevisionsError ? (
                    <div className={styles.revisionEmpty}>이력을 불러오지 못했습니다.</div>
                  ) : revisions.length === 0 ? (
                    <div className={styles.revisionEmpty}>
                      {isRevisionsPending ? '불러오는 중입니다.' : '이력이 없습니다.'}
                    </div>
                  ) : (
                    <table className={styles.revisionTable}>
                      <thead>
                        <tr>
                          <th>리비전</th>
                          <th>상태</th>
                          <th>차트</th>
                          <th>갱신</th>
                          <th>설명</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {revisions.map((item) => (
                          <tr key={item.revision} data-testid={`revision-${item.revision}`}>
                            <td>
                              {item.revision}
                              {String(item.revision) === String(release?.revision) && (
                                <span className={styles.revisionCurrent}>현재</span>
                              )}
                            </td>
                            <td>{item.status ?? '-'}</td>
                            <td>{item.chart ?? '-'}</td>
                            <td>{item.updated ? formatDateTime(item.updated) : '-'}</td>
                            <td>{item.description ?? '-'}</td>
                            <td>
                              {String(item.revision) !== String(release?.revision) && (
                                <button
                                  type="button"
                                  className="table-td-link"
                                  disabled={isRollingBack}
                                  onClick={() => setRollbackTarget(item.revision)}
                                >
                                  이 리비전으로 되돌리기
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
          <AlertDialog
        isOpen={rollbackTarget !== null}
        confirmButtonText={isRollingBack ? '되돌리는 중...' : '되돌리기'}
        cancelButtonText="취소"
        onClickConfirm={() => {
          if (rollbackTarget !== null && name) {
            rollbackHelmRelease({ releaseName: name, revision: rollbackTarget });
          }
        }}
        onClickClose={() => !isRollingBack && setRollbackTarget(null)}
      >
        <div className="flex flex-col gap-2 text-center">
          <strong>리비전 {rollbackTarget} 으로 되돌리기</strong>
          {/* 되돌려도 새 리비전이 쌓인다 — 이력은 지워지지 않는다. */}
          <span>그 시점의 차트와 값으로 다시 배포합니다. 새 리비전으로 기록됩니다.</span>
        </div>
      </AlertDialog>

      {release && (
        <InstallReleasePanel
          isOpen={upgradeOpen}
          onClose={() => setUpgradeOpen(false)}
          mode="upgrade"
          target={{ repoName: '', chartName: release.chart ?? '' }}
          fixed={{
            clusterName: clusterId ?? '',
            namespace: release.namespace ?? '',
            releaseName: release.name ?? '',
          }}
        />
      )}
</main>
  );
}
