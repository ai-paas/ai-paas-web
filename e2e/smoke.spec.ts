import { test, expect } from '@playwright/test';
import { mockApi } from './support/api-mocks';

// TEST_PLAN 4A 최소 스모크: jsdom으로 영구 미커버였던 캔버스 노드 배치·엣지 연결을
// 실브라우저에서 검증한다. API는 전부 목킹(허메틱) — api-mocks.ts 참고.
test('로그인 → 서비스 생성 → 워크플로우 캔버스 배치·연결 → 저장 → 목록 확인', async ({
  page,
}) => {
  const api = await mockApi(page);

  // --- 1. 로그인 (refresh 401 → 폼 → 로그인 성공 → /service 이동) ---
  await page.goto('/login');
  await page.getByPlaceholder('아이디를 입력해주세요.').fill('e2e-user');
  await page.getByPlaceholder('비밀번호를 입력해주세요.').fill('e2e-password');
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page).toHaveURL(/\/service$/);

  // --- 2. 서비스 생성 (모달 → POST → 무효화 refetch로 새 행 표시) ---
  await expect(page.getByText('서비스가 없습니다.')).toBeVisible();
  await page.getByRole('button', { name: '생성' }).click();
  await page.getByPlaceholder('이름을 입력해주세요.').fill('E2E 스모크 서비스');
  await page.getByRole('button', { name: '확인' }).click();
  await expect(page.getByText('서비스 생성 성공')).toBeVisible();
  await expect(page.getByRole('link', { name: 'E2E 스모크 서비스' })).toBeVisible();

  // --- 3. 워크플로우 목록 → 생성(직접 생성) — 전체 로드로 refresh 세션 복원 경로도 커버 ---
  await page.goto('/workflow/workflow');
  await page.getByRole('button', { name: '생성' }).click();
  await page.getByText('직접 생성').click();
  await expect(page).toHaveURL(/\/workflow\/workflow\/create$/);

  // --- 4. 캔버스: 이름 입력, 시작·끝 노드 배치(팔레트 클릭 → 캔버스 클릭) ---
  await page.getByPlaceholder('워크플로우 이름').fill('E2E 캔버스 워크플로우');

  const pane = page.locator('.react-flow__pane');
  // 팔레트 행(컴포넌트 라벨 버튼)의 형제 배치 버튼(sr-only '생성', aria-pressed)
  const paletteCreate = (label: string) =>
    page
      .getByRole('button', { name: label, exact: true })
      .locator('..')
      .getByRole('button', { name: '생성' });

  await paletteCreate('시작').click();
  await pane.click({ position: { x: 250, y: 200 } });
  const startNode = page.locator('.react-flow__node').filter({ hasText: '시작' });
  await expect(startNode).toBeVisible();

  await paletteCreate('끝').click();
  await pane.click({ position: { x: 620, y: 340 } });
  const endNode = page.locator('.react-flow__node').filter({ hasText: '끝' });
  await expect(endNode).toBeVisible();

  // --- 5. 엣지 연결: 시작(source 핸들) → 끝(target 핸들) 드래그 ---
  const sourceHandle = startNode.locator('.react-flow__handle.source');
  const targetHandle = endNode.locator('.react-flow__handle.target');
  await sourceHandle.hover();
  await page.mouse.down();
  const targetBox = await targetHandle.boundingBox();
  if (!targetBox) throw new Error('끝 노드의 target 핸들을 찾지 못했습니다.');
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, {
    steps: 12,
  });
  await page.mouse.up();
  await expect(page.locator('.react-flow__edge')).toHaveCount(1);

  // --- 6. 저장: 생성 모달(패널 이름이 기본값으로 채워짐) → 확인 ---
  // 팔레트 배치 버튼(aria-pressed)을 제외하면 '생성'은 우상단 저장 버튼뿐이다
  await page
    .locator('button:not([aria-pressed])')
    .filter({ hasText: /^생성$/ })
    .click();
  await expect(page.getByPlaceholder('워크플로우 이름을 입력해주세요.')).toHaveValue(
    'E2E 캔버스 워크플로우'
  );
  await page.getByRole('button', { name: '확인' }).click();
  await expect(page.getByText('워크플로우 생성 성공')).toBeVisible();

  // --- 7. 목록 확인 + 직렬화된 요청 본문 단언 ---
  await expect(page).toHaveURL(/\/workflow\/workflow$/);
  await expect(page.getByRole('link', { name: 'E2E 캔버스 워크플로우' })).toBeVisible();

  expect(api.createWorkflowRequests).toHaveLength(1);
  const definition = api.createWorkflowRequests[0].workflow_definition;
  if (!definition) throw new Error('생성 요청에 workflow_definition이 없습니다.');
  expect(definition.components.map((c) => c.type).sort()).toEqual(['END', 'START']);
  const start = definition.components.find((c) => c.type === 'START');
  const end = definition.components.find((c) => c.type === 'END');
  expect(definition.connections).toEqual([
    { source_ref_id: start?.ref_id, target_ref_id: end?.ref_id },
  ]);

  // MSW onUnhandledRequest: 'error'와 같은 규약 — 목킹 밖 요청은 실패로 간주
  expect(api.unmockedRequests).toEqual([]);
});
