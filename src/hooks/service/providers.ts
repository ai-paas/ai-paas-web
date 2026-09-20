import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { queryKeys } from '@/lib/query-keys';

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

/** 자격증명 입력 칸 하나. 백엔드 CredentialFieldSchema 와 같은 모양. */
export interface CredentialFieldSchema {
  key: string;
  label: string;
  required: boolean;
  secret: boolean;
  multiline: boolean;
  description?: string;
  /** 값의 생김새를 보여주는 예시. */
  placeholder?: string;
  /** 같은 group 끼리는 하나만 채우면 된다. */
  group?: string;
}

/** CSP 하나에 대해 "지금 통과하는" 생성 요청 한 벌. 값은 백엔드가 계정에서 조회해 조립한다. */
export interface ProvisioningDefaults {
  provider: string;
  displayName: string;
  ready: boolean;
  blockedReason?: string | null;
  credentialId?: string | null;
  credentialName?: string | null;
  region?: string | null;
  masterInstanceType?: string | null;
  workerInstanceType?: string | null;
  vcpu?: number | null;
  memoryGb?: number | null;
  gpuCount?: number | null;
  osImage?: string | null;
  providerSpec?: Record<string, string> | null;
}

/** 값 하나. 식별자가 곧 이름이면 label 은 value 와 같다. */
export interface ConfigOption {
  value: string;
  label: string;
}

export interface ProviderConfigSchemaField {
  key: string;
  type: string;
  required?: boolean;
  defaultValue?: string;
  /** 화면에 띄울 이름. 비면 키 뒷부분을 그대로 쓴다. */
  label?: string;
  description?: string;
  allowedValues?: string[];
  /** allowedValues 에 사람이 읽을 이름을 붙인 것. */
  allowedOptions?: ConfigOption[];
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
    queryKey: queryKeys.infraProviders.all,
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
    queryKey: queryKeys.infraProviders.regions(provider, credentialId),
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
    queryKey: queryKeys.infraProviders.specs({ provider, credentialId, region, gpuOnly, keyword, limit }),
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
    queryKey: queryKeys.infraProviders.images({ provider, credentialId, region, keyword, architecture, owner, limit }),
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
export const useGetProviderConfigSchema = (
  provider?: string,
  enabled: boolean = true,
  // 주면 계정에서 실제로 고를 수 있는 값이 allowedValues 에 채워진다.
  params?: { credentialId?: string; region?: string }
) => {
  const searchParams = Object.fromEntries(
    Object.entries({ credentialId: params?.credentialId, region: params?.region }).filter(
      ([, v]) => !!v
    )
  ) as Record<string, string>;
  const { data, isPending, isError, error } = useQuery({
    queryKey: queryKeys.infraProviders.configSchema(provider, searchParams),
    queryFn: () =>
      api
        .get(`any-cloud/providers/${provider}/config-schema`, { searchParams })
        .json<ListEnvelope<ProviderConfigSchemaField>>(),
    enabled: enabled && !!provider,
  });
  return { fields: unwrapList(data), isPending, isError, error };
};

/** CSP 별 자격증명 입력 필드 — 화면이 KEY=VALUE 를 직접 받지 않도록 폼을 만드는 데 쓴다. */
export const useGetProviderCredentialSchema = (provider?: string, enabled: boolean = true) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: queryKeys.infraProviders.credentialSchema(provider),
    queryFn: () =>
      api
        .get(`any-cloud/providers/${provider}/credential-schema`)
        .json<ListEnvelope<CredentialFieldSchema>>(),
    enabled: enabled && !!provider,
  });
  return { fields: unwrapList(data), isPending, isError, error };
};

/**
 * CSP 마다 지금 통과하는 생성 기본값.
 *
 * <p>화면에 값을 박아 두면 스펙이나 이미지가 갈릴 때마다 어긋나고, 그 사실을 생성 실패로야
 * 알게 된다. 백엔드가 계정에서 조회해 조립한 것을 그대로 쓴다.
 */
export const useGetProvisioningDefaults = (provider?: string, enabled: boolean = true) => {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: queryKeys.infraProviders.provisioningDefaults(provider),
    queryFn: () =>
      api
        .get('any-cloud/providers/provisioning-defaults', {
          searchParams: provider ? { provider } : undefined,
        })
        .json<ListEnvelope<ProvisioningDefaults>>(),
    enabled,
    /*
     * CSP API 를 실제로 두드려 조립한다. 백엔드도 캐시하지만 모달을 여닫을 때마다 왕복할
     * 이유가 없다. 용량처럼 바뀌는 값이 있어 오래 들고 있지는 않는다.
     */
    staleTime: 60_000,
  });
  return { defaults: unwrapList(data), isPending, isError, error, refetch };
};
