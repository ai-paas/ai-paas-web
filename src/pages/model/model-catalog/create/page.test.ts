import '@/test/mocks/innogrid-ui'; // 페이지 모듈 import 시 실제 @innogrid/ui 로딩 방지 (렌더 없이 순수 함수만 테스트)
import { describe, it, expect } from 'vitest';
import { getRepoIdDescription } from './page';
import type { ModelProvider } from '@/types/model';

const provider = (name: string): ModelProvider => ({ id: 1, name, description: '' });

describe('getRepoIdDescription', () => {
  it('공급자 미선택 시 공급자 먼저 선택하라고 안내한다', () => {
    expect(getRepoIdDescription(undefined)).toBe('모델 공급자를 먼저 선택해주세요.');
  });

  it('custom 공급자는 임의 입력 안내를 보여준다', () => {
    expect(getRepoIdDescription(provider('Custom'))).toBe(
      '모델 저장소(Repository)의 고유 ID를 임의로 입력해주세요.'
    );
  });

  it('Hugging Face 공급자는 예시와 함께 등록된 ID 입력을 안내한다', () => {
    expect(getRepoIdDescription(provider('Hugging Face'))).toBe(
      'Hugging Face에 등록된 모델 ID를 정확히 입력해주세요. (예: meta-llama/Llama-3-8B)'
    );
  });

  it('Kaggle 공급자는 예시와 함께 등록된 ID 입력을 안내한다', () => {
    expect(getRepoIdDescription(provider('Kaggle'))).toBe(
      'Kaggle에 등록된 모델 ID를 정확히 입력해주세요. (예: google/gemma/PyTorch/7b)'
    );
  });

  // 공급자 이름은 백엔드 데이터라 표기가 흔들릴 수 있다 — 정규화 매칭 검증
  it.each([
    ['CUSTOM', '임의로 입력'],
    ['custom-model', '임의로 입력'],
    ['HuggingFace', 'Hugging Face에 등록된'],
    ['hugging-face', 'Hugging Face에 등록된'],
    ['KAGGLE', 'Kaggle에 등록된'],
  ])('공급자 이름 "%s"의 표기 차이를 무시하고 매칭한다', (name, expected) => {
    expect(getRepoIdDescription(provider(name))).toContain(expected);
  });

  it('알려지지 않은 허브 공급자는 공급자 이름을 포함해 안내한다', () => {
    expect(getRepoIdDescription(provider('OpenML'))).toBe(
      'OpenML에 등록된 모델 ID를 정확히 입력해주세요.'
    );
  });
});
