import {
  initial_progress,
  read_progress,
  learning_index,
  learning_checks,
  route_index,
} from './mortgage_learning.ts';
import {
  question_version,
  type LearningProgress,
  type ProgressChanges,
} from './mortgage_learning_state.ts';

const guest_cookie = 'mortgage-learning-visitor';
const token_pattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
type ProfileRow = { route_id: string; current_id: string; updated_at: number };
type ItemRow = {
  concept_id: string;
  understood: number;
  answer_choice: number | null;
  question_version: string | null;
  updated_at: number;
};

async function owner_hash(value: string) {
  const hash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(hash), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}

function validate_changes(value: unknown): ProgressChanges {
  if (!value || typeof value !== 'object') throw new Error('Invalid progress');
  const input = value as ProgressChanges;
  const completed = input.completed ?? [];
  const answers = input.answers ?? {};
  if (
    !Array.isArray(completed) ||
    completed.length > learning_index.size ||
    completed.some((id) => typeof id !== 'string' || !learning_index.has(id))
  )
    throw new Error('Invalid completion');
  if (
    !answers ||
    typeof answers !== 'object' ||
    Array.isArray(answers) ||
    Object.keys(answers).length > learning_index.size
  )
    throw new Error('Invalid answers');
  const current_answers: ProgressChanges['answers'] = {};
  for (const [id, answer] of Object.entries(answers)) {
    const concept = learning_index.get(id);
    const check = learning_checks[id];
    if (
      !concept ||
      !check ||
      !answer ||
      !Number.isInteger(answer.choice) ||
      answer.choice < 0 ||
      answer.choice >= check.choices.length ||
      typeof answer.version !== 'string' ||
      answer.version.length > 10000
    )
      throw new Error('Invalid answer');
    // A lesson update must not block unrelated work in an offline queue.
    if (answer.version === question_version(concept.question, check.choices))
      current_answers[id] = answer;
  }
  if (
    input.position &&
    !route_index
      .get(input.position.route_id)
      ?.steps.includes(input.position.current_id)
  )
    throw new Error('Invalid lesson position');
  return {
    completed: [...new Set(completed)],
    answers: current_answers,
    ...(input.position ? { position: input.position } : {}),
    bootstrap: input.bootstrap === true,
  };
}

async function read_saved(db: D1Database, owner_key: string) {
  const [profile, items] = await Promise.all([
    db
      .prepare(
        'SELECT route_id, current_id, updated_at FROM learning_profiles WHERE owner_key = ?',
      )
      .bind(owner_key)
      .first<ProfileRow>(),
    db
      .prepare(
        'SELECT concept_id, understood, answer_choice, question_version, updated_at FROM learning_items WHERE owner_key = ?',
      )
      .bind(owner_key)
      .all<ItemRow>(),
  ]);
  const answers: NonNullable<LearningProgress['answers']> = {};
  for (const row of items.results) {
    const concept = learning_index.get(row.concept_id);
    const check = learning_checks[row.concept_id];
    if (
      concept &&
      check &&
      row.answer_choice !== null &&
      row.question_version === question_version(concept.question, check.choices)
    ) {
      answers[row.concept_id] = {
        choice: row.answer_choice,
        version: row.question_version,
      };
    }
  }
  const progress = read_progress(
    JSON.stringify({
      ...(profile ?? initial_progress),
      completed: items.results
        .filter((item) => item.understood)
        .map((item) => item.concept_id),
      answers,
    }),
  );
  return {
    progress,
    exists: profile !== null || items.results.length > 0,
    saved_at:
      Math.max(
        profile?.updated_at ?? 0,
        ...items.results.map((item) => item.updated_at),
      ) || null,
  };
}

async function migrate_guest(
  db: D1Database,
  guest_key: string,
  owner_key: string,
) {
  await db.batch([
    db
      .prepare(`INSERT INTO learning_profiles (owner_key, route_id, current_id, updated_at)
      SELECT ?, route_id, current_id, updated_at FROM learning_profiles WHERE owner_key = ?
      ON CONFLICT(owner_key) DO NOTHING`)
      .bind(owner_key, guest_key),
    db
      .prepare(`INSERT INTO learning_items (owner_key, concept_id, understood, answer_choice, question_version, updated_at)
      SELECT ?, concept_id, understood, answer_choice, question_version, updated_at FROM learning_items WHERE owner_key = ?
      ON CONFLICT(owner_key, concept_id) DO UPDATE SET
      understood = MAX(learning_items.understood, excluded.understood),
      answer_choice = CASE WHEN excluded.updated_at > learning_items.updated_at AND excluded.answer_choice IS NOT NULL THEN excluded.answer_choice ELSE learning_items.answer_choice END,
      question_version = CASE WHEN excluded.updated_at > learning_items.updated_at AND excluded.answer_choice IS NOT NULL THEN excluded.question_version ELSE learning_items.question_version END,
      updated_at = MAX(learning_items.updated_at, excluded.updated_at)`)
      .bind(owner_key, guest_key),
    db
      .prepare('DELETE FROM learning_profiles WHERE owner_key = ?')
      .bind(guest_key),
    db
      .prepare('DELETE FROM learning_items WHERE owner_key = ?')
      .bind(guest_key),
  ]);
}

export async function handle_learning_progress(
  request: Request,
  db: D1Database,
  user_id: string | null,
) {
  const headers = new Headers({
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
    Vary: 'Cookie, oai-authenticated-user-id',
  });
  const respond = (data: unknown, status = 200) =>
    Response.json(data, { status, headers });
  const url = new URL(request.url);
  if (request.method !== 'GET' && request.method !== 'PUT')
    return respond({ error: 'Method not allowed' }, 405);
  if (
    request.headers.get('sec-fetch-site') === 'cross-site' ||
    (request.method === 'PUT' && request.headers.get('origin') !== url.origin)
  )
    return respond({ error: 'Use this site to save progress.' }, 403);
  if (
    request.method === 'PUT' &&
    !request.headers.get('content-type')?.startsWith('application/json')
  )
    return respond({ error: 'JSON required' }, 415);
  const cookie_value = request.headers
    .get('cookie')
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${guest_cookie}=`))
    ?.slice(guest_cookie.length + 1);
  const existing_guest =
    cookie_value && token_pattern.test(cookie_value) ? cookie_value : null;
  if (!user_id && !existing_guest && request.method === 'PUT')
    return respond({ error: 'Reload to restore your learning session.' }, 401);
  const guest_token = existing_guest ?? crypto.randomUUID();
  const owner_key = await owner_hash(
    user_id ? `account:${user_id}` : `guest:${guest_token}`,
  );
  const cookie_flags = `Path=/; HttpOnly; SameSite=Lax${url.protocol === 'https:' ? '; Secure' : ''}`;
  try {
    if (user_id && existing_guest) {
      await migrate_guest(
        db,
        await owner_hash(`guest:${existing_guest}`),
        owner_key,
      );
      headers.set('Set-Cookie', `${guest_cookie}=; Max-Age=0; ${cookie_flags}`);
    } else if (!user_id) {
      headers.set(
        'Set-Cookie',
        `${guest_cookie}=${guest_token}; Max-Age=31536000; ${cookie_flags}`,
      );
    }
    if (request.method === 'PUT') {
      let changes: ProgressChanges;
      try {
        const raw = await request.text();
        if (raw.length > 1_000_000)
          return respond({ error: 'Progress update is too large.' }, 413);
        const input = JSON.parse(raw);
        if (input.expected_owner_key !== owner_key)
          return respond(
            { error: 'Your learning account changed. Reload before saving.' },
            409,
          );
        changes = validate_changes(input);
      } catch {
        return respond(
          {
            error:
              'Invalid progress or an updated question. Reload and try again.',
          },
          400,
        );
      }
      const now = Date.now();
      const statements: D1PreparedStatement[] = [];
      if (changes.position) {
        statements.push(
          db
            .prepare(`INSERT INTO learning_profiles (owner_key, route_id, current_id, updated_at) VALUES (?, ?, ?, ?)
          ON CONFLICT(owner_key) ${changes.bootstrap ? 'DO NOTHING' : 'DO UPDATE SET route_id = excluded.route_id, current_id = excluded.current_id, updated_at = excluded.updated_at'}`)
            .bind(
              owner_key,
              changes.position.route_id,
              changes.position.current_id,
              now,
            ),
        );
      }
      for (const id of changes.completed) {
        statements.push(
          db
            .prepare(`INSERT INTO learning_items (owner_key, concept_id, understood, updated_at) VALUES (?, ?, 1, ?)
          ON CONFLICT(owner_key, concept_id) DO UPDATE SET understood = 1, updated_at = excluded.updated_at`)
            .bind(owner_key, id, now),
        );
      }
      for (const [id, answer] of Object.entries(changes.answers)) {
        statements.push(
          db
            .prepare(`INSERT INTO learning_items (owner_key, concept_id, answer_choice, question_version, updated_at) VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(owner_key, concept_id) DO UPDATE SET answer_choice = excluded.answer_choice, question_version = excluded.question_version, updated_at = excluded.updated_at`)
            .bind(owner_key, id, answer.choice, answer.version, now),
        );
      }
      if (statements.length) await db.batch(statements);
    }
    return respond({
      ...(await read_saved(db, owner_key)),
      owner_key,
      signed_in: Boolean(user_id),
    });
  } catch (error) {
    console.error(
      'Learning progress storage unavailable',
      error instanceof Error ? error.message : 'Unknown storage error',
    );
    return respond(
      { error: 'Progress could not be saved. Keep this page open and retry.' },
      503,
    );
  }
}
