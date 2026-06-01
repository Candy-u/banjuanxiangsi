import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'path'

const variablesPath = path.resolve(__dirname, 'src/styles/variables.scss').replace(/\\/g, '/')

export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "${variablesPath}";`,
        api: 'modern-compiler',
        silenceDeprecations: ['import', 'legacy-js-api'],
      },
    },
  },
})
