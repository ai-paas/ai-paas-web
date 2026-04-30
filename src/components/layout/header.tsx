import { IcoAlert, IcoMy, IcoSet } from '../../assets/img/header';
import Logo from '../../assets/img/header/logo.svg';
import styles from './header.module.scss';
import { Link } from 'react-router';

export const Header = () => {
  return (
    <header>
      <div className={styles.headerBox}>
        <Link to="/">
          <span className={styles.logo}><Logo /></span>
        </Link>
        <div className={styles.utilBox}>
          <div className={styles.btnBox}>
            <button type="button" className={styles.btnIcon}>
              <IcoSet />
            </button>
            {/* 알림 버튼에 새로운 알림이 있을때 클래스네임 new 추가 */}
            <button type="button" className={`${styles.btnIcon} ${styles.btnAlert}`}>
              {/* ${styles.new} */}
              <IcoAlert />
            </button>
          </div>
          <button type="button" className={styles.btnMy}>
            <IcoMy />
          </button>
        </div>
      </div>
    </header>
  );
};
