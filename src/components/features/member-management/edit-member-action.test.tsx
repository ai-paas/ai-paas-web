import '@/test/mocks/innogrid-ui';
import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { renderWithUser, screen, waitFor } from '@/test/utils/test-utils';
import { BASE_URL, mockMembers } from '@/test/mocks/handlers';
import { server } from '@/test/mocks/server';
import { EditMemberAction } from './edit-member-action';

const baseFormData = {
  name: '홍길동',
  memberId: 'hong-gildong',
  email: 'hong@example.com',
  password: '',
  passwordConfirm: '',
  phone: '01012345678',
  role: 'user',
  description: '테스트 회원',
};

const submitUpdate = async (formData: typeof baseFormData) => {
  let capturedBody: Record<string, unknown> | undefined;
  server.use(
    http.put(`${BASE_URL}/members/:memberId`, async ({ request }) => {
      capturedBody = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json(mockMembers[0]);
    })
  );
  const { user } = renderWithUser(<EditMemberAction formData={formData} />);

  await user.click(screen.getByRole('button', { name: '수정' }));
  await user.click(screen.getByRole('button', { name: '확인' }));

  await waitFor(() => expect(capturedBody).toBeDefined());
  return capturedBody;
};

describe('EditMemberAction 요청 계약', () => {
  it('비밀번호를 변경하지 않으면 password, password_confirm, is_active를 전송하지 않는다', async () => {
    const capturedBody = await submitUpdate(baseFormData);

    expect(capturedBody).toEqual({
      name: '홍길동',
      email: 'hong@example.com',
      phone: '01012345678',
      role: 'user',
      description: '테스트 회원',
    });
    expect(capturedBody).not.toHaveProperty('password');
    expect(capturedBody).not.toHaveProperty('password_confirm');
    expect(capturedBody).not.toHaveProperty('is_active');
  });

  it('비밀번호를 변경하면 password만 추가하고 password_confirm, is_active는 전송하지 않는다', async () => {
    const capturedBody = await submitUpdate({
      ...baseFormData,
      password: 'Abcd123!',
      passwordConfirm: 'Abcd123!',
    });

    expect(capturedBody).toEqual({
      name: '홍길동',
      email: 'hong@example.com',
      phone: '01012345678',
      role: 'user',
      description: '테스트 회원',
      password: 'Abcd123!',
    });
    expect(capturedBody).not.toHaveProperty('password_confirm');
    expect(capturedBody).not.toHaveProperty('is_active');
  });
});
