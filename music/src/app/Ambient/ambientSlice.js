import { defaults, normalizePrefs } from "./core.mjs";

export const createAmbientSlice = (set, get) => ({
  prefs: { ...defaults },
  ready: false,
  status: "Waiting for a track",
  setPrefs: (patch) => {
    set((state) => { state.ambient.prefs = normalizePrefs({ ...state.ambient.prefs, ...patch }); });
    chrome.storage.local.set({ remasteredAmbientPrefs: get().ambient.prefs });
  },
  mergePrefs: (prefs) => {
    set((state) => { state.ambient.prefs = normalizePrefs(prefs); });
  },
  setReady: () => set((state) => { state.ambient.ready = true; }),
  setStatus: (status) => set((state) => { state.ambient.status = status; }),
});
