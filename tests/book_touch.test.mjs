import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bind_book_touch } from '../lib/book_touch.ts';

function setup(t) {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const doc = new EventTarget();
  doc.defaultView = new EventTarget();
  const shelf = new EventTarget();
  shelf.ownerDocument = doc;
  shelf.dataset = { bookSlug: 'steppenwolf' };
  shelf.closest = () => shelf;
  shelf.contains = (target) => target === shelf;
  const events = [];
  const unbind = bind_book_touch(shelf, (event) => events.push(event));
  t.after(unbind);
  const touch = (x = 100, y = 100, id = 7) => ({ identifier: id, clientX: x, clientY: y });
  function send(type, touches = [touch()], changed = touches, cancelable = true) {
    const event = new Event(type, { cancelable });
    Object.assign(event, { touches, changedTouches: changed });
    (type === 'touchstart' && touches.length === 1 ? shelf : doc).dispatchEvent(event);
    return event;
  }
  return { doc, events, send, touch, unbind };
}

test('quick taps remain native; an early swipe never activates later or prevents scrolling', (t) => {
  const { events, send, touch } = setup(t);
  send('touchstart');
  t.mock.timers.tick(100);
  assert.equal(send('touchend', [], [touch()]).defaultPrevented, false);
  t.mock.timers.tick(200);
  assert.deepEqual(events.map((e) => e.type), ['start', 'finish']);
  events.length = 0;
  send('touchstart');
  assert.equal(send('touchmove', [touch(100, 130)]).defaultPrevented, false);
  t.mock.timers.tick(200);
  assert.deepEqual(events.map((e) => e.type), ['start', 'finish']);
  assert.equal(events.at(-1).cancelled, true);
});

test('a held book can move vertically, horizontally and diagonally without native scroll or release click', (t) => {
  const { events, send, touch } = setup(t);
  send('touchstart');
  t.mock.timers.tick(180);
  assert.equal(events.at(-1).type, 'activate');
  for (const [x, y] of [[100, 350], [250, 350], [100, 600]]) {
    assert.equal(send('touchmove', [touch(x, y)]).defaultPrevented, true);
    assert.deepEqual(events.at(-1), { type: 'move', x, y });
  }
  send('touchend', [touch()], [touch(0, 0, 8)]);
  assert.equal(events.at(-1).type, 'move');
  assert.equal(send('touchend', [], [touch(100, 600)]).defaultPrevented, true);
  assert.deepEqual(events.at(-1), { type: 'finish', cancelled: false });
});

test('multitouch, cancellation, blur, resize and scrolling release gesture ownership', (t) => {
  const { doc, events, send, touch } = setup(t);
  for (const reason of ['multitouch', 'touchcancel', 'blur', 'resize', 'scroll', 'noncancelable']) {
    send('touchstart');
    t.mock.timers.tick(180);
    if (reason === 'multitouch') assert.equal(send('touchstart', [touch(), touch(120, 120, 8)]).defaultPrevented, false);
    else if (reason === 'noncancelable') assert.equal(send('touchmove', [touch(100, 300)], [], false).defaultPrevented, false);
    else if (reason === 'blur' || reason === 'resize') doc.defaultView.dispatchEvent(new Event(reason));
    else doc.dispatchEvent(new Event(reason));
    assert.deepEqual(events.at(-1), { type: 'finish', cancelled: true });
  }
});

test('stationary hold suppresses release click; unmount clears timers and listeners', (t) => {
  const { events, send, touch, unbind } = setup(t);
  send('touchstart');
  t.mock.timers.tick(180);
  assert.equal(send('touchend', [], [touch()]).defaultPrevented, true);
  send('touchstart');
  const count = events.length;
  unbind();
  t.mock.timers.tick(1000);
  send('touchstart');
  send('touchmove');
  assert.equal(events.length, count);
});
