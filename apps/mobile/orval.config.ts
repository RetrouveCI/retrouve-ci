import { defineConfig } from 'orval';

/**
 * Generates the typed TanStack Query client from the NestJS Swagger document.
 * Run with `pnpm --filter mobile orval` once the API exposes its OpenAPI JSON
 * (set API_URL, e.g. http://localhost:3002). Not executed in Phase 1 — the
 * services under src/services use mock data with the same query keys.
 */
export default defineConfig({
  retrouveci: {
    input: {
      target: `${process.env.API_URL ?? 'http://localhost:3002'}/api-json`,
    },
    output: {
      mode: 'tags-split',
      target: 'src/services/generated/',
      client: 'react-query',
      override: {
        mutator: {
          path: 'src/services/api.client.ts',
          name: 'apiClient',
        },
      },
    },
  },
});
