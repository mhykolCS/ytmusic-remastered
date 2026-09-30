import { execFileSync } from "node:child_process";
import { cpSync, readFileSync, writeFileSync, rmSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
const run = (cwd, cmd, args) => execFileSync(cmd, args, { cwd: resolve(root, cwd), stdio: "inherit" });
const json = (path) => JSON.parse(readFileSync(resolve(root, path), "utf8"));
const out = resolve(root, "dist");

run("music", "node", ["tasks/build-remastered.cjs"]);
// The local build never uploads source maps or contacts the upstream error service.
for (const task of ["build:scripts:rollup", "build:styles", "build:manifest", "build:html", "build:images"]) {
  run("youtube", "npm", ["run", task]);
}
rmSync(out, { recursive: true, force: true });
mkdirSync(out);
cpSync(resolve(root, "music/builds/chrome-build"), out, { recursive: true });
// Keep YouTube resources at their original paths: upstream calls getURL('scripts/...').
for (const folder of ["scripts", "styles", "images"]) {
  cpSync(resolve(root, `youtube/dist/${folder}`), resolve(out, folder), { recursive: true });
}
mkdirSync(resolve(out, "youtube"));
const options = readFileSync(resolve(root, "youtube/dist/options.html"), "utf8")
  .replaceAll('href="styles/', 'href="../styles/')
  .replaceAll('src="scripts/', 'src="../scripts/')
  .replaceAll('src="images/', 'src="../images/');
writeFileSync(resolve(out, "youtube/options.html"), options);
const music = json("music/src/chrome-mv3.json");
const youtube = json("youtube/dist/manifest.json");
const manifest = {
  ...music,
  name: "YTMusic Remastered",
  description: "ThemeSong themes and visualizers, ambient lighting for YouTube and Music, and automatic video preference.",
  version: json("package.json").version,
  homepage_url: "https://github.com/mhykolCS/ytmusic-remastered",
  minimum_chrome_version: "121",
  action: { ...music.action, default_title: "YTMusic Remastered" },
  options_ui: { page: "youtube/options.html", open_in_tab: true },
  content_scripts: [...music.content_scripts, ...youtube.content_scripts],
  web_accessible_resources: [...music.web_accessible_resources, ...youtube.web_accessible_resources],
};
writeFileSync(resolve(out, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
mkdirSync(resolve(out, "licenses"));
cpSync(resolve(root, "music/LICENSE"), resolve(out, "licenses/ThemeSong.txt"));
cpSync(resolve(root, "youtube/LICENSE"), resolve(out, "licenses/AmbientLight.txt"));
// Optional, local-only migration data. Never checked into Git or release archives.
if (!process.argv.includes("--clean-preferences") && existsSync(resolve(root, "local/install-preferences.json"))) {
  cpSync(resolve(root, "local/install-preferences.json"), resolve(out, "install-preferences.json"));
} else writeFileSync(resolve(out, "install-preferences.json"), "{}\n");
console.log(`Built YTMusic Remastered at ${out}`);
