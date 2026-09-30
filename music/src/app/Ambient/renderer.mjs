import { normalizePrefs, VideoPreference, sourceKind, blendAlpha } from "./core.mjs";
import { ambientStyles } from "./styles.mjs";

export class MusicAmbientRenderer {
  constructor(prefs, onStatus = () => {}) {
    this.prefs = normalizePrefs(prefs);
    this.onStatus = onStatus;
    this.preference = new VideoPreference();
    this.cleanups = [];
    this.frames = 0;
    this.lastFrame = 0;
    this.sourceKey = "";
    this.raf = 0;
    this.forceFrame = true;
  }

  start() {
    // Duplicate bundles must never leave two active render loops.
    if (document.getElementById("ytmr-ambient")) return;
    this.root = document.createElement("div");
    this.root.id = "ytmr-ambient";
    this.root.setAttribute("aria-hidden", "true");
    this.canvas = document.createElement("canvas");
    this.canvas.width = 256;
    this.canvas.height = 144;
    this.ctx = this.canvas.getContext("2d", { alpha: false });
    this.root.append(this.canvas);
    document.body.prepend(this.root);
    this.style = document.createElement("style");
    this.style.textContent = ambientStyles;
    document.head.append(this.style);
    this.listen(document, "visibilitychange", () => {
      this.stopFrames();
      if (!document.hidden) this.refresh(true);
    });
    this.listen(document, "yt-navigate-finish", () => this.refresh(true));
    this.listen(document, "ytmusic-navigate-finish", () => this.refresh(true));
    this.listen(document, "fullscreenchange", () => this.refresh(true));
    this.listen(document, "click", (event) => {
      if (event.isTrusted && event.target.closest?.("ytmusic-av-toggle button")) {
        this.preference.manualChoice(this.trackKey(), performance.now());
      }
    }, true);
    this.timer = setInterval(() => {
      if (!document.hidden) this.refresh();
    }, 750);
    this.setPrefs(this.prefs);
  }

  listen(target, name, listener, options) {
    target.addEventListener(name, listener, options);
    this.cleanups.push(() => target.removeEventListener(name, listener, options));
  }

  trackKey() {
    const bar = document.querySelector("ytmusic-player-bar");
    const title = bar?.querySelector(".title")?.textContent?.trim();
    const artist = bar?.querySelector(".byline a")?.getAttribute("href") || "";
    return title ? `${title}\n${artist}` : "";
  }

  preferVideo() {
    const toggle = document.querySelector("ytmusic-av-toggle");
    const button = toggle?.querySelector(".video-button");
    const available = !!button && !button.disabled &&
      button.getAttribute("aria-disabled") !== "true" &&
      !toggle.hasAttribute("toggle-disabled") &&
      (toggle.hasAttribute("selected-item-has-video") ||
       toggle.hasAttribute("selected-queue-item-has-counterpart"));
    if (this.preference.update({
      track: this.trackKey(), available,
      selected: button?.getAttribute("aria-pressed") === "true",
      enabled: this.prefs.preferVideo, now: performance.now(),
    })) button.click();
  }

  setPrefs(prefs) {
    const previous = this.prefs;
    this.prefs = normalizePrefs(prefs);
    if (!previous.preferVideo && this.prefs.preferVideo) this.preference.handled = false;
    if (!this.root) return;
    this.root.style.setProperty("--ytmr-opacity", this.prefs.opacity / 100);
    this.root.style.setProperty("--ytmr-blur", `${this.prefs.blur}px`);
    this.root.style.setProperty("--ytmr-saturation", this.prefs.saturation / 100);
    this.canvas.style.width = `${this.prefs.spread}%`;
    this.canvas.style.height = `${this.prefs.spread}%`;
    this.refresh(true);
  }

  bindVideo(video) {
    this.unbindVideo?.();
    this.video = video;
    const events = ["loadeddata", "seeked", "playing", "pause", "emptied", "resize", "ended"];
    const refresh = () => this.refresh(true);
    for (const name of events) video?.addEventListener(name, refresh);
    this.unbindVideo = () => {
      for (const name of events) video?.removeEventListener(name, refresh);
    };
  }

  refresh(force = false) {
    if (!this.root || document.hidden) return;
    this.preferVideo(); // Independent of the lighting on/off switch.
    const video = document.querySelector("ytmusic-player video");
    if (video !== this.video) this.bindVideo(video);
    const player = document.querySelector("ytmusic-player");
    const songMode = player?.getAttribute("playback-mode") === "ATV_PREFERRED";
    const artwork = document.querySelector("ytmusic-player #song-image img") ||
      document.querySelector("ytmusic-player-bar .thumbnail-image-wrapper img");
    const kind = sourceKind({
      videoReady: !!video && video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0,
      songMode,
      hasArtwork: !!artwork?.complete && artwork.naturalWidth > 0,
    });
    this.source = kind === "video" ? video : kind === "artwork" ? artwork : null;
    const key = `${kind}:${kind === "video" ? video.currentSrc : artwork?.currentSrc || artwork?.src || ""}`;
    if (key !== this.sourceKey) {
      this.sourceKey = key;
      this.forceFrame = true;
      this.painted = false;
      // Reset also removes any previous cross-origin taint. No pixels are read.
      this.canvas.width = 256;
    }
    this.kind = kind;
    this.root.dataset.source = kind;
    // The full-screen top layer is separate from the document stacking order.
    // Place the light behind that container's content when it has room for it.
    const fullscreen = document.fullscreenElement;
    const parent = fullscreen && !["VIDEO", "IFRAME"].includes(fullscreen.tagName)
      ? fullscreen : document.body;
    if (this.root.parentNode !== parent) parent.prepend(this.root);
    this.root.style.zIndex = parent === document.body ? "0" : "-1";
    const active = this.prefs.enabled && !!this.source && !!this.ctx;
    document.documentElement.toggleAttribute("data-ytmr-ambient", active);
    this.onStatus(!this.prefs.enabled ? "Off" : kind === "video" ? "Video lighting" :
      kind === "artwork" ? "Album artwork lighting" : "Waiting for a track");
    this.stopFrames();
    if (!active) return;
    if (force || this.forceFrame) this.draw(performance.now());
    if (kind === "video" && !video.paused && !video.ended) this.schedule();
  }

  draw(now) {
    if (!this.source) return;
    try {
      const elapsed = now - this.lastFrame;
      this.ctx.globalAlpha = this.painted && this.kind === "video"
        ? blendAlpha(this.prefs.smoothing, elapsed) : 1;
      this.ctx.drawImage(this.source, 0, 0, this.canvas.width, this.canvas.height);
      this.painted = true;
      this.forceFrame = false;
      this.lastFrame = now;
      this.root.dataset.frames = String(++this.frames);
    } catch {
      // A replaced/temporarily unavailable decoder will be picked up next poll.
      this.forceFrame = true;
    }
  }

  schedule() {
    this.raf = requestAnimationFrame((now) => {
      this.raf = 0;
      if (document.hidden || !this.prefs.enabled || this.video?.paused || this.video?.ended) return;
      if (now - this.lastFrame >= 1000 / this.prefs.fps) this.draw(now);
      this.schedule();
    });
  }

  stopFrames() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  destroy() {
    this.stopFrames();
    clearInterval(this.timer);
    this.unbindVideo?.();
    for (const cleanup of this.cleanups) cleanup();
    if (this.root) {
      document.documentElement.removeAttribute("data-ytmr-ambient");
      this.root.remove();
      this.style.remove();
    }
  }
}
