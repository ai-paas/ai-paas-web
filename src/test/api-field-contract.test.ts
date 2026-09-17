import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// 화면이 읽는 응답 필드 이름을 고정한다.
//
// 백엔드가 주는 이름과 화면이 읽는 이름이 어긋나면 컬럼이 조용히 비어 보인다. 실제로 감사 로그의
// 시각과 응답 코드가 그랬다 — 백엔드는 createdAt/statusCode 인데 화면은 timestamp/status 를
// 읽고 있었다. 타입이 optional 이라 컴파일도 통과한다.
//
// 백엔드 쪽 짝은 any-cloud-management 의 ResponseFieldContractTest 다. 한쪽만 바꾸면 여기서 걸린다.

const SRC = join(process.cwd(), 'src');
const read = (relative: string) => readFileSync(join(SRC, relative), 'utf-8');

describe('감사 로그', () => {
  const source = read('hooks/service/audit-logs.ts');

  it.each(['createdAt', 'statusCode', 'requestId', 'principal', 'httpMethod', 'path'])(
    '%s 를 읽는다',
    (field) => {
      expect(source).toMatch(new RegExp(`\\b${field}\\??:`));
    }
  );

  it.each(['timestamp', 'status'])('%s 는 쓰지 않는다 — 백엔드에 없는 이름이다', (field) => {
    expect(source).not.toMatch(new RegExp(`\\b${field}\\??:`));
  });
});

describe('VM 클러스터', () => {
  const source = read('types/vm.ts');

  it.each([
    'clusterId',
    'clusterRegistered',
    'provisioningStartedAt',
    'bootstrappingStartedAt',
    'verifyingStartedAt',
    'readyAt',
  ])('%s 를 읽는다', (field) => {
    expect(source).toMatch(new RegExp(`\\b${field}\\??:`));
  });
});

describe('클러스터', () => {
  const source = read('types/cluster.ts');

  it.each(['source', 'sources', 'agentConnectivity'])('%s 를 읽는다', (field) => {
    expect(source).toMatch(new RegExp(`\\b${field}\\??:`));
  });

  it('작업 이력이 request 를 읽는다', () => {
    // 같은 type=CREATE_CLUSTER 가 수십 건이라 이것으로 구분한다.
    expect(source).toMatch(/\brequest\??:/);
  });
});

describe('자격증명', () => {
  const source = read('hooks/service/credentials.ts');

  it.each(['credentialKeys', 'healthStatus', 'healthCheckedAt'])('%s 를 읽는다', (field) => {
    expect(source).toMatch(new RegExp(`\\b${field}\\??:`));
  });

  it('목록 타입에 값 필드가 없다', () => {
    // 값은 reveal 경로로만 온다. 목록 타입에 넣으면 캐시에 남는다.
    const listType = source.slice(source.indexOf('export interface Credential {'));
    const body = listType.slice(0, listType.indexOf('\n}'));
    expect(body).not.toMatch(/\bcredentials\??:/);
  });
});
