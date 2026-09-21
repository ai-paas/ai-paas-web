import type { PrometheusQueryResponse, PrometheusVectorResult } from '@/hooks/service/monitoring';

/** DCGM 이 붙이는 라벨. gpu 는 장 번호, device 는 nvidia0 같은 장치명이다. */
export type DcgmLabels = {
  Hostname?: string;
  device?: string;
  gpu?: string;
  modelName?: string;
  exported_namespace?: string;
  exported_pod?: string;
};

export type GpuDevice = {
  key: string;
  node: string;
  device: string;
  model: string;
  util: number;
  memUsedMib: number;
  memTotalMib: number;
  tempC: number;
  powerW: number;
};

export type GpuPod = {
  key: string;
  namespace: string;
  pod: string;
  node: string;
  count: number;
};

type VectorResponse<TLabel> =
  | PrometheusQueryResponse<PrometheusVectorResult<TLabel>[]>
  | undefined;

const seriesOf = <TLabel,>(response: VectorResponse<TLabel>): PrometheusVectorResult<TLabel>[] =>
  response?.data?.result ?? [];

const numberOf = (raw: string | undefined): number => {
  const parsed = Number.parseFloat(raw ?? '');
  return Number.isFinite(parsed) ? parsed : 0;
};

/** 같은 장을 가리키는 키. gpu 번호가 없는 배포가 있어 device 로 보완한다. */
const deviceKey = (labels: DcgmLabels): string =>
  `${labels.Hostname ?? '-'}/${labels.gpu ?? labels.device ?? '-'}`;

const indexByDevice = (response: VectorResponse<DcgmLabels>): Map<string, number> => {
  const out = new Map<string, number>();
  for (const series of seriesOf(response)) {
    out.set(deviceKey(series.metric), numberOf(series.value?.[1]));
  }
  return out;
};

/**
 * 장 단위로 합쳐 표 한 줄씩 만든다.
 *
 * <p>화면이 합계만 보여 주면 8 장 중 한 장만 100% 인 노드와 여덟 장이 12% 인 노드가 같은
 * 숫자로 읽힌다. 어느 장이 노는지는 장 단위로 갈라야 보인다.
 */
export const toGpuDevices = (sources: {
  util?: VectorResponse<DcgmLabels>;
  memUsed?: VectorResponse<DcgmLabels>;
  memFree?: VectorResponse<DcgmLabels>;
  temp?: VectorResponse<DcgmLabels>;
  power?: VectorResponse<DcgmLabels>;
}): GpuDevice[] => {
  const memUsed = indexByDevice(sources.memUsed);
  const memFree = indexByDevice(sources.memFree);
  const temp = indexByDevice(sources.temp);
  const power = indexByDevice(sources.power);

  return seriesOf(sources.util)
    .map((series) => {
      const labels = series.metric ?? {};
      const key = deviceKey(labels);
      const used = memUsed.get(key) ?? 0;
      const free = memFree.get(key) ?? 0;
      return {
        key,
        node: labels.Hostname ?? '-',
        device: labels.gpu ?? labels.device ?? '-',
        model: labels.modelName ?? '-',
        util: numberOf(series.value?.[1]),
        memUsedMib: used,
        memTotalMib: used + free,
        tempC: temp.get(key) ?? 0,
        powerW: power.get(key) ?? 0,
      };
    })
    .sort((a, b) => a.key.localeCompare(b.key));
};

type PodRequestLabels = {
  namespace?: string;
  pod?: string;
  node?: string;
};

/** 파드 하나가 컨테이너 여러 개로 GPU 를 요청할 수 있어 파드 단위로 더한다. */
export const toGpuPods = (response: VectorResponse<PodRequestLabels>): GpuPod[] => {
  const merged = new Map<string, GpuPod>();
  for (const series of seriesOf(response)) {
    const labels = series.metric ?? {};
    const key = `${labels.namespace ?? '-'}/${labels.pod ?? '-'}`;
    const count = numberOf(series.value?.[1]);
    const found = merged.get(key);
    if (found) {
      found.count += count;
      continue;
    }
    merged.set(key, {
      key,
      namespace: labels.namespace ?? '-',
      pod: labels.pod ?? '-',
      node: labels.node ?? '-',
      count,
    });
  }
  return [...merged.values()].sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
};

/** 할당은 됐는데 실제로는 놀고 있는 장. 사용률 임계값 미만을 유휴로 본다. */
export const IDLE_UTIL_THRESHOLD = 5;

export const idleDeviceCount = (devices: GpuDevice[]): number =>
  devices.filter((device) => device.util < IDLE_UTIL_THRESHOLD).length;
