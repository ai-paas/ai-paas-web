import { BreadCrumb, Table, useTablePagination } from '@innogrid/ui';

import { IconMore, IconNode } from '../../assets/img/icon';
import styles from './dashboard.module.scss';

//breadcrumb
const items = [{ label: '대시보드', path: '/dashboard' }];

export default function DashboardPage() {
  return (
    <main>
      <BreadCrumb items={items} onNavigate={(path: string) => {}} className="breadcrumbBox" />
      <div className="page-title-box">
        <h2 className="page-title">대시보드</h2>
      </div>
      <div className="page-content">
        <div className="page-content-detail-col2">
          <div className="page-detail-round-box page-flex-1 page-mt-0">
            <div className="page-detail-round-name">서비스 현황</div>
            <div className="page-detail-round-data">
              <div className="page-content-detail-row2">
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">
                    서비스
                    <button type="button" className="btn-more">
                      <IconMore />
                      <span>바로가기</span>
                    </button>
                  </div>
                  <div className="page-detail-round-data page-h-110">
                    <div className={styles.stateDataBox}>
                      <div className={styles.stateDataNum}>202</div>
                      <div className={styles.stateDataText}>
                        <div className={styles.stateDataDesc}>
                          <span>사용자1</span>
                          <em>142</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용자2</span>
                          <em>36</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용자3</span>
                          <em>24</em>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">
                    워크플로우
                    <button type="button" className="btn-more">
                      <IconMore />
                      <span>바로가기</span>
                    </button>
                  </div>
                  <div className="page-detail-round-data page-h-110">
                    <div className={styles.stateDataBox}>
                      <div className={styles.stateDataNum}>86</div>
                      <div className={styles.stateDataText}>
                        <div className={styles.stateDataDesc}>
                          <span>사용자1</span>
                          <em>142</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용자2</span>
                          <em>36</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용자3</span>
                          <em>24</em>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">
                    모델
                    <button type="button" className="btn-more">
                      <IconMore />
                      <span>바로가기</span>
                    </button>
                  </div>
                  <div className="page-detail-round-data page-h-110">
                    <div className={styles.stateDataBox}>
                      <div className={styles.stateDataNum}>73</div>
                      <div className={styles.stateDataText}>
                        <div className={styles.stateDataDesc}>
                          <span>사용자1</span>
                          <em>142</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용자2</span>
                          <em>36</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용자3</span>
                          <em>24</em>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">
                    데이터 셋
                    <button type="button" className="btn-more">
                      <IconMore />
                      <span>바로가기</span>
                    </button>
                  </div>
                  <div className="page-detail-round-data page-h-110">
                    <div className={styles.stateDataBox}>
                      <div className={styles.stateDataNum}>58</div>
                      <div className={styles.stateDataText}>
                        <div className={styles.stateDataDesc}>
                          <span>사용자1</span>
                          <em>142</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용자2</span>
                          <em>36</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용자3</span>
                          <em>24</em>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">
                    지식 베이스
                    <button type="button" className="btn-more">
                      <IconMore />
                      <span>바로가기</span>
                    </button>
                  </div>
                  <div className="page-detail-round-data page-h-110">
                    <div className={styles.stateDataBox}>
                      <div className={styles.stateDataNum}>49</div>
                      <div className={styles.stateDataText}>
                        <div className={styles.stateDataDesc}>
                          <span>사용자1</span>
                          <em>142</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용자2</span>
                          <em>36</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용자3</span>
                          <em>24</em>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* 나의 서비스 일때 */}
              <div className="page-content-detail-row2">
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">
                    나의 서비스 001
                    <button type="button" className="btn-more">
                      <IconMore />
                      <span>바로가기</span>
                    </button>
                  </div>
                  <div className="page-detail-round-data page-h-130">
                    <div className={`${styles.stateDataBox} page-content-detail-col2`}>
                      <div className={styles.stateDataText}>
                        <div className={styles.stateDataDesc}>
                          <span>사용자1</span>
                          <em>142</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용자2</span>
                          <em>36</em>
                        </div>
                      </div>
                      <div className={styles.stateDataNoti}>RAG 유형 모델을 사용한 채팅 서비스</div>
                    </div>
                  </div>
                </div>
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">
                    나의 서비스 001
                    <button type="button" className="btn-more">
                      <IconMore />
                      <span>바로가기</span>
                    </button>
                  </div>
                  <div className="page-detail-round-data page-h-130">
                    <div className={`${styles.stateDataBox} page-content-detail-col2`}>
                      <div className={styles.stateDataText}>
                        <div className={styles.stateDataDesc}>
                          <span>사용자1</span>
                          <em>142</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용자2</span>
                          <em>36</em>
                        </div>
                      </div>
                      <div className={styles.stateDataNoti}>RAG 유형 모델을 사용한 채팅 서비스</div>
                    </div>
                  </div>
                </div>
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">
                    나의 서비스 001
                    <button type="button" className="btn-more">
                      <IconMore />
                      <span>바로가기</span>
                    </button>
                  </div>
                  <div className="page-detail-round-data page-h-130">
                    <div className={`${styles.stateDataBox} page-content-detail-col2`}>
                      <div className={styles.stateDataText}>
                        <div className={styles.stateDataDesc}>
                          <span>사용자1</span>
                          <em>142</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용자2</span>
                          <em>36</em>
                        </div>
                      </div>
                      <div className={styles.stateDataNoti}>RAG 유형 모델을 사용한 채팅 서비스</div>
                    </div>
                  </div>
                </div>
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">
                    나의 서비스 001
                    <button type="button" className="btn-more">
                      <IconMore />
                      <span>바로가기</span>
                    </button>
                  </div>
                  <div className="page-detail-round-data page-h-130">
                    <div className={`${styles.stateDataBox} page-content-detail-col2`}>
                      <div className={styles.stateDataText}>
                        <div className={styles.stateDataDesc}>
                          <span>사용자1</span>
                          <em>142</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용자2</span>
                          <em>36</em>
                        </div>
                      </div>
                      <div className={styles.stateDataNoti}>RAG 유형 모델을 사용한 채팅 서비스</div>
                    </div>
                  </div>
                </div>
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">
                    나의 서비스 001
                    <button type="button" className="btn-more">
                      <IconMore />
                      <span>바로가기</span>
                    </button>
                  </div>
                  <div className="page-detail-round-data page-h-130">
                    <div className={`${styles.stateDataBox} page-content-detail-col2`}>
                      <div className={styles.stateDataText}>
                        <div className={styles.stateDataDesc}>
                          <span>워크플로우</span>
                          <em>142</em>
                        </div>
                        <div className={styles.stateDataDesc}>
                          <span>사용 모델</span>
                          <em>36</em>
                        </div>
                      </div>
                      <div className={styles.stateDataNoti}>RAG 유형 모델을 사용한 채팅 서비스</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 인프라 */}
          <div className="page-detail-round-box page-flex-1">
            <div className="page-detail-round-name">인프라</div>
            <div className="page-detail-round-data">
              <div className="page-content-detail-row2">
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">
                    노드
                    <button type="button" className="btn-more">
                      <IconMore />
                      <span>바로가기</span>
                    </button>
                  </div>
                  <div className="page-detail-round-data page-h-264">
                    <div className={styles.nodeLegendBox}>
                      <div className={styles.legend}>
                        <div>
                          <i className={`${styles.legendMark} ${styles.legendMark1}`} />
                          <span>실행</span>
                        </div>
                        <em>8</em>
                      </div>
                      <div className={styles.legend}>
                        <div>
                          <i className={`${styles.legendMark} ${styles.legendMark2}`} />
                          <span>경고</span>
                        </div>
                        <em>3</em>
                      </div>
                      <div className={styles.legend}>
                        <div>
                          <i className={`${styles.legendMark} ${styles.legendMark3}`} />
                          <span>에러</span>
                        </div>
                        <em>2</em>
                      </div>
                    </div>
                    <div className={styles.nodesBox}>
                      <div className={`${styles.nodeImportant} ${styles.node}`}>
                        <IconNode />
                        <span>Master 001</span>
                      </div>
                      <div className={`${styles.nodeWarning} ${styles.node}`}>
                        <IconNode />
                        <span>Master 002</span>
                      </div>
                      <div className={`${styles.nodeError} ${styles.node}`}>
                        <IconNode />
                        <span>Master 003</span>
                      </div>
                      <div className={`${styles.nodeImportant} ${styles.node}`}>
                        <IconNode />
                        <span>Master 004</span>
                      </div>
                      <div className={`${styles.nodeImportant} ${styles.node}`}>
                        <IconNode />
                        <span>Master 005</span>
                      </div>
                      <div className={`${styles.nodeWarning} ${styles.node}`}>
                        <IconNode />
                        <span>Master 006</span>
                      </div>
                      <div className={`${styles.nodeImportant} ${styles.node}`}>
                        <IconNode />
                        <span>Master 007</span>
                      </div>
                      <div className={`${styles.nodeWarning} ${styles.node}`}>
                        <IconNode />
                        <span>Master 008</span>
                      </div>
                      <div className={`${styles.nodeImportant} ${styles.node}`}>
                        <IconNode />
                        <span>Master 009</span>
                      </div>
                      <div className={`${styles.nodeImportant} ${styles.node}`}>
                        <IconNode />
                        <span>Master 010</span>
                      </div>
                      <div className={`${styles.nodeImportant} ${styles.node}`}>
                        <IconNode />
                        <span>Master 011</span>
                      </div>
                      <div className={`${styles.nodeError} ${styles.node}`}>
                        <IconNode />
                        <span>Master 012</span>
                      </div>
                      <div className={`${styles.nodeWarning} ${styles.node}`}>
                        <IconNode />
                        <span>Master 013</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">
                    리소스
                    <button type="button" className="btn-more">
                      <IconMore />
                      <span>바로가기</span>
                    </button>
                  </div>
                  <div className="page-detail-round-data page-h-264">
                    <div className={styles.resourceBox}>
                      <div>
                        <div className={styles.resourceName}>
                          <span>CPU</span>
                          <em>384 / 524</em>
                        </div>
                        <div className={styles.resourceProgress}>
                          <div className={styles.resourceProgressActionBar}></div>
                          <div className={styles.resourceProgressBar}></div>
                        </div>
                      </div>
                      <div>
                        <div className={styles.resourceName}>
                          <span>GPU</span>
                          <em>8 / 16</em>
                        </div>
                        <div className={styles.resourceProgress}>
                          <div className={styles.resourceProgressActionBar}></div>
                          <div className={styles.resourceProgressBar}></div>
                        </div>
                      </div>
                      <div>
                        <div className={styles.resourceName}>
                          <span>Memory</span>
                          <em>185 / 400</em>
                        </div>
                        <div className={styles.resourceProgress}>
                          <div className={styles.resourceProgressActionBar}></div>
                          <div className={styles.resourceProgressBar}></div>
                        </div>
                      </div>
                      <div>
                        <div className={styles.resourceName}>
                          <span>파일 시스템</span>
                          <em>209 / 488</em>
                        </div>
                        <div className={styles.resourceProgress}>
                          <div className={styles.resourceProgressActionBar}></div>
                          <div className={styles.resourceProgressBar}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 서비스 모니터링 */}
          <div className="page-detail-round-box page-flex-1">
            <div className="page-detail-round-name">서비스 모니터링</div>
            <div className="page-detail-round-data">
              <div className="page-content-detail-row2">
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">
                    총 메시지 수 Top 5
                    <button type="button" className="btn-more">
                      <IconMore />
                      <span>바로가기</span>
                    </button>
                  </div>
                  <div className="page-detail-round-data page-h-177">
                    <div className={styles.msgBox}>
                      <div>
                        <span>나의 서비스 01</span>
                        <em>10,000</em>
                      </div>
                      <div>
                        <span>나의 서비스 02</span>
                        <em>8,500</em>
                      </div>
                      <div>
                        <span>나의 서비스 03</span>
                        <em>5,400</em>
                      </div>
                      <div>
                        <span>나의 서비스 04</span>
                        <em>3,000</em>
                      </div>
                      <div>
                        <span>나의 서비스 05</span>
                        <em>1,000</em>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">
                    총 메시지 수 Top 5
                    <button type="button" className="btn-more">
                      <IconMore />
                      <span>바로가기</span>
                    </button>
                  </div>
                  <div className="page-detail-round-data page-h-177">
                    <div className={styles.msgBox}>
                      <div>
                        <span>나의 서비스 01</span>
                        <em>10,000</em>
                      </div>
                      <div>
                        <span>나의 서비스 02</span>
                        <em>8,500</em>
                      </div>
                      <div>
                        <span>나의 서비스 03</span>
                        <em>5,400</em>
                      </div>
                      <div>
                        <span>나의 서비스 04</span>
                        <em>3,000</em>
                      </div>
                      <div>
                        <span>나의 서비스 05</span>
                        <em>1,000</em>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">
                    총 메시지 수 Top 5
                    <button type="button" className="btn-more">
                      <IconMore />
                      <span>바로가기</span>
                    </button>
                  </div>
                  <div className="page-detail-round-data page-h-177">
                    <div className={styles.msgBox}>
                      <div>
                        <span>나의 서비스 01</span>
                        <em>10,000</em>
                      </div>
                      <div>
                        <span>나의 서비스 02</span>
                        <em>8,500</em>
                      </div>
                      <div>
                        <span>나의 서비스 03</span>
                        <em>5,400</em>
                      </div>
                      <div>
                        <span>나의 서비스 04</span>
                        <em>3,000</em>
                      </div>
                      <div>
                        <span>나의 서비스 05</span>
                        <em>1,000</em>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
                  <div className="page-detail-round-name">
                    총 메시지 수 Top 5
                    <button type="button" className="btn-more">
                      <IconMore />
                      <span>바로가기</span>
                    </button>
                  </div>
                  <div className="page-detail-round-data page-h-177">
                    <div className={styles.msgBox}>
                      <div>
                        <span>나의 서비스 01</span>
                        <em>10,000</em>
                      </div>
                      <div>
                        <span>나의 서비스 02</span>
                        <em>8,500</em>
                      </div>
                      <div>
                        <span>나의 서비스 03</span>
                        <em>5,400</em>
                      </div>
                      <div>
                        <span>나의 서비스 04</span>
                        <em>3,000</em>
                      </div>
                      <div>
                        <span>나의 서비스 05</span>
                        <em>1,000</em>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="page-content-detail-row2">
            <div className="page-detail-round-box page-flex-1">
              <div className="page-detail-round-name">
                사용자
                <button type="button" className="btn-more">
                  <IconMore />
                  <span>바로가기</span>
                </button>
              </div>
              <div className="page-detail-round-data page-h-288">
                <UserTable />
              </div>
            </div>
            <div className="page-detail-round-box page-flex-1">
              <div className="page-detail-round-name">
                이벤트
                <button type="button" className="btn-more">
                  <IconMore />
                  <span>바로가기</span>
                </button>
              </div>
              <div className="page-detail-round-data page-h-288">
                <EventTable />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const userColumns = [
  {
    id: 'name',
    header: '이름',
    accessorFn: (row) => row.name,
    size: 200,
  },
  {
    id: 'role',
    header: '권한',
    accessorFn: (row) => row.role,
    size: 200,
  },
  {
    id: 'email',
    header: '이메일 주소',
    accessorFn: (row) => row.email,
    size: 200,
  },
  {
    id: 'date',
    header: '생성일시',
    accessorFn: (row) => row.date,
    size: 200,
  },
];

const userData = [
  {
    name: '홍길동',
    role: '어드민',
    email: 'test001@example.com',
    date: '2025-12-31 10:12',
  },
  {
    name: '홍길동',
    role: '어드민',
    email: 'test001@example.com',
    date: '2025-12-31 10:12',
  },
  {
    name: '홍길동',
    role: '어드민',
    email: 'test001@example.com',
    date: '2025-12-31 10:12',
  },
  {
    name: '홍길동',
    role: '어드민',
    email: 'test001@example.com',
    date: '2025-12-31 10:12',
  },
  {
    name: '홍길동',
    role: '어드민',
    email: 'test001@example.com',
    date: '2025-12-31 10:12',
  },
];

const UserTable = () => {
  return (
    <Table
      usePagination={false}
      columns={userColumns}
      data={userData}
      totalCount={userData.length}
    />
  );
};

const eventColumns = [
  {
    id: 'time',
    header: '시간',
    accessorFn: (row) => row.time,
    size: 200,
  },
  {
    id: 'type',
    header: '이벤트 타입',
    accessorFn: (row) => row.type,
    size: 200,
    cell: ({ row }) => (
      <span className="table-td-state table-td-state-run">{row.original.type}</span>
    ),
  },
  {
    id: 'content',
    header: '이벤트 내용',
    accessorFn: (row) => row.content,
    size: 200,
  },
  {
    id: 'resource',
    header: '대상 리소스',
    accessorFn: (row) => row.resource,
    size: 200,
  },
];

const eventData = [
  {
    time: '2025-12-31 10:12',
    type: 'NORMAL',
    content: 'Back-off restarting failed container',
    resource: 'fb98fd96c-vn6qq',
  },
  {
    time: '2025-12-31 10:12',
    type: 'NORMAL',
    content: 'Liveness probe failed.',
    resource: 'fb98fd96c-vn6qq',
  },
  {
    time: '2025-12-31 10:12',
    type: 'NORMAL',
    content: 'Deleted pod',
    resource: 'fb98fd96c-vn6qq',
  },
  {
    time: '2025-12-31 10:12',
    type: 'NORMAL',
    content: 'Deleted pod',
    resource: 'fb98fd96c-vn6qq',
  },
  {
    time: '2025-12-31 10:12',
    type: 'NORMAL',
    content: 'Deleted pod',
    resource: 'fb98fd96c-vn6qq',
  },
];

const EventTable = () => {
  return (
    <Table
      usePagination={false}
      columns={eventColumns}
      data={eventData}
      totalCount={eventData.length}
    />
  );
};
