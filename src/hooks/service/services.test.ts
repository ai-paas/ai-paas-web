import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { createHookWrapper } from '@/test/utils/test-utils';
import {
  useGetServices,
  useCreateService,
  useGetService,
  useUpdateService,
  useDeleteService,
} from './services';

const wrapper = createHookWrapper();

describe('services hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // useGetServices 테스트
  // ============================================
  describe('useGetServices', () => {
    it('서비스 목록을 성공적으로 가져온다', async () => {
      const { result } = renderHook(() => useGetServices(), { wrapper });

      expect(result.current.isPending).toBe(true);

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      expect(result.current.services).toHaveLength(2);
      expect(result.current.services[0].name).toBe('테스트 서비스 1');
      expect(result.current.isError).toBe(false);
    });

    it('페이지네이션 파라미터를 전달한다', async () => {
      const { result } = renderHook(() => useGetServices({ page: 2, size: 5 }), { wrapper });

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      expect(result.current.page.number).toBe(2);
      expect(result.current.page.size).toBe(5);
    });

    it('API 에러 시 isError가 true가 된다', async () => {
      server.use(
        http.get('http://localhost:3000/api/v1/services', () => {
          return HttpResponse.json({ message: 'Server Error' }, { status: 500 });
        })
      );

      const { result } = renderHook(() => useGetServices(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.services).toEqual([]);
    });

    it('데이터가 없을 때 빈 배열을 반환한다', async () => {
      server.use(
        http.get('http://localhost:3000/api/v1/services', () => {
          return HttpResponse.json({ data: [], total: 0, page: 1, size: 10 });
        })
      );

      const { result } = renderHook(() => useGetServices(), { wrapper });

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      expect(result.current.services).toEqual([]);
    });
  });

  // ============================================
  // useCreateService 테스트
  // ============================================
  describe('useCreateService', () => {
    it('서비스를 성공적으로 생성한다', async () => {
      const { result } = renderHook(() => useCreateService(), { wrapper });

      result.current.createService({
        name: '새 서비스',
        description: '새 서비스 설명',
        tags: ['new', 'test'],
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.isPending).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('생성 실패 시 isError가 true가 된다', async () => {
      server.use(
        http.post('http://localhost:3000/api/v1/services', () => {
          return HttpResponse.json({ message: 'Bad Request' }, { status: 400 });
        })
      );

      const { result } = renderHook(() => useCreateService(), { wrapper });

      result.current.createService({
        name: '',
        description: '',
        tags: [],
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  // ============================================
  // useGetService 테스트
  // ============================================
  describe('useGetService', () => {
    it('단일 서비스를 성공적으로 가져온다', async () => {
      const { result } = renderHook(() => useGetService('srv-001'), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      expect(result.current.service).toBeDefined();
      expect(result.current.service?.name).toBe('테스트 서비스 1');
      expect(result.current.service?.workflow_count).toBe(2);
    });

    it('enabled가 false일 때 쿼리가 실행되지 않는다', async () => {
      // 캐시되지 않은 새로운 ID를 사용하여 테스트
      const { result } = renderHook(() => useGetService('srv-not-cached', false), { wrapper });

      // enabled가 false이면 쿼리가 실행되지 않고 isPending 상태 유지
      expect(result.current.service).toBeUndefined();
      expect(result.current.isPending).toBe(true);
    });

    it('존재하지 않는 서비스 조회 시 에러가 발생한다', async () => {
      const { result } = renderHook(() => useGetService('non-existent'), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('surro_service_id가 undefined일 때 쿼리가 실행되지 않는다', async () => {
      const { result } = renderHook(() => useGetService(undefined), {
        wrapper,
      });

      // undefined이므로 쿼리가 실행되지 않음
      expect(result.current.service).toBeUndefined();
    });
  });

  // ============================================
  // useUpdateService 테스트
  // ============================================
  describe('useUpdateService', () => {
    it('서비스를 성공적으로 수정한다', async () => {
      const { result } = renderHook(() => useUpdateService(), { wrapper });

      result.current.updateService({
        surro_service_id: 'srv-001',
        name: '수정된 서비스',
        description: '수정된 설명',
        tags: ['updated'],
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('수정 실패 시 isError가 true가 된다', async () => {
      server.use(
        http.put('http://localhost:3000/api/v1/services/:id', () => {
          return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
        })
      );

      const { result } = renderHook(() => useUpdateService(), { wrapper });

      result.current.updateService({
        surro_service_id: 'invalid-id',
        name: '테스트',
        description: '설명',
        tags: [],
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  // ============================================
  // useDeleteService 테스트
  // ============================================
  describe('useDeleteService', () => {
    it('서비스를 성공적으로 삭제한다', async () => {
      const { result } = renderHook(() => useDeleteService(), { wrapper });

      result.current.deleteService('srv-001');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.isError).toBe(false);
    });

    it('삭제 실패 시 isError가 true가 된다', async () => {
      server.use(
        http.delete('http://localhost:3000/api/v1/services/:id', () => {
          return HttpResponse.json({ message: 'Forbidden' }, { status: 403 });
        })
      );

      const { result } = renderHook(() => useDeleteService(), { wrapper });

      result.current.deleteService('srv-001');

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });
});
