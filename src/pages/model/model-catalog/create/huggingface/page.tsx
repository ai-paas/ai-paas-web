import { useState } from 'react';
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
import styles from '../../../model.module.scss';
import { useNavigate } from 'react-router';
import { useGetHubModels } from '@/hooks/service/models';
import { formatCount } from '@/util/count';
import { formatRelativeTime } from '@/util/date';

export default function CustomModelCreateHuggingfacePage() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const { searchValue, ...restProps } = useSearchInputState();
  const [sort, setSort] = useState<'downloads' | 'created' | 'relevance'>('downloads');
  const [pageable, setPageable] = useState({ page: 1, limit: 10 });
  const { hubModels, page } = useGetHubModels({
    market: 'huggingface',
    sort,
    search: searchValue,
    ...pageable,
  });
  const navigate = useNavigate();

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
        <LeftPanel />
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

const LeftPanel = () => {
  const [value, setValue] = useState<string>('');

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  //slider
  const [value2, setValue2] = useState<number[]>([0, 30]);

  return (
    <div className={styles.flexContentLeft}>
      {/* 탭에 추가되야할 마크 */}
      <div className={styles.chkMark}>9</div>
      {/* 탭 활성화 될때 마크 활성화 클래스네임 active 추가 */}
      <div className={`${styles.chkMark} ${styles.active}`} style={{ left: '40px' }}>
        {/* 선택된 갯수가 99개 이상일때 표시법 */}
        99+
      </div>

      <Tabs
        className={styles.tabs}
        labels={['Main', 'Tasks', 'Libraries', 'Languages']}
        components={[
          <div>
            <div className={styles.inner}>
              <div className={styles.titleBox}>
                <p className={styles.leftTitle}>Tasks</p>
                <button type="button" className={styles.btnRefresh}>
                  <IconRefresh className={styles.iconRefresh} />
                </button>
              </div>
              <div className={styles.chipBox}>
                <button type="button" className={styles.chip}>
                  텍스트가 들어갑니다
                </button>
                {/* 선택 됐을때 클래스네임 active 추가 */}
                <button type="button" className={`${styles.chip} ${styles.active}`}>
                  Text generation
                </button>
                <button type="button" className={styles.chip}>
                  Text value 02
                </button>
                <button type="button" className={styles.chip}>
                  Task 01
                </button>
                <button type="button" className={styles.chip}>
                  Task 02
                </button>
                <button type="button" className={styles.chip}>
                  Task 03
                </button>
                <button type="button" className={styles.chip}>
                  Task 04
                </button>
                <button type="button" className={styles.chip}>
                  Task 05
                </button>
                <button type="button" className={styles.chip}>
                  Task 06
                </button>
                <button type="button" className={styles.chip}>
                  Task 07
                </button>
                <button type="button" className={styles.chip}>
                  Task 08
                </button>
              </div>
              <div className={styles.btnMore}>
                <Button size="medium" color="tertiary" onClick={() => alert('Button clicked!')}>
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
                  value={value2}
                  onValueChange={setValue2}
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
                <button type="button" className={styles.chip}>
                  Transformers
                </button>
                {/* 선택 됐을때 클래스네임 active 추가 */}
                <button type="button" className={`${styles.chip} ${styles.active}`}>
                  Pytorch
                </button>
                <button type="button" className={styles.chip}>
                  Text Generation
                </button>
                <button type="button" className={styles.chip}>
                  Task 01
                </button>
                <button type="button" className={styles.chip}>
                  Task 02
                </button>
                <button type="button" className={styles.chip}>
                  Task 03
                </button>
                <button type="button" className={styles.chip}>
                  Task 04
                </button>
                <button type="button" className={styles.chip}>
                  Task 05
                </button>
                <button type="button" className={styles.chip}>
                  Task 06
                </button>
                <button type="button" className={styles.chip}>
                  Task 07
                </button>
                <button type="button" className={styles.chip}>
                  Task 08
                </button>
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
                <button type="button" className={styles.chip}>
                  English
                </button>
                {/* 선택 됐을때 클래스네임 active 추가 */}
                <button type="button" className={`${styles.chip} ${styles.active}`}>
                  Chinese
                </button>
                <button type="button" className={styles.chip}>
                  Korean
                </button>
                <button type="button" className={styles.chip}>
                  Spanish
                </button>
                <button type="button" className={styles.chip}>
                  German
                </button>
                <button type="button" className={styles.chip}>
                  Japanese
                </button>
                <button type="button" className={styles.chip}>
                  Turkish
                </button>
                <button type="button" className={styles.chip}>
                  Arabic
                </button>
              </div>
              <div className={styles.btnMore}>
                <Button size="medium" color="tertiary" onClick={() => alert('Button clicked!')}>
                  더 보기
                </Button>
              </div>
            </div>
          </div>,
          <div>
            <div className={styles.inner2}>
              <div className={styles.titleBox}>
                <p className={styles.leftTitle}>Tasks</p>
                <button type="button" className={styles.btnRefresh}>
                  <IconRefresh className={styles.iconRefresh} />
                </button>
              </div>
              <Input
                size={{ width: '300px', height: '32px' }}
                placeholder="검색어를 입력해주세요."
              />
              <div className={styles.chipBox}>
                <button type="button" className={styles.chip}>
                  텍스트가 들어갑니다
                </button>
                {/* 선택 됐을때 클래스네임 active 추가 */}
                <button type="button" className={`${styles.chip} ${styles.active}`}>
                  Text generation
                </button>
                <button type="button" className={styles.chip}>
                  Text value 02
                </button>
                <button type="button" className={styles.chip}>
                  Task 01
                </button>
                <button type="button" className={styles.chip}>
                  Task 02
                </button>
                <button type="button" className={styles.chip}>
                  Task 03
                </button>
                <button type="button" className={styles.chip}>
                  Task 04
                </button>
                <button type="button" className={styles.chip}>
                  Task 05
                </button>
                <button type="button" className={styles.chip}>
                  Task 06
                </button>
                <button type="button" className={styles.chip}>
                  Task 07
                </button>
                <button type="button" className={styles.chip}>
                  Task 08
                </button>
              </div>
            </div>
          </div>,
          <div>
            <div className={styles.inner2}>
              <div className={styles.titleBox}>
                <p className={styles.leftTitle}>Libraries</p>
                <button type="button" className={styles.btnRefresh}>
                  <IconRefresh className={styles.iconRefresh} />
                </button>
              </div>
              <Input
                size={{ width: '300px', height: '32px' }}
                placeholder="검색어를 입력해주세요."
                value={value}
                onChange={onChange}
              />
              <div className={styles.chipBox}>
                <button type="button" className={styles.chip}>
                  텍스트가 들어갑니다
                </button>
                {/* 선택 됐을때 클래스네임 active 추가 */}
                <button type="button" className={`${styles.chip} ${styles.active}`}>
                  Text generation
                </button>
                <button type="button" className={styles.chip}>
                  Text value 02
                </button>
                <button type="button" className={styles.chip}>
                  Task 01
                </button>
                <button type="button" className={styles.chip}>
                  Task 02
                </button>
                <button type="button" className={styles.chip}>
                  Task 03
                </button>
                <button type="button" className={styles.chip}>
                  Task 04
                </button>
                <button type="button" className={styles.chip}>
                  Task 05
                </button>
                <button type="button" className={styles.chip}>
                  Task 06
                </button>
                <button type="button" className={styles.chip}>
                  Task 07
                </button>
                <button type="button" className={styles.chip}>
                  Task 08
                </button>
              </div>
            </div>
          </div>,
          <div>
            <div className={styles.inner2}>
              <div className={styles.titleBox}>
                <p className={styles.leftTitle}>Languages</p>
                <button type="button" className={styles.btnRefresh}>
                  <IconRefresh className={styles.iconRefresh} />
                </button>
              </div>
              <Input
                size={{ width: '300px', height: '32px' }}
                placeholder="검색어를 입력해주세요."
                value={value}
                onChange={onChange}
              />
              <div className={styles.chipBox}>
                <button type="button" className={styles.chip}>
                  텍스트가 들어갑니다
                </button>
                {/* 선택 됐을때 클래스네임 active 추가 */}
                <button type="button" className={`${styles.chip} ${styles.active}`}>
                  Text generation
                </button>
                <button type="button" className={styles.chip}>
                  Text value 02
                </button>
                <button type="button" className={styles.chip}>
                  Task 01
                </button>
                <button type="button" className={styles.chip}>
                  Task 02
                </button>
                <button type="button" className={styles.chip}>
                  Task 03
                </button>
                <button type="button" className={styles.chip}>
                  Task 04
                </button>
                <button type="button" className={styles.chip}>
                  Task 05
                </button>
                <button type="button" className={styles.chip}>
                  Task 06
                </button>
                <button type="button" className={styles.chip}>
                  Task 07
                </button>
                <button type="button" className={styles.chip}>
                  Task 08
                </button>
              </div>
            </div>
          </div>,
        ]}
      />
    </div>
  );
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
