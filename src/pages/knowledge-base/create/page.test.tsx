import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react';
import { Route, Routes, useLocation } from 'react-router';
import { act, renderWithUser, screen, waitFor } from '@/test/utils/test-utils';

const mocks = vi.hoisted(() => ({
  createKnowledgeBase: vi.fn(),
  toastOpen: vi.fn(),
  chunkTypes: [{ id: 1, name: 'RecursiveCharacterSplitter' }],
  languages: [{ id: 1, name: 'KO', description: '한국어' }],
  searchMethods: [{ id: 1, name: 'vector' }],
  modelTypes: [{ id: 2, name: 'Embedding', description: '임베딩' }],
  models: [{ id: 13, name: 'bge-m3' }],
}));

vi.mock('@innogrid/ui', () => {
  type Option = Record<string, unknown>;

  return {
    Accordion: ({
      components = [],
    }: {
      components?: Array<{ label: ReactNode; component: ReactNode }>;
    }) => (
      <div>
        {components.map((item, index) => (
          <section key={index}>
            <h3>{item.label}</h3>
            {item.component}
          </section>
        ))}
      </div>
    ),
    BreadCrumb: ({ items = [] }: { items?: Array<{ label: string }> }) => (
      <nav aria-label="경로">{items.map((item) => item.label).join(' / ')}</nav>
    ),
    Button: ({
      color: _color,
      isLoading: _isLoading,
      size: _size,
      ...props
    }: ButtonHTMLAttributes<HTMLButtonElement> & {
      color?: string;
      isLoading?: boolean;
      size?: string;
    }) => {
      void _color;
      void _isLoading;
      void _size;
      return <button {...props} />;
    },
    FileDrop: ({
      description,
      files = [],
      id,
      multiple,
      onAddFile,
      onDeleteFile,
    }: {
      description?: ReactNode;
      files?: File[];
      id?: string;
      multiple?: boolean;
      onAddFile: (files: File[]) => void;
      onDeleteFile?: (value: { file: File; fileIndex: number }) => void;
    }) => (
      <div>
        <input
          aria-label="파일 업로드"
          data-testid={id}
          multiple={multiple}
          type="file"
          onChange={(event) => onAddFile(Array.from(event.currentTarget.files ?? []))}
        />
        <div>{description}</div>
        {files.map((file, index) => (
          <div key={`${file.name}-${file.size}`}>
            <span>{file.name}</span>
            <button type="button" onClick={() => onDeleteFile?.({ file, fileIndex: index })}>
              삭제
            </button>
          </div>
        ))}
      </div>
    ),
    Input: ({
      customSize: _customSize,
      description: _description,
      errMessage,
      size: _size,
      variant: _variant,
      ...props
    }: InputHTMLAttributes<HTMLInputElement> & {
      customSize?: unknown;
      description?: string;
      errMessage?: string;
      size?: string;
      variant?: string;
    }) => {
      void _customSize;
      void _description;
      void _size;
      void _variant;
      return (
        <>
          <input {...props} />
          {errMessage && <span>{errMessage}</span>}
        </>
      );
    },
    RadioGroupButton: ({
      id,
      onValueChange,
      options = [],
      value,
    }: {
      id: string;
      onValueChange?: (value: string) => void;
      options?: Array<{ label?: ReactNode; value: string }>;
      value?: string;
    }) => (
      <div role="radiogroup">
        {options.map((option) => (
          <label key={option.value}>
            <input
              checked={option.value === value}
              name={id}
              type="radio"
              value={option.value}
              onChange={() => onValueChange?.(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    ),
    Select: ({
      errMessage,
      getOptionLabel = (option: Option) => String(option.label ?? ''),
      getOptionValue = (option: Option) => String(option.value ?? ''),
      isDisabled,
      onChange,
      options = [],
      value,
    }: {
      errMessage?: string;
      getOptionLabel?: (option: Option) => string;
      getOptionValue?: (option: Option) => string;
      isDisabled?: boolean;
      onChange?: (option: Option | null) => void;
      options?: Option[];
      value?: Option | null;
    }) => (
      <>
        <select
          aria-label="선택"
          disabled={isDisabled}
          value={value ? getOptionValue(value) : ''}
          onChange={(event) =>
            onChange?.(
              options.find((option) => getOptionValue(option) === event.target.value) ?? null
            )
          }
        >
          <option value="">선택</option>
          {options.map((option) => (
            <option key={getOptionValue(option)} value={getOptionValue(option)}>
              {getOptionLabel(option)}
            </option>
          ))}
        </select>
        {errMessage && <span>{errMessage}</span>}
      </>
    ),
    Slider: ({
      max,
      min,
      onValueChange,
      step,
      value,
    }: {
      max?: number;
      min?: number;
      onValueChange?: (value: number[]) => void;
      step?: number;
      value: number[];
    }) => (
      <input
        aria-label="슬라이더"
        max={max}
        min={min}
        step={step}
        type="range"
        value={value[0]}
        onChange={(event) => onValueChange?.([Number(event.target.value)])}
      />
    ),
    Stepper: ({ step, steps }: { step: number; steps: Array<{ title?: string }> }) => (
      <div data-step={step} data-testid="knowledge-base-stepper">
        {steps[step]?.title}
      </div>
    ),
    Textarea: ({
      customSize: _customSize,
      errMessage,
      size: _size,
      variant: _variant,
      ...props
    }: TextareaHTMLAttributes<HTMLTextAreaElement> & {
      customSize?: unknown;
      errMessage?: string;
      size?: string;
      variant?: string;
    }) => {
      void _customSize;
      void _size;
      void _variant;
      return (
        <>
          <textarea {...props} />
          {errMessage && <span>{errMessage}</span>}
        </>
      );
    },
    useToast: () => ({ open: mocks.toastOpen }),
  };
});

vi.mock('../../../assets/img/icon', () => ({
  IconArrCount: () => <span aria-hidden="true">화살표</span>,
  IconDocument: () => <span aria-hidden="true">문서</span>,
}));

vi.mock('@/hooks/service/knowledgebase', async () => {
  const { useState } = await import('react');

  return {
    useCreateKnowledgeBase: () => {
      const [isPending, setIsPending] = useState(false);

      return {
        isPending,
        createKnowledgeBase: async (data: FormData) => {
          setIsPending(true);
          try {
            return await mocks.createKnowledgeBase(data);
          } finally {
            setIsPending(false);
          }
        },
      };
    },
    useGetChunkTypes: () => ({ chunkTypes: mocks.chunkTypes }),
    useGetLanguages: () => ({ languages: mocks.languages }),
    useGetSearchMethods: () => ({ searchMethods: mocks.searchMethods }),
  };
});

vi.mock('@/hooks/service/models', () => ({
  useGetModels: () => ({ models: mocks.models }),
  useGetModelTypes: () => ({ modelTypes: mocks.modelTypes }),
}));

import KnowledgeBaseCreatePage from './page';

const LocationProbe = () => {
  const location = useLocation();
  return <output data-testid="current-location">{location.pathname}</output>;
};

const renderPage = () =>
  renderWithUser(
    <Routes>
      <Route path="/knowledge-base/create" element={<KnowledgeBaseCreatePage />} />
      <Route path="/knowledge-base/:id" element={<LocationProbe />} />
    </Routes>,
    { route: '/knowledge-base/create' }
  );

const uploadPdf = async (user: ReturnType<typeof renderPage>['user']) => {
  const file = new File(['사내 규정'], '규정.pdf', { type: 'application/pdf' });
  await user.upload(screen.getByLabelText('파일 업로드'), file);
  return file;
};

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

describe('KnowledgeBaseCreatePage', () => {
  beforeEach(() => {
    mocks.createKnowledgeBase.mockReset();
    mocks.toastOpen.mockReset();
  });

  it('파일이 있어도 이름이 비어 있으면 기본 설정에서 다음 단계로 진행하지 않는다', async () => {
    const { user } = renderPage();
    await uploadPdf(user);

    await user.click(screen.getByRole('button', { name: '다음' }));

    expect(screen.getByText('이름을 입력해주세요.')).toBeInTheDocument();
    expect(screen.getByTestId('knowledge-base-stepper')).toHaveAttribute('data-step', '0');
    expect(screen.queryByPlaceholderText('청크 길이를 입력해주세요.')).not.toBeInTheDocument();
  });

  it('이름이 있어도 파일이 없으면 기본 설정에서 다음 단계로 진행하지 않는다', async () => {
    const { user } = renderPage();
    await user.type(screen.getByPlaceholderText('이름을 입력해주세요.'), '사내 규정');

    await user.click(screen.getByRole('button', { name: '다음' }));

    expect(screen.getByText('파일을 업로드해주세요.')).toBeInTheDocument();
    expect(screen.getByTestId('knowledge-base-stepper')).toHaveAttribute('data-step', '0');
    expect(screen.queryByPlaceholderText('청크 길이를 입력해주세요.')).not.toBeInTheDocument();
  });

  it('처리 중 안내를 보이고 surro_knowledge_id 상세 경로로 이동한다', async () => {
    const creation = deferred<{ id: number; surro_knowledge_id: number }>();
    mocks.createKnowledgeBase.mockReturnValue(creation.promise);

    const { user } = renderPage();
    await user.type(screen.getByPlaceholderText('이름을 입력해주세요.'), '사내 규정');
    await uploadPdf(user);

    await user.click(screen.getByRole('button', { name: '다음' }));
    expect(screen.getByTestId('knowledge-base-stepper')).toHaveAttribute('data-step', '1');

    await user.click(screen.getByRole('button', { name: '다음' }));
    expect(screen.getByTestId('knowledge-base-stepper')).toHaveAttribute('data-step', '2');

    await user.click(screen.getByRole('button', { name: '생성' }));

    expect(
      await screen.findByText('파일을 업로드하고 문서를 처리하고 있습니다.')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        '대용량 파일은 업로드와 임베딩에 수 분 이상 걸릴 수 있습니다. 생성 결과가 확인될 때까지 이 화면을 유지해주세요.'
      )
    ).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

    await act(async () => {
      creation.resolve({ id: 7, surro_knowledge_id: 9001 });
      await creation.promise;
    });

    await waitFor(() => {
      expect(screen.getByTestId('current-location')).toHaveTextContent('/knowledge-base/9001');
    });
    expect(screen.queryByText('/knowledge-base/7')).not.toBeInTheDocument();
  });
});
