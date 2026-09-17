import { describe, expect, it } from 'vitest';
import {
  addonStateTone,
  agentConnectivityTone,
  clusterStatusTone,
  healthStatusTone,
  operationStateTone,
} from './status-tone';

describe('clusterStatusTone', () => {
  it.each([
    ['READY', 'run'],
    ['ACTIVE', 'run'],
    ['FAILED', 'negative'],
    ['DELETED', 'negative'],
    ['PROVISIONING', 'ing'],
    ['DELETING', 'ing'],
  ])('%s → %s', (status, tone) => {
    expect(clusterStatusTone(status)).toBe(tone);
  });

  it('DEGRADED 는 실패가 아니라 경고다', () => {
    // 클러스터는 동작하고 있고 요청한 애드온만 아직이다. 빨강으로 두면 실패로 읽힌다.
    expect(clusterStatusTone('DEGRADED')).toBe('warning');
  });

  it('모르는 상태는 중립색', () => {
    expect(clusterStatusTone('SOMETHING_NEW')).toBe('temp');
    expect(clusterStatusTone(undefined)).toBe('temp');
  });
});

describe('operationStateTone', () => {
  it('RUNNING 은 진행색이라 대기와 구분된다', () => {
    expect(operationStateTone('RUNNING')).toBe('ing');
    expect(operationStateTone('PENDING')).toBe('temp');
  });

  it.each([
    ['SUCCEEDED', 'run'],
    ['FAILED', 'negative'],
    ['CANCELLED', 'negative'],
  ])('%s → %s', (state, tone) => {
    expect(operationStateTone(state)).toBe(tone);
  });
});

describe('agentConnectivityTone', () => {
  it.each([
    ['CONNECTED', 'run'],
    ['DEGRADED', 'warning'],
    ['DISCONNECTED', 'negative'],
    ['NOT_REGISTERED', 'negative'],
  ])('%s → %s', (c, tone) => {
    expect(agentConnectivityTone(c)).toBe(tone);
  });
});

describe('addonStateTone', () => {
  it.each([
    ['INSTALLED', 'run'],
    ['installed', 'run'],
    ['FAILED', 'negative'],
    ['INSTALLING', 'ing'],
  ])('%s → %s', (state, tone) => {
    // 백엔드가 대소문자를 섞어 내려준다.
    expect(addonStateTone(state)).toBe(tone);
  });
});

describe('healthStatusTone', () => {
  it.each([
    ['HEALTHY', 'run'],
    ['OK', 'run'],
    ['UP', 'run'],
    ['ACTIVE', 'run'],
    ['UNHEALTHY', 'negative'],
    ['DOWN', 'negative'],
    ['DEGRADED', 'warning'],
  ])('%s → %s', (status, tone) => {
    expect(healthStatusTone(status)).toBe(tone);
  });

  it('모르는 값은 중립색', () => {
    expect(healthStatusTone('WHATEVER')).toBe('temp');
    expect(healthStatusTone(undefined)).toBe('temp');
  });
});
