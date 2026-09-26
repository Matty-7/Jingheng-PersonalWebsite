import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const documentation_paths = new Set([
  'AGENTS.md',
  'README.md',
  'docs/agent_roles.md',
  'docs/agent_workflow.md',
  'docs/site_audit.md',
  'docs/automation/publisher.txt',
  'docs/automation/visitor_audit.txt',
]);

export function classify_ci_paths(paths) {
  return paths.length > 0 &&
    paths.every((path) => documentation_paths.has(path))
    ? 'docs'
    : 'full';
}

export function read_ci_scope(base_sha, cwd = process.cwd()) {
  if (!/^[a-f0-9]{40}$/.test(base_sha ?? '') || /^0+$/.test(base_sha))
    return { scope: 'full', reason: 'Missing or invalid base revision' };
  try {
    const paths = execFileSync(
      'git',
      ['diff', '--no-renames', '--name-only', '-z', base_sha, 'HEAD', '--'],
      { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    )
      .split('\0')
      .filter(Boolean);
    return { scope: classify_ci_paths(paths), changed_files: paths.length };
  } catch {
    return { scope: 'full', reason: 'Base revision or diff unavailable' };
  }
}

export function ci_gate_passes({
  scope,
  scope_result,
  quality_result,
  browser_result,
}) {
  if (scope_result !== 'success') return false;
  if (scope === 'docs')
    return quality_result === 'skipped' && browser_result === 'skipped';
  return (
    scope === 'full' &&
    quality_result === 'success' &&
    browser_result === 'success'
  );
}

if (
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
) {
  if (process.argv[2] === 'scope') {
    const result = read_ci_scope(process.env.CI_BASE_SHA);
    console.log(JSON.stringify(result));
    if (process.env.GITHUB_OUTPUT)
      appendFileSync(process.env.GITHUB_OUTPUT, `scope=${result.scope}\n`);
  } else if (process.argv[2] === 'gate') {
    const results = {
      scope: process.env.CI_SCOPE,
      scope_result: process.env.SCOPE_RESULT,
      quality_result: process.env.QUALITY_RESULT,
      browser_result: process.env.BROWSER_RESULT,
    };
    const passed = ci_gate_passes(results);
    console.log(JSON.stringify({ ...results, passed }));
    process.exitCode = passed ? 0 : 1;
  } else {
    console.error('Usage: node scripts/ci_scope.mjs scope|gate');
    process.exitCode = 1;
  }
}
