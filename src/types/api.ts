export interface Page<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
}

export interface Pagination<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}
