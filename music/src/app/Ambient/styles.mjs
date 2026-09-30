export const ambientStyles = `
#ytmr-ambient {
  position: fixed; inset: 0; overflow: hidden; pointer-events: none;
  z-index: 0; opacity: 0; transition: opacity .45s; contain: strict;
}
#ytmr-ambient canvas {
  position: absolute; left: 50%; top: 50%; width: 100%; height: 100%;
  transform: translate(-50%, -50%); opacity: var(--ytmr-opacity, .75);
  filter: blur(var(--ytmr-blur, 80px)) saturate(var(--ytmr-saturation, 1.4));
}
html[data-ytmr-ambient] #ytmr-ambient { opacity: 1; }
html[data-ytmr-ambient] body { background: #08090d !important; }
html[data-ytmr-ambient] ytmusic-app { position: relative; z-index: 1; background: transparent !important; }
html[data-ytmr-ambient] ytmusic-app-layout,
html[data-ytmr-ambient] ytmusic-player,
html[data-ytmr-ambient] #song-image,
html[data-ytmr-ambient] #main-panel,
html[data-ytmr-ambient] #side-panel { background: transparent !important; }
html[data-ytmr-ambient] #player-page { background: rgb(8 9 13 / .12) !important; }
html[data-ytmr-ambient] #nav-bar-background,
html[data-ytmr-ambient] #player-bar-background,
html[data-ytmr-ambient] #guide-wrapper,
html[data-ytmr-ambient] #mini-guide-background { background: rgb(8 9 13 / .55) !important; }
html[data-ytmr-ambient] ytmusic-player-bar { --ytmusic-player-bar-background: rgb(8 9 13 / .45) !important; }
html[data-ytmr-ambient] .background-gradient.ytmusic-browse-response { background: transparent !important; }
html[data-ytmr-ambient] ytmusic-player-page .background-thumbnail { opacity: 0 !important; }
/* ThemeSong's light themes need dark text on a light scrim. */
html[light][data-ytmr-ambient] body { background: #e9eaf0 !important; }
html[light][data-ytmr-ambient] #player-page { background: rgb(255 255 255 / .35) !important; }
html[light][data-ytmr-ambient] #nav-bar-background,
html[light][data-ytmr-ambient] #player-bar-background,
html[light][data-ytmr-ambient] #guide-wrapper,
html[light][data-ytmr-ambient] #mini-guide-background { background: rgb(255 255 255 / .72) !important; }
html[light][data-ytmr-ambient] ytmusic-player-bar { --ytmusic-player-bar-background: rgb(255 255 255 / .72) !important; }
@media (prefers-reduced-motion: reduce) { #ytmr-ambient { transition: none; } }
`;
