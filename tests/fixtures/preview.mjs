import { MusicAmbientRenderer } from "/music/src/app/Ambient/renderer.mjs";
import { defaults } from "/music/src/app/Ambient/core.mjs";
const $ = (selector) => document.querySelector(selector);
const video = $("video");
const toggle = $("ytmusic-av-toggle");
const player = $("ytmusic-player");
const songButton = $(".song-button");
const videoButton = $(".video-button");
const results = $("#results");
let clicks = 0;
function selectVideo(selected) {
  const mode = selected ? "OMV_PREFERRED" : "ATV_PREFERRED";
  player.setAttribute("playback-mode", mode);
  toggle.setAttribute("playback-mode", mode);
  songButton.setAttribute("aria-pressed", String(!selected));
  videoButton.setAttribute("aria-pressed", String(selected));
}
songButton.onclick = () => selectVideo(false);
videoButton.onclick = () => { clicks++; selectVideo(true); };
const source = document.createElement("canvas");
source.width = 320; source.height = 180;
const ctx = source.getContext("2d");
let phase = 0;
setInterval(() => {
  const gradient = ctx.createLinearGradient(0, 0, 320, 180);
  gradient.addColorStop(0, `hsl(${210 + Math.sin(phase) * 60} 80% 55%)`);
  gradient.addColorStop(1, `hsl(${340 + Math.cos(phase) * 40} 90% 60%)`);
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 320, 180);
  ctx.fillStyle = "#fff5b8"; ctx.beginPath(); ctx.arc(200 + Math.sin(phase) * 45, 65, 35, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#142035"; ctx.beginPath(); ctx.moveTo(0, 180); ctx.lineTo(100, 80); ctx.lineTo(260, 180); ctx.fill();
  phase += 0.015;
}, 1000 / 24);
video.srcObject = source.captureStream(24);
await video.play();
await $("#song-image img").decode();
let renderer;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(predicate, timeout = 6000) {
  const start = performance.now();
  while (!predicate() && performance.now() - start < timeout) await delay(100);
  return predicate();
}
function check(name, condition) {
  const li = document.createElement("li");
  li.className = condition ? "pass" : "fail";
  li.textContent = `${condition ? "PASS" : "FAIL"} — ${name}`;
  results.append(li);
  if (!condition) throw new Error(name);
}
async function run() {
  $("#rerun").disabled = true;
  results.replaceChildren();
  renderer?.destroy();
  clicks = 0;
  selectVideo(false);
  toggle.setAttribute("selected-item-has-video", "");
  toggle.setAttribute("selected-queue-item-has-counterpart", "");
  $(".title").textContent = "Synthetic sunset";
  await video.play();
  renderer = new MusicAmbientRenderer(defaults, status => { $("#status").textContent = status; });
  renderer.start();
  check("Album artwork fallback before video is selected", renderer.kind === "artwork" && renderer.frames > 0);
  await delay(950);
  check("Available video selected automatically", clicks === 1 && renderer.kind === "video");
  const before = renderer.frames;
  check("Decoded video frames update the light", await waitFor(() => renderer.frames > before + 2));
  video.pause(); await delay(100);
  const paused = renderer.frames; await delay(400);
  check("Paused video stops drawing frames", renderer.frames === paused && renderer.raf === 0);
  songButton.click(); renderer.refresh(); await delay(800);
  check("Song choice is retained for the current track", clicks === 1 && renderer.kind === "artwork");
  $(".title").textContent = "Audio-only fixture";
  toggle.removeAttribute("selected-item-has-video");
  toggle.removeAttribute("selected-queue-item-has-counterpart");
  renderer.refresh(); await delay(800);
  check("Audio-only track keeps artwork without clicking", clicks === 1 && renderer.kind === "artwork");
  toggle.setAttribute("selected-item-has-video", "");
  renderer.refresh();
  check("Late video availability is detected", clicks === 2 && renderer.kind === "video");
  renderer.setPrefs({ ...defaults, enabled: false });
  check("Disabling restores ThemeSong's own background", !document.documentElement.hasAttribute("data-ytmr-ambient"));
  renderer.destroy();
  check("Cleanup removes lighting and stops its loop", !$("#ytmr-ambient") && renderer.raf === 0);
  renderer = new MusicAmbientRenderer(defaults, status => { $("#status").textContent = status; });
  renderer.start(); await video.play();
  document.body.dataset.testResult = "passed";
  $("#rerun").disabled = false;
}
$("#enabled").onchange = (event) => renderer.setPrefs({ ...renderer.prefs, enabled: event.target.checked });
$("#prefer").onchange = (event) => renderer.setPrefs({ ...renderer.prefs, preferVideo: event.target.checked });
$("#intensity").oninput = (event) => renderer.setPrefs({ ...renderer.prefs, opacity: Number(event.target.value) });
$("#rerun").onclick = () => run().catch(error => { $("#status").textContent = error.message; document.body.dataset.testResult = "failed"; $("#rerun").disabled = false; });
await run().catch(error => { $("#status").textContent = error.message; document.body.dataset.testResult = "failed"; $("#rerun").disabled = false; });
