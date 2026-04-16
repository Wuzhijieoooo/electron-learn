import { resolve } from 'path';
import { defineConfig } from 'electron-vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

const tailwindPlugin = tailwindcss() as unknown as ReturnType<typeof vue>;

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    build: {
      rollupOptions: {
        input: {
          index: resolve('src/renderer/index.html'),
          loading: resolve('src/renderer/loading.html'),
          child: resolve('src/renderer/child.html'),
          capture: resolve('src/renderer/capture.html')
        }
      }
    },
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@': resolve('src')
      }
    },
    plugins: [vue(), tailwindPlugin]
  }
});
