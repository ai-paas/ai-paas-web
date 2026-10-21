import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithUser, screen } from '@/test/utils/test-utils';
import { toastOpenSpy } from '@/test/mocks/innogrid-ui';
import { ClusterBootstrapModal } from './cluster-bootstrap-modal';

// 회귀: http 로 띄운 포탈(비보안 컨텍스트)에는 navigator.clipboard 가 없어 복사가 항상
// "복사 실패" 토스트로 끝났다. 모달이 copyTextToClipboard 의 폴백을 타는지 고정한다.
// jsdom 에는 navigator.clipboard 도 document.execCommand 도 없으므로 직접 정의한다.
// userEvent.setup() 이 navigator.clipboard 스텁을 심으므로 제거는 렌더 뒤에 해야 한다.

const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
const originalExecCommand = Object.getOwnPropertyDescriptor(document, 'execCommand');

const stubExecCommand = (result: boolean) => {
  const execCommand = vi.fn().mockReturnValue(result);
  Object.defineProperty(document, 'execCommand', {
    value: execCommand,
    configurable: true,
    writable: true,
  });
  return execCommand;
};

const BOOTSTRAP = {
  expiresAt: new Date(Date.now() + 600_000).toISOString(),
  helmInstallCommand: 'helm install cluster-agent ...',
  kubectlApplyCommand: 'curl -sS http://backend/v1/clusters/c1/agent-manifest.yaml | kubectl apply -f -',
};

/** 렌더 후 navigator.clipboard 를 제거해 비보안 컨텍스트를 재현한다. */
const renderModal = () => {
  const view = renderWithUser(
    <ClusterBootstrapModal isOpen clusterName="c1" bootstrap={BOOTSTRAP} onClose={vi.fn()} />,
  );
  Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
  return view;
};

describe('ClusterBootstrapModal 복사', () => {
  beforeEach(() => {
    toastOpenSpy.mockClear();
  });

  afterEach(() => {
    if (originalClipboard) {
      Object.defineProperty(navigator, 'clipboard', originalClipboard);
    } else {
      delete (navigator as { clipboard?: unknown }).clipboard;
    }

    if (originalExecCommand) {
      Object.defineProperty(document, 'execCommand', originalExecCommand);
    } else {
      delete (document as { execCommand?: unknown }).execCommand;
    }
  });

  it('navigator.clipboard 가 없어도 execCommand 폴백으로 복사된다', async () => {
    const execCommand = stubExecCommand(true);

    const { user } = renderModal();
    await user.click(screen.getByRole('button', { name: '복사' }));

    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(toastOpenSpy).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'positive', title: '복사 완료' }),
    );
  });

  it('폴백까지 실패하면 직접 선택 안내를 띄운다', async () => {
    stubExecCommand(false);

    const { user } = renderModal();
    await user.click(screen.getByRole('button', { name: '복사' }));

    expect(toastOpenSpy).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'negative', title: '복사 실패' }),
    );
  });
});
