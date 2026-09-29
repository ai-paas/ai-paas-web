import { useEffect, useRef, useState } from 'react';
import { Button } from '@innogrid/ui';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

import { wsAuthProtocols } from '@/lib/ws-auth';

interface Props {
  vmName?: string;
  /** 붙을 노드의 주소. 백엔드가 이 클러스터의 노드인지 확인한다. */
  host?: string;
}

/**
 * 노드에 직접 붙는 터미널.
 *
 * <p>파드 셸은 에이전트를 거친다. kubelet 이 죽으면 그 길이 막히는데, 그때가 바로 노드에
 * 들어가야 하는 순간이다. 그래서 이 경로는 에이전트를 거치지 않는다.
 */
export const NodeSshTerminal = ({ vmName, host }: Props) => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hostElRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const dataDisposerRef = useRef<{ dispose: () => void } | null>(null);

  useEffect(() => {
    if (!hostElRef.current || termRef.current) return;
    const term = new Terminal({
      fontSize: 13,
      fontFamily: 'ui-monospace, JetBrainsMono, monospace',
      cursorBlink: true,
      theme: { background: '#1e1e1e', foreground: '#d4d4d4' },
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(hostElRef.current);
    try {
      fit.fit();
    } catch {
      // 첫 렌더에서 높이가 0이면 실패한다. 연결할 때 다시 맞춘다.
    }
    termRef.current = term;
    fitRef.current = fit;

    return () => {
      try {
        dataDisposerRef.current?.dispose();
      } catch {
        // 이미 해제됐다.
      }
      wsRef.current?.close();
      term.dispose();
      termRef.current = null;
    };
  }, []);

  const disconnect = () => {
    wsRef.current?.close();
    wsRef.current = null;
    setConnected(false);
  };

  const connect = () => {
    if (!vmName || !host) return;
    const term = termRef.current;
    if (!term) return;
    setError(null);
    term.clear();

    const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const url =
      `${scheme}://${window.location.host}/api/v1/any-cloud/vms/` +
      `${encodeURIComponent(vmName)}/nodes/${encodeURIComponent(host)}/ssh`;

    const ws = new WebSocket(url, wsAuthProtocols());
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      try {
        fitRef.current?.fit();
      } catch {
        // 크기를 못 맞춰도 붙는 것 자체는 된다.
      }
      dataDisposerRef.current = term.onData((data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(new TextEncoder().encode(data).buffer);
        }
      });
    };
    ws.onmessage = (ev) => {
      if (ev.data instanceof ArrayBuffer) {
        term.write(new Uint8Array(ev.data));
        return;
      }
      if (typeof ev.data === 'string') term.write(ev.data);
    };
    ws.onerror = () => setError('연결에 실패했습니다. 노드에 접근할 수 있는지 확인해주세요.');
    ws.onclose = () => {
      setConnected(false);
      term.writeln('\r\n[연결이 끊겼습니다]');
    };
  };

  return (
    <div className="flex flex-col gap-3">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {connected ? (
          <Button color="negative" size="medium" onClick={disconnect}>
            연결 끊기
          </Button>
        ) : (
          <Button color="primary" size="medium" disabled={!vmName || !host} onClick={connect}>
            SSH 접속
          </Button>
        )}
        <span style={{ fontSize: 12, color: '#666' }}>
          {host ? `${host} 에 직접 접속합니다.` : '노드를 선택해주세요.'} 클러스터가 응답하지 않을
          때도 쓸 수 있습니다.
        </span>
      </div>
      {error && <span style={{ color: '#a33', fontSize: 12 }}>{error}</span>}
      <div ref={hostElRef} style={{ height: 420, background: '#1e1e1e' }} />
    </div>
  );
};
