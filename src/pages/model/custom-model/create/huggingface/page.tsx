import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  BreadCrumb,
  Tabs,
  Input,
  Button,
  Slider,
  Pagination,
  DropdownMenu,
  SearchInput,
  Skeleton,
  useSearchInputState,
} from '@innogrid/ui';
import { IconRefresh, IconAlign } from '../../../../../assets/img/icon';
import { useNavigate } from 'react-router';
import { useGetHubModels, useGetHubModelTagsByGroup } from '@/hooks/service/models';
import { formatCount } from '@/util/count';
import { formatRelativeTime } from '@/util/date';
import styles from '../../../model.module.scss';
import type { HubModel } from '@/types/model';

// Types
type SortType = 'downloads' | 'created' | 'relevance';

interface FilterState {
  num_parameters_min: string | null;
  num_parameters_max: string | null;
  task: string;
  library: string[];
  language: string[];
}

interface TagItem {
  id: string;
  label: string;
}

const PARAMETER_MAP: Record<number, string> = {
  20: '6B',
  40: '12B',
  60: '32B',
  80: '128B',
};
const getParameterRangeValue = (
  min: number,
  max: number
): [string | null, string | null] | undefined => {
  let minValue: string | null = PARAMETER_MAP[min];
  let maxValue: string | null = PARAMETER_MAP[max];

  if (min === 100) minValue = '500B';
  if (max === 0) maxValue = '1B';

  return [minValue, maxValue];
};
const getParameterString = (value: number): string => {
  if (value === 0) return '<1B';
  if (value === 100) return '>500B';
  return PARAMETER_MAP[value] ?? null;
};

// Utility functions
const normalizeSearchText = (text: string): string => {
  return text.toLowerCase().replaceAll(' ', '').replaceAll('-', '').replaceAll('.', '');
};

const getSortLabel = (sort: SortType): string => {
  const sortLabels: Record<SortType, string> = {
    created: '최근 업데이트',
    downloads: '다운로드 수',
    relevance: '관련도',
  };
  return sortLabels[sort];
};

const toggleArrayItem = <T,>(array: T[], item: T): T[] => {
  return array.includes(item) ? array.filter((i) => i !== item) : [...array, item];
};

// Custom Hooks
const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [pageable, setPageable] = useState({ page: initialPage, limit: initialLimit });

  const handlePageChange = useCallback((page: number) => {
    setPageable((prev) => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((limit: number) => {
    setPageable((prev) => ({ ...prev, limit }));
  }, []);

  const resetPage = useCallback(() => {
    setPageable((prev) => ({ ...prev, page: 1 }));
  }, []);

  return {
    pageable,
    handlePageChange,
    handlePageSizeChange,
    resetPage,
  };
};

const useSort = (initialSort: SortType = 'downloads') => {
  const [sort, setSort] = useState<SortType>(initialSort);

  const sortLabel = useMemo(() => getSortLabel(sort), [sort]);

  const sortMenus = useMemo(
    () => [
      { label: '다운로드 수', onSelect: () => setSort('downloads') },
      { label: '최근 업데이트', onSelect: () => setSort('created') },
      { label: '관련도', onSelect: () => setSort('relevance') },
    ],
    []
  );

  return { sort, sortLabel, sortMenus };
};

// 탭 리스트(role=tablist)를 마우스로 좌우 드래그해 스크롤
const useDragScrollTabs = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = ref.current?.querySelector<HTMLElement>('[role="tablist"]');
    if (!list) return;

    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    let moved = false;

    const onPointerDown = (e: PointerEvent) => {
      isDown = true;
      moved = false;
      startX = e.pageX;
      startScroll = list.scrollLeft;
      list.classList.add(styles.dragging);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDown) return;
      const dx = e.pageX - startX;
      if (Math.abs(dx) > 3) moved = true;
      list.scrollLeft = startScroll - dx;
    };
    const onPointerUp = () => {
      isDown = false;
      list.classList.remove(styles.dragging);
    };
    // 드래그 직후 탭이 선택되지 않도록 클릭 차단
    const onClickCapture = (e: MouseEvent) => {
      if (moved) {
        e.stopPropagation();
        e.preventDefault();
        moved = false;
      }
    };

    list.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    list.addEventListener('click', onClickCapture, true);
    return () => {
      list.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      list.removeEventListener('click', onClickCapture, true);
    };
  }, []);

  return ref;
};

// 새로고침 클릭 시 최소 1회전(애니메이션 1주기)은 보이도록 보장.
// 응답이 너무 빨라 isFetching이 순간적으로만 true여도 회전이 보인다.
const REFRESH_SPIN_MS = 800;
const useRefreshSpin = (onRefresh: () => void, isFetching?: boolean) => {
  const [minSpin, setMinSpin] = useState(false);

  const handleRefresh = useCallback(() => {
    onRefresh();
    setMinSpin(true);
  }, [onRefresh]);

  useEffect(() => {
    if (!minSpin) return;
    const timer = setTimeout(() => setMinSpin(false), REFRESH_SPIN_MS);
    return () => clearTimeout(timer);
  }, [minSpin]);

  // 최소 회전 시간이 지나도 아직 fetch 중이면 계속 회전
  return { spinning: minSpin || !!isFetching, handleRefresh };
};

// 로딩 중 모델 카드(descInfoBox) 레이아웃에 맞춘 스켈레톤
const SKELETON_COUNT = 30;
function ModelCardSkeleton() {
  return (
    <div className={styles.descInfoBox}>
      {/* 제목 <p> 줄 높이: 13px * 1.5 = 19.5px */}
      <Skeleton variant="slide" style={{ width: 280, height: 20, borderRadius: 4 }} />
      <div className={styles.descInfo}>
        {Array.from({ length: 5 }).map((_, i) => (
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

export default function CustomModelCreateHuggingfacePage() {
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState<HubModel | null>(null);
  const { searchValue, ...restProps } = useSearchInputState();
  const { sort, sortLabel, sortMenus } = useSort();
  const { pageable, handlePageChange, handlePageSizeChange, resetPage } = usePagination();
  const [filter, setFilter] = useState<FilterState>({
    task: '',
    num_parameters_min: null,
    num_parameters_max: null,
    library: [],
    language: [],
  });

  const { hubModels, page, isFetching, isError } = useGetHubModels({
    market: 'huggingface',
    sort,
    search: searchValue,
    ...pageable,
    ...filter,
  });

  useEffect(() => {
    if (searchValue) {
      resetPage();
    }
  }, [searchValue, resetPage]);

  const handleModelSelect = useCallback((model: HubModel) => {
    setSelectedModel(model);
  }, []);

  const handleCreateModel = useCallback(() => {
    if (selectedModel) {
      navigate('/model/custom-model/create', {
        state: { selectedModel, market: 'huggingface' },
      });
    }
  }, [selectedModel]);

  const handleCancel = useCallback(() => {
    navigate('/model/custom-model');
  }, [navigate]);

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb
          items={[
            { label: '모델' },
            { label: '커스텀 모델', path: '/model/custom-model' },
            { label: '커스텀 모델 생성' },
          ]}
          onNavigate={navigate}
        />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">커스텀 모델 생성 - 허깅페이스 연동</h2>
      </div>
      <div className={styles.flexContent}>
        <FilterPanel filter={filter} setFilter={setFilter} />
        <div className={styles.flexContentDesc}>
          <div className={styles.descTopBox}>
            <p className={styles.descTitle}>
              모델<span>{page.total.toLocaleString()}</span>
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
          <div className={`${styles.descBodyBox} pb-6`}>
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
                    다른 검색어나 필터 조건으로 다시 시도해보세요.
                  </p>
                </div>
              ) : (
                hubModels.map((model) => (
                  <ModelItem
                    key={model.id}
                    model={model}
                    isActive={selectedModel?.id === model.id}
                    onClick={() => handleModelSelect(model)}
                  />
                ))
              )}
            </div>
            <Pagination
              pageSizeOption={[10, 15, 20, 30, 50, 100, 500]}
              page={pageable.page}
              size={pageable.limit}
              totalCount={page.total}
              onChangePageInput={(event) => handlePageChange(+event.target.value)}
              onChangePageSize={(event) => handlePageSizeChange(+event.target.value)}
              onClickNext={() => handlePageChange(pageable.page + 1)}
              onClickPrev={() => handlePageChange(pageable.page - 1)}
            />
          </div>
        </div>
      </div>
      <div className={`page-footer ${styles.footer}`}>
        <div className="page-footer_btn-box">
          <Button size="large" color="secondary" onClick={handleCancel}>
            취소
          </Button>
          <Button
            size="large"
            color="primary"
            disabled={!selectedModel}
            onClick={handleCreateModel}
          >
            생성
          </Button>
        </div>
      </div>
    </main>
  );
}

interface FilterPanelProps {
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
}

const FilterPanel = ({ filter, setFilter }: FilterPanelProps) => {
  const {
    hubModelTags: tasks,
    remaining_count: tasksRemainingCount,
    refetch: refetchTasks,
    isFetching: isTasksFetching,
  } = useGetHubModelTagsByGroup({
    market: 'huggingface',
    group: 'task',
  });
  const {
    hubModelTags: libraries,
    remaining_count: librariesRemainingCount,
    refetch: refetchLibraries,
    isFetching: isLibrariesFetching,
  } = useGetHubModelTagsByGroup({
    market: 'huggingface',
    group: 'library',
  });
  const {
    hubModelTags: languages,
    remaining_count: languagesRemainingCount,
    refetch: refetchLanguages,
    isFetching: isLanguagesFetching,
  } = useGetHubModelTagsByGroup({
    market: 'huggingface',
    group: 'language',
  });
  const [parameter, setParameter] = useState<number[]>([0, 100]);
  const tabsRef = useDragScrollTabs();

  useEffect(() => {
    const [min, max] = parameter;
    const [num_parameters_min, num_parameters_max] = getParameterRangeValue(min, max) ?? [
      null,
      null,
    ];
    setFilter((prev) => ({
      ...prev,
      num_parameters_min,
      num_parameters_max,
    }));
  }, [parameter]);

  return (
    <div className={styles.flexContentLeft} ref={tabsRef}>
      <Tabs
        className={styles.tabs}
        labels={[
          'Main',
          `Tasks${(tasks?.length ?? 0) + (tasksRemainingCount ?? 0) > 0 ? ` (${(tasks?.length ?? 0) + (tasksRemainingCount ?? 0)})` : ''}`,
          `Libraries${(libraries?.length ?? 0) + (librariesRemainingCount ?? 0) > 0 ? ` (${(libraries?.length ?? 0) + (librariesRemainingCount ?? 0)})` : ''}`,
          `Languages${(languages?.length ?? 0) + (languagesRemainingCount ?? 0) > 0 ? ` (${(languages?.length ?? 0) + (languagesRemainingCount ?? 0)})` : ''}`,
        ]}
        components={[
          <MainTab
            tasks={tasks}
            libraries={libraries}
            languages={languages}
            parameter={parameter}
            setParameter={setParameter}
            filter={filter}
            setFilter={setFilter}
            refetchTasks={refetchTasks}
            refetchLibraries={refetchLibraries}
            refetchLanguages={refetchLanguages}
            isTasksFetching={isTasksFetching}
            isLibrariesFetching={isLibrariesFetching}
            isLanguagesFetching={isLanguagesFetching}
          />,
          <FilterTab
            title="Tasks"
            items={tasks}
            refetch={refetchTasks}
            isRefreshing={isTasksFetching}
            filter={filter}
            setFilter={setFilter}
            filterKey="task"
          />,
          <FilterTab
            title="Libraries"
            items={libraries}
            refetch={refetchLibraries}
            isRefreshing={isLibrariesFetching}
            filter={filter}
            setFilter={setFilter}
            filterKey="library"
          />,
          <FilterTab
            title="Languages"
            items={languages}
            refetch={refetchLanguages}
            isRefreshing={isLanguagesFetching}
            filter={filter}
            setFilter={setFilter}
            filterKey="language"
          />,
        ]}
      />
    </div>
  );
};

interface MainTabProps {
  tasks: TagItem[] | undefined;
  libraries: TagItem[] | undefined;
  languages: TagItem[] | undefined;
  parameter: number[];
  setParameter: React.Dispatch<React.SetStateAction<number[]>>;
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  refetchTasks: () => void;
  refetchLibraries: () => void;
  refetchLanguages: () => void;
  isTasksFetching: boolean;
  isLibrariesFetching: boolean;
  isLanguagesFetching: boolean;
}

const MainTab = ({
  tasks,
  libraries,
  languages,
  parameter,
  setParameter,
  filter,
  setFilter,
  refetchTasks,
  refetchLibraries,
  refetchLanguages,
  isTasksFetching,
  isLibrariesFetching,
  isLanguagesFetching,
}: MainTabProps) => {
  const handleItemClick = useCallback(
    (filterKey: 'task' | 'library' | 'language', itemId: string) => {
      if (filterKey === 'task') {
        setFilter({
          ...filter,
          task: filter.task === itemId ? '' : itemId,
        });
      } else {
        setFilter({ ...filter, [filterKey]: toggleArrayItem(filter[filterKey], itemId) });
      }
    },
    [filter, setFilter]
  );

  return (
    <div>
      <FilterSection
        title="Tasks"
        items={tasks}
        filter={filter}
        filterKey="task"
        initialDisplayLimit={6}
        onItemClick={handleItemClick}
        onRefresh={refetchTasks}
        isRefreshing={isTasksFetching}
      />

      <div className={styles.inner}>
        <div className={styles.titleBox}>
          <p className={styles.leftTitle}>Parameters</p>
          {/* 슬라이더 범위를 기본값으로 리셋 */}
          <button
            type="button"
            onClick={() => setParameter([0, 100])}
            className={styles.btnRefresh}
          >
            <IconRefresh />
          </button>
        </div>
        <div className={styles.sliderBox}>
          <Slider
            showPointer
            showMarker
            step={20}
            minStepsBetweenThumbs={0}
            marker={6}
            valueFormatter={(value) => getParameterString(value)}
            value={parameter}
            onValueChange={setParameter}
          />
        </div>
      </div>

      <FilterSection
        title="Libraries"
        items={libraries}
        filter={filter}
        filterKey="library"
        initialDisplayLimit={10}
        onItemClick={handleItemClick}
        onRefresh={refetchLibraries}
        isRefreshing={isLibrariesFetching}
      />

      <FilterSection
        title="Languages"
        items={languages}
        filter={filter}
        filterKey="language"
        initialDisplayLimit={12}
        onItemClick={handleItemClick}
        onRefresh={refetchLanguages}
        isRefreshing={isLanguagesFetching}
      />
    </div>
  );
};

interface FilterSectionProps {
  title: string;
  items: TagItem[] | undefined;
  filter: FilterState;
  filterKey: 'task' | 'library' | 'language';
  initialDisplayLimit: number;
  onItemClick: (filterKey: 'task' | 'library' | 'language', itemId: string) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

const FilterSection = ({
  title,
  items,
  filter,
  filterKey,
  initialDisplayLimit,
  onItemClick,
  onRefresh,
  isRefreshing,
}: FilterSectionProps) => {
  const [displayLimit, setDisplayLimit] = useState(initialDisplayLimit);
  const { spinning, handleRefresh } = useRefreshSpin(onRefresh, isRefreshing);

  const isItemActive = (itemId: string) => {
    if (filterKey === 'task') {
      return filter.task === itemId;
    }
    return filter[filterKey].includes(itemId);
  };

  const handleShowMore = useCallback(() => {
    setDisplayLimit((prev) => prev + 9);
  }, []);

  const visibleItems = useMemo(() => items?.slice(0, displayLimit), [items, displayLimit]);
  const hasMore = items && items.length > displayLimit;

  return (
    <div className={styles.inner}>
      <div className={styles.titleBox}>
        <p className={styles.leftTitle}>{title}</p>
        <button
          type="button"
          onClick={handleRefresh}
          className={`${styles.btnRefresh} ${spinning ? styles.spinning : ''}`}
        >
          <IconRefresh />
        </button>
      </div>
      <div className={styles.chipBox}>
        {visibleItems?.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onItemClick(filterKey, item.id)}
            className={`!cursor-pointer ${styles.chip} ${isItemActive(item.id) ? styles.active : ''}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {hasMore && (
        <div className={styles.btnMore}>
          <Button size="medium" color="tertiary" onClick={handleShowMore}>
            더 보기
          </Button>
        </div>
      )}
    </div>
  );
};

interface FilterTabProps {
  title: string;
  items: TagItem[] | undefined;
  refetch: () => void;
  isRefreshing?: boolean;
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  filterKey: 'task' | 'library' | 'language';
}

const FilterTab = ({
  title,
  items,
  refetch,
  isRefreshing,
  filter,
  setFilter,
  filterKey,
}: FilterTabProps) => {
  const [search, setSearch] = useState('');
  const { spinning, handleRefresh } = useRefreshSpin(refetch, isRefreshing);

  const filteredItems = useMemo(
    () =>
      items?.filter((item) =>
        normalizeSearchText(item.label).includes(normalizeSearchText(search))
      ),
    [items, search]
  );

  const handleItemClick = useCallback(
    (itemId: string) => {
      if (filterKey === 'task') {
        setFilter({
          ...filter,
          task: filter.task === itemId ? '' : itemId,
        });
      } else {
        setFilter({ ...filter, [filterKey]: toggleArrayItem(filter[filterKey], itemId) });
      }
    },
    [filter, filterKey, setFilter]
  );

  const isItemActive = useCallback(
    (itemId: string) => {
      if (filterKey === 'task') {
        return filter.task === itemId;
      }
      return filter[filterKey].includes(itemId);
    },
    [filter, filterKey]
  );

  return (
    <div>
      <div className={styles.inner2}>
        <div className={styles.titleBox}>
          <p className={styles.leftTitle}>{title}</p>
          <button
            type="button"
            onClick={handleRefresh}
            className={`${styles.btnRefresh} ${spinning ? styles.spinning : ''}`}
          >
            <IconRefresh />
          </button>
        </div>
        <div style={{ width: '300px', height: '32px' }}>
          <Input
            placeholder="검색어를 입력해주세요."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.chipBox}>
          {filteredItems?.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item.id)}
              className={`${styles.chip} !cursor-pointer ${isItemActive(item.id) ? styles.active : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface ModelItemProps {
  model: {
    modelId: string;
    task: string;
    parameterDisplay: string | null;
    downloads: number;
    likes: number;
    lastModified: string;
  };
  isActive?: boolean;
  onClick: () => void;
}

const ModelItem = ({ model, isActive, onClick }: ModelItemProps) => {
  return (
    <div
      className={`${styles.descInfoBox} ${isActive ? styles.active : ''} cursor-pointer`}
      onClick={onClick}
    >
      <p>{model.modelId}</p>
      <div className={styles.descInfo}>
        <div>
          <span>Tasks</span>
          <div>{model.task || '-'}</div>
        </div>
        <div>
          <span>Parameters</span>
          <div>{model.parameterDisplay ?? 'N/A'}</div>
        </div>
        <div>
          <span>업데이트 날짜(경과일)</span>
          <div>업데이트 {formatRelativeTime(model.lastModified)}</div>
        </div>
        <div>
          <span>다운로드 수</span>
          <div>{formatCount(model.downloads)}</div>
        </div>
        <div>
          <span>좋아요 수</span>
          <div>{formatCount(model.likes)}</div>
        </div>
      </div>
    </div>
  );
};
