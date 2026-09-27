import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { matching_evidence, source_revision } from './verify.mjs';

const base = process.argv[2];
if (!/^[a-f0-9]{40}$/.test(base ?? '')) {
  throw new Error('Usage: npm run review:packet -- <full-base-sha>');
}
const source = source_revision();
if (!source.clean)
  throw new Error('Commit the stable diff before preparing independent review');
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
git('merge-base', '--is-ancestor', base, source.head);
let report;
try {
  report = JSON.parse(readFileSync('outputs/checks/report.json', 'utf8'));
} catch {
  report = null;
}
console.log(
  JSON.stringify(
    {
      role: 'Independent read-only reviewer; no edits, nested agents, Sites or browser access',
      checkout: process.cwd(),
      base,
      head: source.head,
      tree: source.tree,
      changed_files: git(
        'diff',
        '--name-only',
        '--no-renames',
        base,
        source.head,
      )
        .split('\n')
        .filter(Boolean),
      diff_command: `git diff ${base} ${source.head} --`,
      local_evidence: matching_evidence(report, source)
        ? {
            report: resolve('outputs/checks/report.json'),
            mode: report.mode,
            seconds: report.seconds,
            results: report.results,
          }
        : null,
      evidence_note:
        'Only clean, matching-head evidence is included. Null requires explicit targeted evidence or CI IDs; do not rerun full suites automatically.',
      review_instructions:
        'Read docs/agent_roles.md. Inspect changed files and direct contracts; return source-review PASS, CHANGES_REQUESTED or INCOMPLETE without waiting for CI. Parent supplies accepted criteria and checks CI before merge.',
      language:
        'Chinese prose with English technical terms; brief Chinese glosses for unfamiliar terms',
    },
    null,
    2,
  ),
);
