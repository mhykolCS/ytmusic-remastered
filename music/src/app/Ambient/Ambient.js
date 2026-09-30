import { useEffect, useRef } from "react";
import { useStore } from "/src/app/store";
import { MusicAmbientRenderer } from "./renderer.mjs";

export default function Ambient() {
  const renderer = useRef(null);
  const prefs = useStore((state) => state.ambient.prefs);
  const ready = useStore((state) => state.ambient.ready);
  useEffect(() => {
    if (!ready) return;
    const instance = new MusicAmbientRenderer(useStore.getState().ambient.prefs,
      (status) => useStore.getState().ambient.setStatus(status));
    renderer.current = instance;
    instance.start();
    return () => { instance.destroy(); renderer.current = null; };
  }, [ready]);
  useEffect(() => { renderer.current?.setPrefs(prefs); }, [prefs]);
  return null;
}
