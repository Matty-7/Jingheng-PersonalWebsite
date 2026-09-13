import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  initial_mortgage_state,
  mortgage_reducer,
} from '../lib/mortgage_state.ts';

function choose(state, id) {
  return mortgage_reducer(state, {
    type: 'select_concept',
    id,
    preserve_map_context: false,
  });
}
function history(state, offset) {
  return mortgage_reducer(state, {
    type: 'follow_history',
    offset,
    preserve_map_context: false,
  });
}

test('reading back and forward retains the trail; a new visit replaces only forward history', () => {
  const two_visits = choose(choose(initial_mortgage_state, 'cpr'), 'smm');
  const back = history(two_visits, -1);
  assert.equal(back.selected, 'cpr');
  assert.deepEqual(back.trail, { ids: ['cpr', 'smm'], cursor: 0 });
  const forward = history(back, 1);
  assert.equal(forward.selected, 'smm');
  assert.deepEqual(forward.trail, two_visits.trail);
  const branch = choose(back, 'psa');
  assert.deepEqual(branch.trail, { ids: ['cpr', 'psa'], cursor: 1 });
  assert.equal(history(branch, 1), branch);
  assert.equal(history(back, -1), back);
  assert.equal(choose(branch, 'psa').trail, branch.trail);
});

test('reading transitions preserve the input state and ignore unknown concepts', () => {
  const state = structuredClone(initial_mortgage_state);
  choose(state, 'cpr');
  assert.deepEqual(state, initial_mortgage_state);
  assert.equal(choose(state, 'missing_concept'), state);
  assert.equal(
    mortgage_reducer(state, { type: 'restore_concept', id: 'missing' }),
    state,
  );
});

test('closing a reader retains the selection and history; overview clears its map context', () => {
  const selected = choose(initial_mortgage_state, 'cpr');
  const closed = mortgage_reducer(selected, { type: 'close_reader' });
  assert.equal(closed.reader_open, false);
  assert.equal(closed.selected, 'cpr');
  assert.equal(closed.trail, selected.trail);
  const overview = mortgage_reducer(closed, { type: 'overview' });
  assert.deepEqual(
    [
      overview.view,
      overview.depth,
      overview.branch_filter,
      overview.topic_filter,
      overview.selected,
      overview.path_id,
    ],
    ['map', 0, 'all', 'all', null, ''],
  );
  assert.equal(overview.trail, selected.trail);
});

test('map selection reveals a hidden concept but preserves an already visible graph', () => {
  const selected = choose(initial_mortgage_state, 'cpr');
  assert.equal(selected.depth, 2);
  assert.notEqual(selected.branch_filter, 'all');
  assert.notEqual(selected.topic_filter, 'all');
  const all_concepts = { ...initial_mortgage_state, depth: 2 };
  const visible = mortgage_reducer(all_concepts, {
    type: 'select_concept',
    id: 'cpr',
    preserve_map_context: true,
  });
  assert.equal(visible.branch_filter, 'all');
  assert.equal(visible.topic_filter, 'all');
});

test('domain and hierarchy navigation clear the reader without discarding session history', () => {
  const selected = choose(initial_mortgage_state, 'cpr');
  for (const action of [
    { type: 'open_branch', id: 'prepayment' },
    { type: 'open_topic', id: 'speeds', branch: 'prepayment' },
    { type: 'set_depth', depth: 1 },
    { type: 'filter_domain', id: 'all' },
  ]) {
    const next = mortgage_reducer(selected, action);
    assert.equal(next.selected, null);
    assert.equal(next.reader_open, false);
    assert.equal(next.trail, selected.trail);
  }
  const list = mortgage_reducer(selected, {
    type: 'change_view',
    view: 'list',
  });
  assert.equal(
    mortgage_reducer(list, { type: 'filter_domain', id: 'prepayment' }).view,
    'list',
  );
});

test('view and path changes keep selection while respecting reader and path reset semantics', () => {
  const selected = choose(initial_mortgage_state, 'cpr');
  for (const view of ['paths', 'compare', 'map', 'connections', 'list']) {
    const next = mortgage_reducer(selected, { type: 'change_view', view });
    assert.equal(next.selected, 'cpr');
    assert.equal(next.reader_open, !['paths', 'compare'].includes(view));
  }
  const path = mortgage_reducer(selected, {
    type: 'choose_path',
    id: 'prepayment_path',
  });
  assert.equal(path.view, 'paths');
  assert.equal(path.reader_open, false);
  assert.equal(
    mortgage_reducer(path, { type: 'set_depth', depth: 2 }).path_id,
    path.path_id,
  );
  assert.equal(
    mortgage_reducer(path, { type: 'open_branch', id: 'prepayment' }).path_id,
    '',
  );
  const comparison = mortgage_reducer(selected, {
    type: 'choose_comparison',
    id: 'products',
  });
  assert.equal(comparison.reader_open, false);
  assert.equal(comparison.comparison_id, 'products');
  assert.equal(
    mortgage_reducer(selected, { type: 'filter_spreads', id: 'credit' })
      .reader_open,
    false,
  );
});

test('Connections defaults once; a URL visit opens its title after reading relationships', () => {
  const connections = mortgage_reducer(initial_mortgage_state, {
    type: 'change_view',
    view: 'connections',
  });
  assert.equal(connections.selected, 'prepayments');
  assert.equal(connections.reader_open, false);
  assert.deepEqual(connections.trail.ids, ['prepayments']);
  const reading = mortgage_reducer(connections, { type: 'read_connections' });
  assert.equal(reading.reader_section, 'connections');
  assert.equal(reading.reader_open, true);
  const restored = mortgage_reducer(reading, {
    type: 'restore_concept',
    id: 'cpr',
  });
  assert.equal(restored.view, 'connections');
  assert.equal(restored.selected, 'cpr');
  assert.equal(restored.reader_open, true);
  assert.equal(restored.reader_section, 'title');
  assert.deepEqual(restored.trail.ids, ['prepayments', 'cpr']);
});
