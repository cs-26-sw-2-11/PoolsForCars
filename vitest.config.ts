import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    exclude: [
      ...configDefaults.exclude,
      'packages/template/*',
      '**/dist/**'
    ],
  },
})