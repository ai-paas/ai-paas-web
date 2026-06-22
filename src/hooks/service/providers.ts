import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export interface ProviderInfo {
  provider: string;
  displayName?: string;
  supportsRegions?: boolean;
  supportsInstanceTypes?: boolean;
  supportsImages?: boolean;
  liveDiscoveryImplemented?: boolean;
  recommendedRegion?: string;
  [key: string]: unknown;
}

export interface ProviderRegion {
  provider: string;
  id: string;
  name: string;
  available?: boolean;
}

export interface ProviderSpec {
  provider: string;
  region?: string;
  id: string;
  name?: string;
  family?: string;
  vcpu?: number;
  memoryGb?: number;
  gpuCount?: number;
  architecture?: string;
  description?: string;
  [key: string]: unknown;
}

export interface ProviderImage {
  provider: string;
  region?: string;
  id: string;
  name?: string;
  os?: string;
  architecture?: string;
  owner?: string;
  [key: string]: unknown;
}

export interface ProviderConfigSchemaField {
  key: string;
  type: string;
  required?: boolean;
  defaultValue?: string;
  description?: string;
  allowedValues?: string[];
  [key: string]: unknown;
}

// backend envelope: {data: {items: [...]}} | {items: [...]} | {data: [...]} 모두 처리.
type ListEnvelope<T> = {
  items?: T[];
  data?: T[] | { items?: T[] };
};
const unwrapList = <T>(payload: ListEnvelope<T> | undefined): T[] => {
  if (!payload) return [];
  if (payload.items) return payload.items;
  const d = payload.data;
  if (Array.isArray(d)) return d;
  if (d && typeof d === 'object' && 'items' in d) return (d as { items?: T[] }).items ?? [];
  return [];
};

// 지원 CSP 목록
export const useGetProviders = () => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['providers'],
    queryFn: () => api.get('any-cloud/providers').json<ListEnvelope<ProviderInfo>>(),
  });
  return { providers: unwrapList(data), isPending, isError, error };
};

// CSP 별 region 목록 — credentialId 가 변경되면 자동 refetch (live CSP API 호출)
export const useGetProviderRegions = (
  provider?: string,
  credentialId?: string,
  enabled: boolean = true
) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['provider-regions', provider, credentialId],
    queryFn: () =>
      api
        .get(`any-cloud/providers/${provider}/regions`, {
          searchParams: credentialId ? { credentialId } : undefined,
        })
        .json<ListEnvelope<ProviderRegion>>(),
    enabled: enabled && !!provider,
  });
  return { regions: unwrapList(data), isPending, isError, error };
};

// CSP 별 VM spec 목록 — provider/region/credentialId/gpuOnly/keyword 별 조합
export const useGetProviderSpecs = (
  params: {
    provider?: string;
    credentialId?: string;
    region?: string;
    gpuOnly?: boolean;
    keyword?: string;
    limit?: number;
  },
  enabled: boolean = true
) => {
  const { provider, credentialId, region, gpuOnly, keyword, limit } = params;
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['provider-specs', provider, credentialId, region, gpuOnly, keyword, limit],
    queryFn: () => {
      const searchParams = Object.fromEntries(
        Object.entries({
          credentialId,
          region,
          gpuOnly: gpuOnly ? 'true' : undefined,
          keyword,
          limit: limit !== undefined ? String(limit) : undefined,
        }).filter(([, v]) => v !== undefined && v !== '')
      );
      return api
        .get(`any-cloud/providers/${provider}/specs`, { searchParams })
        .json<ListEnvelope<ProviderSpec>>();
    },
    enabled: enabled && !!provider,
  });
  return { specs: unwrapList(data), isPending, isError, error };
};

// CSP 별 OS 이미지 목록
export const useGetProviderImages = (
  params: {
    provider?: string;
    credentialId?: string;
    region?: string;
    keyword?: string;
    architecture?: string;
    owner?: string;
    limit?: number;
  },
  enabled: boolean = true
) => {
  const { provider, credentialId, region, keyword, architecture, owner, limit } = params;
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['provider-images', provider, credentialId, region, keyword, architecture, owner, limit],
    queryFn: () => {
      const searchParams = Object.fromEntries(
        Object.entries({
          credentialId,
          region,
          keyword,
          architecture,
          owner,
          limit: limit !== undefined ? String(limit) : undefined,
        }).filter(([, v]) => v !== undefined && v !== '')
      );
      return api
        .get(`any-cloud/providers/${provider}/images`, { searchParams })
        .json<ListEnvelope<ProviderImage>>();
    },
    enabled: enabled && !!provider,
  });
  return { images: unwrapList(data), isPending, isError, error };
};

// CSP 별 클러스터 설정 스키마
export const useGetProviderConfigSchema = (provider?: string, enabled: boolean = true) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['provider-config-schema', provider],
    queryFn: () =>
      api
        .get(`any-cloud/providers/${provider}/config-schema`)
        .json<ListEnvelope<ProviderConfigSchemaField>>(),
    enabled: enabled && !!provider,
  });
  return { fields: unwrapList(data), isPending, isError, error };
};
