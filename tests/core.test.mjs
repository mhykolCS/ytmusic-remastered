import test from "node:test";
import assert from "node:assert/strict";
import { defaults, normalizePrefs, VideoPreference, sourceKind, blendAlpha } from "../music/src/app/Ambient/core.mjs";

test("fresh installations enable video preference and lighting", () => {
  assert.equal(defaults.preferVideo, true);
  assert.equal(defaults.enabled, true);
});
test("untrusted or old settings cannot create unbounded GPU work", () => {
  assert.deepEqual(normalizePrefs(null), defaults);
  const prefs = normalizePrefs({ enabled: "false", preferVideo: false, fps: 200, opacity: -20, blur: Infinity, unknown: 1 });
  assert.equal(prefs.enabled, true);
  assert.equal(prefs.preferVideo, false);
  assert.equal(prefs.fps, 30);
  assert.equal(prefs.opacity, 10);
  assert.equal(prefs.blur, 80);
  assert.equal("unknown" in prefs, false);
});
const update = (policy, args = {}) => policy.update({ track: "first", available: true, selected: false, enabled: true, now: 0, ...args });
test("delayed video availability is retried, but selection happens once per track", () => {
  const policy = new VideoPreference();
  assert.equal(update(policy), false);
  assert.equal(update(policy, { now: 900, available: false }), false);
  assert.equal(update(policy, { now: 1600 }), true);
  assert.equal(update(policy, { now: 2500 }), false);
  assert.equal(update(policy, { track: "second", now: 3000 }), false);
  assert.equal(update(policy, { track: "second", now: 3700 }), true);
});
test("manual Song stays selected until the next track", () => {
  const policy = new VideoPreference();
  policy.manualChoice("first", 0);
  assert.equal(update(policy, { now: 1000 }), false);
  assert.equal(update(policy, { track: "second", now: 2000 }), false);
  assert.equal(update(policy, { track: "second", now: 2800 }), true);
});
test("already-selected Video consumes the preference without a click", () => {
  const policy = new VideoPreference();
  update(policy);
  assert.equal(update(policy, { now: 1000, selected: true }), false);
  assert.equal(update(policy, { now: 2000 }), false);
});
test("disabled preference never forces a video", () => {
  const policy = new VideoPreference();
  update(policy);
  assert.equal(update(policy, { now: 1000, enabled: false }), false);
});
test("audio mode uses art even with stale decoded video; missing frames fall back", () => {
  assert.equal(sourceKind({ videoReady: true, songMode: true, hasArtwork: true }), "artwork");
  assert.equal(sourceKind({ videoReady: true, songMode: false, hasArtwork: true }), "video");
  assert.equal(sourceKind({ videoReady: false, songMode: false, hasArtwork: true }), "artwork");
  assert.equal(sourceKind({ videoReady: false, songMode: false, hasArtwork: false }), "none");
});
test("frame blending is consistent across frame rates", () => {
  const oneFrame = blendAlpha(70, 40);
  const twoFrames = blendAlpha(70, 80);
  assert.ok(Math.abs(twoFrames - (1 - (1 - oneFrame) ** 2)) < 1e-9);
  assert.equal(blendAlpha(0, 40), 1);
});
