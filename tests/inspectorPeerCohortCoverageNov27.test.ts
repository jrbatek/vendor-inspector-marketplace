import test from "node:test";
import assert from "node:assert/strict";
import { formatPeerPercentile, DEMO_PEER_COHORTS, peerPositioning } from "../lib/inspectorPeerPositioning";

test("fictional percentile labels use correct English ordinal suffixes", () => {
  for (const [value, expected] of [[1,"1st"],[2,"2nd"],[3,"3rd"],[11,"11th"],[12,"12th"],[13,"13th"],[58,"58th"],[61,"61st"],[62,"62nd"],[63,"63rd"],[100,"100th"]] as const) {
    assert.equal(formatPeerPercentile(value), expected+" percentile");
  }
});

test("all eight synthetic filter combinations expose only eligible aggregate comparisons", () => {
  assert.equal(DEMO_PEER_COHORTS.length,8);
  let visible=0;
  for (const cohort of DEMO_PEER_COHORTS) {
    const summary=peerPositioning(cohort);
    if (!summary.available) { assert.deepEqual(summary,{available:false}); continue; }
    visible++;
    assert.equal(summary.size,cohort.size);
    assert.equal(summary.metrics.length,6);
    assert.equal(summary.ratePercentile,cohort.ratePercentile);
  }
  assert.equal(visible,7);
});
