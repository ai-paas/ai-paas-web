import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
import path from 'path';

// @innogrid/ui의 main.css에 base64 Pretendard Variable(2.7MB)이 @font-face로 내장되어 있는데,
// 앱이 동일한 family('Pretendard Variable', weight 45 920)를 woff2 파일로 이미 배포·preload 중이라
// 같은 폰트가 이중 전송된다. 라이브러리 쪽 base64 @font-face만 걷어낸다.
// 라이브러리가 폰트 미포함 빌드를 제공하면 이 플러그인은 제거할 것. (TODO.md 2번)
const stripInnogridEmbeddedPretendard = (): Plugin => ({
  name: 'strip-innogrid-embedded-pretendard',
  enforce: 'pre',
  transform(code, id) {
    if (
      /node_modules[\\/]@innogrid[\\/]ui[\\/].*\.css(?:\?.*)?$/.test(id) &&
      code.includes('Pretendard Variable') &&
      code.includes('data:')
    ) {
      // family가 정확히 'Pretendard Variable'인 base64 블록만 제거 — 다른 임베디드 폰트는 보존.
      return {
        code: code.replace(
          /@font-face\s*{(?=[^}]*font-family:\s*['"]?Pretendard Variable['"]?)[^}]*data:[^}]*}/g,
          '',
        ),
        map: null,
      };
    }
  },
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      stripInnogridEmbeddedPretendard(),
      react(),
      tailwindcss(),
      svgr({
        include: '**/*.svg',
      }),
    ],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_SERVER_URL,
          changeOrigin: false,
          secure: false,
          ws: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        treeshake: {
          // @innogrid/ui는 package.json에 sideEffects 선언이 없어 배럴 re-export가 통째로
          // 엔트리 청크에 남는다. JS 모듈만 부작용 없음으로 표시해 미사용 컴포넌트를 걷어낸다.
          // (.css는 제외 대상이 아니므로 사용 중인 컴포넌트의 스타일은 그대로 유지된다)
          moduleSideEffects: (id) =>
            !/node_modules[\\/]@innogrid[\\/]ui[\\/]dist[\\/].*\.js$/.test(id),
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@/assets/style/utils/variable" as *;
            @use "@/assets/style/utils/mixin" as *;
          `,
        },
      },
    },
  };
});
