export const defaults = Object.freeze({
  enabled: true,
  preferVideo: true,
  opacity: 75,
  blur: 80,
  saturation: 140,
  spread: 115,
  fps: 24,
  smoothing: 65,
});

const limits = {
  opacity: [10, 100], blur: [10, 160], saturation: [50, 250],
  spread: [100, 160], fps: [5, 30], smoothing: [0, 90],
};

export function normalizePrefs(input = {}) {
  const prefs = { ...defaults };
  if (!input || typeof input !== "object") return prefs;
  for (const key of ["enabled", "preferVideo"]) {
    if (typeof input[key] === "boolean") prefs[key] = input[key];
  }
  for (const [key, [min, max]] of Object.entries(limits)) {
    if (typeof input[key] === "number" && Number.isFinite(input[key])) {
      prefs[key] = Math.min(max, Math.max(min, input[key]));
    }
  }
  return prefs;
}

// Keep one video choice per track, so an explicit Song click is respected.
// A disabled/missing switch does not consume the choice: it may arrive later.
export class VideoPreference {
  track = "";
  since = 0;
  handled = false;

  update({ track, available, selected, enabled, now }) {
    if (track !== this.track) {
      this.track = track;
      this.since = now;
      this.handled = false;
    }
    if (!track || !enabled || this.handled || now - this.since < 600) return false;
    if (selected) {
      this.handled = true;
      return false;
    }
    if (!available) return false;
    this.handled = true;
    return true;
  }

  manualChoice(track, now) {
    this.track = track;
    this.since = now;
    this.handled = true;
  }
}

export function sourceKind({ videoReady, songMode, hasArtwork }) {
  if (videoReady && !songMode) return "video";
  if (hasArtwork) return "artwork";
  return "none";
}

export function blendAlpha(smoothing, elapsed) {
  if (!smoothing) return 1;
  // Time-based blending has the same feel at 15, 24 and 30 fps.
  return 1 - Math.pow(smoothing / 100, Math.max(1, elapsed) / (1000 / 24));
}
