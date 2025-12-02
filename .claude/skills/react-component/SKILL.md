---
name: react-component
description: React 컴포넌트를 생성하거나 리팩토링합니다. 재사용 가능한 UI 컴포넌트, 레이아웃 컴포넌트, 또는 복잡한 인터랙션이 필요한 컴포넌트를 만들 때 사용하세요. TypeScript, React Hooks, Tailwind CSS를 활용한 모던 React 개발 패턴을 따릅니다.
---

# React Component Development Skill

React 18.3 + TypeScript 환경에서 재사용 가능하고 타입 안전한 컴포넌트를 개발합니다.

## When to Use This Skill

- 새로운 재사용 가능한 UI 컴포넌트가 필요할 때 (버튼, 모달, 카드 등)
- Feature 컴포넌트를 작성할 때 (생성/수정/삭제 버튼, 테이블 등)
- Custom Hook을 구현할 때 (폼 상태, 검색, 페이지네이션 등)
- 복잡한 상태 관리나 사이드 이펙트가 있는 컴포넌트를 만들 때
- 기존 컴포넌트를 타입 안전하게 리팩토링할 때

## 기술 스택

- **React**: 18.3.1 (함수형 컴포넌트 + Hooks)
- **TypeScript**: 5.8.3 (strict mode)
- **스타일링**: Tailwind CSS 4.1.11 + SCSS
- **UI 라이브러리**: @innogrid/ui v0.0.27
- **상태 관리**: useState, useReducer, React Query

## 컴포넌트 카테고리

### 1. UI 컴포넌트 (src/components/ui/)

재사용 가능한 공통 UI 요소

**예제: Accordion 컴포넌트**

```typescript
import { useState } from 'react';
import { ChevronDownIcon } from '@/assets/icons';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-medium">{title}</span>
        <ChevronDownIcon
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );
}
```

**기존 UI 컴포넌트:**
- `accordion.tsx`: 아코디언
- `collapsible.tsx`: 접을 수 있는 컨테이너
- `gauge-chart.tsx`: 게이지 차트
- `flow-chart.tsx`: 플로우차트
- `resizable.tsx`: 리사이즈 가능한 패널

### 2. Feature 컴포넌트 (src/components/features/)

특정 기능에 특화된 컴포넌트

**패턴: 모달 버튼 컴포넌트**

```typescript
import { useState } from 'react';
import { Button, Modal, ModalHeader, ModalContent, ModalFooter, Input } from '@innogrid/ui';
import { useCreateResource } from '@/hooks/service/resources';

interface CreateResourceButtonProps {
  onSuccess?: () => void;
}

export function CreateResourceButton({ onSuccess }: CreateResourceButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const { mutate, isPending } = useCreateResource();

  const handleSubmit = () => {
    mutate(formData, {
      onSuccess: () => {
        setIsOpen(false);
        setFormData({ name: '', description: '' });
        onSuccess?.();
      },
    });
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>리소스 생성</Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalHeader>새 리소스 생성</ModalHeader>

        <ModalContent>
          <div className="space-y-4">
            <Input
              label="이름"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="리소스 이름 입력"
              required
            />

            <Input
              label="설명"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="설명 입력"
            />
          </div>
        </ModalContent>

        <ModalFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit} loading={isPending}>
            생성
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
```

### 3. Layout 컴포넌트 (src/components/layout/)

페이지 레이아웃 구조

**기존 레이아웃:**
- `header.tsx`: 헤더 (로고, 사용자 정보)
- `sidebar.tsx`: 사이드바 (네비게이션 메뉴)
- `menu.tsx`: 메뉴 아이템
- `error-boundary.tsx`: 에러 경계

## React Hooks 패턴

### 1. useState - 로컬 상태 관리

```typescript
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState<FormData>({ name: '', email: '' });
```

### 2. useEffect - 사이드 이펙트

```typescript
useEffect(() => {
  // 컴포넌트 마운트 시 실행
  const timer = setTimeout(() => {
    setVisible(true);
  }, 100);

  // 클린업
  return () => clearTimeout(timer);
}, []); // 의존성 배열
```

### 3. useCallback - 함수 메모이제이션

```typescript
const handleSubmit = useCallback((data: FormData) => {
  mutate(data);
}, [mutate]);
```

### 4. useMemo - 값 메모이제이션

```typescript
const filteredData = useMemo(() => {
  return data?.filter(item => item.status === 'active');
}, [data]);
```

### 5. useRef - DOM 참조 및 값 저장

```typescript
const inputRef = useRef<HTMLInputElement>(null);

const focusInput = () => {
  inputRef.current?.focus();
};
```

### 6. Custom Hooks

```typescript
// src/hooks/use-search-input-state.ts
export function useSearchInputState() {
  const [value, setValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  return {
    value,
    setValue,
    debouncedValue,
  };
}
```

## TypeScript 타입 정의

### Props 인터페이스

```typescript
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className,
}: ButtonProps) {
  // ...
}
```

### Generic 컴포넌트

```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

export function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
```

## 스타일링 패턴

### Tailwind CSS 유틸리티

```typescript
export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {children}
    </div>
  );
}
```

### 조건부 클래스

```typescript
import { clsx } from 'clsx';

export function Badge({ type }: { type: 'success' | 'error' | 'warning' }) {
  return (
    <span
      className={clsx(
        'px-2 py-1 rounded-full text-xs font-medium',
        type === 'success' && 'bg-green-100 text-green-800',
        type === 'error' && 'bg-red-100 text-red-800',
        type === 'warning' && 'bg-yellow-100 text-yellow-800'
      )}
    >
      {type}
    </span>
  );
}
```

### SCSS 모듈 (복잡한 스타일)

```typescript
import styles from './component.module.scss';

export function ComplexComponent() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>Header</div>
      <div className={styles.content}>Content</div>
    </div>
  );
}
```

```scss
// component.module.scss
.container {
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100vh;

  .header {
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .content {
    overflow-y: auto;
    padding: 1rem;
  }
}
```

## 성능 최적화

### 1. React.memo - 불필요한 리렌더링 방지

```typescript
export const ExpensiveComponent = React.memo(function ExpensiveComponent({
  data,
}: {
  data: ComplexData;
}) {
  // 복잡한 렌더링 로직
  return <div>{/* ... */}</div>;
});
```

### 2. Code Splitting - 지연 로딩

```typescript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

export function Parent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### 3. 가상화 - 긴 리스트 최적화

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} className="h-[500px] overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 접근성 (a11y)

### 시맨틱 HTML

```typescript
export function Article({ title, content }: { title: string; content: string }) {
  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>
      <main>
        <p>{content}</p>
      </main>
    </article>
  );
}
```

### ARIA 속성

```typescript
export function ExpandableSection({ title, children }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls="content"
      >
        {title}
      </button>
      <div id="content" role="region" hidden={!isExpanded}>
        {children}
      </div>
    </div>
  );
}
```

### 키보드 네비게이션

```typescript
export function Menu({ items }: { items: MenuItem[] }) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setFocusedIndex((prev) => Math.min(prev + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      setFocusedIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  return (
    <ul role="menu" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <li
          key={item.id}
          role="menuitem"
          tabIndex={index === focusedIndex ? 0 : -1}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
```

## 에러 처리

### Error Boundary

```typescript
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}
```

## 테스트 (향후 추가 예정)

```typescript
// feature.test.tsx (예제)
import { render, screen, fireEvent } from '@testing-library/react';
import { CreateResourceButton } from './create-resource-button';

describe('CreateResourceButton', () => {
  it('opens modal when clicked', () => {
    render(<CreateResourceButton />);

    const button = screen.getByText('리소스 생성');
    fireEvent.click(button);

    expect(screen.getByText('새 리소스 생성')).toBeInTheDocument();
  });
});
```

## 개발 체크리스트

- [ ] TypeScript 인터페이스 정의
- [ ] Props 타입 정의 (필수/선택 구분)
- [ ] 기본값 설정
- [ ] 접근성 속성 추가 (ARIA)
- [ ] 반응형 디자인 적용
- [ ] 에러 상태 처리
- [ ] 로딩 상태 표시
- [ ] 키보드 네비게이션 지원
- [ ] 재사용성 고려
- [ ] 성능 최적화 (필요시)

## 명명 규칙

- **컴포넌트**: PascalCase (예: `CreateButton`)
- **Props 인터페이스**: `ComponentNameProps`
- **파일명**: kebab-case (예: `create-button.tsx`)
- **Custom Hook**: `use` 접두사 (예: `useFormState`)
