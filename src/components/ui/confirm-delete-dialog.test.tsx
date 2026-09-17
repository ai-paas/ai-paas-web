import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDeleteDialog } from './confirm-delete-dialog';

const open = (props: Partial<React.ComponentProps<typeof ConfirmDeleteDialog>> = {}) => {
  const onConfirm = vi.fn();
  render(
    <ConfirmDeleteDialog
      isOpen
      resourceType="클러스터"
      resourceName="aipaas-oci-01"
      onConfirm={onConfirm}
      onClose={vi.fn()}
      {...props}
    />
  );
  return { onConfirm };
};

describe('ConfirmDeleteDialog', () => {
  it('이름을 정확히 치기 전에는 삭제할 수 없다', () => {
    const { onConfirm } = open();

    const confirm = screen.getByRole('button', { name: /삭제 확인/ });
    expect(confirm).toBeDisabled();

    fireEvent.click(confirm);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('이름이 맞으면 삭제를 넘긴다', () => {
    const { onConfirm } = open();

    fireEvent.change(screen.getByPlaceholderText('확인 입력'), {
      target: { value: 'aipaas-oci-01' },
    });
    fireEvent.click(screen.getByRole('button', { name: /삭제 확인/ }));

    expect(onConfirm).toHaveBeenCalledWith({ force: false });
  });

  it('비슷하지만 다른 이름은 통과시키지 않는다', () => {
    const { onConfirm } = open();

    fireEvent.change(screen.getByPlaceholderText('확인 입력'), {
      target: { value: 'aipaas-oci-0' },
    });
    fireEvent.click(screen.getByRole('button', { name: /삭제 확인/ }));

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('함께 사라지는 것을 먼저 알려준다', () => {
    open({ consequence: 'master 1대와 worker 2대가 모두 삭제됩니다.' });

    expect(screen.getByText(/master 1대와 worker 2대가 모두 삭제됩니다/)).toBeInTheDocument();
    expect(screen.getByText(/되돌릴 수 없습니다/)).toBeInTheDocument();
  });

  it('강제 삭제를 허용하면 켠 채로 넘긴다', () => {
    const { onConfirm } = open({ allowForce: true });

    fireEvent.click(screen.getByLabelText(/강제 삭제/));
    fireEvent.change(screen.getByPlaceholderText('확인 입력'), {
      target: { value: 'aipaas-oci-01' },
    });
    fireEvent.click(screen.getByRole('button', { name: /삭제 확인/ }));

    expect(onConfirm).toHaveBeenCalledWith({ force: true });
  });

  it('강제 삭제를 허용하지 않으면 선택지 자체가 없다', () => {
    open();

    expect(screen.queryByLabelText(/강제 삭제/)).not.toBeInTheDocument();
  });

  it('여러 건이면 이름 대신 개수로 확인한다', () => {
    // 이름을 다 치게 하면 일괄 삭제가 실질적으로 막힌다.
    const { onConfirm } = open({ resourceName: undefined, count: 3 });

    expect(screen.queryByPlaceholderText('확인 입력')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /삭제 확인/ }));

    expect(onConfirm).toHaveBeenCalledWith({ force: false });
  });
});
