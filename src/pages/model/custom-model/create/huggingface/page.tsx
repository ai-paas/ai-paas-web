import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  BreadCrumb,
  Tabs,
  Input,
  Button,
  Slider,
  Pagination,
  DropdownMenu,
  SearchInput,
  useSearchInputState,
} from '@innogrid/ui';
import { IconRefresh, IconAlign } from '../../../../../assets/img/icon';
import { useNavigate } from 'react-router';
import { useGetHubModels, useGetHubModelTagsByGroup } from '@/hooks/service/models';
import { formatCount } from '@/util/count';
import { formatRelativeTime } from '@/util/date';
import styles from '../../../model.module.scss';

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

export default function CustomModelCreateHuggingfacePage() {
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
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

  const { hubModels, page } = useGetHubModels({
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

  const handleModelSelect = useCallback((modelId: string) => {
    setSelectedModel(modelId);
  }, []);

  const handleCreateModel = useCallback(() => {
    if (selectedModel) {
      // TODO: Implement model creation logic
      console.log('Creating model:', selectedModel);
    }
  }, [selectedModel]);

  const handleCancel = useCallback(() => {
    navigate('/model/custom-model');
  }, [navigate]);

  return (
    <main>
      <BreadCrumb
        items={[
          { label: '모델' },
          { label: '커스텀 모델', path: '/model/custom-model' },
          { label: '커스텀 모델 생성' },
        ]}
        onNavigate={navigate}
        className="breadcrumbBox"
      />
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
                  size="m-large"
                  variant="default"
                  placeholder="검색어를 입력해주세요"
                  {...restProps}
                />
                <div className={styles.selectBtnBox}>
                  <DropdownMenu menus={sortMenus}>
                    <button type="button" className={`${styles.btnAlign} ${styles.active}`}>
                      <IconAlign className={styles.iconAlign} />
                      정렬: <span>{sortLabel}</span>
                    </button>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
          <div className={`${styles.descBodyBox} pb-6`}>
            <div className={styles.descContent}>
              {hubModels.map((model) => (
                <ModelItem
                  key={model.id}
                  model={model}
                  isActive={selectedModel === model.id}
                  onClick={() => handleModelSelect(model.id)}
                />
              ))}
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
  } = useGetHubModelTagsByGroup({
    market: 'huggingface',
    group: 'task',
  });
  const {
    hubModelTags: libraries,
    remaining_count: librariesRemainingCount,
    refetch: refetchLibraries,
  } = useGetHubModelTagsByGroup({
    market: 'huggingface',
    group: 'library',
  });
  const {
    hubModelTags: languages,
    remaining_count: languagesRemainingCount,
    refetch: refetchLanguages,
  } = useGetHubModelTagsByGroup({
    market: 'huggingface',
    group: 'language',
  });
  const [parameter, setParameter] = useState<number[]>([0, 100]);

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
    <div className={styles.flexContentLeft}>
      <Tabs
        className={styles.tabs}
        labels={[
          'Main',
          <div className="flex space-x-1">
            <span>Tasks</span>
            <Badge number={tasks?.length + tasksRemainingCount} />
          </div>,
          <div className="flex space-x-1">
            <span>Libraries</span>
            <Badge number={libraries?.length + librariesRemainingCount} />
          </div>,
          <div className="flex space-x-1">
            <span>Languages</span>
            <Badge number={languages?.length + languagesRemainingCount} />
          </div>,
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
          />,
          <FilterTab
            title="Tasks"
            items={tasks}
            refetch={refetchTasks}
            filter={filter}
            setFilter={setFilter}
            filterKey="task"
          />,
          <FilterTab
            title="Libraries"
            items={libraries}
            refetch={refetchLibraries}
            filter={filter}
            setFilter={setFilter}
            filterKey="library"
          />,
          <FilterTab
            title="Languages"
            items={languages}
            refetch={refetchLanguages}
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
}

const MainTab = ({
  tasks,
  libraries,
  languages,
  parameter,
  setParameter,
  filter,
  setFilter,
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
      />

      <div className={styles.inner}>
        <div className={styles.titleBox}>
          <p className={styles.leftTitle}>Parameters</p>
          <button type="button" className={styles.btnRefresh}>
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
      />

      <FilterSection
        title="Languages"
        items={languages}
        filter={filter}
        filterKey="language"
        initialDisplayLimit={12}
        onItemClick={handleItemClick}
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
}

const FilterSection = ({
  title,
  items,
  filter,
  filterKey,
  initialDisplayLimit,
  onItemClick,
}: FilterSectionProps) => {
  const [displayLimit, setDisplayLimit] = useState(initialDisplayLimit);

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
        <button type="button" className={styles.btnRefresh}>
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
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  filterKey: 'task' | 'library' | 'language';
}

const FilterTab = ({ title, items, refetch, filter, setFilter, filterKey }: FilterTabProps) => {
  const [search, setSearch] = useState('');

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
        setFilter({ ...filter, task: itemId });
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
          <button type="button" onClick={refetch} className={styles.btnRefresh}>
            <IconRefresh />
          </button>
        </div>
        <Input
          size={{ width: '300px', height: '32px' }}
          placeholder="검색어를 입력해주세요."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.chipBox}>
          {filteredItems?.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item.id)}
              className={`${styles.chip} ${isItemActive(item.id) ? styles.active : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const Badge = ({ number }: { number?: number }) => {
  if (!number) return null;

  if (number < 100) {
    return <span className={styles.chkMark}>{number}</span>;
  }

  return <div className={`${styles.chkMark} ${styles.active}`}>99+</div>;
};

interface ModelItemProps {
  model: {
    modelId: string;
    task: string;
    parameterDisplay: string;
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
          <div>{model.task}</div>
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
