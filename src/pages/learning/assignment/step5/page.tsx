import Lottie from "react-lottie";

import LoadingWhite from "../../../../assets/lottie/loding_white.json";
import { BreadCrumb } from "@innogrid/ui";

import styles from "../../learning.module.scss";

//breadcrumb
const items = [{ label: "학습", path: "/learning" }, { label: "학습 생성" }];

//lottie
const options = {
  loop: true,
  autoplay: true,
  animationData: LoadingWhite,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

export default function LearningAssignmentStep5Page() {
  return (
    <main>
      <BreadCrumb
        items={items}
        onNavigate={(path: string) => {}}
        className="breadcrumbBox"
      />
      <div className="page-title-box">
        <h2 className="page-title">학습 생성</h2>
      </div>
      <div className="page-content page-p-40">
        <div className="page-detail-list-box">
          {/* 최대 ul 3개, li 6개 사용 해주세요. */}
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-data">
                <div className={styles.conditionBox}>
                  <Lottie
                    width="16px"
                    height="16px"
                    style={{ margin: "0" }}
                    isClickToPauseDisabled={true}
                    options={options}
                  />
                  <span>학습 진행중...</span>
                </div>
              </div>
            </li>
            <li>
              <div className="page-detail_item-name">Epoch</div>
              <div className="page-detail_item-data">
                <div className={styles.progressBox}>
                  <div>6 / 10</div>
                  <div className={styles.progress}>
                    <div className={styles.progressActionBar}></div>
                    <div className={styles.progressBar}></div>
                  </div>
                </div>
              </div>
            </li>
            <li>
              <div className="page-detail_item-name">이름</div>
              <div className="page-detail_item-data">테스트 학습</div>
            </li>
            <li>
              <div className="page-detail_item-name">생성일시</div>
              <div className="page-detail_item-data">2025-12-31 10:12</div>
            </li>
            <li>
              <div className="page-detail_item-name">경과 시간</div>
              <div className="page-detail_item-data">00:45:12</div>
            </li>
          </ul>
        </div>
      </div>
      <div className="page-content page-content-detail">
        <div className="page-content-detail-row2">
          <div className="page-detail-round-box page-flex-1">
            <div className="page-detail-round-name">실시간 Loss 추이</div>
            <div className="page-detail-round-data page-h-488">
              차트 그래프 들어갑니다.
            </div>
          </div>
          <div className="page-detail-round-box page-flex-1">
            <div className="page-detail-round-name">로그</div>
            <div className="page-detail-round-data page-h-488">
              테이블 들어갑니다.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
