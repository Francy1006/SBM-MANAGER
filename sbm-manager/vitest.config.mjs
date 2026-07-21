import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    include: ['src/**/__tests__/**/*.spec.js'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'html', 'lcov', 'cobertura'],
      include: [
        'src/api/clients.js',
        'src/views/ProductView.vue',
        'src/components/CRUDManagerComponent.vue',
        'src/components/CRUDGridComponent.vue',
        'src/components/SimpleFormComponent.vue',
        'src/components/PropertiesComponent.vue',
        'src/components/ConfirmComponent.vue',
      ],
      exclude: ['src/**/__tests__/**', '**/*.spec.js'],
      thresholds: {
        lines: 70,
        statements: 70,
        functions: 70,
        branches: 60,
      },
    },
  },
})
