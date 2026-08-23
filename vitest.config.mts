import path from 'node:path'
import { defineConfig } from 'vitest/config'

const shared = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    jsx: 'automatic' as const,
  },
}

export default defineConfig({
  ...shared,
  test: {
    globals: true,
    projects: [
      {
        ...shared,
        test: {
          name: 'server',
          environment: 'node',
          globals: true,
          include: ['test/**/*.test.ts'],
        },
      },
      {
        ...shared,
        test: {
          name: 'dom',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./test/setup.tsx'],
          include: ['test/**/*.test.tsx'],
        },
      },
    ],
  },
})
