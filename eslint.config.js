import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import pluginQuery from '@tanstack/eslint-plugin-query';
import testingLibrary from 'eslint-plugin-testing-library';
import jestDom from 'eslint-plugin-jest-dom';
import { globalIgnores } from 'eslint/config';

export default tseslint.config([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
      // 쿼리키 오용·exhaustive-deps 등 React Query 안티패턴 방어
      pluginQuery.configs['flat/recommended'],
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Fast Refresh(HMR) 전용 규칙이라 런타임 동작과 무관하다.
      // 상수/훅을 컴포넌트와 같은 파일에서 내보내는 기존 코드가 있어 warn 으로 둔다.
      'react-refresh/only-export-components': 'warn',
    },
  },
  // 테스트 파일 전용: Testing Library / jest-dom 안티패턴 방어
  // (await 누락된 userEvent, waitFor 내 사이드이펙트, toBeInTheDocument 미사용 등)
  {
    files: ['src/**/*.{test,spec}.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    extends: [testingLibrary.configs['flat/react'], jestDom.configs['flat/recommended']],
  },
]);
