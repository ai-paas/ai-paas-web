/**
 * VM 목록 페이지 — 어디를 눌러야 어디로 가는지, 진행 중인 것이 얼마나 걸리고 있는지.
 */
import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import VmPage from './page';
import { server } from '@/test/mocks/server';
import { BASE_URL } from '@/test/mocks/handlers';
import { installDomMeasurementStubs } from '@/test/utils/dom-measure-stubs';
import { renderListPage } from '@/test/utils/list-page';
import { screen } from '@/test/utils/test-utils';

installDomMeasurementStubs();

const node = {
  nodeName: 'demo-master-0',
  role: 'master',
  clusterName: 'demo',
  clusterProvider: 'OpenStack',
  region: 'kr-1',
  privateIp: '10.0.0.1',
  infraStatus: 'PROVISIONING',
};

const setup = (vms: unknown[] = [], extraNodes: unknown[] = []) => {
  server.use(
    http.get(`${BASE_URL}/any-cloud/nodes`, () =>
      HttpResponse.json({ data: [...extraNodes, node] })
    ),
    http.get(`${BASE_URL}/any-cloud/vms`, () => HttpResponse.json({ data: vms })),
    // 진행 중인 클러스터에는 에이전트가 없다 — 목록이 이것 때문에 비면 안 된다.
    http.get(`${BASE_URL}/any-cloud/clusters/:name/kubernetes/*`, () =>
      HttpResponse.json({ data: [] })
    ),
    http.get(`${BASE_URL}/any-cloud/operations`, () => HttpResponse.json({ data: [] }))
  );
};

describe('VmPage', () => {
  it('이름을 눌러 상세로 간다', async () => {
    // 소속 클러스터를 눌러야 상세로 가면 어디로 가는지와 무엇을 눌렀는지가 어긋난다.
    setup();
    renderListPage(<VmPage />);

    const link = await screen.findByRole('link', { name: 'demo-master-0' });
    expect(link).toHaveAttribute('href', '/infra-management/vm/demo');
  });

  it('소속 클러스터는 더 이상 상세로 가는 링크가 아니다', async () => {
    setup();
    renderListPage(<VmPage />);

    await screen.findByRole('link', { name: 'demo-master-0' });
    expect(screen.queryByRole('link', { name: 'demo' })).not.toBeInTheDocument();
  });

  it('노드가 아직 없는 클러스터도 행을 차지한다', async () => {
    /*
     * 노드는 PROVISION 이 끝나야 생긴다. 그 줄은 서버가 함께 내려준다 — 화면이 끼워 넣으면
     * 자르는 곳과 세는 곳이 갈려 다음 페이지가 비어 버린다.
     */
    setup(
      [],
      [
        {
          nodeName: 'pending-one',
          clusterName: 'pending-one',
          clusterProvider: 'AWS',
          infraStatus: 'PROVISIONING',
          pending: true,
        },
      ]
    );
    renderListPage(<VmPage />);

    expect(await screen.findByRole('link', { name: 'pending-one' })).toBeInTheDocument();
  });

  it('노드가 없는 줄은 준비 중으로 표시한다', async () => {
    // 나머지 칸이 비어 있어 표시가 없으면 값이 빠진 행으로 읽힌다.
    setup(
      [],
      [
        {
          nodeName: 'pending-two',
          clusterName: 'pending-two',
          clusterProvider: 'AWS',
          infraStatus: 'PROVISIONING',
          pending: true,
        },
      ]
    );
    renderListPage(<VmPage />);

    await screen.findByRole('link', { name: 'pending-two' });
    expect(screen.getByText('준비 중')).toBeInTheDocument();
  });
});
