import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setup-vitest.ts'],
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['html', 'text', 'text-summary', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/**/*.spec.ts',
        'src/**/*.module.ts',
        'src/**/*.routes.ts',
        'src/**/index.ts',
        'src/main.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/fixtures/**',
        '**/mocks/**',
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@core': resolve(__dirname, './src/app/core'),
      '@shared': resolve(__dirname, './src/app/shared'),
      '@features': resolve(__dirname, './src/app/features'),
    },
  },
});

