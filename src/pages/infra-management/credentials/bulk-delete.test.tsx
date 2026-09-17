/**
 * 자격증명 여러 건 삭제.
 *
 * 고른 만큼 지워져야 한다. 화면은 "N개 삭제" 라고 묻는데 한 건만 사라지면
 * 사용자는 나머지가 왜 남았는지 알 수 없다.
 */
import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import CredentialsPage from './page';
import { server } from '@/test/mocks/server';
import { BASE_URL } from '@/test/mocks/handlers';
import { installDomMeasurementStubs } from '@/test/utils/dom-measure-stubs';
import { renderListPage, toggleRowSelection, toggleSelectAll } from '@/test/utils/list-page';
import { screen, waitFor } from '@/test/utils/test-utils';

installDomMeasurementStubs();

const credentials = [
  { id: 'cred-1', provider: 'AWS', name: 'aws-1', credentialKeys: ['AWS_ACCESS_KEY_ID'] },
  { id: 'cred-2', provider: 'AWS', name: 'aws-2', credentialKeys: ['AWS_ACCESS_KEY_ID'] },
  { id: 'cred-3', provider: 'OCI', name: 'oci-1', credentialKeys: ['TF_VAR_region'] },
];

const setup = () => {
  const deleted: string[] = [];
  server.use(
    http.get(`${BASE_URL}/any-cloud/credentials`, () =>
      HttpResponse.json({ data: { items: credentials } })
    ),
    // 확인 버튼이 자동 갱신을 돌린다 — 삭제 검증과 무관하므로 즉시 응답한다.
    http.post(`${BASE_URL}/any-cloud/credentials/:id/health/refresh`, () =>
      HttpResponse.json({ data: { healthy: true, checkedRegions: 1 } })
    ),
    http.delete(`${BASE_URL}/any-cloud/credentials/:id`, ({ params }) => {
      deleted.push(String(params.id));
      return HttpResponse.json({});
    })
  );
  return deleted;
};

describe('자격증명 여러 건 삭제', () => {
  it('전체 선택 후 삭제하면 고른 만큼 DELETE 를 보낸다', async () => {
    const deleted = setup();
    const { user } = renderListPage(<CredentialsPage />);

    await screen.findByText('aws-1');
    await toggleSelectAll(user);

    await user.click(screen.getByRole('button', { name: /삭제/ }));
    await user.click(await screen.findByRole('button', { name: '확인' }));

    await waitFor(() => expect(deleted).toHaveLength(credentials.length));
    expect([...deleted].sort()).toEqual(['cred-1', 'cred-2', 'cred-3']);
  });

  it('체크박스를 하나씩 눌러도 선택이 쌓인다', async () => {
    // 행 클릭 핸들러가 체크박스 클릭에도 걸려 선택이 "교체" 되면 한 건만 지워진다.
    const deleted = setup();
    const { user } = renderListPage(<CredentialsPage />);

    await screen.findByText('aws-1');
    await toggleRowSelection(user, 0);
    await toggleRowSelection(user, 1);

    await user.click(screen.getByRole('button', { name: /삭제/ }));
    await user.click(await screen.findByRole('button', { name: '확인' }));

    await waitFor(() => expect(deleted.length).toBeGreaterThan(0));
    expect(deleted).toHaveLength(2);
  });
});
