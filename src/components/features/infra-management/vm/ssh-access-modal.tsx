
import { Button, Modal, useToast } from '@innogrid/ui';
import type { VmNode } from '@/types/vm';

interface Props {
  isOpen: boolean;
  vmName?: string;
  nodes: VmNode[];
  sshUser?: string;
  /** 사설망이라 점프 호스트를 거쳐야 하면 user@host[:port]. 비밀번호는 담기지 않는다. */
  sshJump?: string;
  onClose: () => void;
}

/**
 * 내 터미널에서 붙을 SSH 명령 — 노드마다 점프까지 포함해 그대로 복사한다.
 *
 * <p>웹 터미널은 콘솔 탭이 가진다. 같은 터미널이 두 군데 있으면 어느 쪽이 최신인지 헷갈리고,
 * 모달 안의 터미널은 세로가 좁아 잘린다.
 */
export const SshAccessModal = ({ isOpen, vmName, nodes, sshUser, sshJump, onClose }: Props) => {
  const { open } = useToast();

  if (!isOpen) return null;

  const addressOf = (node: VmNode) => node.publicIp ?? node.privateIp ?? '';

  const commandFor = (node: VmNode) => {
    const user = node.sshUser ?? sshUser ?? 'ubuntu';
    // 점프 없이 복사하면 그대로 붙여넣어도 안 붙는다.
    const jump = sshJump ? `-J ${sshJump} ` : '';
    return `ssh ${jump}-i ~/.ssh/${vmName}.pem ${user}@${addressOf(node)}`;
  };

  const copy = (node: VmNode) => {
    void navigator.clipboard.writeText(commandFor(node));
    open({ title: 'SSH 명령이 클립보드에 복사되었습니다.' });
  };

  return (
    <Modal
      isOpen={isOpen}
      title={`SSH 접속 — ${vmName ?? ''}`}
      size="large"
      onRequestClose={onClose}
      action={onClose}
      buttonTitle="닫기"
    >
      <div className="flex flex-col gap-4">
        {sshJump && (
          <span style={{ fontSize: 12, color: '#666' }}>
            점프 호스트를 거쳐 접속합니다: <code>{sshJump}</code>
          </span>
        )}

        {nodes.length > 0 && (
          <span style={{ fontSize: 12, color: '#666' }}>
            브라우저에서 바로 붙으려면 상세의 <strong>콘솔</strong> 탭을 쓰세요.
          </span>
        )}

        {nodes.length === 0 ? (
          <span style={{ color: '#666' }}>
            아직 접속할 노드가 없습니다. 프로비저닝이 끝나야 접속할 수 있습니다.
          </span>
        ) : (
          <table className="w-full" style={{ fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#666' }}>
                <th style={{ padding: '6px 8px' }}>역할</th>
                <th style={{ padding: '6px 8px' }}>공인 IP</th>
                <th style={{ padding: '6px 8px' }}>사설 IP</th>
                <th style={{ padding: '6px 8px' }}>SSH user</th>
                <th style={{ padding: '6px 8px' }} />
              </tr>
            </thead>
            <tbody>
              {nodes.map((n, i) => {
                const address = addressOf(n);
                return (
                  <tr key={`${n.hostname ?? n.role}-${i}`} style={{ borderTop: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>{n.role ?? 'node'}</td>
                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>{n.publicIp ?? '—'}</td>
                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>{n.privateIp ?? '—'}</td>
                    <td style={{ padding: '8px' }}>{n.sshUser ?? sshUser ?? 'ubuntu'}</td>
                    <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>
                      <Button
                        size="small"
                        color="secondary"
                        disabled={!address}
                        onClick={() => copy(n)}
                      >
                        명령 복사
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Modal>
  );
};
