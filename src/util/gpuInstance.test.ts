import { describe, it, expect } from 'vitest';
import { isGpuInstanceType, isGpuSpec } from './gpuInstance';

describe('gpuInstance 유틸', () => {
  // ============================================
  // isGpuInstanceType — 입력 가드
  // ============================================
  describe('isGpuInstanceType > 입력 가드', () => {
    it.each([
      ['provider가 undefined이면', undefined, 'p3.2xlarge'],
      ['provider가 빈 문자열이면', '', 'p3.2xlarge'],
      ['instanceType이 undefined이면', 'aws', undefined],
      ['instanceType이 빈 문자열이면', 'aws', ''],
      ['둘 다 undefined이면', undefined, undefined],
    ])('%s false를 반환한다', (_label, provider, instanceType) => {
      expect(isGpuInstanceType(provider, instanceType)).toBe(false);
    });

    it('공백만 있는 instanceType은 trim 후 빈 문자열이 되어 false를 반환한다', () => {
      expect(isGpuInstanceType('aws', '   ')).toBe(false);
    });
  });

  // ============================================
  // isGpuInstanceType — AWS
  // ============================================
  describe('isGpuInstanceType > AWS', () => {
    it.each([
      ['p3.2xlarge', true],
      ['p4d.24xlarge', true],
      ['p5.48xlarge', true],
      ['g4dn.xlarge', true],
      ['g5.xlarge', true],
      ['g6e.12xlarge', true],
      ['inf1.xlarge', true],
      ['inf2.xlarge', true],
      ['trn1.2xlarge', true],
      ['m5.large', false],
      ['t3.micro', false],
      // c7g는 Graviton(ARM) family — 'g'가 접두가 아니므로 오탐하지 않아야 한다.
      ['c7g.large', false],
      ['r6i.large', false],
    ])('aws + %s → %s', (instanceType, expected) => {
      expect(isGpuInstanceType('aws', instanceType)).toBe(expected);
    });
  });

  // ============================================
  // isGpuInstanceType — GCP
  // ============================================
  describe('isGpuInstanceType > GCP', () => {
    it.each([
      ['a2-highgpu-1g', true],
      ['a2-megagpu-16g', true],
      ['a3-highgpu-8g', true],
      ['g2-standard-4', true],
      ['n1-standard-8', false],
      ['e2-standard-4', false],
      ['c2-standard-8', false],
      // '-with-gpu' 접미가 붙은 커스텀 표기는 GPU로 판정한다.
      ['n1-standard-8-with-gpu', true],
    ])('gcp + %s → %s', (instanceType, expected) => {
      expect(isGpuInstanceType('gcp', instanceType)).toBe(expected);
    });
  });

  // ============================================
  // isGpuInstanceType — Azure
  // ============================================
  describe('isGpuInstanceType > Azure', () => {
    it.each([
      ['Standard_NC6', true],
      ['Standard_NC24ads_A100_v4', true],
      ['Standard_ND96asr_v4', true],
      ['Standard_NV12', true],
      // 정규식에 i 플래그가 있어 대소문자를 무시한다.
      ['standard_nc6', true],
      ['STANDARD_NV12S_V3', true],
      ['Standard_D2s_v3', false],
      ['Standard_E4s_v5', false],
      // NP-series(FPGA)는 N[CDV]에 해당하지 않으므로 GPU가 아니다.
      ['Standard_NP20s', false],
    ])('azure + %s → %s', (instanceType, expected) => {
      expect(isGpuInstanceType('azure', instanceType)).toBe(expected);
    });
  });

  // ============================================
  // isGpuInstanceType — OCI
  // ============================================
  describe('isGpuInstanceType > OCI', () => {
    it.each([
      ['BM.GPU4.8', true],
      ['VM.GPU2.1', true],
      ['VM.GPU.A10.1', true],
      // i 플래그로 소문자 표기도 감지한다.
      ['vm.gpu3.1', true],
      ['VM.Standard2.1', false],
      ['BM.Standard.E4.128', false],
    ])('oci + %s → %s', (instanceType, expected) => {
      expect(isGpuInstanceType('oci', instanceType)).toBe(expected);
    });
  });

  // ============================================
  // isGpuInstanceType — Alibaba
  // ============================================
  describe('isGpuInstanceType > Alibaba', () => {
    it.each([
      ['ecs.gn6i-c4g1.xlarge', true],
      ['ecs.gn7i-c8g1.2xlarge', true],
      ['ecs.ebmgn7.26xlarge', true],
      // 'ecs.g6'은 범용 g6 family — 'gn' 접두가 아니므로 오탐하지 않아야 한다.
      ['ecs.g6.large', false],
      ['ecs.g7.xlarge', false],
      ['ecs.c6.large', false],
      ['ecs.sn2ne.large', false],
    ])('alibaba + %s → %s', (instanceType, expected) => {
      expect(isGpuInstanceType('alibaba', instanceType)).toBe(expected);
    });
  });

  // ============================================
  // isGpuInstanceType — DigitalOcean
  // ============================================
  describe('isGpuInstanceType > DigitalOcean', () => {
    it.each([
      ['gpu-h100x1-80gb', true],
      ['gpu-h100x8-640gb', true],
      ['s-1vcpu-1gb', false],
      ['c-4', false],
    ])('digitalocean + %s → %s', (instanceType, expected) => {
      expect(isGpuInstanceType('digitalocean', instanceType)).toBe(expected);
    });
  });

  // ============================================
  // isGpuInstanceType — provider 처리
  // ============================================
  describe('isGpuInstanceType > provider 처리', () => {
    it.each([
      ['AWS', 'p3.2xlarge'],
      ['Aws', 'p3.2xlarge'],
      ['GCP', 'a2-highgpu-1g'],
      ['Azure', 'Standard_NC6'],
      ['OCI', 'BM.GPU4.8'],
      ['Alibaba', 'ecs.gn6i-c4g1.xlarge'],
      ['DigitalOcean', 'gpu-h100x1-80gb'],
    ])('provider 대소문자를 무시한다 (%s + %s)', (provider, instanceType) => {
      expect(isGpuInstanceType(provider, instanceType)).toBe(true);
    });

    it('instanceType의 앞뒤 공백은 trim되어 정상 판정된다', () => {
      expect(isGpuInstanceType('aws', '  p3.2xlarge  ')).toBe(true);
    });

    // 특성화 테스트: instanceType은 trim하지만 provider는 trim하지 않는다.
    // 버그 의심 — 팀 확인 필요 (' aws '.toLowerCase()가 switch case에 매칭되지 않아 false).
    it('provider의 앞뒤 공백은 trim되지 않아 false를 반환한다 (현재 동작 고정)', () => {
      expect(isGpuInstanceType(' aws ', 'p3.2xlarge')).toBe(false);
    });

    it.each([['ncp'], ['kt-cloud'], ['openstack'], ['unknown']])(
      '미지원 provider(%s)는 GPU 타입이어도 false를 반환한다',
      (provider) => {
        expect(isGpuInstanceType(provider, 'p3.2xlarge')).toBe(false);
      }
    );
  });

  // ============================================
  // isGpuSpec
  // ============================================
  describe('isGpuSpec', () => {
    it('spec이 undefined이면 false를 반환한다', () => {
      expect(isGpuSpec('aws', undefined)).toBe(false);
    });

    it('gpuCount가 0보다 크면 provider/instanceType과 무관하게 true를 반환한다', () => {
      expect(isGpuSpec(undefined, { gpuCount: 1 })).toBe(true);
      expect(isGpuSpec('ncp', { instanceType: 'm5.large', gpuCount: 4 })).toBe(true);
    });

    it.each([
      ['gpuCount가 0이면', 0],
      ['gpuCount가 null이면', null],
      ['gpuCount가 undefined이면', undefined],
    ])('%s instanceType prefix로 폴백 판정한다', (_label, gpuCount) => {
      expect(isGpuSpec('aws', { instanceType: 'p3.2xlarge', gpuCount })).toBe(true);
      expect(isGpuSpec('aws', { instanceType: 'm5.large', gpuCount })).toBe(false);
    });

    it('instanceType이 없으면 id로 폴백 판정한다', () => {
      expect(isGpuSpec('aws', { id: 'g5.xlarge' })).toBe(true);
      expect(isGpuSpec('aws', { id: 'm5.large' })).toBe(false);
    });

    it('instanceType과 id가 모두 있으면 instanceType을 우선한다', () => {
      expect(isGpuSpec('aws', { id: 'p3.2xlarge', instanceType: 'm5.large' })).toBe(false);
      expect(isGpuSpec('aws', { id: 'm5.large', instanceType: 'p3.2xlarge' })).toBe(true);
    });

    // 특성화 테스트: instanceType이 빈 문자열이면 ?? 연산자가 nullish가 아니라고 판단해
    // id 폴백이 일어나지 않는다 (id가 GPU 타입이어도 false).
    // 버그 의심 — 팀 확인 필요 (빈 문자열도 id로 폴백하는 것이 의도일 수 있음).
    it('instanceType이 빈 문자열이면 id로 폴백하지 않고 false를 반환한다 (현재 동작 고정)', () => {
      expect(isGpuSpec('aws', { id: 'p3.2xlarge', instanceType: '' })).toBe(false);
    });

    it('gpuCount가 음수이면 폴백 판정으로 넘어간다', () => {
      expect(isGpuSpec('aws', { instanceType: 'p3.2xlarge', gpuCount: -1 })).toBe(true);
      expect(isGpuSpec('aws', { instanceType: 'm5.large', gpuCount: -1 })).toBe(false);
    });

    it('spec에 판정 근거가 전혀 없으면 false를 반환한다', () => {
      expect(isGpuSpec('aws', {})).toBe(false);
      expect(isGpuSpec(undefined, { gpuCount: 0 })).toBe(false);
    });
  });
});
