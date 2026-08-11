/**
 * 테스트 인프라 자체 검증: test-utils의 render 옵션(route/path/auth)과
 * resetWorkflowStore가 약속대로 동작하는지 보증한다.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useParams } from 'react-router';
import { render, screen, waitFor, makeTestJwt } from './test-utils';
import { resetWorkflowStore } from './reset-workflow-store';
import { useAuth } from '@/hooks/useAuth';
import { parseJwt } from '@/util/jwt';
import { useWorkflowStore } from '@/store/useWorkflowStore';

function ParamsProbe() {
  const { id } = useParams();
  return <div>param:{id}</div>;
}

function AuthProbe() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  if (isLoading) return <div>loading</div>;
  return (
    <div>
      auth:{String(isAuthenticated)} admin:{String(isAdmin)}
    </div>
  );
}

describe('test-utils', () => {
  it('route/path 옵션으로 useParams 페이지를 렌더할 수 있다', () => {
    render(<ParamsProbe />, { route: '/service/srv-001', path: '/service/:id' });

    expect(screen.getByText('param:srv-001')).toBeInTheDocument();
  });

  it("auth: 'admin'이면 isAuthenticated/isAdmin이 즉시 true다", async () => {
    render(<AuthProbe />, { auth: 'admin' });

    await waitFor(() => {
      expect(screen.getByText('auth:true admin:true')).toBeInTheDocument();
    });
  });

  it("auth: 'user'면 isAdmin이 false다", async () => {
    render(<AuthProbe />, { auth: 'user' });

    await waitFor(() => {
      expect(screen.getByText('auth:true admin:false')).toBeInTheDocument();
    });
  });

  it('makeTestJwt 토큰은 parseJwt로 디코딩된다', () => {
    expect(parseJwt(makeTestJwt({ role: 'admin', sub: 'tester' }))).toMatchObject({
      role: 'admin',
      sub: 'tester',
    });
  });
});

describe('resetWorkflowStore', () => {
  beforeEach(() => resetWorkflowStore());

  it('스토어 상태를 초기값으로 복원한다', () => {
    useWorkflowStore.getState().setName('오염된 이름');
    expect(useWorkflowStore.getState().name).toBe('오염된 이름');

    resetWorkflowStore();

    expect(useWorkflowStore.getState().name).toBe('');
    expect(useWorkflowStore.getState().nodes).toEqual([]);
    expect(useWorkflowStore.getState().past).toEqual([]);
  });
});
