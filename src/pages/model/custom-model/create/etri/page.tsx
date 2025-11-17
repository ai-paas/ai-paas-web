import { useState } from 'react';
import type { ChangeEvent } from '@innogrid/ui';
import { BreadCrumb, Input, Button, Pagination } from '@innogrid/ui';

import { IconAlign } from '../../../../../assets/img/icon';
import styles from '../../../model.module.scss';

//breadcrumb
const items = [
  { label: '모델', path: '/model/custom-model' },
  { label: '커스텀 모델' },
  { label: '커스텀 모델 생성' },
];

export default function CustomModelCreateEtriPage() {
  //input
  const [value, setValue] = useState<string>('');

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  //pagination
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const totalCount = 100;
  const pageSizeOption = [10, 15, 20, 30, 50, 100, 500];

  return (
    <main>
      <BreadCrumb items={items} onNavigate={(path: string) => {}} className="breadcrumbBox" />
      <div className="page-title-box">
        <h2 className="page-title">커스텀 모델 생성 - ETRI 연동</h2>
      </div>
      <div className={styles.flexContent}>
        <div className={styles.flexContentDesc2}>
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
          <div className={styles.descBodyBox2}>
            <div className={styles.descContent}>
              <div className={styles.descInfoBox2}>
                <p>한국어 문서 사실성 검증 기술</p>
                <div className={styles.descInfo}>
                  <div>
                    <span>카테고리</span>
                    <div>언어</div>
                  </div>
                  <div>
                    <span>등록일</span>
                    <div>2024-11-11</div>
                  </div>
                  <div>
                    <span>조회수</span>
                    <div>90</div>
                  </div>
                  <div>
                    <span>다운로드 수</span>
                    <div>641</div>
                  </div>
                </div>
              </div>
              {/* 선택시 클래스네임 active 추가 */}
              <div className={`${styles.descInfoBox2} ${styles.active}`}>
                <p>한국어 문서 사실성 검증 기술</p>
                <div className={styles.descInfo}>
                  <div>
                    <span>카테고리</span>
                    <div>언어</div>
                  </div>
                  <div>
                    <span>등록일</span>
                    <div>2024-11-11</div>
                  </div>
                  <div>
                    <span>조회수</span>
                    <div>90</div>
                  </div>
                  <div>
                    <span>다운로드 수</span>
                    <div>641</div>
                  </div>
                </div>
              </div>
              <div className={styles.descInfoBox2}>
                <p>한국어 문서 사실성 검증 기술</p>
                <div className={styles.descInfo}>
                  <div>
                    <span>카테고리</span>
                    <div>언어</div>
                  </div>
                  <div>
                    <span>등록일</span>
                    <div>2024-11-11</div>
                  </div>
                  <div>
                    <span>조회수</span>
                    <div>90</div>
                  </div>
                  <div>
                    <span>다운로드 수</span>
                    <div>641</div>
                  </div>
                </div>
              </div>
              <div className={styles.descInfoBox2}>
                <p>한국어 문서 사실성 검증 기술</p>
                <div className={styles.descInfo}>
                  <div>
                    <span>카테고리</span>
                    <div>언어</div>
                  </div>
                  <div>
                    <span>등록일</span>
                    <div>2024-11-11</div>
                  </div>
                  <div>
                    <span>조회수</span>
                    <div>90</div>
                  </div>
                  <div>
                    <span>다운로드 수</span>
                    <div>641</div>
                  </div>
                </div>
              </div>
              <div className={styles.descInfoBox2}>
                <p>한국어 문서 사실성 검증 기술</p>
                <div className={styles.descInfo}>
                  <div>
                    <span>카테고리</span>
                    <div>언어</div>
                  </div>
                  <div>
                    <span>등록일</span>
                    <div>2024-11-11</div>
                  </div>
                  <div>
                    <span>조회수</span>
                    <div>90</div>
                  </div>
                  <div>
                    <span>다운로드 수</span>
                    <div>641</div>
                  </div>
                </div>
              </div>
              <div className={styles.descInfoBox2}>
                <p>한국어 문서 사실성 검증 기술</p>
                <div className={styles.descInfo}>
                  <div>
                    <span>카테고리</span>
                    <div>언어</div>
                  </div>
                  <div>
                    <span>등록일</span>
                    <div>2024-11-11</div>
                  </div>
                  <div>
                    <span>조회수</span>
                    <div>90</div>
                  </div>
                  <div>
                    <span>다운로드 수</span>
                    <div>641</div>
                  </div>
                </div>
              </div>
              <div className={styles.descInfoBox2}>
                <p>한국어 문서 사실성 검증 기술</p>
                <div className={styles.descInfo}>
                  <div>
                    <span>카테고리</span>
                    <div>언어</div>
                  </div>
                  <div>
                    <span>등록일</span>
                    <div>2024-11-11</div>
                  </div>
                  <div>
                    <span>조회수</span>
                    <div>90</div>
                  </div>
                  <div>
                    <span>다운로드 수</span>
                    <div>641</div>
                  </div>
                </div>
              </div>
              <div className={styles.descInfoBox2}>
                <p>한국어 문서 사실성 검증 기술</p>
                <div className={styles.descInfo}>
                  <div>
                    <span>카테고리</span>
                    <div>언어</div>
                  </div>
                  <div>
                    <span>등록일</span>
                    <div>2024-11-11</div>
                  </div>
                  <div>
                    <span>조회수</span>
                    <div>90</div>
                  </div>
                  <div>
                    <span>다운로드 수</span>
                    <div>641</div>
                  </div>
                </div>
              </div>
              <div className={styles.descInfoBox2}>
                <p>한국어 문서 사실성 검증 기술</p>
                <div className={styles.descInfo}>
                  <div>
                    <span>카테고리</span>
                    <div>언어</div>
                  </div>
                  <div>
                    <span>등록일</span>
                    <div>2024-11-11</div>
                  </div>
                  <div>
                    <span>조회수</span>
                    <div>90</div>
                  </div>
                  <div>
                    <span>다운로드 수</span>
                    <div>641</div>
                  </div>
                </div>
              </div>
              <div className={styles.descInfoBox2}>
                <p>한국어 문서 사실성 검증 기술</p>
                <div className={styles.descInfo}>
                  <div>
                    <span>카테고리</span>
                    <div>언어</div>
                  </div>
                  <div>
                    <span>등록일</span>
                    <div>2024-11-11</div>
                  </div>
                  <div>
                    <span>조회수</span>
                    <div>90</div>
                  </div>
                  <div>
                    <span>다운로드 수</span>
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
