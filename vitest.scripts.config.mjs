// Unit tests for the Node build scripts (scripts/**). The Angular app's tests run via `ng test`.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['scripts/**/*.test.mjs'],
    environment: 'node'
  }
});
