import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { CredentialFieldSchema } from '@/hooks/service/providers';
import { CredentialFields } from './credential-fields';

let fields: CredentialFieldSchema[] = [];
let isPending = false;
let isError = false;

vi.mock('@/hooks/service/providers', () => ({
  useGetProviderCredentialSchema: () => ({ fields, isPending, isError }),
}));

const field = (over: Partial<CredentialFieldSchema>): CredentialFieldSchema => ({
  key: 'KEY',
  label: '라벨',
  required: false,
  secret: false,
  multiline: false,
  ...over,
});

const AWS = [
  field({
    key: 'AWS_ACCESS_KEY_ID',
    label: '액세스 키 ID',
    required: true,
    placeholder: 'AKIAIOSFODNN7EXAMPLE',
  }),
  field({ key: 'AWS_SECRET_ACCESS_KEY', label: '시크릿 액세스 키', required: true, secret: true }),
];

describe('CredentialFields', () => {
  beforeEach(() => {
    fields = AWS;
    isPending = false;
    isError = false;
  });

  it('프로바이더를 고르기 전에는 무엇을 먼저 할지 말한다', () => {
    fields = [];
    render(<CredentialFields provider="" value={{}} onChange={vi.fn()} />);

    expect(screen.getByText(/프로바이더/)).toBeInTheDocument();
  });

  it('키 이름 대신 읽을 수 있는 이름으로 묻는다', () => {
    render(<CredentialFields provider="AWS" value={{}} onChange={vi.fn()} />);

    expect(screen.getByLabelText(/액세스 키 ID/)).toBeInTheDocument();
    expect(screen.getByLabelText(/시크릿 액세스 키/)).toBeInTheDocument();
  });

  it('비밀값은 화면에 드러내지 않는다', () => {
    render(<CredentialFields provider="AWS" value={{}} onChange={vi.fn()} />);

    expect(screen.getByLabelText(/시크릿 액세스 키/)).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText(/액세스 키 ID/)).toHaveAttribute('type', 'text');
  });

  it('입력하면 키 이름으로 올려준다', () => {
    // 화면은 라벨로 묻지만 저장되는 것은 프로바이더가 아는 키여야 한다.
    const onChange = vi.fn();
    render(<CredentialFields provider="AWS" value={{}} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText(/액세스 키 ID/), { target: { value: 'AKIA123' } });

    expect(onChange).toHaveBeenCalledWith({ AWS_ACCESS_KEY_ID: 'AKIA123' });
  });

  it('여러 줄 값은 넓은 칸으로 받는다', () => {
    // 서비스 계정 JSON 이나 PEM 본문을 한 줄 칸에 넣을 수는 없다.
    fields = [field({ key: 'GOOGLE_CREDENTIALS', label: '서비스 계정 JSON', multiline: true })];
    render(<CredentialFields provider="GCP" value={{}} onChange={vi.fn()} />);

    expect(screen.getByLabelText(/서비스 계정 JSON/).tagName).toBe('TEXTAREA');
  });

  it('택일 묶음은 하나만 채우면 된다고 알려준다', () => {
    fields = [
      field({ key: 'GOOGLE_CREDENTIALS', label: 'JSON', group: 'auth' }),
      field({ key: 'GOOGLE_APPLICATION_CREDENTIALS', label: '파일 경로', group: 'auth' }),
    ];
    render(<CredentialFields provider="GCP" value={{}} onChange={vi.fn()} />);

    expect(screen.getByText(/하나만 채우면/)).toBeInTheDocument();
  });

  it('필수 칸은 표시한다', () => {
    render(<CredentialFields provider="AWS" value={{}} onChange={vi.fn()} />);

    expect(screen.getByLabelText(/액세스 키 ID/)).toBeRequired();
  });

  it('스키마를 못 받으면 직접 입력으로 돌아간다', () => {
    // 새 프로바이더가 추가돼 스키마가 없더라도 등록 자체를 막으면 안 된다.
    isError = true;
    fields = [];
    render(<CredentialFields provider="NEWCLOUD" value={{}} onChange={vi.fn()} />);

    expect(screen.getByLabelText(/직접 입력/)).toBeInTheDocument();
  });

  it('직접 입력으로 바꿔 넣을 수 있다', () => {
    const onChange = vi.fn();
    render(<CredentialFields provider="AWS" value={{}} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /직접 입력/ }));
    fireEvent.change(screen.getByLabelText(/직접 입력/), {
      target: { value: 'FOO=bar\nBAZ=qux' },
    });

    expect(onChange).toHaveBeenCalledWith({ FOO: 'bar', BAZ: 'qux' });
  });

  it('직접 입력으로 바꾸면 이 CSP 의 JSON 예제가 채워져 있다', () => {
    // 빈 칸을 주면 키 이름을 다시 찾아다녀야 한다. 고쳐 쓸 수 있는 예제가 들어 있어야 한다.
    render(<CredentialFields provider="AWS" value={{}} onChange={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /직접 입력/ }));

    const box = screen.getByLabelText(/직접 입력/) as HTMLTextAreaElement;
    expect(JSON.parse(box.value)).toEqual({
      AWS_ACCESS_KEY_ID: 'AKIAIOSFODNN7EXAMPLE',
      AWS_SECRET_ACCESS_KEY: '',
    });
  });

  it('채워진 예제를 그대로 등록하지는 않는다', () => {
    // 예제가 값으로 새어 나가면 가짜 키가 저장된다.
    const onChange = vi.fn();
    render(<CredentialFields provider="AWS" value={{}} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /직접 입력/ }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('항목별로 넣던 값이 있으면 예제 대신 그 값을 이어받는다', () => {
    // 전환할 때마다 입력이 예제로 덮이면 쓰던 값을 잃는다.
    render(
      <CredentialFields provider="AWS" value={{ AWS_ACCESS_KEY_ID: 'AKIA-mine' }} onChange={vi.fn()} />
    );

    fireEvent.click(screen.getByRole('button', { name: /직접 입력/ }));

    const box = screen.getByLabelText(/직접 입력/) as HTMLTextAreaElement;
    expect(JSON.parse(box.value)).toEqual({ AWS_ACCESS_KEY_ID: 'AKIA-mine' });
  });

  it('스키마가 없으면 예시 없이도 직접 입력은 열린다', () => {
    isError = true;
    fields = [];
    render(<CredentialFields provider="NEWCLOUD" value={{}} onChange={vi.fn()} />);

    expect(screen.getByLabelText(/직접 입력/)).toBeInTheDocument();
  });

  it('직접 입력은 JSON 도 받는다', () => {
    const onChange = vi.fn();
    render(<CredentialFields provider="AWS" value={{}} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /직접 입력/ }));
    fireEvent.change(screen.getByLabelText(/직접 입력/), {
      target: { value: '{"FOO":"bar"}' },
    });

    expect(onChange).toHaveBeenCalledWith({ FOO: 'bar' });
  });

  it('값의 생김새를 예시로 보여준다', () => {
    // 라벨만으로는 OCID 인지 URL 인지 알 수 없다. 빈 칸 앞에서 멈추게 된다.
    render(<CredentialFields provider="AWS" value={{}} onChange={vi.fn()} />);

    expect(screen.getByLabelText(/액세스 키 ID/)).toHaveAttribute(
      'placeholder',
      'AKIAIOSFODNN7EXAMPLE'
    );
  });

  it('이미 넣은 값은 칸에 남아 있는다', () => {
    render(
      <CredentialFields provider="AWS" value={{ AWS_ACCESS_KEY_ID: 'AKIA123' }} onChange={vi.fn()} />
    );

    expect(screen.getByLabelText(/액세스 키 ID/)).toHaveValue('AKIA123');
  });
});
