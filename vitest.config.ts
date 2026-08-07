import { defineConfig, mergeConfig, coverageConfigDefaults } from 'vitest/config';
import viteConfig from './vite.config';

// vite.config.ts(플러그인·alias·scss additionalData 포함)를 그대로 상속해
// 테스트마다 scss/svg를 수동 목킹할 필요를 없앤다.
export default defineConfig((configEnv) =>
  mergeConfig(
    viteConfig(configEnv),
    defineConfig({
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup-tests.ts'],
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        coverage: {
          provider: 'v8',
          reporter: ['text', 'json', 'html'],
          include: ['src/**/*.{ts,tsx}'],
          exclude: [...coverageConfigDefaults.exclude, 'src/test/**'],
        },
      },
    })
  )
);
