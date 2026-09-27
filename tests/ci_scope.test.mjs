import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  ci_gate_passes,
  classify_ci_paths,
  read_ci_scope,
} from '../scripts/ci_scope.mjs';

test('only known non-runtime documentation qualifies for the fast route', () => {
  assert.equal(classify_ci_paths(['AGENTS.md', 'docs/agent_roles.md']), 'docs');
  for (const path of [
    'app/page.tsx',
    'playwright.config.ts',
    '.github/workflows/site_checks.yml',
    'scripts/ci_scope.mjs',
    'content/posts.json',
    'docs/data.json',
    'docs/new_document.md',
    'AGENTS.md.ts',
    'README.md\napp/page.tsx',
  ])
    assert.equal(classify_ci_paths(['README.md', path]), 'full', path);
  assert.equal(classify_ci_paths([]), 'full');
});

test('missing, failed, cancelled or unexpectedly skipped required jobs cannot pass', () => {
  const full = {
    scope: 'full',
    scope_result: 'success',
    quality_result: 'success',
    browser_result: 'success',
  };
  assert.equal(ci_gate_passes(full), true);
  for (const job of ['scope_result', 'quality_result', 'browser_result']) {
    for (const result of [undefined, '', 'failure', 'cancelled', 'skipped'])
      assert.equal(
        ci_gate_passes({ ...full, [job]: result }),
        false,
        `${job}: ${result}`,
      );
  }
  const docs = {
    scope: 'docs',
    scope_result: 'success',
    quality_result: 'skipped',
    browser_result: 'skipped',
  };
  assert.equal(ci_gate_passes(docs), true);
  for (const result of [undefined, '', 'failure', 'cancelled']) {
    assert.equal(ci_gate_passes({ ...docs, scope_result: result }), false);
    assert.equal(ci_gate_passes({ ...docs, quality_result: result }), false);
    assert.equal(ci_gate_passes({ ...docs, browser_result: result }), false);
  }
  assert.equal(ci_gate_passes({ ...docs, scope: '' }), false);
  assert.equal(ci_gate_passes({ ...full, scope: 'unknown' }), false);
});

test('real Git diffs keep runtime renames, deletions and unavailable bases on the full route', () => {
  const directory = mkdtempSync(join(tmpdir(), 'site-ci-scope-'));
  const git = (...args) =>
    execFileSync('git', args, {
      cwd: directory,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  const commit = () => {
    git('add', '-A');
    git(
      '-c',
      'user.name=CI test',
      '-c',
      'user.email=ci@example.invalid',
      'commit',
      '-qm',
      'fixture',
    );
    return git('rev-parse', 'HEAD');
  };
  try {
    git('init', '-q');
    writeFileSync(join(directory, 'README.md'), 'Initial documentation\n');
    mkdirSync(join(directory, 'app'));
    writeFileSync(
      join(directory, 'app/page.tsx'),
      'export default function Page() {}\n',
    );
    const initial = commit();
    writeFileSync(join(directory, 'README.md'), 'Updated documentation\n');
    const documentation = commit();
    assert.equal(read_ci_scope(initial, directory).scope, 'docs');
    renameSync(join(directory, 'app/page.tsx'), join(directory, 'AGENTS.md'));
    commit();
    assert.equal(read_ci_scope(documentation, directory).scope, 'full');
    for (const base of [undefined, 'HEAD~1', '0'.repeat(40), 'f'.repeat(40)])
      assert.equal(read_ci_scope(base, directory).scope, 'full');
    assert.equal(
      read_ci_scope(git('rev-parse', 'HEAD'), directory).scope,
      'full',
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
