import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { matching_evidence, run_checks } from '../scripts/verify.mjs';

test('concurrent checks preserve failures and separate actual stdout/stderr evidence', async () => {
  const output_dir = mkdtempSync(join(tmpdir(), 'site-checks-'));
  try {
    const results = await run_checks(
      [
        {
          name: 'pass',
          command: process.execPath,
          args: ['-e', 'console.log("passed output")'],
        },
        {
          name: 'fail',
          command: process.execPath,
          args: ['-e', 'console.error("failed output"); process.exit(3)'],
        },
        { name: 'unavailable', command: join(output_dir, 'missing'), args: [] },
      ],
      { output_dir },
    );
    assert.deepEqual(
      results.map(({ passed }) => passed),
      [true, false, false],
    );
    assert.equal(results[1].code, 3);
    assert.match(readFileSync(results[0].log_path, 'utf8'), /passed output/);
    assert.match(readFileSync(results[1].log_path, 'utf8'), /failed output/);
    assert.match(readFileSync(results[2].log_path, 'utf8'), /ENOENT/);
  } finally {
    rmSync(output_dir, { recursive: true, force: true });
  }
});

test('review evidence rejects stale heads, different trees, dirty worktrees and failed runs', () => {
  const revision = { head: 'a'.repeat(40), tree: 'b'.repeat(40), clean: true };
  const report = { passed: true, source: revision };
  assert.equal(matching_evidence(report, revision), true);
  for (const change of [
    { head: 'c'.repeat(40) },
    { tree: 'd'.repeat(40) },
    { clean: false },
  ]) {
    assert.equal(matching_evidence(report, { ...revision, ...change }), false);
    assert.equal(
      matching_evidence(
        { ...report, source: { ...revision, ...change } },
        revision,
      ),
      false,
    );
  }
  assert.equal(
    matching_evidence({ ...report, passed: false }, revision),
    false,
  );
  assert.equal(matching_evidence(null, revision), false);
});
