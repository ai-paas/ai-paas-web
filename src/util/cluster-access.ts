import type { Vm } from '@/types/vm';

/**
 * 내려받은 kubeconfig 로 그 자리에서 쓸 수 있는지 알려줄 말.
 *
 * <p>사설망에 만든 클러스터는 받아 봐야 닿지 않는다. 써 보고 나서 아는 것이 지금 동작이라
 * 미리 말해 준다. 바로 닿는 클러스터에는 아무 말도 붙이지 않는다.
 */
export const clusterAccessNotice = (vm?: Vm): string | null => {
  switch (vm?.apiServerReach) {
    case 'VIA_BASTION':
      return '이 클러스터는 점프 호스트를 거쳐야 닿습니다. 내려받은 kubeconfig 는 같은 망이나 점프를 통해서만 쓸 수 있습니다.';
    case 'PRIVATE_NETWORK':
      return 'API 서버 주소가 사설 대역입니다. 같은 망이나 VPN 안에서만 kubeconfig 가 동작합니다.';
    default:
      return null;
  }
};
