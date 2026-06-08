import { useEffect, useState, type ChangeEvent } from 'react';
import { BreadCrumb, Input, Button, Pagination } from '@innogrid/ui';

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

const pageSizeOption = [10, 15, 20, 30, 50, 100];

export default function CustomModelCreateKagglePage() {
  const navigate = useNavigate();
  //input
  const [value, setValue] = useState<string>('');

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  //sort
  const [sort, setSort] = useState<KaggleSort>('downloads');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortLabel = sortOptions.find((option) => option.value === sort)?.label ?? '';

  //selection
  const [selectedModel, setSelectedModel] = useState<HubModel | null>(null);

  //pagination
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const {
    hubModels,
    page: pageInfo,
    hasMore,
  } = useGetHubModels({
    market: 'kaggle',
    search: value,
    sort,
    page,
    limit: size,
  });

  // 검색어 변경 시 첫 페이지로
  useEffect(() => {
    setPage(1);
  }, [value]);

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
                <Input
                  size="large"
                  placeholder="검색어를 입력해주세요."
                  value={value}
                  onChange={onChange}
                />
                <div className={styles.selectBtnBox}>
                  <button
                    type="button"
                    className={`${styles.btnAlign} ${isSortOpen ? styles.active : ''}`}
                    onClick={() => setIsSortOpen((open) => !open)}
                  >
                    <span className={styles.iconAlign}>
                      <IconAlign />
                    </span>
                    정렬:<span>{sortLabel}</span>
                  </button>
                  <ul className={`${styles.selectOptionBox} ${isSortOpen ? styles.active : ''}`}>
                    {sortOptions.map((option) => (
                      <li
                        key={option.value}
                        className={`${styles.selectOption} ${sort === option.value ? styles.active : ''}`}
                        onClick={() => {
                          setSort(option.value);
                          setPage(1);
                          setIsSortOpen(false);
                        }}
                      >
                        {option.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.descBodyBox2}>
            <div className={styles.descContent}>
              {hubModels.length === 0 ? (
                <div className={styles.descInfoBox2}>모델이 없습니다.</div>
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
              page={page}
              pageSizeOption={pageSizeOption}
              size={size}
              totalCount={pageInfo.total}
              // Kaggle total 은 하한값이라 has_more 로 다음 페이지 존재를 판단
              totalPageCount={hasMore ? page + 1 : page}
              disabledPrevButton={page <= 1}
              disabledNextButton={!hasMore}
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
          <Button size="large" color="secondary" onClick={() => alert('Button clicked!')}>
            취소
          </Button>
          <Button size="large" color="primary" onClick={() => alert('Button clicked!')}>
            생성
          </Button>
        </div>
      </div>
    </main>
  );
}
