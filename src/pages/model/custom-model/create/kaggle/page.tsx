import { useEffect, useState } from 'react';
import {
  BreadCrumb,
  Button,
  Pagination,
  Skeleton,
  DropdownMenu,
  SearchInput,
  useSearchInputState,
} from '@innogrid/ui';

import { IconAlign } from '../../../../../assets/img/icon';
import { useGetHubModels } from '@/hooks/service/models';
import type { HubModel } from '@/types/model';
import { formatCount } from '@/util/count';
import { formatDateTime } from '@/util/date';
import styles from '../../../model.module.scss';
import { useNavigate } from 'react-router';

// 정렬 옵션 (스펙상 Kaggle 지원 값: downloads / trending)
type KaggleSort = 'downloads' | 'trending';
const sortOptions: { value: KaggleSort; label: string }[] = [
  { value: 'downloads', label: '다운로드 수' },
  { value: 'trending', label: '트렌딩' },
];

// 로딩 중 모델 카드(descInfoBox2) 레이아웃에 맞춘 스켈레톤
const SKELETON_COUNT = 10;
function ModelCardSkeleton() {
  return (
    <div className={styles.descInfoBox2}>
      {/* 제목 <p> 줄 높이: 13px * 1.5 = 19.5px */}
      <Skeleton variant="slide" style={{ width: 280, height: 20, borderRadius: 4 }} />
      <div className={styles.descInfo}>
        {Array.from({ length: 4 }).map((_, i) => (
          // 라벨/값 줄 높이: 12px * 1.5 = 18px (gap 4 포함 컬럼 총 40px)
          <div key={i}>
            <Skeleton variant="slide" style={{ width: 56, height: 18, borderRadius: 4 }} />
            <Skeleton variant="slide" style={{ width: 80, height: 18, borderRadius: 4 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CustomModelCreateKagglePage() {
  const navigate = useNavigate();
  //input
  const { searchValue, ...restProps } = useSearchInputState();

  //sort
  const [sort, setSort] = useState<KaggleSort>('downloads');
  const sortLabel = sortOptions.find((option) => option.value === sort)?.label ?? '';
  const sortMenus = sortOptions.map((option) => ({
    label: option.label,
    onSelect: () => {
      setSort(option.value);
      setPage(1);
    },
  }));

  //selection
  const [selectedModel, setSelectedModel] = useState<HubModel | null>(null);

  //pagination
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const {
    hubModels,
    page: pageInfo,
    isFetching,
    isError,
  } = useGetHubModels({
    market: 'kaggle',
    search: searchValue,
    sort,
    page,
    limit: size,
  });

  // 검색어 변경 시 첫 페이지로
  useEffect(() => {
    setPage(1);
  }, [searchValue]);

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb
          items={[
            { label: '모델' },
            { label: '커스텀 모델', path: '/model/custom-model' },
            { label: 'Kaggle 연동' },
          ]}
          onNavigate={navigate}
        />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">커스텀 모델 생성 - Kaggle 연동</h2>
      </div>
      <div className={styles.flexContent}>
        <div className={styles.flexContentDesc2}>
          <div className={styles.descTopBox}>
            <p className={styles.descTitle}>
              모델<span>{formatCount(pageInfo.total)}</span>
            </p>
            <div className={styles.descSearch}>
              <span>모델 검색</span>
              <div className={styles.searchInputBox}>
                <SearchInput
                  size="large"
                  variant="default"
                  placeholder="검색어를 입력해주세요"
                  {...restProps}
                />
                <div className={styles.selectBtnBox}>
                  <DropdownMenu menus={sortMenus}>
                    <button type="button" className={`${styles.btnAlign} ${styles.active}`}>
                      <span className={styles.iconAlign}>
                        <IconAlign />
                      </span>
                      정렬: <span>{sortLabel}</span>
                    </button>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
          <div className={`${styles.descBodyBox2} pb-6`}>
            <div className={styles.descContent}>
              {isFetching ? (
                Array.from({ length: SKELETON_COUNT }).map((_, i) => <ModelCardSkeleton key={i} />)
              ) : isError ? (
                <div className={styles.descStateBox}>
                  <p className={styles.descStateText}>모델을 불러오지 못했습니다.</p>
                  <p className={styles.descStateSub}>잠시 후 다시 시도해주세요.</p>
                </div>
              ) : hubModels.length === 0 ? (
                <div className={styles.descStateBox}>
                  <p className={styles.descStateText}>검색 결과가 없습니다.</p>
                  <p className={styles.descStateSub}>
                    다른 검색어나 정렬 조건으로 다시 시도해보세요.
                  </p>
                </div>
              ) : (
                hubModels.map((model) => (
                  <div
                    key={model.id}
                    className={`${styles.descInfoBox2} ${selectedModel?.id === model.id ? styles.active : ''} cursor-pointer`}
                    onClick={() => setSelectedModel(model)}
                  >
                    <p>{model.modelId}</p>
                    <div className={styles.descInfo}>
                      <div>
                        <span>카테고리</span>
                        <div>{model.pipeline_tag || '-'}</div>
                      </div>
                      <div>
                        <span>등록일</span>
                        <div>
                          {model.createdAt ? formatDateTime(model.createdAt).split(' ')[0] : '-'}
                        </div>
                      </div>
                      <div>
                        <span>좋아요 수</span>
                        <div>{formatCount(model.likes)}</div>
                      </div>
                      <div>
                        <span>다운로드 수</span>
                        <div>{formatCount(model.downloads)}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Pagination
              pageSizeOption={[10, 15, 20, 30, 50, 100]}
              page={page}
              size={size}
              totalCount={pageInfo.total}
              onChangePageInput={(event) => setPage(+event.target.value)}
              onChangePageSize={(event) => setSize(+event.target.value)}
              onClickNext={() => setPage(page + 1)}
              onClickPrev={() => setPage(page - 1)}
            />
          </div>
        </div>
      </div>
      <div className={`page-footer ${styles.footer}`}>
        <div className="page-footer_btn-box">
          <Button size="large" color="secondary" onClick={() => navigate('/model/custom-model')}>
            취소
          </Button>
          <Button
            size="large"
            color="primary"
            disabled={!selectedModel}
            onClick={() => {
              if (selectedModel) {
                navigate('/model/custom-model/create', { state: { selectedModel } });
              }
            }}
          >
            생성
          </Button>
        </div>
      </div>
    </main>
  );
}
