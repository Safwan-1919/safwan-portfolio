/**
 * Generates public/resume.pdf — a one-page hand-typed CV placeholder that the
 * About sheet links to, so the "Download the CV" button is never a dead link.
 *
 *   node scripts/build-resume.mjs
 *
 * Writes an uncompressed PDF with a correctly computed cross-reference table
 * (no dependencies). Replace the output with your real CV when you ship.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { buildSync } from 'esbuild';

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, '..', 'public');
const tmpDir = join(here, '.smoke');
mkdirSync(publicDir, { recursive: true });
mkdirSync(tmpDir, { recursive: true });

// Compile the TS content model so the CV always matches the site copy.
const bundle = join(tmpDir, 'portfolio.mjs');
buildSync({
  entryPoints: [join(here, '..', 'src', 'content', 'portfolio.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node20',
  outfile: bundle,
  logLevel: 'warning',
});

const { content } = await import(pathToFileURL(bundle).href);

const escape = (text) => text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

/** Writes a text line at the given position with the given Helvetica size. */
function line(x, y, text, size = 10, font = 'F1') {
  return `BT /${font} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${escape(text)}) Tj ET\n`;
}

function rule(x1, y, x2) {
  return `0.5 w ${x1} ${y} m ${x2} ${y} l S\n`;
}

const width = 595.28;
const height = 841.89;
const margin = 56;
const maxWidth = width - margin * 2;
const bottomLimit = margin + 30;

let cursor = height - margin;
let stream = '';

/** Rough Helvetica advance width (good enough for a placeholder CV). */
const charWidth = (size, bold) => size * (bold ? 0.56 : 0.5);

function wrapText(text, size, bold = false) {
  const limit = Math.floor(maxWidth / charWidth(size, bold));
  const words = String(text).split(/\s+/);
  const lines = [];
  let current = '';
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > limit && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  });
  if (current) lines.push(current);
  return lines;
}

function writeLine(text, size, bold) {
  cursor -= size + 3;
  stream += line(margin, cursor, text, size, bold ? 'F2' : 'F1');
}

function heading(text) {
  if (cursor < bottomLimit + 48) return false;
  cursor -= 26;
  stream += line(margin, cursor, text.toUpperCase(), 11, 'F2');
  cursor -= 6;
  stream += rule(margin, cursor, width - margin);
  cursor -= 8;
  return true;
}

function paragraph(text, size = 9.5, bold = false) {
  const lines = wrapText(text, size, bold);
  if (cursor - lines.length * (size + 3) < bottomLimit) return false;
  lines.forEach((wrapped) => writeLine(wrapped, size, bold));
  return true;
}

function spacer(amount = 8) {
  cursor -= amount;
}

// Masthead
stream += line(margin, cursor, content.identity.name, 23, 'F2');
cursor -= 19;
stream += line(margin, cursor, content.identity.title, 11.5);
cursor -= 16;
stream += line(margin, cursor, `${content.identity.email} · ${content.identity.phone} · ${content.identity.location}`, 9.5);
cursor -= 12;
stream += rule(margin, cursor, width - margin);
spacer(10);

if (heading('Profile')) {
  content.identity.bio.forEach((entry) => paragraph(entry));
}

if (heading('Selected work')) {
  content.projects.slice(0, 3).forEach((project) => {
    if (!paragraph(`${project.title} — ${project.subtitle}`, 10.5, true)) return;
    paragraph(`${project.year} · ${project.role} · ${project.client}`);
    paragraph(project.summary);
    paragraph(`Stack: ${project.stack.join(', ')}`);
    spacer(6);
  });
}

if (heading('Experience')) {
  content.timeline.forEach((entry) => {
    if (!paragraph(`${entry.period} — ${entry.role}, ${entry.company}`, 10.5, true)) return;
    paragraph(entry.summary);
    spacer(5);
  });
}

if (heading('Skills')) {
  content.skills.forEach((skill) => {
    paragraph(`${skill.label} · ${skill.group}`);
  });
}

if (heading('Certifications')) {
  content.certifications.forEach((certification) => {
    paragraph(`${certification.title} — ${certification.issuer}, ${certification.year}`);
  });
}

if (heading('Education')) {
  content.education.forEach((entry) => {
    paragraph(`${entry.period} — ${entry.degree}`, 10.5, true);
    paragraph(`${entry.institution} · ${entry.detail}`);
  });
}

if (heading('Awards & hackathons')) {
  content.awards.forEach((award) => {
    paragraph(`${award.title} — ${award.issuer}, ${award.year}`);
  });
}

if (heading('Elsewhere')) {
  paragraph(
    `${content.identity.email} · ${content.identity.phone} · ${content.socials
      .filter((social) => !social.url.startsWith('mailto') && !social.url.startsWith('tel'))
      .map((social) => `${social.label} ${social.handle}`)
      .join('  ·  ')}`,
  );
}

const contentStream = stream;
const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
  `<< /Length ${Buffer.byteLength(contentStream, 'latin1')} >>\nstream\n${contentStream}endstream`,
];

let pdf = '%PDF-1.4\n';
const offsets = [0];

objects.forEach((object, index) => {
  offsets.push(Buffer.byteLength(pdf, 'latin1'));
  pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
});

const xrefStart = Buffer.byteLength(pdf, 'latin1');
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (let index = 1; index <= objects.length; index += 1) {
  pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

writeFileSync(join(publicDir, 'resume.pdf'), Buffer.from(pdf, 'latin1'));

/* --------------------------------------------------------------- self check */

// Verify the cross-reference table really points at the objects, so the file
// opens in every reader instead of failing silently.
const bytes = Buffer.from(pdf, 'latin1');
const text = bytes.toString('latin1');
const startxref = Number(text.slice(text.lastIndexOf('startxref') + 9).trim().split(/\s+/)[0]);
if (text.slice(startxref, startxref + 4) !== 'xref') {
  throw new Error(`resume.pdf: startxref ${startxref} does not point at the xref table`);
}

const table = text.slice(startxref).split('\n');
for (let index = 1; index <= objects.length; index += 1) {
  // table[0] = "xref", table[1] = "0 N", table[2] = free entry, then objects.
  const entry = table[index + 2];
  const offset = Number(entry.slice(0, 10));
  const expected = `${index} 0 obj`;
  if (text.slice(offset, offset + expected.length) !== expected) {
    throw new Error(`resume.pdf: object ${index} offset ${offset} is wrong`);
  }
}

console.log(
  `public/resume.pdf written and xref-verified (${bytes.length} bytes, ${objects.length} objects, ${Math.round(cursor)}pt of content left)`,
);