export interface Page<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  total_pages?: number;
  // backend cursor pagination 응답 — k8s 등에서 사용
  nextPageToken?: string | null;
}

export interface Pagination<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}
