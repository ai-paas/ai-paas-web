import { describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { fireEvent, waitFor } from '@testing-library/react';

import { server } from '@/test/mocks/server';
import { BASE_URL } from '@/test/mocks/handlers';
import { render, screen } from '@/test/utils/test-utils';
import { InstallReleasePanel } from './install-release-panel';

const seed = () => {
  server.use(
    http.get(`${BASE_URL}/any-cloud/clusters`, () =>
      HttpResponse.json({ data: [{ id: 'c1', clusterName: 'c1' }] })
    ),
    http.get(`${BASE_URL}/any-cloud/helm-repos`, () =>
      HttpResponse.json({ data: [{ name: 'prometheus-community' }] })
    ),
    http.get(`${BASE_URL}/any-cloud/catalog/:repo/:chart/values`, () =>
      HttpResponse.json({ data: { content: 'replicaCount: 1\n' } })
    )
  );
};

describe('InstallReleasePanel', () => {
  it('고른 차트를 다시 묻지 않고 화면에 고정해 보여준다', () => {
    // 생성 화면이 저장소, 차트, 버전을 드롭다운으로 되물어 같은 것을 두 번 고르게 했다.
    seed();
    render(
      <InstallReleasePanel
        isOpen
        onClose={vi.fn()}
        target={{ repoName: 'prometheus-community', chartName: 'alertmanager', version: '2.0.0' }}
      />
    );

    const target = screen.getByTestId('install-target');
    expect(target).toHaveTextContent('prometheus-community / alertmanager');
    expect(target).toHaveTextContent('v2.0.0');
    expect(
      screen.queryByText((_, node) => node?.textContent?.trim() === '저장소 *')
    ).not.toBeInTheDocument();
  });

  it('클러스터와 네임스페이스가 비면 보내지 않는다', async () => {
    seed();
    let called = false;
    server.use(
      http.post(`${BASE_URL}/any-cloud/clusters/:name/helm-releases`, () => {
        called = true;
        return HttpResponse.json({});
      })
    );
    render(
      <InstallReleasePanel
        isOpen
        onClose={vi.fn()}
        target={{ repoName: 'prometheus-community', chartName: 'alertmanager' }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '설치' }));

    expect(await screen.findByText('클러스터를 선택해주세요.')).toBeInTheDocument();
    await waitFor(() => expect(called).toBe(false));
  });

  it('업그레이드는 저장소만 묻는다 — 릴리즈에 저장소가 남지 않기 때문이다', async () => {
    seed();
    render(
      <InstallReleasePanel
        isOpen
        onClose={vi.fn()}
        mode="upgrade"
        target={{ repoName: '', chartName: 'alertmanager' }}
        fixed={{ clusterName: 'c1', namespace: 'monitoring', releaseName: 'am' }}
      />
    );

    expect(
      await screen.findByText((_, node) => node?.textContent?.trim() === '저장소 *')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '업그레이드' })).toBeInTheDocument();
  });
});
