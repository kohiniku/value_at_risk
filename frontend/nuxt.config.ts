import { defineNuxtConfig } from 'nuxt/config'

const devServerPort = Number.parseInt(process.env.NUXT_DEV_SERVER_PORT ?? '3000', 10)
const hmrHost = process.env.NUXT_PUBLIC_HMR_HOST ?? 'localhost'
const hmrClientPort = Number.parseInt(
  process.env.NUXT_PUBLIC_HMR_PORT ?? process.env.NGINX_PORT ?? '80',
  10,
)

export default defineNuxtConfig({
  compatibilityDate: '2024-08-17',
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  devServer: {
    host: '0.0.0.0',
    port: devServerPort,
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ?? '/api/v1',
      newsLimit: Number.parseInt(process.env.NUXT_PUBLIC_NEWS_LIMIT ?? '5', 10),
      refreshIntervalMs: Number.parseInt(process.env.NUXT_PUBLIC_REFRESH_INTERVAL_MS ?? '60000', 10),
      hmrHost,
      hmrPort: hmrClientPort,
    },
  },
  vite: {
    server: {
      hmr: {
        protocol: 'ws',
        host: hmrHost,
        clientPort: hmrClientPort,
      },
    },
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'ja',
      },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap',
        },
      ],
    },
  },
  typescript: {
    shim: false,
    typeCheck: false,
  },
})
