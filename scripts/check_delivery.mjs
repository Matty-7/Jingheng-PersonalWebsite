import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = new URL('../', import.meta.url);
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const mime_types = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
};

export function verify_asset(path, status, content_type, received, expected) {
  assert.equal(status, 200, `${path}: HTTP status`);
  const extension = path.split('.').pop().toLowerCase();
  assert.ok(mime_types[extension], `${path}: unsupported image extension`);
  const actual_type = (content_type ?? '').split(';')[0].trim().toLowerCase();
  assert.ok(
    actual_type === mime_types[extension] ||
      (extension === 'ico' && actual_type === 'image/vnd.microsoft.icon'),
    `${path}: expected ${mime_types[extension]}, received ${content_type}`,
  );
  assert.equal(
    digest(received),
    digest(expected),
    `${path}: bytes differ from checked source`,
  );
}

async function source_files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map(async (entry) => {
        const url = new URL(
          entry.name + (entry.isDirectory() ? '/' : ''),
          directory,
        );
        return entry.isDirectory() ? source_files(url) : [url];
      }),
    )
  ).flat();
}

export async function check_delivery(origin) {
  const base = new URL(origin);
  assert.ok(['https:', 'http:'].includes(base.protocol));
  const profile = JSON.parse(
    await readFile(new URL('content/profile.json', root), 'utf8'),
  );
  assert.ok(
    [
      new URL(profile.siteUrl).hostname,
      'jinghenghuan.com',
      'jingheng-huan.jh730493450.chatgpt.site',
      'terminal.local',
    ].includes(base.hostname),
    'Use only this Site or its supported preview.',
  );
  const files = (
    await Promise.all(
      ['app/', 'components/', 'lib/'].map((directory) =>
        source_files(new URL(directory, root)),
      ),
    )
  )
    .flat()
    .filter((url) => /\.(tsx?|css|json)$/.test(url.pathname));
  // Content provenance archives are not runtime assets. Inspect the JSON files
  // imported by application source rather than every retired content record.
  const imported_content = new Set();
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    for (const match of source.matchAll(
      /from\s+['"]@\/content\/([a-zA-Z0-9_.-]+\.json)['"]/g,
    ))
      imported_content.add(match[1]);
  }
  files.push(
    ...[...imported_content].map((name) => new URL(`content/${name}`, root)),
  );
  const paths = new Set();
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    for (const match of source.matchAll(
      /\/images\/[a-zA-Z0-9_./-]+\.(?:jpe?g|png|webp|svg|ico)/g,
    ))
      paths.add(match[0]);
  }
  assert.ok(paths.size >= 35, 'Image inventory unexpectedly incomplete');
  const results = [];
  // Four requests at a time; no external audio stream or third-party hosts.
  const remaining = [...paths].sort((a, b) => a.localeCompare(b));
  for (let index = 0; index < remaining.length; index += 4) {
    const batch = await Promise.all(
      remaining.slice(index, index + 4).map(async (path) => {
        try {
          const response = await fetch(new URL(path, base), {
            signal: AbortSignal.timeout(20000),
            headers: { 'User-Agent': 'JinghengHuan-DeliveryCheck/1.0' },
          });
          const final = new URL(response.url);
          assert.ok(
            [
              'jinghenghuan.com',
              new URL(profile.siteUrl).hostname,
              'jingheng-huan.jh730493450.chatgpt.site',
              'terminal.local',
            ].includes(final.hostname),
            `${path}: unexpected redirect`,
          );
          const bytes = Buffer.from(await response.arrayBuffer());
          const expected = await readFile(new URL(`public${path}`, root));
          verify_asset(
            path,
            response.status,
            response.headers.get('content-type'),
            bytes,
            expected,
          );
          return {
            path,
            status: 'PASS',
            http: response.status,
            mime: response.headers.get('content-type'),
          };
        } catch (error) {
          return { path, status: 'FAIL', reason: error.message };
        }
      }),
    );
    results.push(...batch);
  }
  return {
    scope:
      'HTTP delivery only; not browser decoding, interaction, or a corporate-network test',
    source_sha: execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: root,
      encoding: 'utf8',
    }).trim(),
    source_dirty: Boolean(
      execFileSync('git', ['status', '--porcelain'], {
        cwd: root,
        encoding: 'utf8',
      }).trim(),
    ),
    origin: base.origin,
    checked_at: new Date().toISOString(),
    status: results.every((result) => result.status === 'PASS')
      ? 'PASS'
      : 'FAIL',
    results,
  };
}

if (
  process.argv[1] &&
  pathToFileURL(process.argv[1]).href === import.meta.url
) {
  assert.ok(process.argv[2], 'Pass this Site URL.');
  const report = await check_delivery(process.argv[2]);
  console.log(JSON.stringify(report, null, 2));
  if (report.status !== 'PASS') process.exitCode = 1;
}
