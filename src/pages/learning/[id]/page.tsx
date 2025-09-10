import { BreadCrumb, Button } from 'innogrid-ui';
import { IconChkGreen, IconErrRed } from '../../../assets/img/icon';
import styles from '../learning.module.scss';
import { useNavigate } from 'react-router';
import { EditLearningButton } from '../../../components/features/learning/edit-learning-button';
import { DeleteLearningButton } from '../../../components/features/learning/delete-learning-button';

export default function LearningDetailPage() {
  const navigate = useNavigate();

  return (
    <main>
      <BreadCrumb
        items={[{ label: '학습', path: '/learning' }, { label: '학습 생성' }]}
        onNavigate={navigate}
        className="breadcrumbBox"
      />
      <div className="page-title-box">
        <h2 className="page-title">학습 상세</h2>
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <EditLearningButton />
            <DeleteLearningButton />
            <Button onClick={() => alert('Button clicked!')} size="medium" color="primary">
              모델 등록
            </Button>
          </div>
        </div>
      </div>
      <div className="page-content page-pb-40">
        <h3 className="page-detail-title">상세 정보</h3>
        <div className="page-detail-list-box">
          {/* 최대 ul 3개, li 6개 사용 해주세요. */}
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-data">
                {/* 완료시 */}
                <div className={`${styles.conditionBox} ${styles.finish}`}>
                  <IconChkGreen />
                  <span>학습이 정상적으로 완료되었습니다.</span>
                </div>
              </div>
              <div className="page-detail_item-data">
                {/* 실패시 */}
                <div className={`${styles.conditionBox} ${styles.fail}`}>
                  <IconErrRed />
                  <span>[CUDA out of memory] 배치 사이즈가 너무 크거나, 모델이 너무 큽니다.</span>
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
            <li>
              <div className="page-detail_item-name">배포 서비스</div>
              <div className="page-detail_item-data">-</div>
            </li>
            <li>
              <div className="page-detail_item-name">설명</div>
              <div className="page-detail_item-data">설명이 들어갑니다. 설명이 들어갑니다.</div>
            </li>
          </ul>
        </div>
      </div>
      <div className="page-content page-content-detail">
        <h3 className="page-detail-title">학습 결과</h3>
        <div className="page-content-detail-col2">
          <div className="page-content-detail-row2">
            <div className="page-detail-round-box page-flex-1">
              <div className="page-detail-round-name">Accutacy</div>
              <div className="page-detail-round-data page-h-75">
                <em>75%</em>
              </div>
            </div>
            <div className="page-detail-round-box page-flex-1">
              <div className="page-detail-round-name">Precision</div>
              <div className="page-detail-round-data page-h-75">
                <em>-</em>
              </div>
            </div>
            <div className="page-detail-round-box page-flex-1">
              <div className="page-detail-round-name">Recall</div>
              <div className="page-detail-round-data page-h-75">
                <em>75%</em>
              </div>
            </div>
            <div className="page-detail-round-box page-flex-1">
              <div className="page-detail-round-name">Average Precision</div>
              <div className="page-detail-round-data page-h-75">
                <em>0.95</em>
              </div>
            </div>
            <div className="page-detail-round-box page-flex-1">
              <div className="page-detail-round-name">Loss</div>
              <div className="page-detail-round-data page-h-75">
                <em>0.34</em>
              </div>
            </div>
            <div className="page-detail-round-box page-flex-1">
              <div className="page-detail-round-name">Epochs</div>
              <div className="page-detail-round-data page-h-75">
                <em>-</em>
              </div>
            </div>
          </div>
          <div className="page-content-detail-row2">
            <div className="page-detail-round-box page-flex-1">
              <div className="page-detail-round-data page-h-400">차트 그래프 들어갑니다.</div>
            </div>
            <div className="page-detail-round-box page-flex-1">
              <div className="page-detail-round-data page-h-400">차트 그래프 들어갑니다.</div>
            </div>
          </div>
          <div className="page-content-detail-row2">
            <div className="page-detail-round-box page-flex-1">
              <div className="page-detail-round-data page-h-400">차트 그래프 들어갑니다.</div>
            </div>
            <div className="page-detail-round-box page-flex-1">
              <div className="page-detail-round-data page-h-400">차트 그래프 들어갑니다.</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
