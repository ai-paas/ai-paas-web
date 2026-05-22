import { useQuery } from '@tanstack/react-query';

import { api } from '../../lib/api';
import type {
  CatalogResponse,
  CatalogDetailResponse,
  CatalogDetail,
  CatalogListMeta,
  Chart,
  CatalogReadmeResponse,
  CatalogReadmeData,
  CatalogValuesResponse,
  CatalogValuesData,
  CatalogDocumentResponse,
  CatalogDocumentData,
} from '../../types/catalog';

type CatalogDataLike = {
  charts?: unknown;
  page?: number;
  size?: number;
  total?: number;
  total_pages?: number;
};

type CatalogQueryResult = {
  charts: Chart[];
  meta?: CatalogListMeta;
};

const normalizeCatalogResponse = (response: CatalogResponse): CatalogQueryResult => {
  const result: CatalogQueryResult = { charts: [] };

  if (Array.isArray(response)) {
    result.charts = response;
    return result;
  }

  const extractMeta = (payload: Record<string, unknown>): CatalogListMeta | undefined => {
    const meta: CatalogListMeta = {
      page: typeof payload.page === 'number' ? payload.page : undefined,
      size: typeof payload.size === 'number' ? payload.size : undefined,
      total: typeof payload.total === 'number' ? payload.total : undefined,
      totalPages: typeof payload.total_pages === 'number' ? payload.total_pages : undefined,
    };

    return Object.values(meta).some((value) => value !== undefined) ? meta : undefined;
  };

  const maybeObject = response as Record<string, unknown>;

  if (Array.isArray(maybeObject.data)) {
    result.charts = maybeObject.data as Chart[];
    result.meta = extractMeta(maybeObject);
    return result;
  }

  if (maybeObject.data && typeof maybeObject.data === 'object') {
    const nested = maybeObject.data as Record<string, unknown>;

    if (Array.isArray(nested.data)) {
      result.charts = nested.data as Chart[];
      result.meta = extractMeta(nested);
      return result;
    }

    if (Array.isArray(nested.charts)) {
      result.charts = nested.charts as Chart[];
      result.meta = extractMeta(nested);
      return result;
    }
  }

  if (
    (maybeObject as { data?: { data?: CatalogDataLike } }).data?.data &&
    typeof (maybeObject as { data?: { data?: CatalogDataLike } }).data?.data === 'object'
  ) {
    const catalogData = (maybeObject as { data?: { data?: CatalogDataLike } }).data
      ?.data as CatalogDataLike;

    if (Array.isArray(catalogData?.charts)) {
      result.charts = catalogData.charts as Chart[];
      result.meta = extractMeta(catalogData);
      return result;
    }
  }

  return result;
};

export const useGetCatalog = (repoName: string) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['catalog', repoName],
    queryFn: () =>
      api
        .get<CatalogResponse>(`any-cloud/catalog/${repoName}`)
        .json()
        .then((response) => normalizeCatalogResponse(response)),
    enabled: !!repoName,
  });

  return {
    catalog: data,
    charts: data?.charts ?? [],
    meta: data?.meta,
    isPending,
    isError,
  };
};

export const useGetCatalogDetail = (repoName: string, chartName: string, version?: string) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['catalog-detail', repoName, chartName, version],
    queryFn: async () => {
        const url = `any-cloud/catalog/${repoName}/${chartName}/detail`;
      const searchParams = version ? { version } : undefined;

        const response = await api.get(url, { searchParams }).json<CatalogDetailResponse>();

      // 응답 구조에 따라 CatalogDetail 추출
      // 실제 응답: { data: CatalogDetail, status: number }
      // 또는 중첩 구조: { data: { data: CatalogDetail, status: number } }
      const rawData = response.data?.data || response.data || response;
      const catalogDetail = rawData as unknown as CatalogDetail;

      // source 필드 정규화: 문자열이면 배열로 변환
        if (catalogDetail.source && !Array.isArray(catalogDetail.source)) {
          catalogDetail.source = [catalogDetail.source];
        }

        return catalogDetail;
    },
    enabled: !!repoName && !!chartName,
  });

  return {
    catalogDetail: data,
    isPending,
    isError,
    error,
  };
};

type DocumentFieldExtractorOptions = {
  priorityFields: string[];
};

const normalizeDocumentResponse = (
  response: CatalogDocumentResponse,
  options: DocumentFieldExtractorOptions,
  inheritedVersion?: string
): CatalogDocumentData => {
  if (!response) {
    return { version: inheritedVersion, content: '' };
  }

  if (typeof response === 'string') {
    return { version: inheritedVersion, content: response };
  }

  if (Array.isArray(response)) {
    const responseItems = response as unknown[];
    const parts: string[] = [];

    for (const item of responseItems) {
      if (typeof item === 'string') {
        if (item) parts.push(item);
        continue;
      }

      if (Array.isArray(item)) {
        const nestedArray = item as unknown[];
        const nestedStrings = nestedArray.filter(
          (value): value is string => typeof value === 'string'
        );
        if (nestedStrings.length > 0) {
          parts.push(nestedStrings.join('\n'));
        }
        continue;
      }

      if (item && typeof item === 'object') {
        const nested = normalizeDocumentResponse(
          item as CatalogDocumentResponse,
          options,
          inheritedVersion
        );
        if (nested.content) {
          parts.push(nested.content);
        }
      }
    }

    return { version: inheritedVersion, content: parts.join('\n\n') };
  }

  if (typeof response === 'object') {
    const record = response as Record<string, unknown>;
    const versionCandidate = typeof record.version === 'string' ? record.version : inheritedVersion;

    const fieldKeys = [...options.priorityFields, 'content', 'result', 'data'];

    for (const fieldKey of fieldKeys) {
      const field = record[fieldKey];
      if (field === undefined || field === null) continue;

      if (typeof field === 'string') {
        return { version: versionCandidate, content: field };
      }

      if (Array.isArray(field)) {
        const fieldItems = field as unknown[];
        const parts: string[] = [];

        for (const item of fieldItems) {
          if (typeof item === 'string') {
            if (item) parts.push(item);
            continue;
          }

          if (Array.isArray(item)) {
            const nestedArray = item as unknown[];
            const nestedStrings = nestedArray.filter(
              (value): value is string => typeof value === 'string'
            );
            if (nestedStrings.length > 0) {
              parts.push(nestedStrings.join('\n'));
            }
            continue;
          }

          if (item && typeof item === 'object') {
            const nested = normalizeDocumentResponse(
              item as CatalogDocumentResponse,
              options,
              versionCandidate
            );
            if (nested.content) {
              parts.push(nested.content);
            }
          }
        }

        if (parts.length > 0) {
          return { version: versionCandidate, content: parts.join('\n\n') };
        }

        continue;
      }

      if (typeof field === 'object') {
        const nested = normalizeDocumentResponse(
          field as CatalogDocumentResponse,
          options,
          versionCandidate
        );
        if (nested.content) {
          return nested.version
            ? nested
            : { ...nested, version: nested.version ?? versionCandidate };
        }
      }
    }

    return { version: versionCandidate, content: '' };
  }

  return { version: inheritedVersion, content: '' };
};

const normalizeReadmeResponse = (response: CatalogReadmeResponse): CatalogReadmeData => {
  return normalizeDocumentResponse(response, {
    priorityFields: ['readmeContent', 'readme', 'markdown'],
  });
};

const normalizeValuesResponse = (response: CatalogValuesResponse): CatalogValuesData => {
  return normalizeDocumentResponse(response, {
    priorityFields: ['valuesContent', 'values', 'yaml'],
  });
};

export const useGetCatalogReadme = (repoName: string, chartName: string, version?: string) => {
  return useQuery({
    queryKey: ['catalog-readme', repoName, chartName, version],
    queryFn: () =>
      api
        .get<CatalogReadmeResponse>(`any-cloud/catalog/${repoName}/${chartName}/readme`, {
          searchParams: version ? { version } : undefined,
        })
        .json()
        .then((response) => normalizeReadmeResponse(response)),
    enabled: !!repoName && !!chartName,
  });
};

export const useGetCatalogValues = (repoName: string, chartName: string, version?: string) => {
  return useQuery({
    queryKey: ['catalog-values', repoName, chartName, version],
    queryFn: () =>
      api
        .get<CatalogValuesResponse>(`any-cloud/catalog/${repoName}/${chartName}/values`, {
          searchParams: version ? { version } : undefined,
        })
        .json()
        .then((response) => normalizeValuesResponse(response)),
    enabled: !!repoName && !!chartName && !!version,
    staleTime: 0,
    refetchOnMount: true,
    placeholderData: undefined, // queryKey가 변경되면 이전 데이터를 사용하지 않음
  });
};
