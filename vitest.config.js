import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/frontend/setup.js'],
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['alarm-clock-card.js'],
      exclude: ['tests/**', 'node_modules/**'],
    },
  },
  resolve: {
    alias: {
      // Map the CDN URL to local lit package for testing
      'https://cdn.jsdelivr.net/npm/lit@3.1.0/+esm': 'lit',
    },
  },
});
