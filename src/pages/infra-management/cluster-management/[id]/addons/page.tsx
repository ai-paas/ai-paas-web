import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  BreadCrumb,
  Button,
  Input,
  Select,
  type SelectSingleValue,
  Table,
  Textarea,
  useTablePagination,
  useTableSelection,
  useToast,
} from '@innogrid/ui';
import {
  useGetAddonCatalog,
  useGetClusterAddons,
  useInstallAddon,
  useUninstallAddon,
  useRetryAddon,
  type AddonCatalogItem,
  type ClusterAddon,
} from '@/hooks/service/addons';

type OptionType = { text: string; value: string };

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === 'string' && msg) return msg;
  }
  return fallback;
};

const stateColor = (state?: string): 'run' | 'negative' | 'wait' => {
  if (!state) return 'wait';
  const up = state.toUpperCase();
  if (up === 'INSTALLED' || up === 'READY' || up === 'SUCCEEDED') return 'run';
  if (up === 'FAILED' || up === 'DELETED') return 'negative';
  return 'wait';
};

export default function ClusterAddonsPage() {
  const navigate = useNavigate();
  const { id: clusterName } = useParams<{ id: string }>();
  const { open } = useToast();
  const { pagination, setPagination } = useTablePagination();
  const { rowSelection, setRowSelection } = useTableSelection();

  const { catalog, isPending: isCatalogLoading } = useGetAddonCatalog();
  const { addons, isPending: isAddonsLoading } = useGetClusterAddons(clusterName);

  const catalogOptions = useMemo<OptionType[]>(
    () =>
      catalog.map((item: AddonCatalogItem) => ({
        text: item.displayName ?? item.id ?? '-',
        value: item.id ?? item.displayName ?? '',
      })),
    [catalog]
  );

  const [selectedCatalog, setSelectedCatalog] = useState<OptionType>();
  const [namespace, setNamespace] = useState('');
  const [valuesYaml, setValuesYaml] = useState('');

  const selectedCatalogItem = useMemo<AddonCatalogItem | undefined>(
    () => catalog.find((c) => (c.id ?? c.displayName) === selectedCatalog?.value),
    [catalog, selectedCatalog]
  );

  const { installAddon, isPending: isInstalling } = useInstallAddon(clusterName, {
    onSuccess: () => {
      open({ title: '애드온 설치 요청이 접수되었습니다.' });
      setSelectedCatalog(undefined);
      setNamespace('');
      setValuesYaml('');
    },
    onError: (e) => open({ title: extractErrorMessage(e, '설치 실패'), status: 'negative' }),
  });
  const { uninstallAddon, isPending: isUninstalling } = useUninstallAddon(clusterName, {
    onSuccess: () => {
      open({ title: '애드온 제거 요청이 접수되었습니다.' });
      setRowSelection({});
    },
    onError: (e) => open({ title: extractErrorMessage(e, '제거 실패'), status: 'negative' }),
  });
  const { retryAddon, isPending: isRetrying } = useRetryAddon(clusterName, {
    onSuccess: () => {
      open({ title: '재시도 요청이 접수되었습니다.' });
    },
    onError: (e) => open({ title: extractErrorMessage(e, '재시도 실패'), status: 'negative' }),
  });

  const handleInstall = () => {
    if (!selectedCatalogItem) {
      open({ title: '카탈로그 항목을 선택해주세요.', status: 'negative' });
      return;
    }
    installAddon({
      type: selectedCatalogItem.type ?? selectedCatalogItem.id ?? '',
      catalogId: selectedCatalogItem.id,
      namespace: namespace || selectedCatalogItem.defaultNamespace || undefined,
      valuesYaml: valuesYaml || undefined,
    });
  };

  const selectedRowKeys = Object.keys(rowSelection);
  const selectedAddon = useMemo<ClusterAddon | undefined>(() => {
    if (selectedRowKeys.length !== 1) return undefined;
    return addons[parseInt(selectedRowKeys[0], 10)];
  }, [addons, selectedRowKeys]);

  const handleUninstall = () => {
    if (!selectedAddon?.id) return;
    if (
      !window.confirm(
        `애드온 "${selectedAddon.releaseName ?? selectedAddon.id}" 을 제거하시겠습니까?`
      )
    )
      return;
    uninstallAddon(selectedAddon.id);
  };

  const handleRetry = () => {
    if (!selectedAddon?.id) return;
    retryAddon(selectedAddon.id);
  };

  const columns = [
    {
      id: 'type',
      header: '타입',
      accessorFn: (row: ClusterAddon) => row.type ?? '-',
      size: 140,
    },
    {
      id: 'releaseName',
      header: 'Release',
      accessorFn: (row: ClusterAddon) => row.releaseName ?? '-',
      size: 200,
    },
    {
      id: 'namespace',
      header: '네임스페이스',
      accessorFn: (row: ClusterAddon) => row.namespace ?? '-',
      size: 140,
    },
    {
      id: 'chart',
      header: '차트',
      accessorFn: (row: ClusterAddon) =>
        row.chartRepo && row.chartName
          ? `${row.chartRepo}/${row.chartName}`
          : (row.chartName ?? '-'),
      size: 240,
    },
    {
      id: 'state',
      header: '상태',
      accessorFn: (row: ClusterAddon) => row.state ?? '-',
      size: 130,
      cell: ({ row }: { row: { original: ClusterAddon } }) => {
        const s = row.original.state;
        return <span className={`table-td-state table-td-state-${stateColor(s)}`}>{s ?? '-'}</span>;
      },
    },
  ];

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb
          items={[
            { label: '인프라 관리' },
            { label: '클러스터 관리', path: '/infra-management/cluster-management' },
            {
              label: clusterName ?? '-',
              path: `/infra-management/cluster-management/${clusterName}`,
            },
            { label: '애드온' },
          ]}
          onNavigate={navigate}
        />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">애드온 — {clusterName}</h2>
      </div>

      <div className="page-content">
        <h3 className="page-detail-title">새 애드온 설치</h3>
        <div className="page-input-box">
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">카탈로그</div>
            <div className="page-input_item-data" style={{ maxWidth: 480 }}>
              <Select
                options={catalogOptions}
                getOptionLabel={(o) => o.text}
                getOptionValue={(o) => o.value}
                value={selectedCatalog}
                onChange={(opt: SelectSingleValue<OptionType>) =>
                  setSelectedCatalog(opt ?? undefined)
                }
                placeholder={isCatalogLoading ? '로딩 중...' : '카탈로그 항목을 선택해주세요.'}
                isDisabled={isCatalogLoading}
              />
              {selectedCatalogItem?.description && (
                <p style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
                  {selectedCatalogItem.description}
                </p>
              )}
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name">네임스페이스</div>
            <div className="page-input_item-data">
              <Input
                placeholder={selectedCatalogItem?.defaultNamespace ?? '기본값 사용'}
                value={namespace}
                onChange={(e) => setNamespace(e.target.value)}
              />
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name">values.yaml (override)</div>
            <div className="page-input_item-data">
              <Textarea
                placeholder="grafana:&#10;  enabled: true"
                value={valuesYaml}
                onChange={(e) => setValuesYaml(e.target.value)}
              />
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <Button color="primary" onClick={handleInstall} disabled={isInstalling}>
              {isInstalling ? '설치 중...' : '설치'}
            </Button>
          </div>
        </div>
      </div>

      <div className="page-content page-pb-40">
        <div className="page-toolBox">
          <h3 className="page-detail-title">설치된 애드온</h3>
          <div className="page-toolBox-btns" style={{ display: 'flex', gap: 8 }}>
            <Button
              color="secondary"
              onClick={handleRetry}
              disabled={
                !selectedAddon || isRetrying || selectedAddon?.state?.toUpperCase() !== 'FAILED'
              }
            >
              재시도
            </Button>
            <Button
              color="negative"
              onClick={handleUninstall}
              disabled={!selectedAddon || isUninstalling}
            >
              제거
            </Button>
          </div>
        </div>
        <div className="h-[481px]">
          <Table
            columns={columns}
            data={addons}
            isLoading={isAddonsLoading}
            emptyMessage="설치된 애드온이 없습니다."
            totalCount={addons.length}
            pagination={pagination}
            setPagination={setPagination}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
          />
        </div>
      </div>
    </main>
  );
}
