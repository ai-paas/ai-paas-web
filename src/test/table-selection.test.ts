import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// 선택 가능한 테이블이 갖춰야 할 것.
//
// Table 은 useSelect / useMultiSelect 를 넘겨야 선택이 동작한다. 체크박스 컬럼만 그려놓고
// 이 prop 을 빼먹으면 화면에는 체크박스가 보이는데 눌러도 아무 일도 일어나지 않는다.
// 반대로 prop 만 켜고 컬럼이 없으면 고를 방법 자체가 없다. 실제로 둘 다 있었다.

const SRC = join(process.cwd(), 'src');

const read = (relative: string) => readFileSync(join(SRC, relative), 'utf-8');

/** 여러 건을 한 번에 처리하는 화면 — 삭제가 N개 일괄이다. */
const MULTI_SELECT_PAGES = [
  'pages/infra-management/cluster-management/page.tsx',
  'pages/infra-management/credentials/page.tsx',
  'pages/infra-management/application/helm-release/page.tsx',
];

/** 한 건씩만 고르는 화면. */
const SINGLE_SELECT_PAGES = [
  // VM 은 노드를 한 행씩 본다. 노드 개별 삭제 경로가 없어 일괄 선택할 일이 없다.
  'pages/infra-management/vm/page.tsx',
  'pages/infra-management/application/helm-repository/page.tsx',
  'pages/infra-management/cluster-management/[id]/addons/page.tsx',
  'components/features/infra-management/operation-table.tsx',
];

describe('선택 가능한 테이블', () => {
  it.each([...MULTI_SELECT_PAGES, ...SINGLE_SELECT_PAGES])('%s 는 useSelect 를 넘긴다', (file) => {
    expect(read(file)).toMatch(/\buseSelect\b/);
  });

  it.each(MULTI_SELECT_PAGES)('%s 는 useMultiSelect 를 넘긴다', (file) => {
    expect(read(file)).toMatch(/\buseMultiSelect\b/);
  });

  it.each(SINGLE_SELECT_PAGES)('%s 는 useMultiSelect 를 켜지 않는다', (file) => {
    expect(read(file)).not.toMatch(/\buseMultiSelect\b/);
  });

  it.each([...MULTI_SELECT_PAGES, ...SINGLE_SELECT_PAGES.slice(0, 2)])(
    '%s 는 체크박스 컬럼을 그린다',
    (file) => {
      // prop 만 켜고 컬럼이 없으면 고를 방법이 없다.
      expect(read(file)).toContain("id: 'select'");
    }
  );

  it('선택 상태를 쓰면서 useSelect 를 빠뜨린 화면이 없다', () => {
    // 새 화면이 같은 실수를 반복하는 것을 막는다.
    const all = [...MULTI_SELECT_PAGES, ...SINGLE_SELECT_PAGES];
    for (const file of all) {
      const source = read(file);
      if (source.includes('rowSelection={rowSelection}')) {
        expect(source, `${file} 이 선택 상태만 넘기고 useSelect 가 없다`).toMatch(/\buseSelect\b/);
      }
    }
  });
});
