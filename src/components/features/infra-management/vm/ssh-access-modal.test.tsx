import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SshAccessModal } from './ssh-access-modal';

const writeText = vi.fn();

vi.mock('./node-ssh-terminal', () => ({
  NodeSshTerminal: ({ host }: { host?: string }) => <div data-testid="term">{host}</div>,
}));
vi.mock('@innogrid/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@innogrid/ui')>();
  return { ...actual, useToast: () => ({ open: vi.fn() }) };
});

const NODES = [
  { role: 'master', publicIp: '1.2.3.4', privateIp: '10.0.0.1', sshUser: 'ubuntu' },
  { role: 'worker', privateIp: '10.0.0.2', sshUser: 'ubuntu' },
];

const open = (props = {}) =>
  render(
    <SshAccessModal
      isOpen
      vmName="demo"
      nodes={NODES}
      sshUser="ubuntu"
      onClose={vi.fn()}
      {...props}
    />
  );

describe('SshAccessModal', () => {
  beforeEach(() => {
    writeText.mockReset();
    Object.assign(navigator, { clipboard: { writeText } });
  });

  it('노드를 표로 보여준다', () => {
    open();

    expect(screen.getByText('10.0.0.1')).toBeInTheDocument();
    expect(screen.getByText('10.0.0.2')).toBeInTheDocument();
    expect(screen.queryByTestId('term')).not.toBeInTheDocument();
  });

  it('점프 호스트가 있으면 왜 바로 안 붙는지 알려준다', () => {
    open({ sshJump: 'root@bastion:10022' });

    expect(screen.getByText(/root@bastion:10022/)).toBeInTheDocument();
  });

  it('점프가 없으면 그 줄을 그리지 않는다', () => {
    open();

    expect(screen.queryByText(/점프 호스트/)).not.toBeInTheDocument();
  });

  it('복사한 명령에 점프가 들어간다', () => {
    // 점프 없이 복사하면 그대로 붙여넣어도 안 붙는다.
    open({ sshJump: 'root@bastion:10022' });

    fireEvent.click(screen.getAllByRole('button', { name: '명령 복사' })[0]);

    expect(writeText).toHaveBeenCalledWith(
      'ssh -J root@bastion:10022 -i ~/.ssh/demo.pem ubuntu@1.2.3.4'
    );
  });

  it('공인 IP 가 없으면 사설 IP 로 붙는다', () => {
    // 점프를 거치면 사설 IP 로 닿는다.
    open({ sshJump: 'root@bastion:10022' });

    fireEvent.click(screen.getAllByRole('button', { name: '명령 복사' })[1]);

    expect(writeText).toHaveBeenCalledWith(
      'ssh -J root@bastion:10022 -i ~/.ssh/demo.pem ubuntu@10.0.0.2'
    );
  });

  it('터미널은 여기서 열지 않는다', () => {
    // 같은 웹 터미널이 모달과 콘솔 탭 두 군데 있으면 어느 쪽이 최신인지 헷갈린다.
    open();

    expect(screen.queryByRole('button', { name: '웹 터미널' })).not.toBeInTheDocument();
  });

  it('터미널이 어디 있는지는 알려준다', () => {
    // 없애기만 하면 쓰던 사람이 사라진 기능을 찾는다.
    open();

    expect(screen.getByText(/콘솔/)).toBeInTheDocument();
  });

  it('프로비저닝 전에는 접속할 것이 없다고 말한다', () => {
    // 노드가 없으면 키도 없다. 빈 표를 보여주면 왜 안 되는지 알 수 없다.
    open({ nodes: [] });

    expect(screen.getByText(/프로비저닝이 끝나야/)).toBeInTheDocument();
  });

  it('닫혀 있으면 아무것도 그리지 않는다', () => {
    render(
      <SshAccessModal isOpen={false} vmName="demo" nodes={NODES} sshUser="ubuntu" onClose={vi.fn()} />
    );

    expect(screen.queryByText('10.0.0.1')).not.toBeInTheDocument();
  });
});
