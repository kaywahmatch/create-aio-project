import { defineConfig, loadEnv } from 'vite';
// import vue from '@vitejs/plugin-vue';
import { wrapperEnv } from './build/utils';
console.log('🚀 ~ file: vite.config.ts ~ line 4 ~ wrapperEnv', wrapperEnv);

import { createVitePlugins } from './build/vite/plugin';
import { resolve } from 'path';
import { createProxy } from './build/vite/proxy';

function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir);
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const root = process.cwd();

  const env = loadEnv(mode, root);

  console.log('-------env-------', env);

  //  loadEnv读取的布尔类型是一个字符串。这个函数可以转换为布尔类型
  const viteEnv = wrapperEnv(env);

  const { VITE_PORT, VITE_PUBLIC_PATH, VITE_PROXY, VITE_DROP_CONSOLE } = viteEnv;

  // 是否打包模式
  const isBuild = command === 'build';

  // 打包强制为生产模式
  if (isBuild) {
    process.env.NODE_ENV = 'production';
  }

  return {
    base: VITE_PUBLIC_PATH,
    root,
    resolve: {
      // 设置快捷路径
      alias: [
        // /@/xxxx => src/xxxx
        {
          find: /\/@\//,
          replacement: pathResolve('src') + '/',
        },
        // /#/xxxx => types/xxxx
        {
          find: /\/#\//,
          replacement: pathResolve('types') + '/',
        },
      ],
    },

    server: {
      watch: {
        usePolling: true,
      },
      host: true,
      port: VITE_PORT,
      proxy: createProxy(VITE_PROXY),
    },

    build: {
      target: 'es2015',
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
      },
      minify: 'terser',
      terserOptions: {
        compress: {
          keep_infinity: true,
          // 用于在生产环境中删除控制台
          drop_console: VITE_DROP_CONSOLE,
        },
      },
      // 关闭brotlize显示可以略微减少包装时间
      brotliSize: false,
      // 调整块大小警告限制 单位kb
      chunkSizeWarningLimit: 2000,
    },

    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            hack: `true; @import (reference) "${resolve('src/less/index.less')}";`,
          },
          javascriptEnabled: true,
        },
      },
    },

    plugins: [createVitePlugins(viteEnv, isBuild)],
    optimizeDeps: {
      include: [],
      exclude: [],
    },
  };
});
