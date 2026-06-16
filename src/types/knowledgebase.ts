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

export interface KnowledgeBase {
  surro_knowledge_id: number;
  name: string;
  description?: string;
  chunk_type?: string;
  language?: string;
  search_method?: string;
  created_at?: string;
  updated_at?: string;
  files?: KnowledgeBaseFile[];
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
  chunk_type?: string;
  language?: string;
  search_method?: string;
}

export interface GetKnowledgeBasesParams {
  page?: number;
  size?: number;
  search?: string;
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
  query: string;
  top_k?: number;
  threshold?: number;
}

export interface SearchResult {
  content: string;
  score: number;
  metadata?: Record<string, unknown>;
  file_id?: string;
  file_name?: string;
}

export interface SearchKnowledgeBaseResponse {
  results: SearchResult[];
  total: number;
}

export interface SearchRecord {
  id: string;
  query: string;
  results_count: number;
  created_at: string;
}

export interface GetSearchRecordsParams {
  page?: number;
  size?: number;
}
