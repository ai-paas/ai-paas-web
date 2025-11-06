import { useEffect, useState } from 'react';
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

export default function CustomModelCreateHuggingfacePage() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const { searchValue, ...restProps } = useSearchInputState();
  const [sort, setSort] = useState<'downloads' | 'created' | 'relevance'>('downloads');
  const [pageable, setPageable] = useState({ page: 1, limit: 10 });
  const [filter, setFilter] = useState<{
    num_parameters_min?: string;
    num_parameters_max?: string;
    task: string;
    library: string[];
    language: string[];
  }>({
    task: '',
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
  const navigate = useNavigate();

  useEffect(() => {
    if (searchValue) {
      setPageable({ ...pageable, page: 1 });
    }
  }, [searchValue]);

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
                  <DropdownMenu
                    menus={[
                      { label: '다운로드 수', onSelect: () => setSort('downloads') },
                      { label: '최근 업데이트', onSelect: () => setSort('created') },
                      { label: '관련도', onSelect: () => setSort('relevance') },
                    ]}
                  >
                    <button type="button" className={`${styles.btnAlign} ${styles.active}`}>
                      <IconAlign className={styles.iconAlign} />
                      정렬:
                      <span>
                        {sort === 'created'
                          ? '최근 업데이트'
                          : sort === 'downloads'
                            ? '다운로드 수'
                            : '관련도'}
                      </span>
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
                  onClick={() => setSelectedModel(model.id)}
                />
              ))}
            </div>
            <Pagination
              pageSizeOption={[10, 15, 20, 30, 50, 100, 500]}
              page={pageable.page}
              size={pageable.limit}
              totalCount={page.total}
              onChangePageInput={(event) => setPageable({ ...pageable, page: +event.target.value })}
              onChangePageSize={(event) => setPageable({ ...pageable, limit: +event.target.value })}
              onClickNext={() => setPageable({ ...pageable, page: pageable.page + 1 })}
              onClickPrev={() => setPageable({ ...pageable, page: pageable.page - 1 })}
            />
          </div>
        </div>
      </div>
      <div className={`page-footer ${styles.footer}`}>
        <div className="page-footer_btn-box">
          <Button size="large" color="secondary" onClick={() => navigate('/model/custom-model')}>
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

interface FilterPanelProps {
  filter: {
    num_parameters_min?: string;
    num_parameters_max?: string;
    task: string;
    library: string[];
    language: string[];
  };
  setFilter: React.Dispatch<
    React.SetStateAction<{
      num_parameters_min?: string;
      num_parameters_max?: string;
      task: string;
      library: string[];
      language: string[];
    }>
  >;
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
  const [parameter, setParameter] = useState<number[]>([0, 30]);

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
          <TaskTab
            tasks={tasks}
            refetchTasks={refetchTasks}
            filter={filter}
            setFilter={setFilter}
          />,
          <LibraryTab
            libraries={libraries}
            refetchLibraries={refetchLibraries}
            filter={filter}
            setFilter={setFilter}
          />,
          <LanguageTab
            languages={languages}
            refetchLanguages={refetchLanguages}
            filter={filter}
            setFilter={setFilter}
          />,
        ]}
      />
    </div>
  );
};

interface MainTabProps {
  tasks: { id: string; label: string }[] | undefined;
  libraries: { id: string; label: string }[] | undefined;
  languages: { id: string; label: string }[] | undefined;
  parameter: number[];
  setParameter: React.Dispatch<React.SetStateAction<number[]>>;
  filter: {
    task: string;
    num_parameters_min: number;
    num_parameters_max: number | null;
    library: string[];
  };
  setFilter: React.Dispatch<
    React.SetStateAction<{
      task: string;
      num_parameters_min: number;
      num_parameters_max: number | null;
      library: string[];
    }>
  >;
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
  return (
    <div>
      <div className={styles.inner}>
        <div className={styles.titleBox}>
          <p className={styles.leftTitle}>Tasks</p>
          <button type="button" className={styles.btnRefresh}>
            <IconRefresh className={styles.iconRefresh} />
          </button>
        </div>
        <div className={styles.chipBox}>
          {tasks?.slice(0, 6)?.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => setFilter({ ...filter, task: task.id })}
              className={`${styles.chip} ${filter.task === task.id && styles.active}`}
            >
              {task.label}
            </button>
          ))}
        </div>
        <div className={styles.btnMore}>
          <Button size="medium" color="tertiary" onClick={() => {}}>
            더 보기
          </Button>
        </div>
      </div>
      <div className={styles.inner}>
        <div className={styles.titleBox}>
          <p className={styles.leftTitle}>Parameters</p>
          <button type="button" className={styles.btnRefresh}>
            <IconRefresh className={styles.iconRefresh} />
          </button>
        </div>
        <div className={styles.sliderBox}>
          <Slider
            showPointer
            showMarker={true}
            marker={6}
            value={parameter}
            onValueChange={setParameter}
          />
        </div>
      </div>
      <div className={styles.inner}>
        <div className={styles.titleBox}>
          <p className={styles.leftTitle}>Libraries</p>
          <button type="button" className={styles.btnRefresh}>
            <IconRefresh className={styles.iconRefresh} />
          </button>
        </div>
        <div className={styles.chipBox}>
          {libraries?.slice(0, 10)?.map((library) => (
            <button
              type="button"
              onClick={() => setFilter({ ...filter, library: [...filter.library, library.id] })}
              className={`${styles.chip} ${filter.library.find((lib) => lib === library.id) && styles.active}`}
            >
              {library.label}
            </button>
          ))}
        </div>
        <div className={styles.btnMore}>
          <Button size="medium" color="tertiary" onClick={() => alert('Button clicked!')}>
            더 보기
          </Button>
        </div>
      </div>
      <div className={styles.inner}>
        <div className={styles.titleBox}>
          <p className={styles.leftTitle}>Languages</p>
          <button type="button" className={styles.btnRefresh}>
            <IconRefresh className={styles.iconRefresh} />
          </button>
        </div>
        <div className={styles.chipBox}>
          {languages?.slice(0, 12)?.map((language) => (
            <button
              type="button"
              onClick={() => setFilter({ ...filter, language: [...filter.language, language.id] })}
              className={`${styles.chip} ${filter.language.find((lang) => lang === language.id) && styles.active}`}
            >
              {language.label}
            </button>
          ))}
        </div>
        <div className={styles.btnMore}>
          <Button size="medium" color="tertiary" onClick={() => alert('Button clicked!')}>
            더 보기
          </Button>
        </div>
      </div>
    </div>
  );
};

interface TaskTabProps {
  tasks: { id: string; label: string }[] | undefined;
  refetchTasks: () => void;
  filter: {
    task: string;
    num_parameters_min: number;
    num_parameters_max: number | null;
    library: string[];
  };
  setFilter: React.Dispatch<
    React.SetStateAction<{
      task: string;
      num_parameters_min: number;
      num_parameters_max: number | null;
      library: string[];
    }>
  >;
}

const TaskTab = ({ tasks, refetchTasks, filter, setFilter }: TaskTabProps) => {
  const [search, setSearch] = useState('');

  const filteredTasks = tasks?.filter((task) =>
    task.label
      .toLowerCase()
      .replaceAll(' ', '')
      .replaceAll('-', '')
      .includes(search.toLowerCase().replaceAll(' ', '').replaceAll('-', ''))
  );

  return (
    <div>
      <div className={styles.inner2}>
        <div className={styles.titleBox}>
          <p className={styles.leftTitle}>Tasks</p>
          <button type="button" onClick={() => refetchTasks()} className={styles.btnRefresh}>
            <IconRefresh className={styles.iconRefresh} />
          </button>
        </div>
        <Input
          size={{ width: '300px', height: '32px' }}
          placeholder="검색어를 입력해주세요."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.chipBox}>
          {filteredTasks?.map((task) => (
            <button
              type="button"
              onClick={() => setFilter({ ...filter, task: task.id })}
              className={`${styles.chip} ${filter.task === task.id && styles.active}`}
            >
              {task.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface LibraryTabProps {
  libraries: { id: string; label: string }[] | undefined;
  refetchLibraries: () => void;
  filter: {
    task: string;
    num_parameters_min: number;
    num_parameters_max: number | null;
    library: string[];
  };
  setFilter: React.Dispatch<
    React.SetStateAction<{
      task: string;
      num_parameters_min: number;
      num_parameters_max: number | null;
      library: string[];
    }>
  >;
}

const LibraryTab = ({ libraries, refetchLibraries, filter, setFilter }: LibraryTabProps) => {
  const [search, setSearch] = useState('');

  const filteredLibraries = libraries?.filter((library) =>
    library.label
      .toLowerCase()
      .replaceAll(' ', '')
      .replaceAll('-', '')
      .replaceAll('.', '')
      .includes(search.toLowerCase().replaceAll(' ', '').replaceAll('-', '').replaceAll('.', ''))
  );

  return (
    <div>
      <div className={styles.inner2}>
        <div className={styles.titleBox}>
          <p className={styles.leftTitle}>Libraries</p>
          <button type="button" onClick={() => refetchLibraries()} className={styles.btnRefresh}>
            <IconRefresh className={styles.iconRefresh} />
          </button>
        </div>
        <Input
          size={{ width: '300px', height: '32px' }}
          placeholder="검색어를 입력해주세요."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.chipBox}>
          {filteredLibraries?.map((library) => (
            <button
              type="button"
              onClick={() => setFilter({ ...filter, library: [...filter.library, library.id] })}
              className={`${styles.chip} ${filter.library.find((lib) => lib === library.id) && styles.active}`}
            >
              {library.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface LanguageTabProps {
  languages: { id: string; label: string }[] | undefined;
  refetchLanguages: () => void;
  filter: {
    task: string;
    num_parameters_min: number;
    num_parameters_max: number | null;
    library: string[];
  };
  setFilter: React.Dispatch<
    React.SetStateAction<{
      task: string;
      num_parameters_min: number;
      num_parameters_max: number | null;
      library: string[];
    }>
  >;
}

const LanguageTab = ({ languages, refetchLanguages, filter, setFilter }: LanguageTabProps) => {
  const [search, setSearch] = useState('');

  const filteredLanguages = languages?.filter((language) =>
    language.label
      .toLowerCase()
      .replaceAll(' ', '')
      .replaceAll('-', '')
      .includes(search.toLowerCase().replaceAll(' ', '').replaceAll('-', ''))
  );

  return (
    <div>
      <div className={styles.inner2}>
        <div className={styles.titleBox}>
          <p className={styles.leftTitle}>Languages</p>
          <button type="button" onClick={() => refetchLanguages()} className={styles.btnRefresh}>
            <IconRefresh className={styles.iconRefresh} />
          </button>
        </div>
        <Input
          size={{ width: '300px', height: '32px' }}
          placeholder="검색어를 입력해주세요."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.chipBox}>
          {filteredLanguages?.map((language) => (
            <button
              type="button"
              onClick={() => setFilter({ ...filter, language: [...filter.language, language.id] })}
              className={`${styles.chip} ${filter.language.find((lang) => lang === language.id) && styles.active}`}
            >
              {language.label}
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
          <div>{model.task}Text generation</div>
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
