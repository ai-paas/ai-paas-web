import {
  Button,
  Slider,
  Table,
  Textarea,
  useTablePagination,
  type ColDef,
  type TableRow,
} from '@innogrid/ui';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { IconArrCount, IconDocument, IconSet } from '../../../../assets/img/icon';
import { ChunkDetailModal } from './chunk-detail-modal';
import { useGetSearchRecords, useSearchKnowledgeBase } from '@/hooks/service/knowledgebase';
import { queryKeys } from '@/lib/query-keys';
import { formatDateTime } from '@/util/date';
import type { SearchRecord, SearchResult } from '@/types/knowledgebase';

const TOP_K_MIN = 1;
const TOP_K_MAX = 20;

const recordColumns: ColDef<SearchRecord>[] = [
  {
    id: 'source',
    header: '소스',
    accessorFn: (row: SearchRecord) => row.source ?? '-',
    size: 160,
  },
  {
    id: 'text',
    header: '텍스트',
    accessorFn: (row: SearchRecord) => row.text ?? '-',
    size: 240,
  },
  {
    id: 'created_at',
    header: '시간',
    accessorFn: (row: SearchRecord) => formatDateTime(row.created_at),
    size: 180,
  },
];

interface RetrievalTestTabProps {
  knowledgeBaseId: number;
  /** 지식 베이스에 설정된 기본 Top K */
  defaultTopK?: number;
}

export const RetrievalTestTab = ({ knowledgeBaseId, defaultTopK }: RetrievalTestTabProps) => {
  const [query, setQuery] = useState('');
  const [topK, setTopK] = useState<number[]>([defaultTopK ?? TOP_K_MIN]);
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [selectedChunk, setSelectedChunk] = useState<SearchResult | null>(null);
  const settingRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  const { pagination, setPagination } = useTablePagination();

  const { search, searchResults, isPending, isError } = useSearchKnowledgeBase(knowledgeBaseId);
  const { searchRecords, isError: isRecordsError } = useGetSearchRecords(knowledgeBaseId);

  const results = searchResults?.results ?? [];

  // 검색 설정 팝오버 외부 클릭 시 닫기
  useEffect(() => {
    if (!isSettingOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (settingRef.current && !settingRef.current.contains(e.target as Node)) {
        setIsSettingOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSettingOpen]);

  const clampTopK = (value: number) => Math.min(TOP_K_MAX, Math.max(TOP_K_MIN, value));

  const handleRunTest = () => {
    if (!query.trim() || isPending) return;
    search(
      { text: query },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: queryKeys.knowledgeBases.searchRecords(knowledgeBaseId),
          });
        },
      }
    );
  };

  const handleClickRecord = (row: TableRow<SearchRecord>) => {
    setQuery(row.original.text ?? '');
  };

  return (
    <div className="kb-retrieval">
      <div className="kb-retrieval_panel">
        {/* 소스 텍스트 입력 */}
        <div className="kb-retrieval_section">
          <div className="kb-retrieval_section-head">
            <h4 className="kb-retrieval_title">소스 텍스트</h4>
            <div className="kb-retrieval_setting" ref={settingRef}>
              <button
                type="button"
                className="kb-retrieval_setting-btn"
                aria-label="검색 설정"
                onClick={() => setIsSettingOpen((prev) => !prev)}
              >
                <IconSet />
              </button>
              {isSettingOpen && (
                <div className="kb-retrieval_setting-popover">
                  <div className="kb-retrieval_setting-title">검색 설정</div>
                  <div className="kb-retrieval_setting-row">
                    <span className="kb-retrieval_setting-label">Top k</span>
                    <div className="w-40">
                      <Slider
                        step={1}
                        min={TOP_K_MIN}
                        max={TOP_K_MAX}
                        value={topK}
                        onValueChange={(value) => setTopK(value)}
                      />
                    </div>
                    <div className="page-num-count">
                      <input
                        type="number"
                        min={TOP_K_MIN}
                        max={TOP_K_MAX}
                        value={topK[0]}
                        onChange={(e) => setTopK([clampTopK(Number(e.target.value))])}
                      />
                      <div className="page-num-count-control">
                        <button
                          type="button"
                          className="btn-num"
                          onClick={() => setTopK((prev) => [clampTopK((prev[0] || 0) + 1)])}
                        >
                          <span className="icon-arr icon-arrUp">
                            <IconArrCount />
                          </span>
                        </button>
                        <button
                          type="button"
                          className="btn-num"
                          onClick={() => setTopK((prev) => [clampTopK((prev[0] || 0) - 1)])}
                        >
                          <span className="icon-arr icon-arrDown">
                            <IconArrCount />
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="kb-retrieval_source">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="검색할 소스 텍스트를 입력해주세요."
              customSize={{ height: 180 }}
            />
            <div className="kb-retrieval_source-action">
              <Button
                size="medium"
                color="primary"
                disabled={!query.trim() || isPending}
                onClick={handleRunTest}
              >
                {isPending ? '테스트 중...' : '테스트'}
              </Button>
            </div>
          </div>
        </div>

        {/* 레코드 */}
        <div className="kb-retrieval_section">
          <h4 className="kb-retrieval_title">레코드</h4>
          <div className="kb-retrieval_records">
            <Table
              useClientPagination
              columns={recordColumns}
              data={searchRecords}
              totalCount={searchRecords.length}
              pagination={pagination}
              setPagination={setPagination}
              onClickRow={handleClickRecord}
              emptyMessage={
                isRecordsError
                  ? '레코드를 불러오는 데 실패했습니다.'
                  : '검색 테스트 레코드가 없습니다.'
              }
            />
          </div>
        </div>
      </div>

      {/* 검색 결과 단락 */}
      <div className="kb-retrieval_result">
        <h4 className="kb-retrieval_title">검색 결과 단락</h4>
        <div className="kb-retrieval_result-list">
          {isError ? (
            <div className="kb-retrieval_result-empty">검색 결과를 불러오는 데 실패했습니다.</div>
          ) : results.length === 0 ? (
            <div className="kb-retrieval_result-empty">
              소스 텍스트를 입력하고 테스트를 실행해주세요.
            </div>
          ) : (
            results.map((chunk, index) => (
              <div key={chunk.chunk_id ?? index} className="kb-chunk-card">
                <div className="kb-chunk-card_head">
                  <span className="kb-chunk-card_id">{chunk.chunk_id ?? `chunk-${index + 1}`}</span>
                  <span className="kb-chunk-card_count">{chunk.text.length} 문자</span>
                  {chunk.file_name && (
                    <span className="kb-chunk-card_file">
                      <IconDocument />
                      {chunk.file_name}
                    </span>
                  )}
                </div>
                <p className="kb-chunk-card_text">{chunk.text}</p>
                <div className="kb-chunk-card_foot">
                  {chunk.keywords && chunk.keywords.length > 0 ? (
                    <div className="kb-chunk-keyword-list">
                      {chunk.keywords.map((keyword, keywordIndex) => (
                        <span key={keywordIndex} className="kb-chunk-keyword">
                          #{keyword}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    className="kb-chunk-card_more"
                    onClick={() => setSelectedChunk(chunk)}
                  >
                    자세히 보기
                    <i className="kb-chunk-card_more-arr" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ChunkDetailModal
        isOpen={!!selectedChunk}
        chunk={selectedChunk}
        onClose={() => setSelectedChunk(null)}
      />
    </div>
  );
};
