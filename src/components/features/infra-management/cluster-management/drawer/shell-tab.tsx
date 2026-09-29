import { useEffect, useRef, useState } from 'react';
import { Button } from '@innogrid/ui';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

import { wsAuthProtocols } from '@/lib/ws-auth';

interface ContainerOption {
  name: string;
}

interface ShellTabProps {
  clusterName?: string;
  namespace?: string;
  podName?: string;
  containers: ContainerOption[];
  enabled: boolean;
  /** 처음 붙을 때 실행할 명령. 비우면 셸만 연다. */
  initialCommand?: string;
  /**
   * 붙을 때까지 스스로 다시 시도한다.
   *
   * <p>파드를 방금 만든 자리에서는 컨테이너가 아직 없어 첫 시도가 거의 항상 실패한다. 사용자가
   * 연결 버튼을 눌러 가며 기다릴 일이 아니다.
   */
  autoRetry?: boolean;
}

const SHELL_PRESETS = ['/bin/bash', '/bin/sh'];
const DEFAULT_SHELL = '/bin/bash';

/** 컨테이너가 아직 뜨지 않아 실패한 경우. 기다렸다 다시 붙으면 된다. */
const RETRY_DELAY_MS = 2000;
const MAX_RETRIES = 30;

export const ShellTab = ({
  clusterName,
  namespace,
  podName,
  containers,
  enabled,
  initialCommand,
  autoRetry = false,
}: ShellTabProps) => {
  const [container, setContainer] = useState<string>('');
  const [command, setCommand] = useState<string>(initialCommand || DEFAULT_SHELL);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const retriesRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 사용자가 셸을 끝냈는지. 그 경우 다시 붙으면 종료가 먹히지 않는 것처럼 보인다.
  const closedByUserRef = useRef(false);

  const hostElRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const dataDisposerRef = useRef<{ dispose: () => void } | null>(null);
  const resizeDisposerRef = useRef<{ dispose: () => void } | null>(null);

  useEffect(() => {
    if (!enabled || !hostElRef.current || termRef.current) return;
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
      // ignore — initial fit can fail when host has zero size on first paint.
    }
    termRef.current = term;
    fitAddonRef.current = fit;

    return () => {
      try {
        dataDisposerRef.current?.dispose();
      } catch {
        // ignore
      }
      try {
        resizeDisposerRef.current?.dispose();
      } catch {
        // ignore
      }
      term.dispose();
      termRef.current = null;
      fitAddonRef.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !hostElRef.current) return;
    const ro = new ResizeObserver(() => {
      try {
        fitAddonRef.current?.fit();
      } catch {
        // ignore
      }
    });
    ro.observe(hostElRef.current);
    return () => ro.disconnect();
  }, [enabled]);

  // 컨테이너 1개면 자동 선택
  useEffect(() => {
    if (!enabled) return;
    if (!container && containers.length === 1) {
      setContainer(containers[0].name);
    }
  }, [containers, container, enabled]);

  const closeWs = () => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        // ignore
      }
      wsRef.current = null;
    }
    try {
      dataDisposerRef.current?.dispose();
    } catch {
      // ignore
    }
    dataDisposerRef.current = null;
    try {
      resizeDisposerRef.current?.dispose();
    } catch {
      // ignore
    }
    resizeDisposerRef.current = null;
  };

  const cancelRetry = () => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    retryTimerRef.current = null;
    setRetrying(false);
  };

  /** 컨테이너가 아직 없을 때만 다시 붙는다. 사용자가 끝낸 셸은 되살리지 않는다. */
  const scheduleRetry = () => {
    if (!autoRetry || closedByUserRef.current) return;
    if (retriesRef.current >= MAX_RETRIES) {
      setError('터미널이 준비되지 않았습니다. 잠시 후 연결을 다시 눌러주세요.');
      setRetrying(false);
      return;
    }
    retriesRef.current += 1;
    setRetrying(true);
    retryTimerRef.current = setTimeout(() => connect(), RETRY_DELAY_MS);
  };

  const connect = () => {
    if (!clusterName || !namespace || !podName || !container) return;
    cancelRetry();
    closedByUserRef.current = false;
    closeWs();
    const term = termRef.current;
    if (!term) return;
    setError(null);

    const params = new URLSearchParams();
    params.set('container', container);
    // backend 는 ExecPacket.command 를 comma-split (예: "/bin/bash,-l") — 사용자 입력 그대로 전달.
    params.set('command', command || DEFAULT_SHELL);
    params.set('tty', 'true');
    params.set('stdin', 'true');

    const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl =
      `${wsScheme}://${window.location.host}/api/v1/any-cloud/kubernetes` +
      `/clusters/${encodeURIComponent(clusterName)}/pods/${encodeURIComponent(namespace)}/${encodeURIComponent(
        podName
      )}/exec?${params.toString()}`;

    const ws = new WebSocket(wsUrl, wsAuthProtocols());
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      retriesRef.current = 0;
      setRetrying(false);
      term.clear();
      try {
        fitAddonRef.current?.fit();
      } catch {
        // ignore
      }
      ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
      const dataDisp = term.onData((data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(new TextEncoder().encode(data).buffer);
        }
      });
      const resizeDisp = term.onResize(({ cols, rows }) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'resize', cols, rows }));
        }
      });
      dataDisposerRef.current = dataDisp;
      resizeDisposerRef.current = resizeDisp;
    };
    ws.onmessage = (ev) => {
      if (ev.data instanceof ArrayBuffer) {
        term.write(new Uint8Array(ev.data));
        return;
      }
      if (typeof ev.data === 'string') {
        // backend 의 종료 frame ({"type":"end","exitCode":N,"errorCode":"...","message":"..."}) 처리.
        // 그 외 text 는 그대로 출력.
        try {
          const parsed = JSON.parse(ev.data);
          if (parsed && (parsed.type === 'end' || 'exitCode' in parsed)) {
            const exitCode = parsed.exitCode ?? '-';
            /*
             * 컨테이너가 아직 없어 끝난 경우다. 파드를 방금 만든 자리에서는 이미지를 받는 동안
             * 계속 나므로, 화면을 오류로 덮지 않고 조용히 다시 붙는다.
             */
            const notReady =
              typeof parsed.message === 'string' && parsed.message.includes('container not found');
            if (notReady && autoRetry) {
              ws.close();
              scheduleRetry();
              return;
            }
            // 사용자가 exit 로 끝낸 셸이다. 여기서 다시 붙으면 종료가 먹지 않는 것처럼 보인다.
            if (!parsed.errorCode) closedByUserRef.current = true;
            term.writeln(`\r\n[종료, exit=${exitCode}]`);
            if (parsed.errorCode || parsed.message) {
              const detail = [parsed.errorCode, parsed.message].filter(Boolean).join(' — ');
              term.writeln(`[${detail}]`);
            }
            if (exitCode === 127) {
              term.writeln(
                `[힌트] command not found. 컨테이너에 ${command} 가 없을 수 있습니다. ` +
                  '상단의 sh / bash 프리셋 또는 /bin/ash, /bin/dash 등을 시도해 보세요.'
              );
            }
            ws.close();
            return;
          }
        } catch {
          // not JSON — fall through to text write
        }
        term.write(ev.data);
      }
    };
    ws.onerror = () => {
      setError('연결 오류 — 네트워크 또는 backend 상태 확인.');
    };
    ws.onclose = () => {
      setConnected(false);
      // open 도 못 해보고 닫혔다 — 파드가 아직 준비되지 않았을 때다.
      if (autoRetry && retriesRef.current === 0 && !closedByUserRef.current) scheduleRetry();
    };
  };

  useEffect(() => {
    if (!enabled) return;
    if (container) connect();
    return () => {
      cancelRetry();
      closeWs();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container, enabled]);

  if (!enabled) return null;

  return (
    <div className="flex h-full min-h-[420px] flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-[12px] text-[#6b7280]">컨테이너</label>
        <select
          value={container}
          onChange={(e) => setContainer(e.target.value)}
          disabled={containers.length === 0}
          className="rounded border border-[#d1d5db] bg-white px-2 py-1 text-[12px]"
        >
          <option value="" disabled>
            선택...
          </option>
          {containers.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <label className="text-[12px] text-[#6b7280]">command</label>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder={DEFAULT_SHELL}
          className="w-[140px] rounded border border-[#d1d5db] bg-white px-2 py-1 font-mono text-[12px]"
        />
        <span className="flex items-center gap-1">
          {SHELL_PRESETS.map((preset) => (
            <Button
              key={preset}
              size="small"
              color={command === preset ? 'focus' : 'secondary'}
              onClick={() => setCommand(preset)}
            >
              {preset.replace('/bin/', '')}
            </Button>
          ))}
        </span>
        <span
          className={[
            'text-[11px]',
            connected ? 'text-[#15803d]' : 'text-[#9ca3af]',
          ].join(' ')}
        >
          {connected ? '● 연결됨' : retrying ? '○ 준비 기다리는 중...' : '○ 연결 안됨'}
        </span>
        {error && <span className="text-[11px] text-[#dc2626]">{error}</span>}
        <span className="ml-auto">
          <Button
            size="small"
            color={connected ? 'secondary' : 'primary'}
            onClick={() => connect()}
            disabled={!container}
          >
            {connected ? '재연결' : '연결'}
          </Button>
        </span>
      </div>
      <div
        ref={hostElRef}
        className="min-h-[420px] flex-1 overflow-hidden rounded-md border border-[#1f2937] bg-[#1e1e1e] p-1"
      />
    </div>
  );
};