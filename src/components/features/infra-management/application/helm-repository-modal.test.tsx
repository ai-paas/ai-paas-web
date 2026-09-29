import { describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { server } from '@/test/mocks/server';
import { BASE_URL } from '@/test/mocks/handlers';
import { render } from '@/test/utils/test-utils';
import { HelmRepositoryModal } from './helm-repository-modal';

const openModal = (onClose = vi.fn()) => {
  render(<HelmRepositoryModal isOpen onClose={onClose} />);
  return onClose;
};

const typeInto = (placeholder: string, value: string) =>
  fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } });

describe('HelmRepositoryModal', () => {
  it('이름과 URL 이 비면 보내지 않는다', async () => {
    // 이름은 helm alias 라, 빈 값이 넘어가면 차트 참조가 어긋난다.
    let called = false;
    server.use(
      http.post(`${BASE_URL}/any-cloud/helm-repos`, () => {
        called = true;
        return HttpResponse.json({});
      })
    );
    openModal();

    fireEvent.click(screen.getByRole('button', { name: '연동' }));

    await screen.findByText('저장소 이름을 입력해주세요.');
    expect(screen.getByText('저장소 URL 을 입력해주세요.')).toBeInTheDocument();
    expect(called).toBe(false);
  });

  it('이름에 대문자나 공백은 막는다', async () => {
    openModal();

    typeInto('prometheus-community', 'My Repo');
    fireEvent.click(screen.getByRole('button', { name: '연동' }));

    await screen.findByText('소문자, 숫자, - 만 쓸 수 있습니다.');
  });

  it('URL 이 http 로 시작하지 않으면 막는다', async () => {
    openModal();

    typeInto('prometheus-community', 'repo-one');
    typeInto('https://prometheus-community.github.io/helm-charts', 'ftp://example.com');
    fireEvent.click(screen.getByRole('button', { name: '연동' }));

    await screen.findByText('http 또는 https 로 시작해야 합니다.');
  });

  it('올바른 값이면 저장소를 만든다', async () => {
    let sent: Record<string, unknown> | null = null;
    server.use(
      http.post(`${BASE_URL}/any-cloud/helm-repos`, async ({ request }) => {
        sent = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ success: true });
      })
    );
    const onClose = openModal();

    typeInto('prometheus-community', 'repo-one');
    typeInto('https://prometheus-community.github.io/helm-charts', 'https://charts.example.com');
    fireEvent.click(screen.getByRole('button', { name: '연동' }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(sent).toMatchObject({ name: 'repo-one', url: 'https://charts.example.com' });
  });
});
