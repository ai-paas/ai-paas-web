import { useState } from 'react';
import {
  BreadCrumb,
  LineChart,
  Select,
  Table,
  useTablePagination,
  type SelectSingleValue,
} from '@innogrid/ui';
import { IconHexagon } from '../../../assets/img/icon';
import styles from '../inframonitor.module.scss';
import { GaugeChart } from '@/components/ui/gauge-chart';

//select option
type OptionType = { text: string; value: string };

const options = [
  { text: '옵션 1', value: 'option1' },
  { text: '옵션 2', value: 'option2' },
  { text: '옵션 3', value: 'option3' },
];

const columns = [
  {
    id: 'name',
    header: '이름',
    accessorFn: (row) => row.name,
    size: 300,
  },
  {
    id: 'workflow',
    header: '워크플로우',
    accessorFn: (row) => row.workflow,
    size: 300,
  },
  {
    id: 'type',
    header: '유형',
    accessorFn: (row) => row.type,
    size: 285,
  },
  {
    id: 'desc',
    header: '설명',
    accessorFn: (row) => row.desc,
    size: 334,
    enableSorting: false, //오름차순/내림차순 아이콘 숨기기
  },
  {
    id: 'date',
    header: '생성일시',
    accessorFn: (row) => row.date,
    size: 325,
  },
];

const rowData = [];

export default function MonitoringPage() {
  const { pagination, setPagination } = useTablePagination();
  //select
  const [selectedValue, setSelectedValue] = useState<OptionType>();

  const onChangeSelect = (option: SelectSingleValue<OptionType>) => {
    setSelectedValue(option);
  };

  return (
    <main>
      <BreadCrumb
        items={[{ label: '인프라 모니터' }, { label: '모니터링' }]}
        className="breadcrumbBox"
      />
      <div className="page-title-box">
        <h2 className="page-title">모니터링</h2>
      </div>
      <div className="page-content">
        <Select
          className="page-input_item-data_select"
          options={options}
          getOptionLabel={(option) => option.text}
          getOptionValue={(option) => option.value}
          value={selectedValue}
          onChange={onChangeSelect}
        />
        <div className="page-content-detail-col2 page-mt-16">
          <div className="page-detail-round-box page-flex-1 page-mt-0">
            <div className="page-detail-round-name">리소스 요청 및 제한</div>
            <div className="page-detail-round-data">
              <div className="page-content-detail-row2">
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">CPU</div>
                  <div className="page-detail-round-data page-h-216">
                    <div className={styles.chartRow}>
                      <GaugeChart
                        value={76.68}
                        startAngle={240}
                        endAngle={-60}
                        className="size-[176px]"
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="absolute top-[35%] text-2xl font-bold text-[#1a1a1a]">
                            74.68%
                          </div>
                          <div className="absolute top-[52%] mt-2 font-[13px] text-[#1a1a1a]">
                            2 / 16 Core
                          </div>
                          <div className="absolute top-[72%] mt-6 text-xs text-[#999]">Request</div>
                        </div>
                      </GaugeChart>
                      <GaugeChart
                        value={12.45}
                        startAngle={240}
                        endAngle={-60}
                        color="green"
                        className="size-[176px]"
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="absolute top-[35%] text-2xl font-bold text-[#1a1a1a]">
                            12.45%
                          </div>
                          <div className="absolute top-[52%] mt-2 font-[13px] text-[#1a1a1a]">
                            2 / 16 Core
                          </div>
                          <div className="absolute top-[72%] mt-6 text-xs text-[#999]">Limit</div>
                        </div>
                      </GaugeChart>
                    </div>
                  </div>
                </div>
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">Memory</div>
                  <div className="page-detail-round-data page-h-216">
                    <div className={styles.chartRow}>
                      <GaugeChart
                        value={32.78}
                        startAngle={240}
                        endAngle={-60}
                        color="yellow"
                        className="size-[176px]"
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="absolute top-[35%] text-2xl font-bold text-[#1a1a1a]">
                            32.78%
                          </div>
                          <div className="absolute top-[52%] mt-2 font-[13px] text-[#1a1a1a]">
                            2 / 16 Core
                          </div>
                          <div className="absolute top-[72%] mt-6 text-xs text-[#999]">Request</div>
                        </div>
                      </GaugeChart>
                      <GaugeChart
                        value={32.78}
                        startAngle={240}
                        endAngle={-60}
                        color="yellow"
                        className="size-[176px]"
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="absolute top-[35%] text-2xl font-bold text-[#1a1a1a]">
                            32.78%
                          </div>
                          <div className="absolute top-[52%] mt-2 font-[13px] text-[#1a1a1a]">
                            2 / 16 Core
                          </div>
                          <div className="absolute top-[72%] mt-6 text-xs text-[#999]">Limit</div>
                        </div>
                      </GaugeChart>
                    </div>
                  </div>
                </div>
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">GPU</div>
                  <div className="page-detail-round-data page-h-216">
                    <div className={styles.chartRow}>
                      <GaugeChart
                        value={12.45}
                        startAngle={240}
                        endAngle={-60}
                        color="green"
                        className="size-[176px]"
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="absolute top-[35%] text-2xl font-bold text-[#1a1a1a]">
                            12.45%
                          </div>
                          <div className="absolute top-[52%] mt-2 font-[13px] text-[#1a1a1a]">
                            2 / 16 Core
                          </div>
                          <div className="absolute top-[72%] mt-6 text-xs text-[#999]">Request</div>
                        </div>
                      </GaugeChart>
                      <GaugeChart
                        value={32.78}
                        startAngle={240}
                        endAngle={-60}
                        color="yellow"
                        className="size-[176px]"
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="absolute top-[35%] text-2xl font-bold text-[#1a1a1a]">
                            32.78%
                          </div>
                          <div className="absolute top-[52%] mt-2 font-[13px] text-[#1a1a1a]">
                            2 / 16 Core
                          </div>
                          <div className="absolute top-[72%] mt-6 text-xs text-[#999]">Limit</div>
                        </div>
                      </GaugeChart>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="page-detail-round-box page-flex-1">
            <div className="page-detail-round-name">리소스 현황</div>
            <div className="page-detail-round-data">
              <div className="page-content-detail-row2">
                <div className={styles.chartRow}>
                  <GaugeChart
                    value={100.0}
                    startAngle={90}
                    endAngle={-270}
                    color="blue"
                    className="size-[176px]"
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="absolute top-[18%] mt-2 font-[13px] text-[#1a1a1a]">CPU</div>
                      <div className="absolute top-[38%] text-2xl font-bold text-[#1a1a1a]">
                        100.00%
                      </div>
                      <div className="absolute top-[50%] mt-6 text-xs text-[#999]">
                        34.8 of 104.94 GiB
                      </div>
                    </div>
                  </GaugeChart>
                  <GaugeChart
                    value={64.92}
                    startAngle={90}
                    endAngle={-270}
                    color="blue"
                    className="size-[176px]"
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="absolute top-[18%] mt-2 font-[13px] text-[#1a1a1a]">
                        메모리
                      </div>
                      <div className="absolute top-[38%] text-2xl font-bold text-[#1a1a1a]">
                        64.92%
                      </div>
                      <div className="absolute top-[50%] mt-6 text-xs text-[#999]">
                        34.8 of 104.94 GiB
                      </div>
                    </div>
                  </GaugeChart>
                  <GaugeChart
                    value={12.82}
                    startAngle={90}
                    endAngle={-270}
                    color="blue"
                    className="size-[176px]"
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="absolute top-[18%] mt-2 font-[13px] text-[#1a1a1a]">
                        파일 시스템
                      </div>
                      <div className="absolute top-[38%] text-2xl font-bold text-[#1a1a1a]">
                        12.82%
                      </div>
                      <div className="absolute top-[50%] mt-6 text-xs text-[#999]">
                        34.8 of 104.94 GiB
                      </div>
                    </div>
                  </GaugeChart>
                  <GaugeChart
                    value={39.25}
                    startAngle={90}
                    endAngle={-270}
                    color="blue"
                    className="size-[176px]"
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="absolute top-[18%] mt-2 font-[13px] text-[#1a1a1a]">
                        영구 볼륨
                      </div>
                      <div className="absolute top-[38%] text-2xl font-bold text-[#1a1a1a]">
                        39.25%
                      </div>
                      <div className="absolute top-[50%] mt-6 text-xs text-[#999]">
                        34.8 of 104.94 GiB
                      </div>
                    </div>
                  </GaugeChart>
                  <GaugeChart
                    value={64.92}
                    startAngle={90}
                    endAngle={-270}
                    color="blue"
                    className="size-[176px]"
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="absolute top-[18%] mt-2 font-[13px] text-[#1a1a1a]">파드</div>
                      <div className="absolute top-[38%] text-2xl font-bold text-[#1a1a1a]">
                        64.92%
                      </div>
                      <div className="absolute top-[50%] mt-6 text-xs text-[#999]">
                        34.8 of 104.94
                      </div>
                    </div>
                  </GaugeChart>
                  <GaugeChart
                    value={39.25}
                    startAngle={90}
                    endAngle={-270}
                    color="blue"
                    className="size-[176px]"
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="absolute top-[18%] mt-2 font-[13px] text-[#1a1a1a]">GPU</div>
                      <div className="absolute top-[38%] text-2xl font-bold text-[#1a1a1a]">
                        39.25%
                      </div>
                      <div className="absolute top-[50%] mt-6 text-xs text-[#999]">
                        34.8 of 104.94
                      </div>
                    </div>
                  </GaugeChart>
                </div>
              </div>
            </div>
          </div>
          <div className="page-detail-round-box page-flex-1">
            <div className="page-detail-round-name">파드</div>
            <div className="page-detail-round-data">
              <div className={styles.symbolBox}>
                <IconHexagon />
                <em>38</em>
              </div>
              <div className="page-h-240">
                <Table
                  columns={columns}
                  data={rowData}
                  totalCount={rowData.length}
                  pagination={pagination}
                  setPagination={setPagination}
                />
              </div>
            </div>
          </div>
          <div className="page-detail-round-box page-flex-1">
            <div className="page-detail-round-name">성능 지표</div>
            <div className="page-detail-round-data">
              <div className="page-content-detail-row2">
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">CPU</div>
                  <div className="page-detail-round-data page-h-548 page-p-24">
                    <LineChart
                      xDataKey="name"
                      yDataKey={['workflow1']}
                      data={[
                        {
                          name: '2022.04.12',
                          workflow1: 120,
                        },
                        {
                          name: '24',
                          workflow1: 162,
                        },
                        {
                          name: '25',
                          workflow1: 118,
                        },
                        {
                          name: '26',
                          workflow1: 131,
                        },
                        {
                          name: '27',
                          workflow1: 85,
                        },
                        {
                          name: '2022.04.28',
                          workflow1: 81,
                        },
                      ]}
                    />
                  </div>
                </div>
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">CPU load average</div>
                  <div className="page-detail-round-data page-h-548 page-p-24">
                    <LineChart
                      xDataKey="name"
                      yDataKey={['workflow1']}
                      data={[
                        {
                          name: '2022.04.12',
                          workflow1: 120,
                        },
                        {
                          name: '24',
                          workflow1: 162,
                        },
                        {
                          name: '25',
                          workflow1: 118,
                        },
                        {
                          name: '26',
                          workflow1: 131,
                        },
                        {
                          name: '27',
                          workflow1: 85,
                        },
                        {
                          name: '2022.04.28',
                          workflow1: 81,
                        },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
