import { useMemo, useState } from 'react';
import {
  Table,
  HeaderCheckbox,
  CellCheckbox,
  useTableSelection,
  useTablePagination,
} from '@innogrid/ui';
import { useGetKubernetesSecrets } from '@/hooks/service/clusters';
import { ResourceDetailDrawer, type DrawerTab } from '../resource-detail-drawer';
import { ResourceRowActions } from '../resource-row-actions';
import { BulkActionToolbar } from '../bulk-action-toolbar';
import type { KubernetesSecret } from '@/types/cluster';

interface SecretsTabProps {
  namespace?: string;
  clusterName?: string | null;
}

export const SecretsTab = ({ clusterName, namespace }: SecretsTabProps) => {
  const { rowSelection, setRowSelection } = useTableSelection();
  const { pagination, setPagination } = useTablePagination();

  const { secrets, isPending, isError } = useGetKubernetesSecrets(
    clusterName || undefined,
    namespace
  );

  const selectedItems = useMemo<KubernetesSecret[]>(() => {
    return Object.keys(rowSelection)
      .map((k) => secrets[parseInt(k, 10)])
      .filter((s): s is KubernetesSecret => Boolean(s));
  }, [secrets, rowSelection]);

  const [drawerItem, setDrawerItem] = useState<KubernetesSecret | undefined>();
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('overview');

  const openDrawer = (item: KubernetesSecret, tab: DrawerTab = 'overview') => {
    setDrawerItem(item);
    setDrawerTab(tab);
  };

  const columns = [
    {
      id: 'select',
      size: 50,
      header: (props: { table: unknown }) => <HeaderCheckbox table={props.table} />,
      cell: (props: { row: unknown }) => <CellCheckbox row={props.row} />,
      enableSorting: false,
    },
    {
      id: 'name',
      header: '이름',
      accessorFn: (row: KubernetesSecret) => row.metadata.name,
      size: 200,
      cell: ({ row }: { row: { original: KubernetesSecret } }) => (
        <span
          onClick={() => openDrawer(row.original, 'overview')}
          style={{ color: '#0066cc', textDecoration: 'underline', cursor: 'pointer' }}
        >
          {row.original.metadata.name}
        </span>
      ),
    },
    {
      id: 'namespace',
      header: '네임스페이스',
      accessorFn: (row: KubernetesSecret) => row.metadata.namespace,
      size: 150,
    },
    {
      id: 'type',
      header: '유형',
      accessorFn: (row: KubernetesSecret) => row.type || 'Unknown',
      size: 200,
    },
    {
      id: 'createdAt',
      header: '생성 일시',
      accessorFn: (row: KubernetesSecret) => row.metadata.creationTimestamp,
      size: 200,
    },
    {
      id: 'actions',
      header: '작업',
      enableSorting: false,
      size: 90,
      cell: ({ row }: { row: { original: KubernetesSecret } }) => (
        <ResourceRowActions
          clusterName={clusterName ?? undefined}
          resourceType="secrets"
          resourceLabel="시크릿"
          resourceName={row.original.metadata.name}
          namespace={row.original.metadata.namespace}
          rowData={row.original}
          onOpenDrawer={(tab) => openDrawer(row.original, tab)}
        />
      ),
    },
  ];

  return (
    <div>
      <BulkActionToolbar
        selected={selectedItems}
        resourceType="secrets"
        resourceLabel="시크릿"
        clusterName={clusterName ?? undefined}
        getName={(s) => s.metadata.name}
        getNamespace={(s) => s.metadata.namespace}
        onClear={() => setRowSelection({})}
      />

      <div className="h-[481px]">
        <Table
          columns={columns}
          data={secrets}
          isLoading={isPending}
          emptyMessage={
            /*
             * 시크릿은 자격증명이 그대로 담겨 있어 게이트웨이가 일부러 막는다(P0 정책).
             * "없습니다" 로 두면 정책 때문인지 진짜 없는 건지 알 수 없다.
             */
            isError ? (
              <div className="flex flex-col items-center gap-4">
                <div>시크릿은 포탈에서 조회할 수 없습니다.</div>
                <div>자격증명이 담겨 있어 보안 정책으로 막혀 있습니다. kubectl 로 확인하세요.</div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div>시크릿이 없습니다.</div>
                <div>클러스터에 시크릿이 생성되지 않았습니다.</div>
              </div>
            )
          }
          totalCount={secrets.length}
          pagination={pagination}
          setPagination={setPagination}
          useClientPagination
          useSelect
          useMultiSelect
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>

      <ResourceDetailDrawer
        isOpen={!!drawerItem}
        clusterName={clusterName ?? undefined}
        resourceType="secrets"
        resourceLabel="시크릿"
        resourceName={drawerItem?.metadata.name}
        namespace={drawerItem?.metadata.namespace}
        initialTab={drawerTab}
        onClose={() => setDrawerItem(undefined)}
      />
    </div>
  );
};