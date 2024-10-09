import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'



// https://vitejs.dev/config/
export default defineConfig({
  // base: '/sub3-yiting/', // 将 '/your-base-path/' 替换为实际部署时的路径
  build: {
    outDir: 'dist', // 输出目录
    assetsDir: 'assets', // 静态资源目录
  },
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  devServer: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' https://trusted.cdn.com; style-src 'self' 'unsafe-inline';"
    }
  }
})
