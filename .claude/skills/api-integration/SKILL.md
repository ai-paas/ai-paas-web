---
name: api-integration
description: REST API와 통합하고 React Query 훅을 작성합니다. 새로운 엔드포인트를 연결하거나(GET/POST/PUT/DELETE), 페이지네이션/무한스크롤을 구현하거나, API 응답 타입 정의 및 에러 처리가 필요할 때 사용하세요. Ky HTTP 클라이언트와 TanStack React Query v5를 활용하며, 낙관적 업데이트와 캐시 무효화 전략을 포함합니다.
---

# API Integration Skill

AI-PaaS 프로젝트의 백엔드 REST API와 통합하고 타입 안전한 데이터 페칭 로직을 구현합니다.

## When to Use This Skill

- 새로운 API 엔드포인트를 호출하는 커스텀 훅이 필요할 때
- GET 쿼리(단일/리스트/페이지네이션/무한스크롤)를 구현할 때
- POST/PUT/DELETE mutation을 작성하고 캐시 무효화가 필요할 때
- API 응답/요청 TypeScript 타입을 정의할 때
- 401 토큰 갱신, 에러 처리, 재시도 로직을 추가할 때

## 기술 스택

- **HTTP 클라이언트**: Ky 1.8.2
- **상태 관리**: TanStack React Query v5.84.2
- **타입 시스템**: TypeScript 5.8.3
- **인증**: JWT Bearer Token

## API 클라이언트 설정 (src/lib/api.ts)

### 기본 구성

```typescript
import ky from 'ky';
import { LOCAL_STORAGE_KEY } from '@/constant/local-storage';

const baseURL = import.meta.env.VITE_SERVER_BASE_URL;

export const api = ky.create({
  prefixUrl: baseURL,
  timeout: 30000,
  retry: {
    limit: 2,
    methods: ['get'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeRequest: [
      (request) => {
        const accessToken = localStorage.getItem(LOCAL_STORAGE_KEY.ACCESS_TOKEN);
        if (accessToken) {
          request.headers.set('Authorization', `Bearer ${accessToken}`);
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        // 401 에러 시 토큰 갱신
        if (response.status === 401) {
          const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEY.REFRESH_TOKEN);

          if (refreshToken) {
            try {
              const refreshResponse = await ky.post(`${baseURL}/auth/refresh`, {
                json: { refreshToken },
              }).json<{ accessToken: string; refreshToken: string }>();

              localStorage.setItem(LOCAL_STORAGE_KEY.ACCESS_TOKEN, refreshResponse.accessToken);
              localStorage.setItem(LOCAL_STORAGE_KEY.REFRESH_TOKEN, refreshResponse.refreshToken);

              // 원래 요청 재시도
              request.headers.set('Authorization', `Bearer ${refreshResponse.accessToken}`);
              return ky(request);
            } catch (error) {
              // Refresh 실패 시 로그아웃
              localStorage.removeItem(LOCAL_STORAGE_KEY.ACCESS_TOKEN);
              localStorage.removeItem(LOCAL_STORAGE_KEY.REFRESH_TOKEN);
              window.location.href = '/login';
              throw error;
            }
          }
        }

        return response;
      },
    ],
  },
});
```

## React Query 훅 패턴

### 1. GET - 단일 리소스 조회

```typescript
// src/hooks/service/resources.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Resource } from '@/types/resource';

export const useGetResource = (id: string) => {
  return useQuery({
    queryKey: ['resources', id],
    queryFn: () => api.get(`resources/${id}`).json<Resource>(),
    enabled: !!id, // id가 있을 때만 실행
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};
```

**사용 예제:**

```typescript
function ResourceDetail({ id }: { id: string }) {
  const { data, isPending, isError, error } = useGetResource(id);

  if (isPending) return <Spinner />;
  if (isError) return <ErrorMessage error={error} />;

  return <div>{data.name}</div>;
}
```

### 2. GET - 리스트 조회 (페이지네이션)

```typescript
import type { Page } from '@/types/api';

interface GetResourcesParams {
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const useGetResources = (params: GetResourcesParams = {}) => {
  return useQuery({
    queryKey: ['resources', params],
    queryFn: () =>
      api
        .get('resources', {
          searchParams: {
            search: params.search || '',
            page: params.page || 0,
            size: params.size || 10,
            sort: params.sort || 'createdAt,desc',
          },
        })
        .json<Page<Resource>>(),
    placeholderData: (previousData) => previousData, // 로딩 중에도 이전 데이터 유지
  });
};
```

**사용 예제:**

```typescript
function ResourceList() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const { data, isPending, isError } = useGetResources({ page, search });

  return (
    <div>
      <SearchInput value={search} onChange={setSearch} />
      <Table data={data?.content} />
      <Pagination
        currentPage={page}
        totalPages={data?.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
```

### 3. POST - 리소스 생성

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateResourceRequest {
  name: string;
  description: string;
  tags?: string[];
}

export const useCreateResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateResourceRequest) =>
      api.post('resources', { json: data }).json<Resource>(),
    onSuccess: (newResource) => {
      // 리스트 쿼리 무효화 (자동 리페치)
      queryClient.invalidateQueries({ queryKey: ['resources'] });

      // 또는 낙관적 업데이트
      queryClient.setQueryData<Page<Resource>>(['resources'], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          content: [newResource, ...oldData.content],
          totalElements: oldData.totalElements + 1,
        };
      });
    },
    onError: (error) => {
      console.error('Failed to create resource:', error);
      // 토스트 알림 등
    },
  });
};
```

**사용 예제:**

```typescript
function CreateResourceButton() {
  const { mutate, isPending } = useCreateResource();

  const handleSubmit = (formData: CreateResourceRequest) => {
    mutate(formData, {
      onSuccess: () => {
        toast.success('리소스가 생성되었습니다.');
        closeModal();
      },
      onError: (error) => {
        toast.error('생성에 실패했습니다.');
      },
    });
  };

  return <Button onClick={handleSubmit} loading={isPending}>생성</Button>;
}
```

### 4. PUT/PATCH - 리소스 수정

```typescript
interface UpdateResourceRequest {
  name?: string;
  description?: string;
  tags?: string[];
}

export const useUpdateResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResourceRequest }) =>
      api.put(`resources/${id}`, { json: data }).json<Resource>(),
    onSuccess: (updatedResource) => {
      // 특정 리소스 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['resources', updatedResource.id] });
      // 리스트 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
};
```

### 5. DELETE - 리소스 삭제

```typescript
export const useDeleteResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`resources/${id}`).json(),
    onMutate: async (deletedId) => {
      // 낙관적 업데이트
      await queryClient.cancelQueries({ queryKey: ['resources'] });

      const previousResources = queryClient.getQueryData<Page<Resource>>(['resources']);

      queryClient.setQueryData<Page<Resource>>(['resources'], (old) => {
        if (!old) return old;
        return {
          ...old,
          content: old.content.filter((r) => r.id !== deletedId),
          totalElements: old.totalElements - 1,
        };
      });

      return { previousResources };
    },
    onError: (err, deletedId, context) => {
      // 에러 시 롤백
      if (context?.previousResources) {
        queryClient.setQueryData(['resources'], context.previousResources);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
};
```

### 6. Infinite Query - 무한 스크롤

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

export const useGetInfiniteResources = (params: GetResourcesParams = {}) => {
  return useInfiniteQuery({
    queryKey: ['resources', 'infinite', params],
    queryFn: ({ pageParam = 0 }) =>
      api
        .get('resources', {
          searchParams: {
            ...params,
            page: pageParam,
            size: 20,
          },
        })
        .json<Page<Resource>>(),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.last ? undefined : pages.length;
    },
    initialPageParam: 0,
  });
};
```

**사용 예제:**

```typescript
function InfiniteResourceList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetInfiniteResources();

  return (
    <div>
      {data?.pages.map((page) =>
        page.content.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))
      )}

      {hasNextPage && (
        <Button onClick={() => fetchNextPage()} loading={isFetchingNextPage}>
          더 보기
        </Button>
      )}
    </div>
  );
}
```

## TypeScript 타입 정의

### API 응답 타입

```typescript
// src/types/api.ts

// 페이지네이션 응답
export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

// 에러 응답
export interface ApiError {
  message: string;
  code: string;
  status: number;
  timestamp: string;
}
```

### 리소스 타입

```typescript
// src/types/resource.ts

export interface Resource {
  id: string;
  name: string;
  description: string;
  tags: string[];
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateResourceRequest {
  name: string;
  description: string;
  tags?: string[];
}

export interface UpdateResourceRequest {
  name?: string;
  description?: string;
  tags?: string[];
  status?: 'active' | 'inactive' | 'pending';
}

export interface GetResourcesParams {
  search?: string;
  status?: 'active' | 'inactive' | 'pending';
  page?: number;
  size?: number;
  sort?: string;
}
```

## 에러 처리

### 전역 에러 핸들러

```typescript
import { QueryClient } from '@tanstack/react-query';
import { HTTPError } from 'ky';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof HTTPError) {
          // 4xx 에러는 재시도하지 않음
          if (error.response.status >= 400 && error.response.status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
      staleTime: 60 * 1000, // 1분
    },
    mutations: {
      retry: false,
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});
```

### 컴포넌트 레벨 에러 처리

```typescript
function ResourceDetail({ id }: { id: string }) {
  const { data, isError, error } = useGetResource(id);

  if (isError) {
    if (error instanceof HTTPError) {
      if (error.response.status === 404) {
        return <NotFoundError message="리소스를 찾을 수 없습니다." />;
      }
      if (error.response.status === 403) {
        return <ForbiddenError message="접근 권한이 없습니다." />;
      }
    }
    return <GenericError error={error} />;
  }

  return <div>{data?.name}</div>;
}
```

## 고급 패턴

### 1. Dependent Queries - 순차적 쿼리

```typescript
function ResourceWithDetails({ id }: { id: string }) {
  // 첫 번째 쿼리
  const { data: resource } = useGetResource(id);

  // resource가 로드된 후에만 실행
  const { data: details } = useQuery({
    queryKey: ['resource-details', resource?.detailId],
    queryFn: () => api.get(`details/${resource!.detailId}`).json(),
    enabled: !!resource?.detailId,
  });

  return <div>{details?.content}</div>;
}
```

### 2. Parallel Queries - 병렬 쿼리

```typescript
function Dashboard() {
  const resources = useGetResources();
  const users = useGetUsers();
  const stats = useGetStats();

  if (resources.isPending || users.isPending || stats.isPending) {
    return <Spinner />;
  }

  return (
    <div>
      <ResourceChart data={resources.data} />
      <UserList data={users.data} />
      <StatsPanel data={stats.data} />
    </div>
  );
}
```

### 3. Prefetching - 미리 가져오기

```typescript
function ResourceListItem({ resource }: { resource: Resource }) {
  const queryClient = useQueryClient();

  const prefetchDetails = () => {
    queryClient.prefetchQuery({
      queryKey: ['resources', resource.id],
      queryFn: () => api.get(`resources/${resource.id}`).json<Resource>(),
    });
  };

  return (
    <div onMouseEnter={prefetchDetails}>
      <Link to={`/resources/${resource.id}`}>{resource.name}</Link>
    </div>
  );
}
```

### 4. Background Refetching - 백그라운드 갱신

```typescript
export const useGetLiveStats = () => {
  return useQuery({
    queryKey: ['stats', 'live'],
    queryFn: () => api.get('stats/live').json<LiveStats>(),
    refetchInterval: 5000, // 5초마다 자동 갱신
    refetchIntervalInBackground: true, // 백그라운드에서도 갱신
  });
};
```

## Query Keys 관리

### Factory 패턴

```typescript
// src/hooks/service/query-keys.ts

export const resourceKeys = {
  all: ['resources'] as const,
  lists: () => [...resourceKeys.all, 'list'] as const,
  list: (params: GetResourcesParams) => [...resourceKeys.lists(), params] as const,
  details: () => [...resourceKeys.all, 'detail'] as const,
  detail: (id: string) => [...resourceKeys.details(), id] as const,
};

// 사용
export const useGetResource = (id: string) => {
  return useQuery({
    queryKey: resourceKeys.detail(id),
    queryFn: () => api.get(`resources/${id}`).json<Resource>(),
  });
};

export const useCreateResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateResourceRequest) =>
      api.post('resources', { json: data }).json<Resource>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
    },
  });
};
```

## 환경 변수

```typescript
// .env.local
VITE_SERVER_BASE_URL=https://api.example.com

// vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_SERVER_BASE_URL: string;
}

// 사용
const baseURL = import.meta.env.VITE_SERVER_BASE_URL;
```

## 개발 체크리스트

- [ ] TypeScript 타입 정의 (요청/응답)
- [ ] Query key 정의
- [ ] GET 훅 작성 (useQuery)
- [ ] POST/PUT/DELETE 훅 작성 (useMutation)
- [ ] 에러 처리 구현
- [ ] 로딩 상태 처리
- [ ] 캐시 무효화 전략 (invalidateQueries)
- [ ] 낙관적 업데이트 (필요시)
- [ ] Stale time / GC time 설정
- [ ] Retry 정책 설정

## 디버깅

### React Query Devtools

```typescript
// src/main.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### 네트워크 요청 로깅

```typescript
export const api = ky.create({
  hooks: {
    beforeRequest: [
      (request) => {
        console.log('→', request.method, request.url);
      },
    ],
    afterResponse: [
      (request, options, response) => {
        console.log('←', response.status, request.url);
        return response;
      },
    ],
  },
});
```
