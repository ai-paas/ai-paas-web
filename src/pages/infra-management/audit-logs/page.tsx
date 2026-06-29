import { useState } from 'react';
import { BreadCrumb, Input, Table, useTablePagination, useTableSelection } from '@innogrid/ui';
import { useGetAuditLogs, type AuditLog } from '@/hooks/service/audit-logs';
import { formatDateTime } from '@/util/date';

export default function AuditLogsPage() {
  const { pagination, setPagination } = useTablePagination();
  const { rowSelection, setRowSelection } = useTableSelection();
  const [principal, setPrincipal] = useState('');
  const [pathFilter, setPathFilter] = useState('');

  const { logs, isPending, isError } = useGetAuditLogs({
    pageSize: 100,
    principal: principal || undefined,
    path: pathFilter || undefined,
  });

  const columns = [
    {
      id: 'timestamp',
      header: '시각',
      accessorFn: (row: AuditLog) => formatDateTime(row.timestamp),
      size: 180,
    },
    {
      id: 'principal',
      header: '사용자',
      accessorFn: (row: AuditLog) => row.principal ?? '-',
      size: 140,
    },
    {
      id: 'clientIp',
      header: '클라이언트 IP',
      accessorFn: (row: AuditLog) => row.clientIp ?? '-',
      size: 140,
    },
    {
      id: 'httpMethod',
      header: 'Method',
      accessorFn: (row: AuditLog) => row.httpMethod ?? '-',
      size: 90,
    },
    {
      id: 'path',
      header: 'Path',
      accessorFn: (row: AuditLog) => row.path ?? '-',
      size: 340,
    },
    {
      id: 'status',
      header: '응답 코드',
      accessorFn: (row: AuditLog) => row.status ?? '-',
      size: 100,
    },
    {
      id: 'requestId',
      header: 'Request ID',
      accessorFn: (row: AuditLog) => row.requestId ?? '-',
      size: 140,
    },
  ];

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb
          items={[{ label: '인프라 관리' }, { label: '시스템 설정' }, { label: '감사 로그' }]}
        />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">감사 로그</h2>
      </div>
      <div className="page-content page-pb-40">
        <div className="page-toolBox">
          <div className="page-toolBox-btns" style={{ display: 'flex', gap: 8 }}>
            <Input
              placeholder="사용자 필터 (principal)"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              style={{ width: 200 }}
            />
            <Input
              placeholder="경로 필터 (path)"
              value={pathFilter}
              onChange={(e) => setPathFilter(e.target.value)}
              style={{ width: 300 }}
            />
          </div>
        </div>
        <div className="h-[600px]">
          <Table
            columns={columns}
            data={logs}
            isLoading={isPending}
            emptyMessage={
              isError ? '감사 로그를 불러오는 데 실패했습니다.' : '감사 로그가 없습니다.'
            }
            totalCount={logs.length}
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
