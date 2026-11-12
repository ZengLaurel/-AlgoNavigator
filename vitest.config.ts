import { configDefaults, defineConfig } from 'vitest/config'

// Kept separate from vite.config.ts: vitest bundles its own copy of Vite,
// whose plugin types don't line up with the root Vite install, so mixing
// `test` config into the same defineConfig() call breaks type-checking.
export default defineConfig({
  test: {
    // Real WASM plus many jsdom suites otherwise oversubscribe school/dev machines.
    maxWorkers: 4,
    minWorkers: 1,
    environment: 'jsdom',
    globals: true,
    exclude: [...configDefaults.exclude, 'artifacts/**'],
  },
})
