import { appendFileSync, readFileSync } from 'node:fs';

const report = JSON.parse(
  readFileSync('test-results/browser_results.json', 'utf8'),
);
const cases = [];
function visit_suites(suites) {
  for (const suite of suites) {
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests) {
        cases.push({
          project: test.projectName,
          file: spec.file,
          title: spec.title,
          status: test.status,
          seconds:
            test.results.reduce((sum, result) => sum + result.duration, 0) /
            1000,
        });
      }
    }
    visit_suites(suite.suites ?? []);
  }
}
visit_suites(report.suites);
const escape_cell = (text) => text.replaceAll('|', '\\|').replaceAll('\n', ' ');
const rows = [...cases].sort((a, b) => b.seconds - a.seconds).slice(0, 10);
const summary =
  `### Browser timing\n\n${cases.length} cases; wall time ${(report.stats.duration / 1000).toFixed(1)}s.\n\n` +
  '| Project | Test | Result | Seconds |\n| --- | --- | --- | ---: |\n' +
  rows
    .map(
      (row) =>
        `| ${escape_cell(row.project)} | ${escape_cell(row.file)}: ${escape_cell(row.title)} | ${row.status} | ${row.seconds.toFixed(1)} |`,
    )
    .join('\n') +
  '\n';
console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY)
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
