import { css } from "@emotion/react";
import { useStore } from "/src/app/store";
import { defaults } from "./core.mjs";

const sliders = [
  ["opacity", "Intensity", 10, 100, "%"],
  ["blur", "Blur", 10, 160, "px"],
  ["spread", "Spread", 100, 160, "%"],
  ["saturation", "Saturation", 50, 250, "%"],
  ["smoothing", "Smooth transitions", 0, 90, "%"],
  ["fps", "Frame limit", 5, 30, " fps"],
];

export default function AmbientPanel() {
  const prefs = useStore((state) => state.ambient.prefs);
  const setPrefs = useStore((state) => state.ambient.setPrefs);
  const status = useStore((state) => state.ambient.status);
  return (
    <section aria-label="Ambient light" css={css`
      padding: 10px; margin: 6px 0; border: 1px solid #ffffff25; border-radius: 8px;
      font-size: 12px; min-width: 220px;
      label { display: flex; justify-content: space-between; align-items: center; margin: 9px 0; gap: 8px; }
      input { accent-color: #9aafff; }
      input[type=range] { display: block; width: 100%; margin: 4px 0 12px; }
      summary { cursor: pointer; margin-top: 12px; }
      h3 { font-size: 14px; margin: 0 0 8px; }
      small { display: block; opacity: .75; line-height: 1.45; }
      button { margin-top: 6px; cursor: pointer; color: inherit; background: #ffffff18; border: 1px solid #ffffff33; border-radius: 6px; padding: 6px 10px; }
    `}>
      <h3>Ambient light</h3>
      <label>Enable ambient light<input type="checkbox" checked={prefs.enabled} onChange={(e) => setPrefs({ enabled: e.target.checked })} /></label>
      <label>Prefer video when available<input type="checkbox" checked={prefs.preferVideo} onChange={(e) => setPrefs({ preferVideo: e.target.checked })} /></label>
      <small>{status}</small>
      <details>
        <summary>Lighting settings</summary>
        {sliders.map(([key, label, min, max, unit]) => (
          <div key={key}>
            <label htmlFor={`ytmr-${key}`}>{label}<span>{prefs[key]}{unit}</span></label>
            <input id={`ytmr-${key}`} type="range" min={min} max={max} value={prefs[key]} onChange={(e) => setPrefs({ [key]: Number(e.target.value) })} />
          </div>
        ))}
        <small>Video follows the picture. Audio-only tracks use album artwork. Choosing Song lasts until the next track.</small>
        <button onClick={() => setPrefs(defaults)}>Reset lighting</button>
      </details>
    </section>
  );
}
