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

export interface HelmRepositoryListMeta {
  page?: number;
  size?: number;
  total?: number;
  totalPages?: number;
}

export interface HelmReleaseResource {
  name?: string;
  namespace?: string;
  status?: string;
  type?: string;
  created?: string;
  createdAt?: string;
  yaml?: string;
}
