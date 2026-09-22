import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProxmoxSpecInput } from './proxmox-spec-input';

/**
 * Proxmox 는 인스턴스 타입 목록이 없다.
 *
 * <p>조회로 채우는 선택 상자를 그대로 두면 후보가 영영 비어 있어 폼을 제출할 수 없다.
 */
describe('ProxmoxSpecInput', () => {
  it('입력한 값을 그대로 올린다', () => {
    const onChange = vi.fn();
    render(<ProxmoxSpecInput value="" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Proxmox 노드 사양'), { target: { value: '4-8192' } });

    expect(onChange).toHaveBeenCalledWith('4-8192');
  });

  it('붙여 넣을 때 딸려 온 공백은 떼어 낸다', () => {
    const onChange = vi.fn();
    render(<ProxmoxSpecInput value="" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Proxmox 노드 사양'), { target: { value: ' 2-4096 ' } });

    expect(onChange).toHaveBeenCalledWith('2-4096');
  });

  it('형식이 어긋나면 그 자리에서 알려준다', () => {
    // 서버는 값이 깨져도 기본값으로 떨어져서, 다른 사양의 노드가 조용히 만들어진다.
    render(<ProxmoxSpecInput value="large" onChange={vi.fn()} />);

    expect(screen.getByText(/코어-메모리MiB/)).toBeInTheDocument();
  });

  it('형식이 맞으면 경고하지 않는다', () => {
    render(<ProxmoxSpecInput value="2-4096" onChange={vi.fn()} />);

    expect(screen.queryByText(/형식이어야 합니다/)).not.toBeInTheDocument();
  });

  it('빈 값은 아직 입력하지 않은 것이라 경고하지 않는다', () => {
    render(<ProxmoxSpecInput value="" onChange={vi.fn()} />);

    expect(screen.queryByText(/형식이어야 합니다/)).not.toBeInTheDocument();
  });

  it('형식 경고가 있으면 상위 오류 문구는 가린다', () => {
    // 같은 자리에 두 줄이 겹치면 무엇을 고쳐야 하는지 흐려진다.
    render(<ProxmoxSpecInput value="large" onChange={vi.fn()} errorText="사양을 입력해주세요." />);

    expect(screen.queryByText('사양을 입력해주세요.')).not.toBeInTheDocument();
  });
});
