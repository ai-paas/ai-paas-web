import { useRef, useState, type FormEvent } from 'react';
import { Button, Input, Password } from '@innogrid/ui';
import Logo from '../../assets/img/header/logo.svg';
import styles from './login.module.scss';
import { useLogin } from '../../hooks/service/authentication';
import { Navigate, useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';

const MEMBER_ID_INPUT_ID = 'member-id';
const PASSWORD_INPUT_ID = 'password';
const LOGIN_ERROR_ID = 'login-error';

export default function LoginPage() {
  const { isAuthenticated, setAccessToken } = useAuth();
  const [memberId, setMemberId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { mutate: login, isPending } = useLogin();
  const navigate = useNavigate();
  const memberIdInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');

    login(
      { member_id: memberId, password: password },
      {
        onSuccess: (data) => {
          setAccessToken(data.access_token);

          navigate('/service');
        },
        onError: (error) => {
          let message = error.message || '로그인에 실패했습니다.';

          if (error.message.includes('HTTP 401')) {
            message = '아이디 또는 비밀번호를 확인해주세요.';
          } else if (/Network|Failed to fetch|fetch failed/i.test(error.message)) {
            message = '네트워크 연결을 확인해주세요.';
          }

          setErrorMessage(message);
        },
      }
    );
  };

  const handleClearMemberId = () => {
    setMemberId('');
    memberIdInputRef.current?.focus();
  };

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <main className={styles.loginMain}>
      <form onSubmit={handleSubmit} className={styles.loginBox}>
        <div>
          <Logo />
        </div>
        <p>로그인</p>
        <div className={styles.loginInputBox}>
          <div>
            <label htmlFor={MEMBER_ID_INPUT_ID}>아이디</label>
            <div className={`${styles.inputBox} ${styles.idInput}`}>
              <Input
                ref={memberIdInputRef}
                id={MEMBER_ID_INPUT_ID}
                name="username"
                autoComplete="username"
                placeholder="아이디를 입력해주세요."
                value={memberId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMemberId(e.target.value)}
                size="large"
                customSize={{ width: '100%', height: '48px' }}
                variant={errorMessage ? 'err' : 'default'}
                aria-invalid={Boolean(errorMessage)}
                aria-describedby={errorMessage ? LOGIN_ERROR_ID : undefined}
              />
              {memberId && (
                <button
                  type="button"
                  aria-label="아이디 지우기"
                  onClick={handleClearMemberId}
                  className={styles.btnDel}
                />
              )}
            </div>
          </div>
          <div>
            <label htmlFor={PASSWORD_INPUT_ID}>비밀번호</label>
            <div className={styles.inputBox}>
              <Password
                id={PASSWORD_INPUT_ID}
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                size="large"
                customSize={{ width: '100%', height: '48px' }}
                variant={errorMessage ? 'err' : 'default'}
                aria-invalid={Boolean(errorMessage)}
                aria-describedby={errorMessage ? LOGIN_ERROR_ID : undefined}
              />
            </div>
            {errorMessage && (
              <p id={LOGIN_ERROR_ID} role="alert" className={styles.errorMessage}>
                {errorMessage}
              </p>
            )}
          </div>
        </div>
        <div className={styles.btnBox}>
          <Button disabled={isPending} color="primary" size="large">
            로그인
          </Button>
        </div>
      </form>
      <p className={styles.copyright}>© 2026 Innogrid. All rights reserved copyright.</p>
    </main>
  );
}
