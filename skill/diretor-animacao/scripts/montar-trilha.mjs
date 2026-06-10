#!/usr/bin/env node
// Monta a trilha única de narração a partir da decupagem, compensando overlaps de transição.
// A matemática que sempre erra na mão: starts reais com fadeIn (fromFrame = cursor - fadeIn).
//
// Uso: node montar-trilha.mjs decupagem.json saida.wav
// decupagem.json:
// { "lead": 0.6,
//   "scenes": [ { "id": "c1", "dur": 6.165, "fadeIn": 0, "narr": "assets/audio/n1.wav" },
//               { "id": "c4b", "dur": 3.6, "fadeIn": 0.3 } ] }   // sem narr = só ocupa tempo
// Imprime a tabela de starts/offsets e gera o WAV (adelay+amix).

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const [specPath, outWav] = process.argv.slice(2);
if (!specPath || !outWav) { console.error('uso: montar-trilha.mjs decupagem.json saida.wav'); process.exit(1); }
const spec = JSON.parse(readFileSync(specPath, 'utf8'));
const LEAD = spec.lead ?? 0.6;

const dur = (f) => parseFloat(execSync(
  `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${f}"`,
  { encoding: 'utf8' }).trim());

let cursor = 0;
const rows = [];
for (const sc of spec.scenes) {
  const fadeIn = sc.fadeIn ?? 0;
  const start = rows.length === 0 ? 0 : +(cursor - fadeIn).toFixed(3);
  const row = { id: sc.id, dur: sc.dur, start, narr: sc.narr || null, offset: null, narrDur: null };
  if (sc.narr) {
    row.narrDur = +dur(sc.narr).toFixed(3);
    row.offset = +(start + (sc.narrLead ?? LEAD)).toFixed(3);
  }
  rows.push(row);
  cursor = +(start + sc.dur).toFixed(3);
}
const total = cursor;

console.log('cena  start    dur     narr-offset  narr-dur');
for (const r of rows) console.log(
  `${r.id.padEnd(5)} ${String(r.start).padEnd(8)} ${String(r.dur).padEnd(7)} ` +
  `${r.narr ? String(r.offset).padEnd(12) + r.narrDur : '—'}`);
console.log(`TOTAL ${total}s`);

const narrRows = rows.filter((r) => r.narr);
const inputs = narrRows.map((r) => `-i "${r.narr}"`).join(' ');
const filters = narrRows.map((r, i) => `[${i}:a]adelay=${Math.round(r.offset * 1000)}|${Math.round(r.offset * 1000)}[a${i}]`).join(';');
const tags = narrRows.map((_, i) => `[a${i}]`).join('');
const cmd = `ffmpeg -v error ${inputs} -filter_complex "${filters};${tags}amix=inputs=${narrRows.length}:normalize=0,apad=whole_dur=${(total + 0.2).toFixed(2)}[out]" -map "[out]" -ar 44100 "${outWav}" -y`;
execSync(cmd, { stdio: 'inherit' });
console.log(`trilha: ${outWav} (${(total + 0.2).toFixed(2)}s)`);
