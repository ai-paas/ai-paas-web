import { useState, useMemo, useEffect } from 'react';
import {
  BreadCrumb,
  Button,
  Pagination,
  SearchInput,
  Select,
  useSearchInputState,
  type SelectSingleValue,
} from '@innogrid/ui';
import { useNavigate, useSearchParams } from 'react-router';

import styles from '../../inframonitor.module.scss';
import { useGetCatalog } from '@/hooks/service/catalog';
import { useGetHelmRepositories } from '@/hooks/service/helm';
import type { Chart } from '@/types/catalog';

//breadcrumb
const items = [{ label: '인프라 모니터' }, { label: '애플리케이션' }, { label: '카탈로그' }];

//select option
type OptionType = { text: string; value: string };

// 키워드 토글 상태를 관리하는 컴포넌트
const CatalogItem = ({ chart }: { chart: Chart }) => {
  const navigate = useNavigate();
  const [expandedKeywords, setExpandedKeywords] = useState<Set<number>>(new Set());
  const [imageError, setImageError] = useState(false);
  const MAX_VISIBLE_KEYWORDS = 5;

  const toggleKeywordExpansion = (index: number) => {
    setExpandedKeywords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const visibleKeywords = chart.keywords?.slice(0, MAX_VISIBLE_KEYWORDS) ?? [];
  const remainingKeywords = chart.keywords?.slice(MAX_VISIBLE_KEYWORDS) ?? [];
  const hasMoreKeywords = remainingKeywords.length > 0;
  const isExpanded = expandedKeywords.has(0);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // 이미 한 번 실패했으면 더 이상 시도하지 않음
    if (!imageError) {
      setImageError(true);
      // 이미지를 숨기거나 투명 이미지로 변경 (무한 루프 방지)
      const img = e.target as HTMLImageElement;
      img.style.display = 'none';
    }
  };

  return (
    <div className={styles.catalogBox}>
      <div className={styles.catalogInfo}>
        <div className={styles.catalogImg}>
          {!imageError && chart.icon ? (
            <img
              src={chart.icon}
              alt={chart.name}
              style={{
                width: '84px',
                height: '84px',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
              }}
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <div
              style={{
                width: '84px',
                height: '84px',
                backgroundColor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                border: '1px solid #e0e0e0',
                color: '#999',
                fontSize: '12px',
              }}
            >
              No Image
            </div>
          )}
        </div>
        <div className={styles.catalogDesc}>
          <div>
            <div className={styles.catalogTit}>
              <p>{chart.name}</p>
              <span>{chart.version}</span>
            </div>
            <div className={styles.catalogTxt}>{chart.description}</div>
          </div>
          {chart.keywords && chart.keywords.length > 0 && (
            <div className={styles.catalogKeyword}>
              <div className={styles.catalogKeywordDetail}>
                {visibleKeywords.map((keyword, idx) => (
                  <span key={idx}>{keyword}</span>
                ))}
              </div>
              {hasMoreKeywords && (
                <>
                  <button
                    type="button"
                    className={styles.btnKeywordNum}
                    onClick={() => toggleKeywordExpansion(0)}
                  >
                    +{remainingKeywords.length}
                  </button>
                  {isExpanded && (
                    <div className={styles.keywordNumList}>
                      {remainingKeywords.map((keyword, idx) => (
                        <span key={idx}>{keyword}</span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <div className={styles.catalogBtns}>
        <Button
          onClick={() => navigate(`/infra-management/application/catalog/${chart.name}`)}
          color="secondary"
        >
          상세 정보
        </Button>
        <Button onClick={() => alert('Button clicked!')} color="focus">
          헬름 배포
        </Button>
      </div>
    </div>
  );
};

export default function ApplicationCatalogPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const repositoryParam = searchParams.get('repository');
  const [selectedValue, setSelectedValue] = useState<OptionType>();

  const { repositories, isPending: isRepositoriesPending } = useGetHelmRepositories();

  // 헬름 저장소 목록을 Select 옵션으로 변환
  const repositoryOptions = useMemo<OptionType[]>(() => {
    return (repositories || []).map((repo) => ({
      text: repo.name ?? '-',
      value: repo.name ?? '',
    }));
  }, [repositories]);

  // repository 파라미터와 옵션 목록을 기반으로 기본 선택값을 동기화
  useEffect(() => {
    if (repositoryOptions.length === 0) return;

    const matched = repositoryParam
      ? repositoryOptions.find((opt) => opt.value === repositoryParam)
      : undefined;
    const nextValue = matched ?? repositoryOptions[0];

    if (!nextValue) return;

    if (!selectedValue || selectedValue.value !== nextValue.value) {
      setSelectedValue(nextValue);
    }

    if (!repositoryParam || repositoryParam !== nextValue.value) {
      setSearchParams({ repository: nextValue.value });
    }
  }, [repositoryOptions, repositoryParam, selectedValue, setSearchParams]);

  const onChangeSelect = (option: SelectSingleValue<OptionType>) => {
    if (option) {
      setSelectedValue(option);
      setSearchParams({ repository: option.value });
    } else {
      setSelectedValue(undefined);
      setSearchParams({});
    }
  };

  //SearchInput
  const { searchValue, ...restProps } = useSearchInputState();

  const selectedRepoName = selectedValue?.value || '';
  const { charts, isPending, isError } = useGetCatalog(selectedRepoName);

  // 검색 및 필터링
  const filteredCharts = useMemo(() => {
    if (!charts) return [];
    let result = charts;

    if (searchValue) {
      result = result.filter(
        (chart) =>
          chart.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          chart.description.toLowerCase().includes(searchValue.toLowerCase()) ||
          chart.keywords.some((keyword) =>
            keyword.toLowerCase().includes(searchValue.toLowerCase())
          )
      );
    }

    return result;
  }, [charts, searchValue]);

  //pagination
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const pageSizeOption = [10, 15, 20, 30, 50, 100, 500];

  const paginatedCharts = useMemo(() => {
    const start = (page - 1) * size;
    const end = start + size;
    return filteredCharts.slice(start, end);
  }, [filteredCharts, page, size]);

  const totalCount = filteredCharts.length;

  if (isRepositoriesPending || (!!selectedRepoName && isPending)) {
    return (
      <main>
        <div className="breadcrumbBox">
          <BreadCrumb items={items} onNavigate={() => {}} />
        </div>
        <div className="page-title-box">
          <h2 className="page-title">카탈로그</h2>
        </div>
        <div className="page-content">
          <div style={{ padding: '24px', textAlign: 'center' }}>로딩 중...</div>
        </div>
      </main>
    );
  }

  if (repositoryOptions.length === 0) {
    return (
      <main>
        <div className="breadcrumbBox">
          <BreadCrumb items={items} onNavigate={() => {}} />
        </div>
        <div className="page-title-box">
          <h2 className="page-title">카탈로그</h2>
        </div>
        <div className="page-content">
          <div
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div style={{ color: '#666' }}>
              등록된 헬름 저장소가 없습니다. 저장소를 먼저 추가해 주세요.
            </div>
            <Button
              color="focus"
              onClick={() => navigate('/infra-management/application/helm-repository')}
            >
              헬름 저장소 관리
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main>
        <div className="breadcrumbBox">
          <BreadCrumb items={items} onNavigate={() => {}} />
        </div>
        <div className="page-title-box">
          <h2 className="page-title">카탈로그</h2>
        </div>
        <div className="page-content">
          <div style={{ padding: '24px', textAlign: 'center', color: 'red' }}>
            데이터를 불러오는 중 오류가 발생했습니다.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb items={items} onNavigate={() => {}} />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">카탈로그</h2>
      </div>
      <div className="page-content">
        <div className={styles.flexBox}>
          <Select
            options={repositoryOptions}
            getOptionLabel={(option) => option.text}
            getOptionValue={(option) => option.value}
            value={selectedValue}
            onChange={onChangeSelect}
            isLoading={isRepositoriesPending}
            placeholder="저장소를 선택해주세요"
            size="small"
          />
          <SearchInput size="medium" placeholder="검색어를 입력해주세요" {...restProps} />
        </div>
        <div className="page-content-detail-row2 page-mt-24 flex-wrap">
          {paginatedCharts.length > 0 ? (
            paginatedCharts.map((chart, index) => (
              <CatalogItem key={`${chart.name}-${index}`} chart={chart} />
            ))
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', width: '100%' }}>
              검색 결과가 없습니다.
            </div>
          )}
        </div>
        {totalCount > 0 && (
          <div className={styles.paginationBox}>
            <Pagination
              page={page}
              pageSizeOption={pageSizeOption}
              size={size}
              totalCount={totalCount}
              onChangePageInput={(event) => setPage(+event.target.value)}
              onChangePageSize={(event) => {
                setSize(+event.target.value);
                setPage(1); // 페이지 크기 변경 시 첫 페이지로 이동
              }}
              onClickNext={() => setPage(page + 1)}
              onClickPrev={() => setPage(page - 1)}
            />
          </div>
        )}
      </div>
    </main>
  );
}
