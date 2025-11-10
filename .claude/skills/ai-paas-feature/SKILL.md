---
name: ai-paas-feature
description: AI-PaaS 플랫폼의 새로운 기능을 개발합니다. 서비스, 모델, 워크플로우, 데이터셋, 지식베이스, 프롬프트 관리 등의 CRUD 기능을 추가하거나 수정할 때 사용하세요. 모달 기반 폼, React Query 훅, 테이블 컴포넌트를 활용한 일관된 패턴으로 구현합니다.
---

# AI-PaaS Feature Development Skill

이 skill은 AI-PaaS 웹 애플리케이션의 새로운 기능을 개발하거나 기존 기능을 확장할 때 사용합니다.

## 프로젝트 개요

- **프레임워크**: React 18.3.1 + TypeScript 5.8.3
- **빌드 도구**: Vite 7.1.2 with SWC
- **상태 관리**: TanStack React Query v5.84.2
- **라우팅**: React Router v7.8.0
- **UI 라이브러리**: @innogrid/ui v0.0.27
- **스타일링**: Tailwind CSS 4.1.11 + SCSS

## 일관된 CRUD 패턴

### 1. 리스트 페이지 패턴 (src/pages/{feature}/page.tsx)

```typescript
export default function FeaturePage() {
  const searchInputProps = useSearchInputState();
  const paginationProps = useTablePagination();
  const selectionProps = useTableSelection<Feature>();

  const { data, isPending, isError } = useGetFeatures({
    search: searchInputProps.value,
    page: paginationProps.currentPage,
    size: paginationProps.pageSize,
  });

  return (
    <div className="page">
      <PageBreadcrumb items={breadcrumbs} />
      <PageTitle>기능 관리</PageTitle>
      <PageToolBox>
        <SearchInput {...searchInputProps} />
        <CreateFeatureButton />
      </PageToolBox>
      <Table
        columns={columns}
        data={data?.content}
        pagination={paginationProps}
        selection={selectionProps}
      />
    </div>
  );
}
```

### 2. Custom Hook 패턴 (src/hooks/service/{feature}.ts)

```typescript
// GET 리스트
export const useGetFeatures = (params: GetFeaturesParams) => {
  return useQuery({
    queryKey: ['features', params],
    queryFn: () => api.get('features', { searchParams: params }).json<Page<Feature>>(),
  });
};

// POST 생성
export const useCreateFeature = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFeatureRequest) =>
      api.post('features', { json: data }).json<Feature>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
    },
  });
};

// PUT 수정
export const useUpdateFeature = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFeatureRequest }) =>
      api.put(`features/${id}`, { json: data }).json<Feature>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
    },
  });
};

// DELETE 삭제
export const useDeleteFeature = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`features/${id}`).json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
    },
  });
};
```

### 3. 모달 버튼 컴포넌트 (src/components/features/{feature}/)

```typescript
export function CreateFeatureButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<CreateFeatureRequest>({
    name: '',
    description: '',
  });

  const { mutate, isPending } = useCreateFeature();

  const handleSubmit = () => {
    mutate(formData, {
      onSuccess: () => {
        setIsOpen(false);
        setFormData({ name: '', description: '' });
      },
    });
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>생성</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalHeader>기능 생성</ModalHeader>
        <ModalContent>
          <Input
            label="이름"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Textarea
            label="설명"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </ModalContent>
        <ModalFooter>
          <Button onClick={() => setIsOpen(false)} variant="outline">취소</Button>
          <Button onClick={handleSubmit} loading={isPending}>생성</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
```

### 4. TypeScript 타입 정의 (src/types/{feature}.ts)

```typescript
export interface Feature {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeatureRequest {
  name: string;
  description: string;
}

export interface UpdateFeatureRequest {
  name?: string;
  description?: string;
}

export interface GetFeaturesParams {
  search?: string;
  page?: number;
  size?: number;
}
```

## 디렉토리 구조

```
src/
├── pages/{feature}/
│   ├── page.tsx                    # 리스트 페이지
│   ├── create/page.tsx             # 생성 페이지 (복잡한 경우)
│   └── [id]/
│       ├── page.tsx                # 상세 페이지
│       └── edit/page.tsx           # 수정 페이지
├── components/features/{feature}/
│   ├── create-button.tsx           # 생성 버튼 + 모달
│   ├── edit-button.tsx             # 수정 버튼 + 모달
│   ├── delete-button.tsx           # 삭제 버튼 + 확인 모달
│   └── feature-table.tsx           # 테이블 컴포넌트
├── hooks/service/
│   └── {feature}.ts                # API 훅
└── types/
    └── {feature}.ts                # TypeScript 타입
```

## 주요 컴포넌트 (@innogrid/ui)

- `Button`: 버튼 (variant: primary, outline, ghost)
- `Modal`: 모달 (ModalHeader, ModalContent, ModalFooter)
- `Table`: 테이블 (페이지네이션, 정렬, 선택)
- `Input`: 입력 필드
- `Textarea`: 텍스트 영역
- `Select`: 셀렉트 박스
- `SearchInput`: 검색 입력
- `Badge`: 배지
- `Tabs`: 탭

## 스타일링 규칙

1. **Tailwind CSS 우선**: 유틸리티 클래스 활용
2. **SCSS 모듈**: 복잡한 스타일은 SCSS 모듈로 분리
3. **반응형 디자인**: `sm:`, `md:`, `lg:` 브레이크포인트 활용
4. **컬러 시스템**: Tailwind 커스텀 컬러 사용

## API 통신

- **Base URL**: `import.meta.env.VITE_SERVER_BASE_URL`
- **HTTP 클라이언트**: Ky (src/lib/api.ts)
- **인증**: Bearer Token (자동 삽입)
- **토큰 갱신**: 401 에러 시 자동 refresh

## 코드 품질

- **TypeScript strict mode**: 타입 안정성 보장
- **ESLint**: 코드 품질 검사
- **Prettier**: 코드 포맷팅 (100자 제한)
- **명명 규칙**: camelCase (변수/함수), PascalCase (컴포넌트/타입)

## 주요 기능 영역

1. **서비스 관리** (src/pages/service/)
2. **모델 관리** (src/pages/model/)
3. **워크플로우 관리** (src/pages/workflow/)
4. **데이터셋 관리** (src/pages/dataset/)
5. **지식베이스 관리** (src/pages/knowledge-base/)
6. **프롬프트 관리** (src/pages/prompt/)
7. **멤버 관리** (src/pages/member-management/)
8. **인프라 관리** (src/pages/infra-management/)
9. **학습 시스템** (src/pages/learning/)
10. **대시보드** (src/pages/dashboard/)

## 개발 가이드라인

1. **기존 패턴 따르기**: 위의 CRUD 패턴을 일관되게 사용
2. **재사용성**: 공통 로직은 커스텀 훅으로 추출
3. **타입 안정성**: 모든 API 응답에 타입 정의
4. **에러 처리**: React Query의 isError 상태 활용
5. **로딩 상태**: isPending으로 로딩 UI 표시
6. **접근성**: ARIA 속성 및 시맨틱 HTML 사용

## 예제: 새로운 기능 추가 체크리스트

- [ ] TypeScript 타입 정의 (src/types/)
- [ ] API 커스텀 훅 작성 (src/hooks/service/)
- [ ] 리스트 페이지 구현 (src/pages/{feature}/page.tsx)
- [ ] CRUD 버튼 컴포넌트 (src/components/features/{feature}/)
- [ ] 라우터에 경로 추가 (src/router/router.tsx)
- [ ] 사이드바 메뉴 추가 (src/components/layout/sidebar.tsx)
- [ ] 코드 린트 및 포맷팅 (npm run lint)
