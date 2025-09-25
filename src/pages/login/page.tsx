import { useState, type FormEvent } from "react";
import { Button, Input, Password } from "@innogrid/ui";
import Logo from "../../assets/img/header/logo.svg";
import styles from "./login.module.scss";
import { useLogin } from "../../hooks/service/authentication";
import { Navigate, useNavigate } from "react-router";
import { LOCAL_STORAGE } from "../../constant/local-storage";

export default function LoginPage() {
  const accessToken = localStorage.getItem(LOCAL_STORAGE.ACCESS_TOKEN);
  const [memberId, setMemberId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { mutate: login, isPending } = useLogin();
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    login(
      { member_id: memberId, password: password },
      {
        onSuccess: (data) => {
          localStorage.setItem(LOCAL_STORAGE.ACCESS_TOKEN, data.access_token);
          localStorage.setItem(LOCAL_STORAGE.REFRESH_TOKEN, data.refresh_token);

          navigate("/service");
        },
        onError: (error) => {
          let message = "로그인에 실패했습니다.";
          console.log(error);

          if (
            error.message.includes("401") ||
            error.message.includes("Unauthorized")
          ) {
            message = "아이디 또는 비밀번호를 확인해주세요.";
          } else if (error.message.includes("Network")) {
            message = "네트워크 연결을 확인해주세요.";
          }

          setErrorMessage(message);
        },
      },
    );
  };

  if (accessToken) {
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
            <span>아이디</span>
            <div className={`${styles.inputBox} ${styles.idInput}`}>
              <Input
                placeholder="아이디를 입력해주세요."
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                size={{ width: "452px", height: "46px" }}
                variant={errorMessage ? "err" : "default"}
                errMessage={errorMessage}
              />
              {memberId && (
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setMemberId("")}
                  className={styles.btnDel}
                >
                  <span>삭제</span>
                </button>
              )}
            </div>
          </div>
          <div>
            <span>비밀번호</span>
            <div className={styles.inputBox}>
              <Password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size={{ width: "452px", height: "46px" }}
                variant={errorMessage ? "err" : "default"}
                errMessage={errorMessage}
              />
            </div>
          </div>
        </div>
        <div className={styles.btnBox}>
          <Button disabled={isPending} color="primary" size="large">
            로그인
          </Button>
        </div>
      </form>
      <p className={styles.copyright}>
        © 2025 Innogrid. All rights reserved copyright.
      </p>
    </main>
  );
}
