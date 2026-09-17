import { useState } from 'react';
import { BreadCrumb, Input, Select, type SelectSingleValue } from '@innogrid/ui';
import { OperationTable } from '@/components/features/infra-management/operation-table';
import type { OperationState } from '@/types/cluster';

type OptionType = { text: string; value: string };

const stateOptions: OptionType[] = [
  { text: '전체', value: '' },
  { text: 'PENDING', value: 'PENDING' },
  { text: 'RUNNING', value: 'RUNNING' },
  { text: 'SUCCEEDED', value: 'SUCCEEDED' },
  { text: 'FAILED', value: 'FAILED' },
  { text: 'CANCELLED', value: 'CANCELLED' },
];

export default function OperationsPage() {
  const [stateFilter, setStateFilter] = useState<OptionType>(stateOptions[0]);
  const [resourceId, setResourceId] = useState('');

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb
          items={[{ label: '인프라 관리' }, { label: '기록' }, { label: '작업 이력' }]}
        />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">작업 이력</h2>
      </div>

      <div className="page-content">
        <div className="page-toolBox">
          <div
            className="page-toolBox-btns"
            style={{ display: 'flex', gap: 8, alignItems: 'center' }}
          >
            <span style={{ fontSize: 13, color: '#666' }}>상태</span>
            <div style={{ minWidth: 160 }}>
              <Select
                options={stateOptions}
                getOptionLabel={(o) => o.text}
                getOptionValue={(o) => o.value}
                value={stateFilter}
                onChange={(opt: SelectSingleValue<OptionType>) =>
                  setStateFilter(opt ?? stateOptions[0])
                }
              />
            </div>
            <span style={{ fontSize: 13, color: '#666', marginLeft: 12 }}>리소스 ID</span>
            <Input
              placeholder="cluster 이름 등"
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              style={{ width: 240 }}
            />
          </div>
        </div>

        <OperationTable
          resourceId={resourceId || undefined}
          state={(stateFilter.value || undefined) as OperationState | undefined}
          height={520}
        />
      </div>
    </main>
  );
}