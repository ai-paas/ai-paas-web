import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
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
