import { spawn, execFileSync } from 'node:child_process';
import { createWriteStream, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function source_revision(cwd = process.cwd()) {
  const git = (...args) =>
    execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
  return {
    head: git('rev-parse', 'HEAD'),
    tree: git('rev-parse', 'HEAD^{tree}'),
    clean: git('status', '--porcelain', '--untracked-files=all') === '',
  };
}

export function matching_evidence(report, revision) {
  return (
    report?.passed === true &&
    report.source?.clean === true &&
    revision.clean &&
    report.source.head === revision.head &&
    report.source.tree === revision.tree
  );
}

export async function run_checks(
  checks,
  { cwd = process.cwd(), output_dir, workers = 2 },
) {
  if (!Number.isInteger(workers) || workers < 1)
    throw new Error('Invalid worker count');
  mkdirSync(output_dir, { recursive: true });
  const results = Array.from({ length: checks.length });
  let next_index = 0;
  await Promise.all(
    Array.from({ length: Math.min(workers, checks.length) }, async () => {
      while (next_index < checks.length) {
        const index = next_index++;
        const { name, command, args } = checks[index];
        const log_path = resolve(output_dir, `${name}.log`);
        const log = createWriteStream(log_path);
        const started = performance.now();
        const result = await new Promise((done) => {
          const child = spawn(command, args, {
            cwd,
            stdio: ['ignore', 'pipe', 'pipe'],
          });
          child.stdout.pipe(log, { end: false });
          child.stderr.pipe(log, { end: false });
          child.on('error', (error) => log.write(`${error.message}\n`));
          child.on('close', (code, signal) =>
            log.end(() => done({ code, signal })),
          );
        });
        results[index] = {
          name,
          ...result,
          passed: result.code === 0 && !result.signal,
          seconds: +(performance.now() - started).toFixed(0) / 1000,
          log_path,
        };
        console.log(
          `${results[index].passed ? 'PASS' : 'FAIL'} ${name} (${results[index].seconds}s) ${log_path}`,
        );
      }
    }),
  );
  return results;
}

async function main() {
  const mode = process.argv[2] ?? 'quick';
  if (!['quick', 'full'].includes(mode))
    throw new Error('Usage: node scripts/verify.mjs [quick|full]');
  const output_dir = resolve('outputs/checks');
  const source = source_revision();
  const started = performance.now();
  const checks = [
    { name: 'lint', command: 'npm', args: ['run', 'lint'] },
    { name: 'format', command: 'npm', args: ['run', 'format:check'] },
    {
      name: 'types',
      command: 'node',
      args: ['node_modules/typescript/bin/tsc', '--noEmit'],
    },
    { name: 'unit', command: 'npm', args: ['test'] },
    { name: 'content', command: 'node', args: ['scripts/check-content.mjs'] },
  ];
  // A failed or interrupted invocation must never leave a previous PASS report.
  mkdirSync(output_dir, { recursive: true });
  writeFileSync(
    resolve(output_dir, 'report.json'),
    JSON.stringify({ source, mode, passed: false }),
  );
  const results = await run_checks(checks, { output_dir });
  if (mode === 'full' && results.every((result) => result.passed)) {
    results.push(
      ...(await run_checks(
        [{ name: 'build', command: 'npm', args: ['run', 'build'] }],
        { output_dir },
      )),
    );
  }
  const final_source = source_revision();
  const report = {
    source,
    mode,
    generated_at: new Date().toISOString(),
    passed:
      results.every((result) => result.passed) &&
      JSON.stringify(source) === JSON.stringify(final_source),
    seconds: +(performance.now() - started).toFixed(0) / 1000,
    results,
  };
  writeFileSync(
    resolve(output_dir, 'report.json'),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  if (process.env.GITHUB_STEP_SUMMARY) {
    writeFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `### Quality checks (${report.seconds}s)\n\n| Check | Result | Seconds |\n| --- | --- | ---: |\n` +
        results
          .map(
            (result) =>
              `| ${result.name} | ${result.passed ? 'PASS' : 'FAIL'} | ${result.seconds} |`,
          )
          .join('\n') +
        '\n',
      { flag: 'a' },
    );
  }
  process.exitCode = report.passed ? 0 : 1;
}

if (
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
) {
  await main();
}
