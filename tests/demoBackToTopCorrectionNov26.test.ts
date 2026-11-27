import assert from "node:assert/strict";
import test from "node:test";
import { createDemoBackToTopCorrection } from "../lib/demoBackToTopCorrection";

function harness() {
  let next = 0;
  const pending = new Map<number, () => void>();
  const correction = createDemoBackToTopCorrection(callback => {
    const id = ++next;
    pending.set(id, callback);
    return id;
  }, id => pending.delete(id));
  function step() {
    const callbacks = Array.from(pending.values());
    pending.clear();
    callbacks.forEach(callback => callback());
  }
  return { correction, step, pending };
}

test("normal demo return applies exactly one correction after two frames", () => {
  const { correction, step, pending } = harness();
  let calls = 0;
  correction.schedule(() => calls++);
  step();
  assert.equal(calls, 0);
  step();
  step();
  assert.equal(calls, 1);
  assert.equal(pending.size, 0);
});

test("new navigation between correction frames cancels the late scroll", () => {
  const { correction, step, pending } = harness();
  let calls = 0;
  correction.schedule(() => calls++);
  step();
  const alreadyDispatched = Array.from(pending.values())[0];
  assert.ok(alreadyDispatched);
  correction.cancel();
  alreadyDispatched();
  step();
  assert.equal(calls, 0);
  assert.equal(pending.size, 0);
});

test("a replacement activation invalidates the earlier queued callback", () => {
  const { correction, step, pending } = harness();
  const calls: string[] = [];
  correction.schedule(() => calls.push("old"));
  const old = Array.from(pending.values())[0];
  assert.ok(old);
  correction.schedule(() => calls.push("new"));
  old();
  step();
  step();
  assert.deepEqual(calls, ["new"]);
  assert.equal(pending.size, 0);
});
