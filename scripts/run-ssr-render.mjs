/**
 * Render-level test: bundles the UI entry (scripts/ssr-entry.tsx) and renders
 * every overlay component + every room sheet with react-dom/server, so all
 * render paths are executed outside the browser.
 *
 *   npm run test:render
 */

import { buildSync } from 'esbuild';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { installCanvasStub } from './lib/canvas-stub.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '.smoke');
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const bundle = join(outDir, 'ssr-entry.mjs');
buildSync({
  entryPoints: [join(here, 'ssr-entry.tsx')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node20',
  jsx: 'automatic',
  external: ['react', 'react-dom', 'react/jsx-runtime', 'gsap', 'three', '@react-three/fiber', '@react-three/drei'],
  // Vite injects the env; Node needs it defined for the bundle to load.
  define: { 'import.meta.env.VITE_CONTACT_ENDPOINT': 'undefined' },
  outfile: bundle,
  logLevel: 'warning',
});

writeFileSync(
  join(outDir, 'run-ssr-render.mjs'),
  `import { installCanvasStub } from '../lib/canvas-stub.mjs';
installCanvasStub();
const mod = await import('./ssr-entry.mjs');
const results = mod.renderAll();
const failed = results.filter((entry) => !entry.ok);
results.forEach((entry) => {
  if (entry.ok) {
    console.log(\`PASS  \${entry.name} (\${entry.html.length} bytes of markup)\`);
  } else {
    console.log(\`FAIL  \${entry.name} -> \${entry.error}\`);
  }
});

// Content integrity: the rendered markup must actually carry the profile data.
const { content } = mod;
const decodeEntities = (value) =>
  value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&#39;', "'");
const allMarkup = decodeEntities(results.map((entry) => entry.html).join('\\n'));
const expectations = [
  ['name', content.identity.name],
  ['job title', content.identity.title],
  ['email', content.identity.email],
  ['phone', content.identity.phone],
  ['location', content.identity.location],
  ['github', content.socials.find((social) => social.id === 'github')?.url ?? 'github'],
  ['linkedin', content.socials.find((social) => social.id === 'linkedin')?.url ?? 'linkedin'],
];

const missing = [];
expectations.forEach(([label, value]) => {
  if (!allMarkup.includes(value)) missing.push(\`\${label} (\${value})\`);
});
content.projects.forEach((project) => {
  if (!allMarkup.includes(project.title)) missing.push(\`project: \${project.title}\`);
});
content.certifications.forEach((certification) => {
  if (!allMarkup.includes(certification.title)) missing.push(\`certification: \${certification.title}\`);
});
content.education.forEach((entry) => {
  if (!allMarkup.includes(entry.degree)) missing.push(\`education: \${entry.degree}\`);
});
content.skills.forEach((skill) => {
  if (!allMarkup.includes(skill.label)) missing.push(\`skill: \${skill.label}\`);
});

if (missing.length) {
  console.log(\`FAIL  content integrity -> missing from markup: \${missing.join(', ')}\`);
} else {
  console.log(
    \`PASS  content integrity (\${content.projects.length} projects, \${content.skills.length} skills, \` +
      \`\${content.certifications.length} certifications, \${content.education.length} education entries)\`,
  );
}

console.log(\`\\n\${results.length - failed.length}/\${results.length} render paths passed\`);
if (failed.length || missing.length) {
  process.exit(1);
}
console.log('UI render test passed.');
`,
);

console.log('UI layer bundled — rendering every component\n');
execFileSync(process.execPath, [join(outDir, 'run-ssr-render.mjs')], { stdio: 'inherit' });