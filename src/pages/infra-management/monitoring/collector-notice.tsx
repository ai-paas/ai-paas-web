import { Link } from 'react-router';

import styles from './collector-notice.module.scss';

type CollectorNoticeProps = {
  deviceName: string;
  addonName: string;
  clusterName?: string;
};

/**
 * 장치는 있는데 수집기가 없는 상태를 값 0 으로 보여 주면 "놀고 있다" 로 읽힌다.
 *
 * <p>장치가 없어서 안 보이는 것과 수집기가 없어서 안 보이는 것은 할 일이 다르다.
 */
export const CollectorNotice = ({ deviceName, addonName, clusterName }: CollectorNoticeProps) => (
  <div className={styles.notice} role="status">
    <div className={styles.title}>
      {deviceName} 는 있는데 지표가 들어오지 않습니다 — {addonName} 가 설치되지 않았습니다.
    </div>
    {clusterName && (
      <Link
        to={`/infra-management/cluster-management/${encodeURIComponent(clusterName)}/addons`}
        className="table-td-link"
      >
        애드온에서 설치하기 →
      </Link>
    )}
  </div>
);
