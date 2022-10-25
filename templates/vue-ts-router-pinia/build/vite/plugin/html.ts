import type { Plugin, PluginOption } from 'vite';

import { createHtmlPlugin } from 'vite-plugin-html';

export function configHtmlPlugin(env: ViteEnv, isBuild: boolean) {
  const { VITE_GLOB_APP_TITLE, VITE_API_ENV } = env;

  const htmlPlugin: PluginOption[] = createHtmlPlugin({
    minify: isBuild,
    inject: {
      // Inject data into ejs template
      data: {
        title: VITE_GLOB_APP_TITLE,
        runEnv: VITE_API_ENV,
      },
    },
  });
  return htmlPlugin;
}
