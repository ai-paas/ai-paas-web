import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  ProviderSpecFields,
  missingProviderSpecFields,
  providerSpecFieldName,
} from './provider-spec-fields';

let schema: { fields: Array<Record<string, unknown>>; isPending: boolean };

vi.mock('@/hooks/service/providers', () => ({
  useGetProviderConfigSchema: () => schema,
}));

const field = (key: string, extra: Record<string, unknown> = {}) => ({
  key,
  type: 'string',
  required: false,
  ...extra,
});

describe('ProviderSpecFields', () => {
  beforeEach(() => {
    schema = { fields: [], isPending: false };
  });

  it('CSP 고유 키만 칸으로 만든다', () => {
    // masterCount 나 osImage 는 전용 입력이 이미 받는다. 여기서 또 받으면 칸이 겹친다.
    schema.fields = [
      field('anycloud-k8s:providerSpec.zone', { required: true }),
      field('anycloud-k8s:masterCount'),
      field('anycloud-k8s:osImage'),
    ];

    render(<ProviderSpecFields provider="ibm" values={{}} onChange={vi.fn()} />);

    expect(screen.getByText('zone')).toBeInTheDocument();
    expect(screen.queryByText('masterCount')).not.toBeInTheDocument();
    expect(screen.queryByText('osImage')).not.toBeInTheDocument();
  });

  it('고유 키가 없는 CSP 에서는 아무것도 그리지 않는다', () => {
    schema.fields = [field('anycloud-k8s:masterCount')];

    const { container } = render(
      <ProviderSpecFields provider="aws" values={{}} onChange={vi.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('입력한 값을 필드 이름으로 올려보낸다', () => {
    // 서버는 providerSpec.zone 이 아니라 zone 을 받는다.
    schema.fields = [field('anycloud-k8s:providerSpec.zone', { required: true })];
    const onChange = vi.fn();

    render(<ProviderSpecFields provider="ibm" values={{}} onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'jp-tok-1' } });

    expect(onChange).toHaveBeenCalledWith({ zone: 'jp-tok-1' });
  });

  it('스키마 기본값을 처음에 한 번 채운다', () => {
    schema.fields = [field('anycloud-k8s:providerSpec.datastoreId', { defaultValue: 'local-lvm' })];
    const onChange = vi.fn();

    render(<ProviderSpecFields provider="proxmox" values={{}} onChange={onChange} />);

    expect(onChange).toHaveBeenCalledWith({ datastoreId: 'local-lvm' });
  });

  it('사용자가 지운 칸에 기본값을 되살리지 않는다', () => {
    schema.fields = [field('anycloud-k8s:providerSpec.datastoreId', { defaultValue: 'local-lvm' })];
    const onChange = vi.fn();

    render(<ProviderSpecFields provider="proxmox" values={{ datastoreId: '' }} onChange={onChange} />);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('제출을 시도하기 전에는 빈 필수 칸을 빨갛게 만들지 않는다', () => {
    schema.fields = [field('anycloud-k8s:providerSpec.zone', { required: true })];

    render(<ProviderSpecFields provider="ibm" values={{}} onChange={vi.fn()} />);

    expect(screen.queryByText(/입력해주세요/)).not.toBeInTheDocument();
  });

  it('제출 후에는 빈 필수 칸을 짚어 준다', () => {
    schema.fields = [field('anycloud-k8s:providerSpec.zone', { required: true })];

    render(<ProviderSpecFields provider="ibm" values={{}} onChange={vi.fn()} showErrors />);

    expect(screen.getByText(/zone 을\(를\) 입력해주세요/)).toBeInTheDocument();
  });

  it('허용값이 정해진 키는 고르게 한다', () => {
    schema.fields = [
      field('anycloud-k8s:providerSpec.tier', { allowedValues: ['basic', 'premium'] }),
    ];

    render(<ProviderSpecFields provider="ibm" values={{}} onChange={vi.fn()} />);

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});

describe('missingProviderSpecFields', () => {
  it('필수인데 비어 있는 것만 센다', () => {
    const fields = [
      field('anycloud-k8s:providerSpec.zone', { required: true }),
      field('anycloud-k8s:providerSpec.resourceGroup'),
      field('anycloud-k8s:masterCount', { required: true }),
    ];

    expect(missingProviderSpecFields(fields, {})).toEqual(['zone']);
    expect(missingProviderSpecFields(fields, { zone: 'jp-tok-1' })).toEqual([]);
  });

  it('공백만 넣은 것은 채운 것으로 보지 않는다', () => {
    const fields = [field('anycloud-k8s:providerSpec.zone', { required: true })];

    expect(missingProviderSpecFields(fields, { zone: '   ' })).toEqual(['zone']);
  });
});

describe('providerSpecFieldName', () => {
  it('접두를 떼어 서버가 받는 이름으로 만든다', () => {
    expect(providerSpecFieldName('anycloud-k8s:providerSpec.externalNetworkId')).toBe(
      'externalNetworkId'
    );
  });
});
