export interface ChunkType {
  id: number;
  name: string;
  description?: string;
}

export interface Language {
  id: number;
  name: string;
  description: string;
}

export interface SearchMethod {
  id: number;
  name: string;
  description?: string;
}

/** 목록 조회 응답 항목 (KnowledgeBaseBriefReadSchema) */
export interface KnowledgeBaseBrief {
  id: number;
  surro_knowledge_id: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  name: string;
  description?: string;
  collection_name: string;
  chunk_size: number;
  chunk_overlap: number;
  top_k: number;
  threshold: number;
}

/** 상세 조회 응답 (KnowledgeBaseReadSchema) */
export interface KnowledgeBase extends KnowledgeBaseBrief {
  embedding_model_id: number;
  language_id: number;
  chunk_type_id: number;
  search_method_id: number;
  files: KnowledgeBaseFile[];
}

export interface CreateKnowledgeBaseRequest {
  name: string;
  description?: string;
  language_id: number;
  embedding_model_id: number;
  chunk_size: number;
  chunk_overlap: number;
  chunk_type_id: number;
  search_method_id: number;
  top_k: number;
  threshold: number;
  file: File[];
}

export interface UpdateKnowledgeBaseRequest {
  surro_knowledge_id: number;
  name?: string;
  description?: string;
}

export interface GetKnowledgeBasesParams {
  page?: number;
  size?: number;
  search?: string;
  /** 정렬 기준. `,`로 다중 정렬, `-` 접두어는 내림차순. 미지정 시 -created_at */
  sort?: string;
}

export interface KnowledgeBaseFile {
  id: number;
  knowledge_base_id: number;
  name: string;
  partition_name?: string;
  chunk_number?: number;
  object_storage_uri?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  created_by?: string;
  updated_by?: string;
  deleted_by?: string;
}

export interface AddFileRequest {
  file: File;
}

export interface SearchKnowledgeBaseRequest {
  /** 검색할 쿼리 텍스트. top_k/threshold/search_method 는 KB에 설정된 값을 사용 */
  text: string;
}

/** SearchResultItemSchema */
export interface SearchResult {
  text: string;
  score: number;
  chunk_id?: string;
  partition_name?: string;
  file_name?: string;
  distance?: number;
  /** 청크 키워드. 백엔드가 제공하는 경우에만 표시 */
  keywords?: string[];
}

/** KnowledgeBaseSearchResponseSchema */
export interface SearchKnowledgeBaseResponse {
  results: SearchResult[];
  total: number;
  /** 사용된 검색 방법 (dense/sparse/hybrid) */
  search_method: string;
}

/** KnowledgeBaseSearchRecordReadSchema */
export interface SearchRecord {
  id: number;
  knowledge_base_id: number;
  /** Collection 이름 */
  source: string;
  /** 검색 쿼리 텍스트 */
  text: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  created_by?: string;
  updated_by?: string;
  deleted_by?: string;
}
