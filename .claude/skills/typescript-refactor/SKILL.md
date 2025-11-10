---
name: typescript-refactor
description: TypeScript 코드를 리팩토링하고 타입 안정성을 개선합니다. 타입 에러 수정, 제네릭 추가, 인터페이스 재구성, 유틸리티 타입 활용, 또는 strict mode 마이그레이션이 필요할 때 사용하세요.
---

# TypeScript Refactoring Skill

TypeScript 5.8.3 strict mode 환경에서 타입 안정성과 코드 품질을 향상시킵니다.

## When to Use This Skill

- any 타입을 제거하고 구체적인 타입으로 변경할 때
- 타입 에러를 수정할 때 (null/undefined, 타입 불일치 등)
- 제네릭을 추가하여 재사용성을 높일 때
- Union Type을 Discriminated Union으로 리팩토링할 때
- Utility Types(Partial, Pick, Omit 등)를 활용할 때
- React Props, Event Handler, Ref 타입을 정의할 때
- API 응답 타입 정의 및 타입 가드를 추가할 때

## 프로젝트 TypeScript 설정

### tsconfig.app.json

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## 일반적인 리팩토링 패턴

### 1. Any 타입 제거

**Before:**
```typescript
function processData(data: any) {
  return data.map((item: any) => item.name);
}
```

**After:**
```typescript
interface DataItem {
  id: string;
  name: string;
}

function processData(data: DataItem[]): string[] {
  return data.map((item) => item.name);
}
```

### 2. 타입 가드 활용

**Before:**
```typescript
function handleResponse(response: unknown) {
  if (response) {
    // Type error: Object is of type 'unknown'
    console.log(response.data);
  }
}
```

**After:**
```typescript
interface ApiResponse {
  data: unknown;
  status: number;
}

function isApiResponse(value: unknown): value is ApiResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    'status' in value
  );
}

function handleResponse(response: unknown) {
  if (isApiResponse(response)) {
    console.log(response.data); // ✓ Type-safe
  }
}
```

### 3. 제네릭 활용

**Before:**
```typescript
function getFirstItem(items: any[]): any {
  return items[0];
}
```

**After:**
```typescript
function getFirstItem<T>(items: T[]): T | undefined {
  return items[0];
}

// 사용
const firstNumber = getFirstItem([1, 2, 3]); // number | undefined
const firstName = getFirstItem(['a', 'b']); // string | undefined
```

### 4. Union Type을 Discriminated Union으로

**Before:**
```typescript
interface Resource {
  id: string;
  type: 'model' | 'service' | 'workflow';
  modelConfig?: ModelConfig;
  serviceConfig?: ServiceConfig;
  workflowConfig?: WorkflowConfig;
}
```

**After:**
```typescript
interface BaseResource {
  id: string;
}

interface ModelResource extends BaseResource {
  type: 'model';
  modelConfig: ModelConfig;
}

interface ServiceResource extends BaseResource {
  type: 'service';
  serviceConfig: ServiceConfig;
}

interface WorkflowResource extends BaseResource {
  type: 'workflow';
  workflowConfig: WorkflowConfig;
}

type Resource = ModelResource | ServiceResource | WorkflowResource;

// 타입 가드
function handleResource(resource: Resource) {
  switch (resource.type) {
    case 'model':
      console.log(resource.modelConfig); // ✓ Type-safe
      break;
    case 'service':
      console.log(resource.serviceConfig); // ✓ Type-safe
      break;
    case 'workflow':
      console.log(resource.workflowConfig); // ✓ Type-safe
      break;
  }
}
```

### 5. Optional Chaining & Nullish Coalescing

**Before:**
```typescript
const userName = user && user.profile && user.profile.name
  ? user.profile.name
  : 'Anonymous';
```

**After:**
```typescript
const userName = user?.profile?.name ?? 'Anonymous';
```

### 6. Non-null Assertion 제거

**Before:**
```typescript
function getUser(id: string) {
  const user = users.find(u => u.id === id);
  return user!.name; // ⚠️ Unsafe!
}
```

**After:**
```typescript
function getUser(id: string): string | null {
  const user = users.find(u => u.id === id);
  return user?.name ?? null;
}

// 또는 에러 던지기
function getUserOrThrow(id: string): string {
  const user = users.find(u => u.id === id);
  if (!user) {
    throw new Error(`User not found: ${id}`);
  }
  return user.name;
}
```

## React 관련 리팩토링

### 1. Props 타입 정의

**Before:**
```typescript
function Button({ children, onClick, variant }) {
  return <button onClick={onClick}>{children}</button>;
}
```

**After:**
```typescript
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  className?: string;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(className, variant)}
    >
      {children}
    </button>
  );
}
```

### 2. Event Handler 타입

**Before:**
```typescript
function handleChange(e: any) {
  setValue(e.target.value);
}
```

**After:**
```typescript
function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  setValue(e.target.value);
}

// 또는 더 간단하게
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};
```

### 3. Ref 타입

**Before:**
```typescript
const inputRef = useRef(null);
```

**After:**
```typescript
const inputRef = useRef<HTMLInputElement>(null);

// 사용
useEffect(() => {
  inputRef.current?.focus(); // ✓ Type-safe
}, []);
```

### 4. Custom Hook 타입

**Before:**
```typescript
function useApi(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  // ...
  return { data, loading };
}
```

**After:**
```typescript
interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

function useApi<T>(url: string): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(url);
      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [url]);

  return { data, loading, error, refetch };
}

// 사용
const { data } = useApi<User>('/api/user');
// data는 User | null 타입
```

## API 응답 타입 정의

### 1. Zod를 사용한 런타임 검증 (권장)

```typescript
import { z } from 'zod';

// 스키마 정의
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  age: z.number().optional(),
});

// 타입 추론
type User = z.infer<typeof UserSchema>;

// API 호출 시 검증
async function fetchUser(id: string): Promise<User> {
  const response = await api.get(`users/${id}`).json();
  return UserSchema.parse(response); // 런타임 검증 + 타입 보장
}
```

### 2. 수동 타입 정의

```typescript
// src/types/api.ts

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export interface Page<T> {
  content: T[];
  pageable: Pageable;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: Sort;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface Sort {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
}
```

## 유틸리티 타입 활용

### 1. Partial - 모든 속성을 선택적으로

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

// 부분 업데이트
function updateUser(id: string, updates: Partial<User>) {
  // updates의 모든 필드는 선택적
}

updateUser('1', { name: 'John' }); // ✓
updateUser('1', { email: 'john@example.com' }); // ✓
```

### 2. Required - 모든 속성을 필수로

```typescript
interface UserForm {
  name?: string;
  email?: string;
}

function validateUser(user: Required<UserForm>) {
  // user.name, user.email 모두 필수
}
```

### 3. Pick - 특정 속성만 선택

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

type UserPublic = Pick<User, 'id' | 'name' | 'email'>;
// { id: string; name: string; email: string; }
```

### 4. Omit - 특정 속성 제외

```typescript
interface User {
  id: string;
  name: string;
  password: string;
}

type UserWithoutPassword = Omit<User, 'password'>;
// { id: string; name: string; }

interface CreateUserRequest extends Omit<User, 'id'> {
  // id 제외한 나머지 필드
}
```

### 5. Record - 키-값 타입 정의

```typescript
type Status = 'active' | 'inactive' | 'pending';

const statusLabels: Record<Status, string> = {
  active: '활성',
  inactive: '비활성',
  pending: '대기중',
};
```

### 6. Extract & Exclude

```typescript
type T1 = 'a' | 'b' | 'c';
type T2 = Extract<T1, 'a' | 'b'>; // 'a' | 'b'
type T3 = Exclude<T1, 'a' | 'b'>; // 'c'
```

### 7. ReturnType - 함수 반환 타입 추출

```typescript
function getUser() {
  return { id: '1', name: 'John' };
}

type User = ReturnType<typeof getUser>;
// { id: string; name: string; }
```

### 8. Parameters - 함수 파라미터 타입 추출

```typescript
function createUser(name: string, age: number) {
  return { name, age };
}

type CreateUserParams = Parameters<typeof createUser>;
// [name: string, age: number]
```

## 고급 패턴

### 1. Branded Types - 타입 안전성 강화

```typescript
type UserId = string & { readonly __brand: 'UserId' };
type Email = string & { readonly __brand: 'Email' };

function createUserId(id: string): UserId {
  return id as UserId;
}

function createEmail(email: string): Email {
  if (!email.includes('@')) {
    throw new Error('Invalid email');
  }
  return email as Email;
}

function sendEmail(to: Email, from: Email) {
  // Email 타입만 허용
}

const userId = createUserId('123');
const email = createEmail('test@example.com');

// sendEmail(userId, email); // ❌ Type error!
sendEmail(email, email); // ✓
```

### 2. Template Literal Types

```typescript
type Color = 'red' | 'blue' | 'green';
type Size = 'sm' | 'md' | 'lg';

type ButtonClass = `btn-${Color}-${Size}`;
// 'btn-red-sm' | 'btn-red-md' | 'btn-red-lg' |
// 'btn-blue-sm' | 'btn-blue-md' | 'btn-blue-lg' |
// 'btn-green-sm' | 'btn-green-md' | 'btn-green-lg'
```

### 3. Mapped Types

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Optional<T> = {
  [P in keyof T]?: T[P];
};

type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};
```

### 4. Conditional Types

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<string>; // true
type B = IsString<number>; // false

// 실용적 예제
type Unwrap<T> = T extends Promise<infer U> ? U : T;

type A = Unwrap<Promise<string>>; // string
type B = Unwrap<number>; // number
```

### 5. Type Predicates (타입 서술어)

```typescript
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value
  );
}

function processValue(value: unknown) {
  if (isUser(value)) {
    console.log(value.name); // ✓ value는 User 타입
  }
}
```

## React Query 타입 패턴

```typescript
// src/hooks/service/resources.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Resource, CreateResourceRequest } from '@/types/resource';
import type { Page } from '@/types/api';

interface GetResourcesParams {
  search?: string;
  page?: number;
  size?: number;
}

export const useGetResources = (
  params: GetResourcesParams = {}
): UseQueryResult<Page<Resource>, Error> => {
  return useQuery({
    queryKey: ['resources', params],
    queryFn: () =>
      api
        .get('resources', { searchParams: params })
        .json<Page<Resource>>(),
  });
};

export const useCreateResource = (): UseMutationResult<
  Resource,
  Error,
  CreateResourceRequest
> => {
  return useMutation({
    mutationFn: (data: CreateResourceRequest) =>
      api.post('resources', { json: data }).json<Resource>(),
  });
};
```

## 타입 에러 해결 패턴

### 1. Object is possibly 'null' or 'undefined'

```typescript
// ❌ Bad
const name = user.name; // Error if user is possibly null

// ✓ Good
const name = user?.name;
// 또는
if (user) {
  const name = user.name;
}
```

### 2. Type 'X' is not assignable to type 'Y'

```typescript
// ❌ Bad
const status: 'active' | 'inactive' = getStatus(); // getStatus()가 string 반환

// ✓ Good
const status = getStatus() as 'active' | 'inactive';
// 또는 타입 가드
function isValidStatus(value: string): value is 'active' | 'inactive' {
  return value === 'active' || value === 'inactive';
}
```

### 3. Property 'X' does not exist on type 'Y'

```typescript
// ❌ Bad
const data = response.data; // response가 unknown

// ✓ Good
if (isApiResponse(response)) {
  const data = response.data;
}
```

## ESLint 규칙과 TypeScript

```typescript
// @typescript-eslint/no-explicit-any - any 사용 금지
// ❌ Bad
function process(data: any) {}

// ✓ Good
function process<T>(data: T) {}

// @typescript-eslint/no-unused-vars - 미사용 변수 금지
// ❌ Bad
const unused = 'value';

// ✓ Good - 언더스코어로 의도적 미사용 표시
const _intentionallyUnused = 'value';

// @typescript-eslint/explicit-function-return-type
// 함수 반환 타입 명시 (선택사항)
function getUser(): User {
  return { id: '1', name: 'John' };
}
```

## 리팩토링 체크리스트

- [ ] `any` 타입 제거
- [ ] Non-null assertion (`!`) 제거
- [ ] 타입 가드 추가
- [ ] 제네릭 활용
- [ ] Union Type을 Discriminated Union으로
- [ ] Optional Chaining & Nullish Coalescing 적용
- [ ] Props 인터페이스 정의
- [ ] Event Handler 타입 명시
- [ ] API 응답 타입 정의
- [ ] Utility Types 활용
- [ ] 에러 타입 정의 및 처리
- [ ] ESLint 경고 해결
- [ ] TypeScript strict 모드 에러 해결

## 도구 및 명령어

```bash
# 타입 체크
npm run type-check
# 또는
tsc --noEmit

# ESLint 검사
npm run lint

# 자동 수정
npm run lint -- --fix
```

## 참고 자료

- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/
- React TypeScript Cheatsheet: https://react-typescript-cheatsheet.netlify.app/
