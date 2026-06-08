import { motion } from 'framer-motion';
import { useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { IconMore } from '@/assets/img/icon';
import { useGetMeDashboardServices } from '@/hooks/service/dashboard';
import styles from '@/pages/dashboard/dashboard.module.scss';

// 한 행에 보이는 카드 수 / 카드 간 간격(px) — 카드 폭(1/N) 계산용
const VISIBLE_CARDS = 5;
const GAP = 16;

// 사용자: 나의 서비스 (GET /me/dashboard/services)
export const MyServiceCards = () => {
  const navigate = useNavigate();
  const { services } = useGetMeDashboardServices();

  const viewportRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(0);
  // 드래그로 움직인 직후의 클릭은 카드 이동으로 처리하지 않기 위한 플래그
  const dragged = useRef(false);

  // 뷰포트 폭 기준으로 카드 폭(보이는 카드 수만큼 균등 분할)을 계산
  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => setCardWidth((el.clientWidth - GAP * (VISIBLE_CARDS - 1)) / VISIBLE_CARDS);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
    // 데이터 로딩 후 뷰포트가 마운트되면 다시 측정
  }, [services.length]);

  const handleNavigate = (serviceId: string) => {
    if (dragged.current) return;
    navigate(`/service/${serviceId}`);
  };

  // 카드가 보이는 개수를 넘을 때(=오버플로)만 드래그 가능
  const isDraggable = services.length > VISIBLE_CARDS;

  if (services.length === 0) {
    return (
      <div className="page-content-detail-row2">
        <div className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0">
          <div className="page-detail-round-data page-h-130">
            <div className={styles.stateDataBox}>
              <div className={styles.stateDataEmpty}>서비스 없음</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={viewportRef}
      className={`${styles.myServiceViewport} ${isDraggable ? styles.draggable : ''}`}
    >
      <motion.div
        className={styles.myServiceTrack}
        drag={isDraggable ? 'x' : false}
        dragConstraints={viewportRef}
        dragElastic={0.08}
        onPointerDown={() => {
          dragged.current = false;
        }}
        onDragStart={() => {
          dragged.current = true;
        }}
      >
        {services.map((service) => (
          <div
            key={service.surro_service_id}
            style={{ width: cardWidth || undefined }}
            className={`page-detail-round-box page-detail-round-color page-mt-0 ${styles.myServiceCard}`}
          >
            <div className="page-detail-round-name">
              {service.name}
              <button
                type="button"
                className="btn-more"
                onClick={() => handleNavigate(service.surro_service_id)}
              >
                <IconMore />
                <span>바로가기</span>
              </button>
            </div>
            <div className="page-detail-round-data page-h-130">
              <div className={`${styles.stateDataBox} page-content-detail-col2`}>
                <div className={styles.stateDataText}>
                  <div className={styles.stateDataDesc}>
                    <span>워크플로우</span>
                    <em>{service.workflow_count}</em>
                  </div>
                  <div className={styles.stateDataDesc}>
                    <span>사용 모델</span>
                    <em>{service.model_count ?? '-'}</em>
                  </div>
                </div>
                <div className={styles.stateDataNoti}>{service.description || '-'}</div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};
