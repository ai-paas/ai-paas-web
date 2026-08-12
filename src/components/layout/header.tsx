import { DropdownMenu } from '@innogrid/ui';
import { IcoAlert, IcoMy, IcoSet } from '../../assets/img/header';
import Logo from '../../assets/img/header/logo.svg';
import styles from './header.module.scss';
import { Link } from 'react-router';
import { useAuth } from '@/hooks/useAuth';

export const Header = () => {
  const { logout } = useAuth();

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
          {/* 헤더가 fixed + z-index:1 이라 기본값(auto)이면 메뉴가 헤더에 가린다 */}
          <DropdownMenu menus={[{ label: '로그아웃', onSelect: () => logout() }]} align="end" zIndex={1000}>
            <button type="button" className={styles.btnMy} aria-label="내 계정">
              <IcoMy />
            </button>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
