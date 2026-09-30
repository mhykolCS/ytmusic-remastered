# YTMusic Remastered

One Chrome extension combining **ThemeSong** with **Ambient light for YouTube**, plus ambient lighting and automatic video preference for YouTube Music.

- **YouTube Music:** ThemeSong's themes, visualizers, player controls, side player, sleep timer and interface customizations.
- **Music ambient light:** blurred video frames fill the page background; audio-only tracks fall back to album artwork. Intensity, blur, saturation, spread, frame limit and smoothing are adjustable.
- **Video by default:** selects YouTube Music's Video mode when available. Audio-only tracks play normally. A manual Song selection is respected until the next track.
- **YouTube:** the upstream Ambient Light renderer and its player settings, including regular videos and embeds.
- **Playback efficiency:** small 256 × 144 lighting buffer; frame limit defaults to 24 fps; drawing stops while paused or hidden. Artwork is redrawn only when it changes.

## Build and install

Use Node.js 22.5.1 or later, npm and Python 3 (only needed for optional migration).

```sh
git clone https://github.com/mhykolCS/ytmusic-remastered.git
cd ytmusic-remastered
npm run setup
npm run build
npm test
```

1. Open `chrome://extensions/` in Chrome.
2. Turn off the original **ThemeSong** and any separate **Ambient light for YouTube** installation to avoid duplicate controls/renderers. Disabling preserves their settings for rollback.
3. Enable **Developer mode**, choose **Load unpacked**, and select this project's `dist` directory.
4. Refresh your YouTube and YouTube Music tabs.

On YouTube Music, open the **YTMusic Remastered controls** button beside the player controls. **Ambient light** has the lighting toggle, video preference and advanced lighting settings. These settings also appear in the extension popup's Settings tab. On regular YouTube, use the upstream **AL** button in the video player.

After changing the code, run `npm run build`, press **Reload** on this extension's card in Chrome, and refresh affected tabs. The unpacked build stays installed across Chrome restarts; it does not receive Chrome Web Store updates.

## Preserve an existing ThemeSong configuration

Before the **first installation** of this extension on Linux:

```sh
python tools/migrate-themesong.py
npm run build
```

The migration reads ThemeSong's Chrome preference journal without changing or locking the original database. It exports only saved theme, visualizer, popup, extension, customization and utility preferences. It excludes the current track and listening history. Pass `--profile /path/to/Chrome/profile` for another profile.

The migration file lives in Git-ignored `local/install-preferences.json` and is applied on first install. It is deliberately excluded from public builds and release archives. The journal reader refuses compacted `.ldb`/`.sst` databases instead of risking an incomplete export. If migration is unavailable, the new extension starts with defaults and the original extension retains its settings.

For a clean, shareable build:

```sh
npm run build -- --clean-preferences
```

## Development and verification

```sh
npm test
npm run preview
# Open http://127.0.0.1:47839 in Chrome
```

The preview uses the production Music renderer with synthetic video and artwork. It checks automatic video choice, decoded frame updates, pause behavior, manual Song choice, audio-only fallback, delayed availability, disable/restore and cleanup. It never installs the extension and is separate from live YouTube verification.

- `music/`: editable ThemeSong 1.3.4 source plus the new `src/app/Ambient/` feature.
- `youtube/`: editable Ambient light for YouTube 2.38.17 source.
- `tools/build.mjs`: combines the outputs into one Manifest V3 extension.
- `UPSTREAM.json`: exact imported upstream commits.
- `tests/`: behavior tests, manifest validation and the browser fixture.

The Music integration uses the native Song/Video switch and player DOM. Future YouTube layout changes may require selector updates. It never starts playback merely to create a glow. Fullscreen behavior depends on which element YouTube promotes into fullscreen; video-element-only fullscreen has no surrounding page to illuminate.

## Permissions and privacy

The extension runs only on `music.youtube.com` and `www.youtube.com`. ThemeSong's original permissions remain for settings storage, Music script execution, optional track notifications, lyrics search and the side player. No account, payment or unrelated-site permissions are added. Rendering stays in the browser. Upstream YouTube crash reporting defaults to **off** in this fork; source maps are not uploaded by the combined build.

Use one theme/ambient extension at a time. To roll back, disable YTMusic Remastered, re-enable your original extensions, and refresh the tabs.

## Credits and licence

This project is an independent fork/integration, not an official YouTube or upstream release.

- [ThemeSong](https://github.com/KristofferTroncoso/ThemeSong) by Kristoffer Troncoso — MIT, preserved in [music/LICENSE](music/LICENSE).
- [Ambient light for YouTube](https://github.com/WesselKroos/youtube-ambilight) by Wessel Kroos — MIT, preserved in [youtube/LICENSE](youtube/LICENSE).
- Integration and Music lighting additions — MIT, see [LICENSE](LICENSE).

Both upstream licence notices are also included in the built extension.
