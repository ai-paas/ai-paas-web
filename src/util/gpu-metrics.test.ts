import { describe, expect, it } from 'vitest';

import { idleDeviceCount, toGpuDevices, toGpuPods } from './gpu-metrics';

const vector = <TLabel,>(rows: { metric: TLabel; value: string }[]) => ({
  status: 'success' as const,
  data: {
    resultType: 'vector' as const,
    result: rows.map((row) => ({ metric: row.metric, value: [0, row.value] as [number, string] })),
  },
});

describe('toGpuDevices', () => {
  it('장마다 한 줄로 합친다', () => {
    const devices = toGpuDevices({
      util: vector([
        { metric: { Hostname: 'w1', gpu: '0', modelName: 'NVIDIA L4' }, value: '82' },
        { metric: { Hostname: 'w1', gpu: '1', modelName: 'NVIDIA L4' }, value: '3' },
      ]),
      memUsed: vector([
        { metric: { Hostname: 'w1', gpu: '0' }, value: '20480' },
        { metric: { Hostname: 'w1', gpu: '1' }, value: '512' },
      ]),
      memFree: vector([
        { metric: { Hostname: 'w1', gpu: '0' }, value: '3072' },
        { metric: { Hostname: 'w1', gpu: '1' }, value: '23040' },
      ]),
      temp: vector([{ metric: { Hostname: 'w1', gpu: '0' }, value: '71' }]),
      power: vector([{ metric: { Hostname: 'w1', gpu: '0' }, value: '68.5' }]),
    });

    expect(devices).toHaveLength(2);
    expect(devices[0]).toMatchObject({
      node: 'w1',
      device: '0',
      model: 'NVIDIA L4',
      util: 82,
      memUsedMib: 20480,
      memTotalMib: 23552,
      tempC: 71,
      powerW: 68.5,
    });
    // 온도, 전력이 없는 장도 빠지지 않는다 — 사용률만 있어도 줄은 있어야 한다.
    expect(devices[1]).toMatchObject({ device: '1', util: 3, tempC: 0, powerW: 0 });
  });

  it('gpu 번호가 없으면 device 이름으로 맞춘다', () => {
    const devices = toGpuDevices({
      util: vector([{ metric: { Hostname: 'w1', device: 'nvidia0' }, value: '50' }]),
      memUsed: vector([{ metric: { Hostname: 'w1', device: 'nvidia0' }, value: '100' }]),
    });

    expect(devices[0]).toMatchObject({ device: 'nvidia0', memUsedMib: 100 });
  });

  it('값이 없으면 빈 목록이다', () => {
    expect(toGpuDevices({})).toEqual([]);
  });
});

describe('toGpuPods', () => {
  it('컨테이너 여러 개의 요청을 파드 단위로 더한다', () => {
    const pods = toGpuPods(
      vector([
        { metric: { namespace: 'ml', pod: 'train-0', node: 'w1' }, value: '1' },
        { metric: { namespace: 'ml', pod: 'train-0', node: 'w1' }, value: '1' },
        { metric: { namespace: 'ml', pod: 'infer-0', node: 'w1' }, value: '1' },
      ])
    );

    expect(pods).toHaveLength(2);
    expect(pods[0]).toMatchObject({ pod: 'train-0', count: 2 });
    expect(pods[1]).toMatchObject({ pod: 'infer-0', count: 1 });
  });
});

describe('idleDeviceCount', () => {
  it('할당은 됐는데 노는 장을 센다', () => {
    const devices = toGpuDevices({
      util: vector([
        { metric: { Hostname: 'w1', gpu: '0' }, value: '82' },
        { metric: { Hostname: 'w1', gpu: '1' }, value: '3' },
        { metric: { Hostname: 'w2', gpu: '0' }, value: '0' },
      ]),
    });

    expect(idleDeviceCount(devices)).toBe(2);
  });
});
