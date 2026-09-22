/**
 * Bundles the sketch engine for the Node smoke test and runs it.
 *
 *   npm run smoke
 *
 * esbuild (already a Vite dependency) compiles the two TypeScript modules to
 * ESM in scripts/.smoke/, then scripts/smoke-textures.mjs imports them with a
 * stubbed canvas context that rejects non-finite drawing arguments.
 */

import { buildSync } from 'esbuild';
import { mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '.smoke');

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

['sketch', 'textures'].forEach((entry) => {
  buildSync({
    entryPoints: [join(process.cwd(), 'src', 'lib', `${entry}.ts`)],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node20',
    external: ['three'],
    outfile: join(outDir, `${entry}.mjs`),
    logLevel: 'warning',
  });
});

// The 3D helpers are TypeScript + JSX, so they get their own entry.
buildSync({
  entryPoints: [join(process.cwd(), 'src', 'components', 'three', 'Ink.tsx')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node20',
  jsx: 'automatic',
  external: ['three', 'react', '@react-three/fiber'],
  outfile: join(outDir, 'ink.mjs'),
  logLevel: 'warning',
});

console.log('sketch engine bundled — running runtime checks\n');
execFileSync(process.execPath, [join(here, 'smoke-textures.mjs')], { stdio: 'inherit' });