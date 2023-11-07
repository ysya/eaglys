import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import Vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import Components from 'unplugin-vue-components/vite'
import UnheadVite from '@unhead/addons/vite'
import Checker from 'vite-plugin-checker'
import RequireTransform from 'vite-plugin-require-transform'
import { quasar as Quasar, transformAssetUrls } from '@quasar/vite-plugin'
import { QuasarResolver } from 'unplugin-vue-components/resolvers'
import { createHash } from 'crypto'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }
  const dev = mode === 'development'
  const hash = (code: string) =>
    createHash('sha256').update(code).digest('hex').substring(0, 8)
  return {
    server: {
      port: 8080,
      proxy: {
        '/api': {
          target: process.env.V_API_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    envPrefix: 'V_',
    esbuild: {
      drop: dev ? [] : ['console', 'debugger'],
    },
    build: {
      minify: 'esbuild',
      rollupOptions: {
        output: {
          entryFileNames: (ch) => `js/${hash(ch.name)}[hash].js`,
          chunkFileNames: (ch) => `js/${hash(ch.name)}[hash].js`,
          assetFileNames: (ch) => {
            const n = ch.name ?? ''
            const nSplit = n.split('.')
            let extType = nSplit[nSplit.length - 1]
            if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(n)) {
              extType = 'media'
            } else if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)(\?.*)?$/.test(n)) {
              extType = 'img'
            } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(n)) {
              extType = 'fonts'
            }
            return `static/${extType}/[hash][extname]`
          },
        },
      },
    },
    resolve: {
      dedupe: ['codemirror'],
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    plugins: [
      Vue({
        template: { transformAssetUrls },
      }),
      Quasar(),
      Components({
        resolvers: [QuasarResolver()],
        dts: 'src/typings/typed-components.d.ts',
        types: [
          {
            from: 'vue-router',
            names: ['RouterLink', 'RouterView'],
          },
        ],
      }),
      UnheadVite(),
      UnoCSS(),
      RequireTransform({
        fileRegex: /.ts$|.vue$/,
      }),
      !process.env.VITEST ? Checker({ vueTsc: true }) : undefined,
    ],
  }
})
