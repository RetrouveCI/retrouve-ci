import { defineConfig } from 'orval';

/**
 * Generates the typed TanStack Query client from the NestJS Swagger document.
 * Run with `pnpm --filter mobile orval` while the API is up (Nest exposes the
 * OpenAPI JSON at /docs-json). Override API_URL to point elsewhere.
 */
export default defineConfig({
  retrouveci: {
    input: {
      target: `${process.env.API_URL ?? 'http://localhost:3002'}/docs-json`,
    },
    output: {
      mode: 'tags-split',
      target: 'src/services/generated',
      schemas: 'src/services/generated/model',
      client: 'react-query',
      httpClient: 'axios',
      override: {
        mutator: {
          path: 'src/services/api.client.ts',
          name: 'apiClient',
        },
        query: {
          useQuery: true,
          useInfinite: false,
        },
      },
    },
  },
});
