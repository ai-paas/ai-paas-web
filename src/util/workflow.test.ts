import { describe, it, expect } from 'vitest';
import { getWorkflowStatus, getWorkflowModelStatus } from './workflow';

describe('workflow util', () => {
  // ============================================
  // getWorkflowStatus 테스트
  // ============================================
  describe('getWorkflowStatus', () => {
    it.each([
      ['DRAFT', '임시저장', 'table-td-state-temp'],
      ['ACTIVE', '정상', 'table-td-state-run'],
      ['ERROR', '오류', 'table-td-state-negative'],
    ])('%s 상태는 label "%s", className "%s"를 반환한다', (status, label, className) => {
      expect(getWorkflowStatus(status)).toEqual({ label, className });
    });

    it('정의되지 않은 상태는 상태 문자열을 label로, temp 클래스를 className으로 폴백한다', () => {
      expect(getWorkflowStatus('UNKNOWN')).toEqual({
        label: 'UNKNOWN',
        className: 'table-td-state-temp',
      });
    });

    it('빈 문자열도 그대로 label로 폴백한다', () => {
      expect(getWorkflowStatus('')).toEqual({
        label: '',
        className: 'table-td-state-temp',
      });
    });

    it('소문자 상태값은 매핑되지 않고 폴백한다 (대소문자 구분)', () => {
      expect(getWorkflowStatus('active')).toEqual({
        label: 'active',
        className: 'table-td-state-temp',
      });
    });
  });

  // ============================================
  // getWorkflowModelStatus 테스트
  // ============================================
  describe('getWorkflowModelStatus', () => {
    it.each([
      ['PENDING', '대기중', 'table-td-state-ing'],
      ['DEPLOYING', '배포중', 'table-td-state-ing'],
      ['DEPLOYED', '배포완료', 'table-td-state-run'],
      ['FAILED', '실패', 'table-td-state-negative'],
      ['DELETED', '삭제됨', 'table-td-state-temp'],
    ])('%s 상태는 label "%s", className "%s"를 반환한다', (status, label, className) => {
      expect(getWorkflowModelStatus(status)).toEqual({ label, className });
    });

    it('정의되지 않은 상태는 상태 문자열을 label로, temp 클래스를 className으로 폴백한다', () => {
      expect(getWorkflowModelStatus('SOMETHING_ELSE')).toEqual({
        label: 'SOMETHING_ELSE',
        className: 'table-td-state-temp',
      });
    });

    it('소문자 상태값은 매핑되지 않고 폴백한다 (대소문자 구분)', () => {
      expect(getWorkflowModelStatus('deployed')).toEqual({
        label: 'deployed',
        className: 'table-td-state-temp',
      });
    });
  });
});
