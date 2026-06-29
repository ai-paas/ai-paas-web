export interface Chart {
  name: string;
  version: string;
  description: string;
  appVersion: string;
  keywords: string[];
  icon: string;
  created: string;
}

export interface CatalogData {
  repositoryName?: string;
  charts: Chart[];
}

export interface CatalogListMeta {
  page?: number;
  size?: number;
  total?: number;
  totalPages?: number;
}

export interface CatalogListResponseV2 {
  data: Chart[];
  page?: number;
  size?: number;
  total?: number;
  total_pages?: number;
}

export type CatalogResponse =
  | {
      data: {
        data: CatalogData;
        status?: number;
      };
    }
  | {
      data: CatalogData;
    }
  | CatalogListResponseV2
  | Chart[];

export interface CatalogDocumentData {
  version?: string;
  content: string;
}

export type CatalogDocumentResponse =
  | string
  | string[]
  | {
      readmeContent?: unknown;
      readme?: unknown;
      markdown?: unknown;
      valuesContent?: unknown;
      values?: unknown;
      yaml?: unknown;
      content?: unknown;
      data?: unknown;
      result?: unknown;
      version?: unknown;
      status?: number;
    };

export type CatalogReadmeData = CatalogDocumentData;
export type CatalogReadmeResponse = CatalogDocumentResponse;

export type CatalogValuesData = CatalogDocumentData;
export type CatalogValuesResponse = CatalogDocumentResponse;

export interface CatalogDetail {
  name: string;
  version: string;
  description: string;
  appVersion: string;
  keywords: string[];
  icon: string;
  created: string;
  updated?: string;
  repositoryName: string;
  chartName: string;
  maintainers?: Array<{
    name: string;
    email: string;
  }>;
  source?: string[];
  versions?: string[];
  versionHistory?: Array<{
    version: string;
    appVersion: string;
    created: string;
  }>;
  readme?: string;
  values?: string;
}

export interface CatalogDetailResponse {
  data: {
    data: CatalogDetail;
    status: number;
  };
}
