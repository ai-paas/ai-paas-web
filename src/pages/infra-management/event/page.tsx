import { IconEventOff, IconEventOn, IconPlay, IconStop } from '@/assets/img/icon';
import { BreadCrumb, Select, type SelectSingleValue } from '@innogrid/ui';
import { useState } from 'react';
import styles from '../inframonitor.module.scss';

//select option
type OptionType = { text: string; value: string };

const options = [
  { text: '옵션 1', value: 'option1' },
  { text: '옵션 2', value: 'option2' },
  { text: '옵션 3', value: 'option3' },
];

export default function EventPage() {
  //select
  const [selectedValue, setSelectedValue] = useState<OptionType>();

  const onChangeSelect = (option: SelectSingleValue<OptionType>) => {
    setSelectedValue(option ?? undefined);
  };

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb items={[{ label: '인프라 모니터' }, { label: '이벤트' }]} />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">이벤트</h2>
      </div>
      <div className="page-content">
        <Select
          classNames={{ container: () => 'page-input_item-data_select' }}
          options={options}
          getOptionLabel={(option: OptionType) => option.text}
          getOptionValue={(option: OptionType) => option.value}
          value={selectedValue}
          onChange={onChangeSelect}
        />
        <div className={styles.eventBox}>
          <div className={styles.btnBox}>
            <button type="button" className={styles.btnPlay}>
              <span className={styles.iconPlay}>
                <IconPlay />
              </span>
              스트리밍 시작
            </button>
            <button type="button" className={styles.btnStop}>
              <span className={styles.iconStop}>
                <IconStop />
              </span>
              스트리밍 일시정지
            </button>
          </div>
          <div className={styles.palyBox}>
            <hr className={styles.leftLine} />
            <div className={styles.cardBoxLeftInner}>
              <div className={styles.cardBoxLeft}>
                <span className={styles.iconEventOn}>
                  <IconEventOn />
                </span>
                <div className={`${styles.card} ${styles.warning}`}>
                  <div className={styles.state}>
                    <div className="table-td-state table-td-state-warning">Warning</div>
                    <span>2025-07-29 10:32</span>
                  </div>
                  <p>Pod/testqa-1748395270316-565cd67b6d-fj2lg</p>
                  <span>Pulling image "testqa"</span>
                </div>
              </div>
              <div className={styles.cardBoxLeft}>
                <span className={styles.iconEventOn}>
                  <IconEventOn />
                </span>
                <div className={`${styles.card} ${styles.warning}`}>
                  <div className={styles.state}>
                    <div className="table-td-state table-td-state-warning">Warning</div>
                    <span>2025-07-29 10:32</span>
                  </div>
                  <p>Pod/testqa-1748395270316-565cd67b6d-fj2lg</p>
                  <span>Pulling image "testqa"</span>
                </div>
              </div>
              <div className={styles.cardBoxLeft}>
                <span className={styles.iconEventOff}>
                  <IconEventOff />
                </span>
                <div className={`${styles.card} ${styles.normal}`}>
                  <div className={styles.state}>
                    <div className="table-td-state table-td-state-run">Normal</div>
                    <span>2025-07-29 10:32</span>
                  </div>
                  <p>Pod/testqa-1748395270316-565cd67b6d-fj2lg</p>
                  <span>Pulling image "testqa"</span>
                </div>
              </div>
              <div className={styles.cardBoxLeft}>
                <span className={styles.iconEventOn}>
                  <IconEventOn />
                </span>
                <div className={`${styles.card} ${styles.warning}`}>
                  <div className={styles.state}>
                    <div className="table-td-state table-td-state-warning">Warning</div>
                    <span>2025-07-29 10:32</span>
                  </div>
                  <p>Pod/testqa-1748395270316-565cd67b6d-fj2lg</p>
                  <span>Pulling image "testqa"</span>
                </div>
              </div>
            </div>
            <div className={styles.cardBoxRightInner}>
              <div className={styles.cardBoxRight}>
                <span className={styles.iconEventOn}>
                  <IconEventOn />
                </span>
                <div className={`${styles.card} ${styles.warning}`}>
                  <div className={styles.state}>
                    <div className="table-td-state table-td-state-warning">Warning</div>
                    <span>2025-07-29 10:32</span>
                  </div>
                  <p>Pod/testqa-1748395270316-565cd67b6d-fj2lg</p>
                  <span>Pulling image "testqa"</span>
                </div>
              </div>
              <div className={styles.cardBoxRight}>
                <span className={styles.iconEventOff}>
                  <IconEventOff />
                </span>
                <div className={`${styles.card} ${styles.normal}`}>
                  <div className={styles.state}>
                    <div className="table-td-state table-td-state-run">Normal</div>
                    <span>2025-07-29 10:32</span>
                  </div>
                  <p>Pod/testqa-1748395270316-565cd67b6d-fj2lg</p>
                  <span>Pulling image "testqa"</span>
                </div>
              </div>
              <div className={styles.cardBoxRight}>
                <span className={styles.iconEventOff}>
                  <IconEventOff />
                </span>
                <div className={`${styles.card} ${styles.normal}`}>
                  <div className={styles.state}>
                    <div className="table-td-state table-td-state-run">Normal</div>
                    <span>2025-07-29 10:32</span>
                  </div>
                  <p>Pod/testqa-1748395270316-565cd67b6d-fj2lg</p>
                  <span>Pulling image "testqa"</span>
                </div>
              </div>
              <div className={styles.cardBoxRight}>
                <span className={styles.iconEventOn}>
                  <IconEventOn />
                </span>
                <div className={`${styles.card} ${styles.warning}`}>
                  <div className={styles.state}>
                    <div className="table-td-state table-td-state-warning">Warning</div>
                    <span>2025-07-29 10:32</span>
                  </div>
                  <p>Pod/testqa-1748395270316-565cd67b6d-fj2lg</p>
                  <span>Pulling image "testqa"</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
