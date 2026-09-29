// 프로비저닝 emitter 가 있는 CSP 만 노출한다. 목록에 있는데 emitter 가 없으면
// 자격증명까지 등록하고 프로비저닝에서 실패한다 — emitter 가 없는 CSP 를 목록에 두면 그렇게 된다.
// 백엔드 기준: YamlEmitters.supported()
//
// brand color + 실제 Simple Icons CDN 의 brand 로고 (CC0).
// dropdown 대신 시각적 그리드. 선택 상태 = 강한 outline + 체크 표시.
//
// Simple Icons CDN: https://cdn.simpleicons.org/<slug>/<hex-color>
//   - slug: 공식 brand slug (소문자, hyphen 없음)
//   - color: 6-digit hex (without #). 흰색 = "ffffff"

interface CspOption {
  value: string;
  label: string;
  description: string;
  color: string; // brand background
  textColor?: string; // contrast (default white)
  iconSlug: string; // Simple Icons brand slug — https://simpleicons.org
}

export const CSP_OPTIONS: CspOption[] = [
  {
    value: 'AWS',
    label: 'AWS',
    description: 'Amazon Web Services',
    color: '#FF9900',
    iconSlug: 'amazonwebservices',
  },
  {
    value: 'GCP',
    label: 'GCP',
    description: 'Google Cloud Platform',
    color: '#4285F4',
    iconSlug: 'googlecloud',
  },
  {
    value: 'ALIBABA',
    label: 'Alibaba Cloud',
    description: 'Alibaba Cloud ECS',
    color: '#FF6A00',
    iconSlug: 'alibabacloud',
  },
  {
    value: 'OPENSTACK',
    label: 'OpenStack',
    description: 'OpenStack Cloud',
    color: '#ED1944',
    iconSlug: 'openstack',
  },
  {
    value: 'OCI',
    label: 'OCI',
    description: 'Oracle Cloud Infrastructure',
    color: '#C74634',
    iconSlug: 'oracle',
  },
  {
    value: 'IBM',
    label: 'IBM',
    description: 'IBM Cloud VPC',
    color: '#0F62FE',
    iconSlug: 'ibmcloud',
  },
  {
    value: 'PROXMOX',
    label: 'Proxmox',
    description: 'Proxmox VE',
    color: '#E57000',
    iconSlug: 'proxmox',
  },
];

interface CspSelectorProps {
  value?: string;
  onChange: (value: string) => void;
}

export const CspSelector = ({ value, onChange }: CspSelectorProps) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12,
      }}
    >
      {CSP_OPTIONS.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={selected}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              padding: '14px 10px',
              borderRadius: 8,
              border: selected ? `2px solid ${opt.color}` : '1px solid #e5e7eb',
              background: selected ? `${opt.color}10` : '#fff',
              cursor: 'pointer',
              transition: 'border-color 120ms, background 120ms, transform 120ms',
              outline: 'none',
            }}
            onMouseDown={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)';
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = '';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = '';
            }}
          >
            {selected && (
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: opt.color,
                  color: '#fff',
                  fontSize: 12,
                  lineHeight: '18px',
                  textAlign: 'center',
                  fontWeight: 700,
                }}
              >
                ✓
              </span>
            )}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: opt.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <img
                src={`https://cdn.simpleicons.org/${opt.iconSlug}/${(opt.textColor ?? '#fff').replace('#', '')}`}
                alt={`${opt.label} logo`}
                width={22}
                height={22}
                loading="lazy"
                onError={(e) => {
                  // CDN 미동작 시 fallback — label 앞 1~2 글자만 표시.
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('[data-icon-fallback]')) {
                    const span = document.createElement('span');
                    span.dataset.iconFallback = '1';
                    span.style.color = opt.textColor ?? '#fff';
                    span.style.fontSize = '14px';
                    span.style.fontWeight = '700';
                    span.style.letterSpacing = '-0.02em';
                    span.textContent = opt.label.slice(0, 3).toUpperCase();
                    parent.appendChild(span);
                  }
                }}
              />
            </div>
            <div style={{ textAlign: 'center', width: '100%', marginTop: 4 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#1a1a1a',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {opt.label}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#666',
                  marginTop: 2,
                  lineHeight: 1.3,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {opt.description}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
