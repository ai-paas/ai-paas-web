import { Modal } from '@innogrid/ui';
import { IconDocument } from '../../../../assets/img/icon';
import type { SearchResult } from '@/types/knowledgebase';

interface ChunkDetailModalProps {
  isOpen: boolean;
  chunk: SearchResult | null;
  onClose: () => void;
}

/** 검색 결과 단락 상세 보기 팝업 (자세히 보기) */
export const ChunkDetailModal = ({ isOpen, chunk, onClose }: ChunkDetailModalProps) => {
  return (
    <Modal
      allowOutsideInteraction
      isOpen={isOpen}
      size="medium"
      title="청크 디테일"
      buttonTitle="확인"
      onRequestClose={onClose}
      action={onClose}
    >
      {chunk && (
        <div className="kb-chunk-detail">
          <div className="kb-chunk-detail_head">
            <span className="kb-chunk-detail_id">{chunk.chunk_id ?? '-'}</span>
            {chunk.file_name && (
              <span className="kb-chunk-detail_file">
                <IconDocument />
                {chunk.file_name}
              </span>
            )}
          </div>
          <div className="kb-chunk-detail_content">{chunk.text}</div>
          {chunk.keywords && chunk.keywords.length > 0 && (
            <div className="kb-chunk-detail_keywords">
              <div className="kb-chunk-detail_keywords-title">키워드</div>
              <div className="kb-chunk-keyword-list">
                {chunk.keywords.map((keyword, index) => (
                  <span key={index} className="kb-chunk-keyword">
                    #{keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
