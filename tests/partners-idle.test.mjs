// Portal idle timeout (src/portal/idle.ts) under fake timers: warning at 28 min,
// sign-out at 30, activity resets, expiry on load, token refreshes don't count.
import assert from "node:assert/strict";
import { mock, test } from "node:test";
import {
  IDLE_TIMEOUT_MS,
  LAST_ACTIVITY_KEY,
  WARNING_BEFORE_MS,
  isIdleExpired,
  watchIdle,
} from "../src/portal/idle.ts";

const MIN = 60_000;

function setup() {
  mock.timers.enable({ apis: ["setInterval", "Date"], now: 1_000_000 });
  const data = new Map();
  const store = {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
  };
  const target = new EventTarget();
  const doc = Object.assign(new EventTarget(), { visibilityState: "visible" });
  const log = [];
  const start = () =>
    watchIdle({
      store,
      target,
      doc,
      onWarn: (w) => log.push(w ? "warn" : "unwarn"),
      onExpire: () => log.push("expire"),
    });
  const advance = (ms) => mock.timers.tick(ms);
  return { store, target, doc, log, start, advance };
}

test("constants are 30 min and 2 min", () => {
  assert.equal(IDLE_TIMEOUT_MS, 30 * MIN);
  assert.equal(WARNING_BEFORE_MS, 2 * MIN);
});

test("warns at 28 minutes and signs out at 30", (t) => {
  const s = setup();
  t.after(() => mock.timers.reset());
  s.start();
  s.advance(27 * MIN + 59_000);
  assert.deepEqual(s.log, []);
  s.advance(15_000);
  assert.deepEqual(s.log, ["warn"]);
  s.advance(2 * MIN);
  assert.deepEqual(s.log, ["warn", "expire"]);
  s.advance(10 * MIN);
  assert.deepEqual(s.log, ["warn", "expire"], "expires only once");
});

test("activity resets the timer and clears the warning", (t) => {
  const s = setup();
  t.after(() => mock.timers.reset());
  s.start();
  s.advance(20 * MIN);
  s.target.dispatchEvent(new Event("keydown"));
  s.advance(25 * MIN);
  assert.deepEqual(s.log, [], "25 min after the keypress: no warning yet");
  s.advance(3 * MIN + 15_000);
  assert.deepEqual(s.log, ["warn"]);
  s.target.dispatchEvent(new Event("mousemove"));
  assert.deepEqual(s.log, ["warn", "unwarn"]);
  s.advance(29 * MIN);
  assert.ok(!s.log.includes("expire"));
});

test("Stay signed in counts as activity", (t) => {
  const s = setup();
  t.after(() => mock.timers.reset());
  const w = s.start();
  s.advance(28 * MIN + 15_000);
  w.stayActive();
  assert.deepEqual(s.log, ["warn", "unwarn"]);
  s.advance(29 * MIN);
  assert.ok(!s.log.includes("expire"));
});

test("activity is throttled", (t) => {
  const s = setup();
  t.after(() => mock.timers.reset());
  s.start();
  s.target.dispatchEvent(new Event("mousemove"));
  const first = s.store.getItem(LAST_ACTIVITY_KEY);
  s.advance(5_000);
  s.target.dispatchEvent(new Event("mousemove"));
  assert.equal(s.store.getItem(LAST_ACTIVITY_KEY), first, "second event within 15s ignored");
});

test("expiry is detected on load after a long gap (refresh/reopen)", (t) => {
  const s = setup();
  t.after(() => mock.timers.reset());
  s.store.setItem(LAST_ACTIVITY_KEY, String(Date.now() - 31 * MIN));
  assert.equal(isIdleExpired(s.store), true);
  s.start();
  assert.deepEqual(s.log, ["expire"], "expires immediately, does not reset the clock");
});

test("a refresh within the window keeps the clock (no reset, no expiry)", (t) => {
  const s = setup();
  t.after(() => mock.timers.reset());
  s.store.setItem(LAST_ACTIVITY_KEY, String(Date.now() - 10 * MIN));
  assert.equal(isIdleExpired(s.store), false);
  s.start();
  s.advance(18 * MIN + 15_000);
  assert.deepEqual(s.log, ["warn"], "warning comes 18 min after reload, not 28");
});

test("returning to a hidden tab after 30+ minutes signs out instead of resetting", (t) => {
  const s = setup();
  t.after(() => mock.timers.reset());
  const w = s.start();
  w.stop(); // simulate a background tab whose timers never fired
  s.advance(45 * MIN);
  const w2 = s.start(); // fresh watcher, then the tab becomes visible
  assert.deepEqual(s.log, ["expire"]);
  w2.stop();
});

test("visibilitychange to visible counts as activity", (t) => {
  const s = setup();
  t.after(() => mock.timers.reset());
  s.start();
  s.advance(20 * MIN);
  s.doc.dispatchEvent(new Event("visibilitychange"));
  s.advance(20 * MIN);
  assert.deepEqual(s.log, []);
});

test("background token refresh does not reset the timer", (t) => {
  const s = setup();
  t.after(() => mock.timers.reset());
  s.start();
  // Supabase refreshes the token on its own timer and fires TOKEN_REFRESHED;
  // no DOM event happens, and supabase writes only its own storage key.
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 20; j++) s.advance(15_000); // 5 minutes, tick by tick
    s.store.setItem("sb-portal-x-auth-token", `{"refreshed":${i}}`);
  }
  assert.deepEqual(s.log, ["warn", "expire"]);
});
