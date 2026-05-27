import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  target: 'node18',
  platform: 'node',
  noExternal: [/^@github-global\//],
});
