import { useState } from 'react';
import type { ChangeEvent } from '@innogrid/ui';
import { BreadCrumb, Tabs, Input, Button, Slider, Pagination } from '@innogrid/ui';
import { IconRefresh, IconAlign } from '../../../../../assets/img/icon';
import styles from '../../../model.module.scss';
import { useNavigate } from 'react-router';

export default function CustomModelCreateHuggingfacePage() {
  const navigate = useNavigate();
  //input
  const [value, setValue] = useState<string>('');

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  //slider
  const [value2, setValue2] = useState<number[]>([0, 30]);

  //pagination
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const totalCount = 100;
  const pageSizeOption = [10, 15, 20, 30, 50, 100, 500];

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
        <div className={styles.flexContentDesc}>
          <div className={styles.descTopBox}>
            <p className={styles.descTitle}>
              모델<span>40,563</span>
            </p>
            <div className={styles.descSearch}>
              <span>모델 검색</span>
              <div className={styles.searchInputBox}>
                <Input
                  size={'m-large'}
                  placeholder="검색어를 입력해주세요."
                  value={value}
                  onChange={onChange}
                />
                <div className={styles.selectBtnBox}>
                  {/* 버튼 클릭시 클래스네임 active 추가 */}
                  {/* ${styles.active} */}
                  <button type="button" className={`${styles.btnAlign} ${styles.active}`}>
                    <IconAlign className={styles.iconAlign} />
                    정렬:<span>좋아요 수</span>
                  </button>
                  {/* 버튼 클릭시 클래스네임 active 추가 */}
                  <ul className={`${styles.selectOptionBox} ${styles.active}`}>
                    <li className={styles.selectOption}>좋아요 수</li>
                    <li className={styles.selectOption}>다운로드 수</li>
                    <li className={styles.selectOption}>최근 업데이트</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.descBodyBox}>
            <div className={styles.descContent}>
              <div className={styles.descInfoBox}>
                <p>sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2</p>
                <div className={styles.descInfo}>
                  <div>
                    <span>Tasks</span>
                    <div>Text generation</div>
                  </div>
                  <div>
                    <span>Parameters</span>
                    <div>423B</div>
                  </div>
                  <div>
                    <span>업데이트 날짜(경과일)</span>
                    <div>업데이트 6일전</div>
                  </div>
                  <div>
                    <span>다운로드 수</span>
                    <div>2.71K</div>
                  </div>
                  <div>
                    <span>좋아요 수</span>
                    <div>641</div>
                  </div>
                </div>
              </div>
              {/* 선택시 클래스네임 active 추가 */}
              <div className={`${styles.descInfoBox} ${styles.active}`}>
                <p>sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2</p>
                <div className={styles.descInfo}>
                  <div>
                    <span>Tasks</span>
                    <div>Text generation</div>
                  </div>
                  <div>
                    <span>Parameters</span>
                    <div>423B</div>
                  </div>
                  <div>
                    <span>업데이트 날짜(경과일)</span>
                    <div>업데이트 6일전</div>
                  </div>
                  <div>
                    <span>다운로드 수</span>
                    <div>2.71K</div>
                  </div>
                  <div>
                    <span>좋아요 수</span>
                    <div>641</div>
                  </div>
                </div>
              </div>
              <div className={styles.descInfoBox}>
                <p>sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2</p>
                <div className={styles.descInfo}>
                  <div>
                    <span>Tasks</span>
                    <div>Text generation</div>
                  </div>
                  <div>
                    <span>Parameters</span>
                    <div>423B</div>
                  </div>
                  <div>
                    <span>업데이트 날짜(경과일)</span>
                    <div>업데이트 6일전</div>
                  </div>
                  <div>
                    <span>다운로드 수</span>
                    <div>2.71K</div>
                  </div>
                  <div>
                    <span>좋아요 수</span>
                    <div>641</div>
                  </div>
                </div>
              </div>
              <div className={styles.descInfoBox}>
                <p>sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2</p>
                <div className={styles.descInfo}>
                  <div>
                    <span>Tasks</span>
                    <div>Text generation</div>
                  </div>
                  <div>
                    <span>Parameters</span>
                    <div>423B</div>
                  </div>
                  <div>
                    <span>업데이트 날짜(경과일)</span>
                    <div>업데이트 6일전</div>
                  </div>
                  <div>
                    <span>다운로드 수</span>
                    <div>2.71K</div>
                  </div>
                  <div>
                    <span>좋아요 수</span>
                    <div>641</div>
                  </div>
                </div>
              </div>
              <div className={styles.descInfoBox}>
                <p>sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2</p>
                <div className={styles.descInfo}>
                  <div>
                    <span>Tasks</span>
                    <div>Text generation</div>
                  </div>
                  <div>
                    <span>Parameters</span>
                    <div>423B</div>
                  </div>
                  <div>
                    <span>업데이트 날짜(경과일)</span>
                    <div>업데이트 6일전</div>
                  </div>
                  <div>
                    <span>다운로드 수</span>
                    <div>2.71K</div>
                  </div>
                  <div>
                    <span>좋아요 수</span>
                    <div>641</div>
                  </div>
                </div>
              </div>
              <div className={styles.descInfoBox}>
                <p>sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2</p>
                <div className={styles.descInfo}>
                  <div>
                    <span>Tasks</span>
                    <div>Text generation</div>
                  </div>
                  <div>
                    <span>Parameters</span>
                    <div>423B</div>
                  </div>
                  <div>
                    <span>업데이트 날짜(경과일)</span>
                    <div>업데이트 6일전</div>
                  </div>
                  <div>
                    <span>다운로드 수</span>
                    <div>2.71K</div>
                  </div>
                  <div>
                    <span>좋아요 수</span>
                    <div>641</div>
                  </div>
                </div>
              </div>
              <div className={styles.descInfoBox}>
                <p>sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2</p>
                <div className={styles.descInfo}>
                  <div>
                    <span>Tasks</span>
                    <div>Text generation</div>
                  </div>
                  <div>
                    <span>Parameters</span>
                    <div>423B</div>
                  </div>
                  <div>
                    <span>업데이트 날짜(경과일)</span>
                    <div>업데이트 6일전</div>
                  </div>
                  <div>
                    <span>다운로드 수</span>
                    <div>2.71K</div>
                  </div>
                  <div>
                    <span>좋아요 수</span>
                    <div>641</div>
                  </div>
                </div>
              </div>
              <div className={styles.descInfoBox}>
                <p>sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2</p>
                <div className={styles.descInfo}>
                  <div>
                    <span>Tasks</span>
                    <div>Text generation</div>
                  </div>
                  <div>
                    <span>Parameters</span>
                    <div>423B</div>
                  </div>
                  <div>
                    <span>업데이트 날짜(경과일)</span>
                    <div>업데이트 6일전</div>
                  </div>
                  <div>
                    <span>다운로드 수</span>
                    <div>2.71K</div>
                  </div>
                  <div>
                    <span>좋아요 수</span>
                    <div>641</div>
                  </div>
                </div>
              </div>
              <div className={styles.descInfoBox}>
                <p>sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2</p>
                <div className={styles.descInfo}>
                  <div>
                    <span>Tasks</span>
                    <div>Text generation</div>
                  </div>
                  <div>
                    <span>Parameters</span>
                    <div>423B</div>
                  </div>
                  <div>
                    <span>업데이트 날짜(경과일)</span>
                    <div>업데이트 6일전</div>
                  </div>
                  <div>
                    <span>다운로드 수</span>
                    <div>2.71K</div>
                  </div>
                  <div>
                    <span>좋아요 수</span>
                    <div>641</div>
                  </div>
                </div>
              </div>
              <div className={styles.descInfoBox}>
                <p>sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2</p>
                <div className={styles.descInfo}>
                  <div>
                    <span>Tasks</span>
                    <div>Text generation</div>
                  </div>
                  <div>
                    <span>Parameters</span>
                    <div>423B</div>
                  </div>
                  <div>
                    <span>업데이트 날짜(경과일)</span>
                    <div>업데이트 6일전</div>
                  </div>
                  <div>
                    <span>다운로드 수</span>
                    <div>2.71K</div>
                  </div>
                  <div>
                    <span>좋아요 수</span>
                    <div>641</div>
                  </div>
                </div>
              </div>
            </div>
            <Pagination
              page={page}
              pageSizeOption={pageSizeOption}
              size={size}
              totalCount={totalCount}
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
