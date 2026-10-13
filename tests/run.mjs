// SEVEN — full regression runner. Executes every suite in order and fails if
// any suite fails. Usage: npm test   (or)   node tests/run.mjs
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const suites = [
  'backup-restore.test.mjs',
  'patient-edit.test.mjs',
  'regression.test.mjs',
];

let failed = 0;
for (const suite of suites) {
  console.log(`\n========== ${suite} ==========`);
  const r = spawnSync(process.execPath, [path.join(here, suite)], { stdio: 'inherit' });
  if (r.status !== 0) failed += 1;
}

console.log(`\n========================================`);
console.log(failed === 0 ? 'ALL SUITES PASSED' : `${failed} SUITE(S) FAILED`);
process.exit(failed === 0 ? 0 : 1);
