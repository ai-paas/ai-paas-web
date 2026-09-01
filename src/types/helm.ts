export interface HelmRelease {
  name?: string;
  namespace?: string;
  status?: string;
  revision?: number | string;
  chart?: string;
  chartVersion?: string | null;
  appVersion?: string;
  clusterName?: string;
  created?: string;
  createdAt?: string;
  updated?: string;
  updatedAt?: string;
  values?: string;
}

export interface HelmReleaseListMeta {
  page?: number;
  size?: number;
  total?: number;
  totalPages?: number;
}

export type HelmReleaseResponse =
  | HelmRelease[]
  | {
      data?:
        | HelmRelease[]
        | {
            data?: HelmRelease[] | HelmReleaseResponse;
            releases?: HelmRelease[];
            items?: HelmRelease[];
          };
      releases?: HelmRelease[];
      items?: HelmRelease[];
      status?: number;
      page?: number;
      size?: number;
      total?: number;
      total_pages?: number;
      totalPages?: number;
    };

export interface HelmReleaseListResult {
  releases: HelmRelease[];
  meta?: HelmReleaseListMeta;
}

export interface HelmRepository {
  name?: string;
  url?: string;
  source?: 'INTERNAL' | 'EXTERNAL' | string;
  tags?: string;
  username?: string;
  insecureSkipTLSVerify?: boolean;
  caFile?: string;
  createdAt?: string;
  updatedAt?: string;
  // 옛 호환
  status?: string;
  insecure?: boolean;
  created?: string;
}

export interface GetHelmRepositoriesParams {
  page?: number;
  size?: number;
  search?: string;
}

/** OpenAPI `HelmRepoCreateRequest`와 동일한 JSON 요청 계약 */
export interface HelmRepositoryCreateRequest {
  name: string;
  url: string;
  username: string;
  password: string;
  caFile: string;
  insecureSkipTLSVerify: boolean;
}

export interface HelmRepositoryListMeta {
  page?: number;
  size?: number;
  total?: number;
  totalPages?: number;
}

/**
 * Any Cloud 프록시가 직접 응답 또는 `data` envelope를 반환할 수 있어 두 형태를 모두 표현한다.
 * 일부 배포 버전은 envelope를 한 단계 더 중첩하므로 재귀 형태를 허용한다.
 */
export interface AnyCloudResponseEnvelope<T> {
  data?: T | AnyCloudResponseEnvelope<T>;
  status?: number;
  message?: string;
  [key: string]: unknown;
}

export type AnyCloudResponse<T> = T | AnyCloudResponseEnvelope<T>;

export interface HelmRepositoryPagedEnvelope {
  data?:
    | HelmRepository[]
    | HelmRepositoryPagedEnvelope
    | {
        data?: HelmRepository[] | HelmRepositoryPagedEnvelope;
        repositories?: HelmRepository[];
        items?: HelmRepository[];
        page?: number;
        size?: number;
        total?: number;
        total_pages?: number;
        totalPages?: number;
      };
  repositories?: HelmRepository[];
  items?: HelmRepository[];
  status?: number;
  page?: number;
  size?: number;
  total?: number;
  total_pages?: number;
  totalPages?: number;
  [key: string]: unknown;
}

export type HelmRepositoryListResponse = HelmRepository[] | HelmRepositoryPagedEnvelope;
export type HelmRepositoryDetailResponse = AnyCloudResponse<HelmRepository>;
export type HelmRepositoryExistsResponse = AnyCloudResponse<
  boolean | { exists?: boolean; isExists?: boolean }
>;
export type HelmRepositoryMutationResponse = AnyCloudResponse<HelmRepository>;

export interface HelmReleaseResource {
  name?: string;
  namespace?: string;
  status?: string;
  type?: string;
  created?: string;
  createdAt?: string;
  yaml?: string;
}
