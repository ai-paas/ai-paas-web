export interface AddonSelection {
  monitoring: boolean;
  gpuOperator: boolean;
  ingress: boolean;
}

interface Props {
  value: AddonSelection;
  onChange: (value: AddonSelection) => void;
  /** GPU 인스턴스를 골랐는지. 드라이버 스택이 필요한지가 여기서 갈린다. */
  hasGpuNodes: boolean;
}

interface Row {
  key: keyof AddonSelection;
  name: string;
  description: string;
}

const ROWS: Row[] = [
  {
    key: 'monitoring',
    name: '모니터링',
    description: 'Prometheus + Grafana. 끄면 모니터링 화면이 비어 있습니다.',
  },
  {
    key: 'gpuOperator',
    name: 'GPU Operator',
    description: 'NVIDIA 드라이버와 컨테이너 런타임. 없으면 GPU 를 쓸 수 없습니다.',
  },
  {
    key: 'ingress',
    name: 'Ingress NGINX',
    description: '외부 트래픽 진입점. 서비스를 밖으로 열 때 필요합니다.',
  },
];

/**
 * 클러스터에 함께 올릴 것들.
 *
 * <p>표로 둔다 — 카드는 여럿 중 하나를 고를 때 맞고, 여기는 각각을 따로 켜고 끄면서 무엇을
 * 하는지와 왜 켜졌는지를 함께 읽어야 한다.
 */
export const AddonPicker = ({ value, onChange, hasGpuNodes }: Props) => {
  const set = (key: keyof AddonSelection, on: boolean) => onChange({ ...value, [key]: on });

  /* GPU 노드를 골랐는데 꺼 두면 GPU 가 놀게 된다. 막지는 않고 이유를 적는다. */
  const noteOf = (key: keyof AddonSelection): string | null => {
    if (key !== 'gpuOperator') return null;
    if (hasGpuNodes && !value.gpuOperator) return 'GPU 노드인데 꺼져 있습니다';
    if (hasGpuNodes) return 'GPU 노드라 자동으로 켰습니다';
    return null;
  };

  return (
    <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
      <tbody>
        {ROWS.map((row) => {
          const note = noteOf(row.key);
          return (
            <tr key={row.key} style={{ borderTop: '1px solid #eee' }}>
              <td style={{ width: 32, padding: '10px 0' }}>
                <input
                  type="checkbox"
                  aria-label={row.name}
                  checked={value[row.key]}
                  onChange={(e) => set(row.key, e.target.checked)}
                />
              </td>
              <td style={{ width: 150, whiteSpace: 'nowrap' }}>{row.name}</td>
              {/*
               * 설명과 안내를 한 칸에 둔다. 칸을 나누면 좁은 화면에서 설명이 먼저 접혀
               * 두 줄이 되고, 이름과 높이가 어긋난다.
               */}
              <td style={{ color: '#666' }}>
                {row.description}
                {note && (
                  <span
                    style={{
                      marginLeft: 8,
                      whiteSpace: 'nowrap',
                      color: note.includes('꺼져') ? '#b45309' : '#15803d',
                    }}
                  >
                    {note}
                  </span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
