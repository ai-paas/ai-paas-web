import { useEffect, useState } from 'react';
import { Button, useToast } from '@innogrid/ui';
import {
  DEBUG_POD_CONTAINER,
  useCreateNodeDebugPod,
  useGetKubernetesNodes,
  type NodeDebugPod,
} from '@/hooks/service/clusters';
import { getServerErrorMessage } from '@/lib/api';
import { ShellTab } from '../drawer/shell-tab';

interface Props {
  clusterName?: string;
}

/**
 * 붙자마자 k9s 를 띄운다.
 *
 * <p>k9s 를 끝내도 세션이 같이 끊기면 kubectl 을 쓸 수 없다. 뒤에 셸을 이어 두어 k9s 를 나오면
 * 그 자리에 남는다. 백엔드가 command 를 쉼표로 쪼개므로 인자마다 쉼표로 가른다.
 */
const K9S_ON_LOGIN = '/bin/bash,-lc,k9s; exec bash';

/**
 * kubectl, k9s 를 쓸 수 있는 터미널.
 *
 * <p>노드에 SSH 로 붙는 대신 도구가 들어 있는 파드를 그 노드에 띄우고 안으로 들어간다. 파드 안으로
 * 들어가는 길은 이미 있어 개인키를 서버가 들고 있을 필요가 없고, 권한은 RBAC 이 통제한다.
 *
 * <p>탭에 들어오는 것만으로는 만들지 않는다. 스쳐 지나가는 것만으로 클러스터에 파드가 생기면 안 된다.
 */
export const TerminalTab = ({ clusterName }: Props) => {
  const { open } = useToast();
  const [pod, setPod] = useState<NodeDebugPod>();
  const [nodeName, setNodeName] = useState('');

  const { nodes } = useGetKubernetesNodes(clusterName);
  const nodeNames = nodes.map((n) => n.metadata?.name).filter((n): n is string => !!n);

  // 노드 목록은 나중에 온다. 사용자가 이미 고른 값은 덮어쓰지 않는다.
  useEffect(() => {
    if (!nodeName && nodeNames.length > 0) setNodeName(nodeNames[0]);
  }, [nodeName, nodeNames]);

  const { createNodeDebugPod, isPending } = useCreateNodeDebugPod({
    onSuccess: (created) => setPod(created),
    onError: (error) =>
      open({
        title: '터미널을 열지 못했습니다',
        children: getServerErrorMessage(error, '이미지를 받아오지 못했을 수 있습니다.'),
        status: 'negative',
      }),
  });

  const start = () => {
    if (!clusterName) return;
    createNodeDebugPod({ clusterName, nodeName: nodeName || nodeNames[0] });
  };

  // 파드는 TTL 로 사라진다. 화면에서 붙잡고 있을 이유가 없다.
  const stop = () => setPod(undefined);

  return (
    <div className="flex flex-col gap-3">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label htmlFor="terminal-node" style={{ fontSize: 13 }}>
          노드
        </label>
        <select
          id="terminal-node"
          value={nodeName}
          disabled={!!pod}
          onChange={(e) => setNodeName(e.target.value)}
          className="rounded border border-[#d1d5db] bg-white px-2 text-[13px]"
          style={{ height: 32, minWidth: 180 }}
        >
          {nodeNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        {pod ? (
          <Button color="negative" size="medium" onClick={stop}>
            종료
          </Button>
        ) : (
          <Button
            color="primary"
            size="medium"
            disabled={!clusterName || isPending}
            onClick={start}
          >
            {isPending ? '준비 중...' : '터미널 시작'}
          </Button>
        )}
      </div>

      <span style={{ fontSize: 13, color: '#666' }}>
        고른 노드에 kubectl, k9s 가 들어 있는 파드를 띄우고 붙는 즉시 k9s 를 엽니다. k9s 를 끝내면
        같은 자리에서 셸을 씁니다. 파드는 일정 시간 뒤 스스로 사라집니다.
      </span>

      <ShellTab
        clusterName={clusterName}
        namespace={pod?.namespace}
        podName={pod?.podName}
        containers={pod ? [{ name: DEBUG_POD_CONTAINER }] : []}
        enabled={!!pod}
        initialCommand={K9S_ON_LOGIN}
        autoRetry
      />
    </div>
  );
};
