import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { handle_learning_progress } from '../lib/learning_progress_api.ts';
import {
  initial_progress,
  learning_checks,
  learning_index,
} from '../lib/mortgage_learning.ts';
import { question_version } from '../lib/mortgage_learning_state.ts';

function database() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(
    readFileSync(
      new URL('../drizzle/0000_wonderful_zuras.sql', import.meta.url),
      'utf8',
    ),
  );
  return {
    prepare(sql) {
      return {
        bind(...args) {
          const statement = sqlite.prepare(sql);
          return {
            first: async () => statement.get(...args) ?? null,
            all: async () => ({ results: statement.all(...args) }),
            run: () => statement.run(...args),
          };
        },
      };
    },
    async batch(statements) {
      sqlite.exec('BEGIN');
      try {
        const rows = statements.map((statement) => statement.run());
        sqlite.exec('COMMIT');
        return rows;
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    },
  };
}
const url = 'https://jinghenghuan.com/api/mortgage-progress';
async function client(db, user_id = null, cookie = '') {
  let owner_key;
  return {
    async call(changes, extra_headers = {}) {
      const response = await handle_learning_progress(
        new Request(url, {
          method: changes ? 'PUT' : 'GET',
          headers: {
            cookie,
            origin: 'https://jinghenghuan.com',
            'content-type': 'application/json',
            ...extra_headers,
          },
          ...(changes
            ? {
                body: JSON.stringify({
                  ...changes,
                  expected_owner_key: owner_key,
                }),
              }
            : {}),
        }),
        db,
        user_id,
      );
      if (response.headers.has('set-cookie'))
        cookie = response.headers.get('set-cookie').split(';')[0];
      const data = await response.json();
      if (data.owner_key) owner_key = data.owner_key;
      return { response, data };
    },
    cookie: () => cookie,
  };
}
const position = {
  route_id: initial_progress.route_id,
  current_id: 'prepayments',
};
const answer = {
  choice: learning_checks.incentive.correct,
  version: question_version(
    learning_index.get('incentive').question,
    learning_checks.incentive.choices,
  ),
};

test('anonymous progress survives a new client and remains isolated from another visitor', async () => {
  const db = database();
  const first = await client(db);
  const opened = await first.call();
  assert.match(
    opened.response.headers.get('set-cookie'),
    /HttpOnly; SameSite=Lax; Secure/,
  );
  assert.equal(
    opened.response.headers.get('cache-control'),
    'private, no-store',
  );
  assert.equal(
    (
      await first.call({
        position,
        completed: ['incentive'],
        answers: { incentive: answer },
      })
    ).response.status,
    200,
  );
  const reopened = await client(db, null, first.cookie());
  const saved = (await reopened.call()).data;
  assert.deepEqual(saved.progress.completed, ['incentive']);
  assert.equal(saved.progress.current_id, 'prepayments');
  assert.deepEqual(saved.progress.answers.incentive, answer);
  const unrelated = await client(db);
  assert.deepEqual((await unrelated.call()).data.progress.completed, []);
});

test('sign-in merges guest completion while keeping an existing account position and isolating accounts', async () => {
  const db = database();
  const account = await client(db, 'learner-a');
  await account.call();
  await account.call({
    position: initial_progress,
    completed: ['principal_interest'],
    answers: {},
  });
  const guest = await client(db);
  await guest.call();
  await guest.call({
    position,
    completed: ['incentive'],
    answers: { incentive: answer },
  });
  const signed = await client(db, 'learner-a', guest.cookie());
  const merged = (await signed.call()).data;
  assert.equal(merged.progress.current_id, 'incentive');
  assert.deepEqual(
    new Set(merged.progress.completed),
    new Set(['principal_interest', 'incentive']),
  );
  const other_device = await client(db, 'learner-a');
  assert.deepEqual((await other_device.call()).data.progress, merged.progress);
  const other_account = await client(db, 'learner-b');
  assert.deepEqual((await other_account.call()).data.progress.completed, []);
});

test('stale tabs and duplicate writes cannot erase completed lessons or repeat an answer count', async () => {
  const db = database();
  const one = await client(db, 'shared');
  const two = await client(db, 'shared');
  await one.call();
  await two.call();
  await Promise.all([
    one.call({ completed: ['incentive'], answers: {} }),
    two.call({ completed: ['prepayments'], answers: {} }),
  ]);
  await one.call({ completed: ['incentive'], answers: {} });
  assert.deepEqual(
    new Set((await one.call()).data.progress.completed),
    new Set(['incentive', 'prepayments']),
  );
});

test('rejects cross-site writes, invalid IDs, stale questions and changed account ownership', async () => {
  const db = database();
  const visitor = await client(db);
  await visitor.call();
  const changes = { completed: ['incentive'], answers: {} };
  assert.equal(
    (await visitor.call(changes, { origin: 'https://elsewhere.example' }))
      .response.status,
    403,
  );
  assert.equal(
    (await visitor.call({ ...changes, completed: ['missing'] })).response
      .status,
    400,
  );
  assert.equal(
    (
      await visitor.call({
        ...changes,
        answers: { incentive: { ...answer, version: 'old' } },
      })
    ).response.status,
    400,
  );
  const response = await handle_learning_progress(
    new Request(url, {
      method: 'PUT',
      headers: {
        origin: 'https://jinghenghuan.com',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        ...changes,
        expected_owner_key: 'another-account',
      }),
    }),
    db,
    'new-account',
  );
  assert.equal(response.status, 409);
  assert.deepEqual((await visitor.call()).data.progress.completed, []);
});

test('storage errors stay recoverable without claiming a save', async () => {
  const db = {
    prepare() {
      throw new Error('storage offline');
    },
  };
  const visitor = await client(db);
  const result = await visitor.call();
  assert.equal(result.response.status, 503);
  assert.match(result.data.error, /retry/);
});
